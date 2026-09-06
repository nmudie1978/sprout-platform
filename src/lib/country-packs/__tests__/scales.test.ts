import { describe, it, expect } from "vitest";
import {
  gradeScaleFor,
  clampToScale,
  NORWAY_VGS,
  SWEDEN_MERITVARDE,
  SWEDEN_HOGSKOLEPROVET,
} from "../scales";
import { matchCareerToGradeRange } from "@/lib/career-pathways/grade-match";

describe("gradeScaleFor", () => {
  it("gives Norway the 1-6 VGS scale and falls back to it", () => {
    expect(gradeScaleFor("Norway").id).toBe("no-vgs-1-6");
    expect(gradeScaleFor(null).id).toBe("no-vgs-1-6");
    expect(gradeScaleFor("Brazil").id).toBe("no-vgs-1-6");
  });

  it("gives Sweden the meritvärde scale", () => {
    expect(gradeScaleFor("Sweden").id).toBe("se-meritvarde");
  });
});

describe("scale definitions", () => {
  // Verified 2026-09-06 against UHR/antagning.se: betygspoäng A=20 down to
  // F=0, jämförelsetal capped at 20.00, plus up to 2.5 meritpoäng.
  it("caps Swedish meritvärde at 22.5", () => {
    expect(SWEDEN_MERITVARDE.min).toBe(0);
    expect(SWEDEN_MERITVARDE.max).toBe(22.5);
  });

  // One letter grade is 2.5 betygspoäng (E=10, D=12.5, C=15...), so that is
  // what "one grade's worth" has to mean in Sweden.
  it("treats one Swedish letter grade as one step", () => {
    expect(SWEDEN_MERITVARDE.step).toBe(2.5);
    expect(NORWAY_VGS.step).toBe(1);
  });

  it("scores Högskoleprovet 0.00-2.00", () => {
    expect(SWEDEN_HOGSKOLEPROVET.min).toBe(0);
    expect(SWEDEN_HOGSKOLEPROVET.max).toBe(2);
  });

  it("formats with the country's own decimal separator", () => {
    expect(NORWAY_VGS.format(4)).toBe("4");
    expect(SWEDEN_MERITVARDE.format(17.5)).toBe("17,50");
  });
});

describe("clampToScale", () => {
  it("holds values inside the scale and survives nonsense", () => {
    expect(clampToScale(25, SWEDEN_MERITVARDE)).toBe(22.5);
    expect(clampToScale(-3, SWEDEN_MERITVARDE)).toBe(0);
    expect(clampToScale(NaN, NORWAY_VGS)).toBe(1);
  });
});

describe("grade matching across scales", () => {
  // The point of the abstraction: the same semantic gap produces the same
  // verdict regardless of the scale's units.
  it("calls one grade short a stretch in both countries", () => {
    const no = matchCareerToGradeRange(
      { gradeBand: { floor: 5, ceiling: 6 } },
      { low: 3, high: 4 },
      NORWAY_VGS,
    );
    const se = matchCareerToGradeRange(
      { gradeBand: { floor: 17.5, ceiling: 20 } },
      { low: 12.5, high: 15 },
      SWEDEN_MERITVARDE,
    );
    expect(no.status).toBe("stretch");
    expect(se.status).toBe("stretch");
  });

  it("calls two grades short a reach in both countries", () => {
    const no = matchCareerToGradeRange(
      { gradeBand: { floor: 5, ceiling: 6 } },
      { low: 2, high: 3 },
      NORWAY_VGS,
    );
    const se = matchCareerToGradeRange(
      { gradeBand: { floor: 17.5, ceiling: 20 } },
      { low: 10, high: 12.5 },
      SWEDEN_MERITVARDE,
    );
    expect(no.status).toBe("reach");
    expect(se.status).toBe("reach");
  });

  // Without the scale, a Swedish gap of 5 meritvärde points would read as a
  // gap of 5 "grades" and be branded an impossible reach.
  it("does not mistake Swedish points for Norwegian grades", () => {
    const wrong = matchCareerToGradeRange(
      { gradeBand: { floor: 17.5, ceiling: 20 } },
      { low: 12.5, high: 15 },
      NORWAY_VGS, // the bug: Swedish values read on the Norwegian scale
    );
    expect(wrong.status).toBe("reach");
    expect(
      matchCareerToGradeRange(
        { gradeBand: { floor: 17.5, ceiling: 20 } },
        { low: 12.5, high: 15 },
        SWEDEN_MERITVARDE,
      ).status,
    ).toBe("stretch");
  });

  it("quotes the coaching hint in the country's own notation", () => {
    const se = matchCareerToGradeRange(
      { gradeBand: { floor: 17.5, ceiling: 20 } },
      { low: 12.5, high: 15 },
      SWEDEN_MERITVARDE,
    );
    expect(se.coachingHint).toContain("17,50");
  });
});
