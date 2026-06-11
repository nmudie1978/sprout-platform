import { describe, it, expect } from "vitest";
import { getCareerPathProgression, careerPathProgressionForkIds } from "@/lib/career-progressions";

describe("career path progression — IC/management fork", () => {
  it("software-developer exposes both expert and lead tracks", () => {
    const p = getCareerPathProgression("software-developer");
    expect(p?.nextExpert?.length).toBeGreaterThan(0);
    expect(p?.nextLead?.length).toBeGreaterThan(0);
  });

  it("a non-forked career (electrician) keeps a flat next and no fork", () => {
    const p = getCareerPathProgression("electrician");
    expect(p?.next?.length).toBeGreaterThan(0);
    expect(p?.nextExpert).toBeUndefined();
    expect(p?.nextLead).toBeUndefined();
  });

  it("every forked career has BOTH tracks non-empty (no half-forks)", () => {
    for (const id of careerPathProgressionForkIds) {
      const p = getCareerPathProgression(id);
      expect(p, `missing progression for ${id}`).toBeTruthy();
      expect(p?.nextExpert?.length, `${id} missing nextExpert`).toBeGreaterThan(0);
      expect(p?.nextLead?.length, `${id} missing nextLead`).toBeGreaterThan(0);
    }
  });
});
