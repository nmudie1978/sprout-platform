import { describe, it, expect } from "vitest";
import { swedishRouteText, SV_ROUTE_LABELS } from "../sv/route-templates";
import { SV_DISCIPLINE_NAMES, svDisciplineName } from "../sv/disciplines";
import bucketsData from "@/lib/education/data/discipline-buckets.json";

describe("Swedish discipline names", () => {
  // Every bucket must be translated, or a career silently loses its field
  // and the route reads generic again — the exact problem this fixes.
  it("covers every discipline bucket", () => {
    const ids = (bucketsData as { buckets: { id: string }[] }).buckets.map((b) => b.id);
    for (const id of ids) {
      expect(SV_DISCIPLINE_NAMES[id], `no Swedish name for "${id}"`).toBeTruthy();
    }
  });

  it("writes fields lower-case, as Swedish does", () => {
    for (const [id, name] of Object.entries(SV_DISCIPLINE_NAMES)) {
      expect(name[0], `"${id}" is capitalised`).toBe(name[0].toLowerCase());
    }
  });

  it("returns null for an unknown or missing discipline", () => {
    expect(svDisciplineName(null)).toBeNull();
    expect(svDisciplineName("not-a-discipline")).toBeNull();
  });
});

describe("swedishRouteText", () => {
  it("names the field for a degree route", () => {
    const t = swedishRouteText("bachelor", "university", "medicine");
    expect(t).toContain("kandidatexamen");
    expect(t).toContain("vanligtvis inom medicin");
  });

  // "No formal education required, typically in logistics" is nonsense. A
  // field only belongs where a qualification is actually taken in something.
  it("does not name a field where a qualification is not taken in one", () => {
    for (const route of ["direct-entry", "certification", "apprenticeship"] as const) {
      const t = swedishRouteText(route, "on-the-job", "logistics-supplychain");
      expect(t, route).not.toContain("vanligtvis inom");
    }
  });

  it("omits the field when the discipline is unknown", () => {
    expect(swedishRouteText("bachelor", "university", null)).not.toContain("vanligtvis inom");
    expect(swedishRouteText("bachelor", "university")).not.toContain("vanligtvis inom");
  });

  it("still reads as one sentence, with no doubled full stop", () => {
    const t = swedishRouteText("master", "university", "law");
    expect(t).not.toContain("..");
    expect(t.endsWith(".")).toBe(true);
  });

  it("always returns something, whatever the route", () => {
    for (const r of ["university", "vocational", "mixed", "on-the-job", "certification"] as const) {
      expect(swedishRouteText(undefined, r, "medicine").length, r).toBeGreaterThan(20);
    }
  });
});

describe("route labels", () => {
  // The vocabulary point: one shared enum, local names, so Sweden reads
  // "yrkesexamen" where Norway reads "fagbrev".
  it("gives Swedish names to the shared entry routes", () => {
    expect(SV_ROUTE_LABELS.fagbrev).toBe("yrkesexamen");
    expect(SV_ROUTE_LABELS.fagskole).toContain("yrkeshögskola");
  });
});
