import { describe, it, expect } from "vitest";
import mapData from "@/lib/education/data/career-discipline-map.json";
import { getCareersForDiscipline, rankDisciplineCareers } from "../degree-to-careers";
import type { Career } from "@/lib/career-pathways";

const map: Record<string, string> = (mapData as { map: Record<string, string> }).map;

describe("getCareersForDiscipline", () => {
  it("returns a non-empty array for a real discipline", () => {
    const result = getCareersForDiscipline("medicine");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns [] for an unknown discipline", () => {
    expect(getCareersForDiscipline("nonsense-xyz")).toEqual([]);
  });

  it("every distinct disciplineId in the map inverts to a non-empty list", () => {
    const distinct = new Set(Object.values(map));
    for (const id of distinct) {
      const careers = getCareersForDiscipline(id);
      expect(careers.length, `discipline ${id} should have ≥1 career`).toBeGreaterThan(0);
    }
  });

  it("returns only strings (career ids)", () => {
    const ids = getCareersForDiscipline("computer-science-software");
    expect(ids.every((id) => typeof id === "string")).toBe(true);
  });

  it("the union of all discipline career-id lists equals the full map key set", () => {
    const distinct = new Set(Object.values(map));
    const allFromIndex = new Set<string>();
    for (const id of distinct) {
      for (const careerId of getCareersForDiscipline(id)) {
        allFromIndex.add(careerId);
      }
    }
    const mapKeys = new Set(Object.keys(map));
    expect(allFromIndex).toEqual(mapKeys);
  });
});

describe("rankDisciplineCareers", () => {
  const makeCareer = (
    id: string,
    title: string,
    growthOutlook: Career["growthOutlook"],
  ): Career =>
    ({
      id,
      title,
      growthOutlook,
      emoji: "🔧",
      description: "",
      avgSalary: "500,000 kr/year",
      educationPath: "",
      educationRoute: "university",
      keySkills: [],
      dailyTasks: [],
      workSetting: "desk",
      peopleIntensity: "medium",
      sector: "mixed",
      entryRoute: "bachelor",
    }) as unknown as Career;

  it("puts a high-growth career before a stable one", () => {
    const careers = [
      makeCareer("b", "Beta", "stable"),
      makeCareer("a", "Alpha", "high"),
    ];
    const ranked = rankDisciplineCareers(careers);
    expect(ranked[0].id).toBe("a");
    expect(ranked[1].id).toBe("b");
  });

  it("puts high before medium before stable", () => {
    const careers = [
      makeCareer("c", "Charlie", "stable"),
      makeCareer("a", "Alpha", "high"),
      makeCareer("b", "Beta", "medium"),
    ];
    const [first, second, third] = rankDisciplineCareers(careers);
    expect(first.growthOutlook).toBe("high");
    expect(second.growthOutlook).toBe("medium");
    expect(third.growthOutlook).toBe("stable");
  });

  it("sorts alphabetically by title within the same growth tier", () => {
    const careers = [
      makeCareer("z", "Zoology", "high"),
      makeCareer("a", "Archaeology", "high"),
      makeCareer("m", "Marine Biology", "high"),
    ];
    const ranked = rankDisciplineCareers(careers);
    expect(ranked.map((c) => c.id)).toEqual(["a", "m", "z"]);
  });

  it("is stable: does not mutate the input array", () => {
    const careers = [
      makeCareer("b", "Beta", "stable"),
      makeCareer("a", "Alpha", "high"),
    ];
    const original = [...careers];
    rankDisciplineCareers(careers);
    expect(careers[0].id).toBe(original[0].id);
    expect(careers[1].id).toBe(original[1].id);
  });

  it("handles an empty array", () => {
    expect(rankDisciplineCareers([])).toEqual([]);
  });

  it("handles a single career", () => {
    const c = makeCareer("x", "X-ray Tech", "medium");
    expect(rankDisciplineCareers([c])).toEqual([c]);
  });
});
