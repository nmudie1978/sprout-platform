import { describe, it, expect } from "vitest";
import { getGradeBandForScale } from "@/lib/country-packs/grade-band-lookup";
import { SV_GRADE_BANDS } from "../sv/grade-bands";
import { SWEDEN_MERITVARDE, NORWAY_VGS } from "../scales";
import { matchCareerToGradeRange } from "@/lib/career-pathways/grade-match";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

const ALL_IDS = new Set(Object.values(CAREER_PATHWAYS).flat().map((c) => c.id));

describe("Swedish grade bands", () => {
  it("references only real careers", () => {
    for (const id of Object.keys(SV_GRADE_BANDS)) {
      expect(ALL_IDS.has(id), `unknown careerId ${id}`).toBe(true);
    }
  });

  it("sits inside the meritvärde scale, floor below ceiling", () => {
    for (const [id, b] of Object.entries(SV_GRADE_BANDS)) {
      expect(b.value.floor, `${id} floor below 0`).toBeGreaterThanOrEqual(SWEDEN_MERITVARDE.min);
      expect(b.value.ceiling, `${id} ceiling above 22.5`).toBeLessThanOrEqual(SWEDEN_MERITVARDE.max);
      expect(b.value.floor, `${id} reversed`).toBeLessThanOrEqual(b.value.ceiling);
    }
  });

  it("carries a citation for every band", () => {
    for (const [id, b] of Object.entries(SV_GRADE_BANDS)) {
      expect(b.source, `${id} uncited`).toMatch(/^https:\/\//);
      expect(["verified", "estimated"]).toContain(b.tier);
    }
  });

  // Bands are not Norwegian grades in disguise. Every value must be well
  // above 6, or someone has pasted a 1-6 figure into a 0-22.5 field.
  it("holds meritvärde values, not Norwegian grades", () => {
    for (const [id, b] of Object.entries(SV_GRADE_BANDS)) {
      expect(b.value.floor, `${id} looks like a 1-6 grade`).toBeGreaterThan(6);
    }
  });
});

describe("getGradeBandForScale", () => {
  it("resolves Swedish bands from the Swedish scale id", () => {
    expect(getGradeBandForScale("se-meritvarde", "psychologist")).toEqual({
      floor: 20.21,
      ceiling: 21.88,
    });
  });

  it("returns null for the Norwegian scale and unknown careers", () => {
    expect(getGradeBandForScale("no-vgs-1-6", "psychologist")).toBeNull();
    expect(getGradeBandForScale("se-meritvarde", "not-a-career")).toBeNull();
    expect(getGradeBandForScale(undefined, "psychologist")).toBeNull();
  });
});

describe("matching a Swedish student", () => {
  const band = getGradeBandForScale("se-meritvarde", "psychologist")!;

  it("calls a strong meritvärde aligned for psychology", () => {
    const r = matchCareerToGradeRange(
      { gradeBand: band },
      { low: 20, high: 21 },
      SWEDEN_MERITVARDE,
    );
    expect(r.status).toBe("aligned");
  });

  it("calls a mid meritvärde a stretch, not an impossibility", () => {
    const r = matchCareerToGradeRange(
      { gradeBand: band },
      { low: 17.5, high: 18.5 },
      SWEDEN_MERITVARDE,
    );
    expect(r.status).toBe("stretch");
    expect(r.coachingHint).toContain("20,21");
  });

  // The failure this design exists to prevent. The same student, the same
  // band, judged on the wrong scale: a 1.71-point shortfall is 1.71 GRADES
  // on Norway's scale (step 1) and 0.68 of one on Sweden's (step 2.5). So
  // the Norwegian reading brands psychology a "reach" and docks 15 points,
  // where the truth is a "stretch" costing 6. Discouraging, and wrong.
  it("would overstate the gap if judged on the Norwegian scale", () => {
    const correct = matchCareerToGradeRange(
      { gradeBand: band },
      { low: 17.5, high: 18.5 },
      SWEDEN_MERITVARDE,
    );
    const wrong = matchCareerToGradeRange(
      { gradeBand: band },
      { low: 17.5, high: 18.5 },
      NORWAY_VGS,
    );
    expect(correct.status).toBe("stretch");
    expect(wrong.status).toBe("reach");
    expect(wrong.gap).toBeGreaterThan(correct.gap);
  });
});
