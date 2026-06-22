import { describe, it, expect } from "vitest";
import { generateFallbackTimeline } from "../generate-fallback-timeline";

/**
 * Regression guard for the reported bug: an undeclared 21-year-old was
 * put on a "Complete Videregående" (VG3) roadmap. Videregående finishes
 * at ~18-19 in Norway, so the no-Foundation default must never route a
 * 20+ user through upper secondary. (≤18 → school, 19-25 → university,
 * 26+ → other.)
 */
describe("age-based default stage (no declared Foundation)", () => {
  const textOf = (career: string, age: number) =>
    generateFallbackTimeline(career, age, undefined, false, undefined, "university")
      .items.map((i) => `${i.title} ${i.subtitle ?? ""} ${i.description ?? ""}`)
      .join(" | ")
      .toLowerCase();

  for (const age of [20, 21, 24, 30]) {
    it(`does NOT route a ${age}-year-old through videregående / upper secondary`, () => {
      expect(textOf("Software Engineer", age)).not.toMatch(/videreg|upper secondary|\bvg3\b/);
    });
  }

  it("still produces a roadmap (university-shaped) for a 21-year-old", () => {
    const j = generateFallbackTimeline("Nurse", 21, undefined, false, undefined, "university");
    expect(j.items.length).toBeGreaterThan(0);
    expect(textOf("Nurse", 21)).toMatch(/university|degree|graduat/);
  });
});
