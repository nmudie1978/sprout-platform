import { describe, it, expect } from "vitest";
import {
  browseCareersForCategory,
  withBrowseCrossListCounts,
} from "@/lib/career-filters/cross-list";
import { getCareersForCategory, type CareerCategory } from "@/lib/career-pathways";

describe("browse cross-list (military under public service)", () => {
  it("Public Service filter includes military careers, deduped", () => {
    const ps = getCareersForCategory("PUBLIC_SERVICE_SAFETY");
    const mil = getCareersForCategory("MILITARY_DEFENCE");
    const merged = browseCareersForCategory(
      "PUBLIC_SERVICE_SAFETY",
      getCareersForCategory,
    );
    expect(merged.length).toBe(ps.length + mil.length); // categories disjoint
    expect(new Set(merged.map((c) => c.id)).size).toBe(merged.length);
    expect(merged.some((c) => c.pathType === "military")).toBe(true);
  });

  it("Military filter stays military-only (no reverse cross-list)", () => {
    const mil = getCareersForCategory("MILITARY_DEFENCE");
    const merged = browseCareersForCategory(
      "MILITARY_DEFENCE",
      getCareersForCategory,
    );
    expect(merged.length).toBe(mil.length);
  });

  it("a non-cross-listed category is untouched", () => {
    const tech = getCareersForCategory("TECHNOLOGY_IT");
    const merged = browseCareersForCategory("TECHNOLOGY_IT", getCareersForCategory);
    expect(merged.length).toBe(tech.length);
  });

  it("count rolls military into public service, leaves others alone", () => {
    const counts = {
      PUBLIC_SERVICE_SAFETY: 10,
      MILITARY_DEFENCE: 21,
      HEALTHCARE_LIFE_SCIENCES: 5,
    } as Record<string, number>;
    const out = withBrowseCrossListCounts(counts);
    expect(out.PUBLIC_SERVICE_SAFETY).toBe(31);
    expect(out.MILITARY_DEFENCE).toBe(21);
    expect(out.HEALTHCARE_LIFE_SCIENCES).toBe(5);
  });
});
