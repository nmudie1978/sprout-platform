import { describe, it, expect } from "vitest";
import { sanitizeGradeRange } from "../grade-range";
import { NORWAY_VGS, SWEDEN_MERITVARDE } from "@/lib/country-packs/scales";

describe("sanitizeGradeRange", () => {
  it("keeps a valid Norwegian range and records its scale", () => {
    expect(sanitizeGradeRange({ low: 3, high: 5 }, NORWAY_VGS)).toEqual({
      low: 3,
      high: 5,
      scale: "no-vgs-1-6",
    });
  });

  // The bug this replaces: the route required high <= 6, so a Swedish
  // meritvärde was rejected outright and the user's answer vanished.
  it("accepts a Swedish meritvärde that the old 1-6 check threw away", () => {
    expect(sanitizeGradeRange({ low: 15, high: 18.75 }, SWEDEN_MERITVARDE)).toEqual({
      low: 15,
      high: 18.75,
      scale: "se-meritvarde",
    });
  });

  // The other half of the bug: Math.round turned 17.5 into 18.
  it("preserves Swedish decimals instead of rounding them away", () => {
    const r = sanitizeGradeRange({ low: 17.5, high: 20.25 }, SWEDEN_MERITVARDE);
    expect(r?.low).toBe(17.5);
    expect(r?.high).toBe(20.25);
  });

  it("still rounds Norwegian grades to whole numbers", () => {
    expect(sanitizeGradeRange({ low: 3.4, high: 4.6 }, NORWAY_VGS)).toMatchObject({
      low: 3,
      high: 5,
    });
  });

  it("clamps out-of-range values rather than discarding the answer", () => {
    expect(sanitizeGradeRange({ low: -2, high: 99 }, SWEDEN_MERITVARDE)).toMatchObject({
      low: 0,
      high: 22.5,
    });
  });

  it("rejects a reversed range rather than guessing the intent", () => {
    expect(sanitizeGradeRange({ low: 5, high: 2 }, NORWAY_VGS)).toBeUndefined();
  });

  it("rejects nonsense without throwing", () => {
    expect(sanitizeGradeRange(null, NORWAY_VGS)).toBeUndefined();
    expect(sanitizeGradeRange("4-5", NORWAY_VGS)).toBeUndefined();
    expect(sanitizeGradeRange({ low: "x", high: 5 }, NORWAY_VGS)).toBeUndefined();
    expect(sanitizeGradeRange([], NORWAY_VGS)).toBeUndefined();
  });
});
