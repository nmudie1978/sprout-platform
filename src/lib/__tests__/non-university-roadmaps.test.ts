import { describe, it, expect } from "vitest";
import { getAllCareers, inferEducationRoute } from "../career-pathways";
import { generateFallbackTimeline } from "../journey/generate-fallback-timeline";

describe("non-university roadmaps", () => {
  it("certification careers (e.g. scuba diving instructor) get a non-degree roadmap", () => {
    const scuba = getAllCareers().find((c) => c.id === "scuba-diving-instructor")!;
    expect(scuba).toBeTruthy();
    expect(inferEducationRoute(scuba)).toBe("certification");
    const j = generateFallbackTimeline(
      "Scuba Diving Instructor", 16, "school", false, undefined, "certification",
    );
    const titles = j.items.map((i) => i.title.toLowerCase()).join(" | ");
    expect(titles).not.toMatch(/bachelor|master|university|videreg|fagbrev|degree/);
    expect(j.items.some((i) => i.stage === "certification")).toBe(true);
    expect(j.items.some((i) => i.stage === "career")).toBe(true);
  });

  it("the catalogue now has a real non-university pool", () => {
    const d: Record<string, number> = {};
    for (const c of getAllCareers()) d[inferEducationRoute(c)] = (d[inferEducationRoute(c)] || 0) + 1;
    expect(d.certification).toBeGreaterThan(50);
    expect(d.vocational).toBeGreaterThan(100);
    expect((d.certification || 0) + (d.vocational || 0) + (d["on-the-job"] || 0) + (d.mixed || 0)).toBeGreaterThan(400);
  });
});
