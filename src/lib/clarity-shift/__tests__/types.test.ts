import { describe, it, expect } from "vitest";
import {
  CLARITY_LEVELS,
  isClarityScore,
  clarityLevelLabelKey,
  computeShift,
  shiftNarrativeKey,
  type ClarityScore,
} from "../types";

describe("clarity-shift/types", () => {
  describe("CLARITY_LEVELS", () => {
    it("has five levels 1..5 in order", () => {
      expect(CLARITY_LEVELS.map((l) => l.score)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("isClarityScore", () => {
    it("accepts integers 1..5", () => {
      for (const n of [1, 2, 3, 4, 5]) expect(isClarityScore(n)).toBe(true);
    });
    it("rejects everything else", () => {
      for (const n of [0, 6, 2.5, "3", null, undefined, NaN]) {
        expect(isClarityScore(n)).toBe(false);
      }
    });
  });

  describe("clarityLevelLabelKey", () => {
    it("returns the i18n label key for a score", () => {
      expect(clarityLevelLabelKey(1 as ClarityScore)).toBe(CLARITY_LEVELS[0].labelKey);
    });
  });

  describe("computeShift", () => {
    it("reports a small upward shift as clearer/small", () => {
      expect(computeShift(3, 4)).toEqual({ delta: 1, direction: "clearer", magnitude: "small" });
    });
    it("reports a big upward shift as clearer/big", () => {
      expect(computeShift(2, 5)).toEqual({ delta: 3, direction: "clearer", magnitude: "big" });
    });
    it("reports no change as steady", () => {
      expect(computeShift(3, 3)).toEqual({ delta: 0, direction: "steady", magnitude: "small" });
    });
    it("reports a small downward shift as less-sure/small", () => {
      expect(computeShift(4, 3)).toEqual({ delta: -1, direction: "less-sure", magnitude: "small" });
    });
    it("treats a delta of exactly 2 as big", () => {
      expect(computeShift(1, 3)).toEqual({ delta: 2, direction: "clearer", magnitude: "big" });
      expect(computeShift(5, 3)).toEqual({ delta: -2, direction: "less-sure", magnitude: "big" });
    });
  });

  describe("shiftNarrativeKey", () => {
    it("keys steady without a magnitude", () => {
      expect(shiftNarrativeKey(computeShift(3, 3))).toBe("narrative.steady");
    });
    it("keys directional shifts with magnitude", () => {
      expect(shiftNarrativeKey(computeShift(3, 4))).toBe("narrative.clearer.small");
      expect(shiftNarrativeKey(computeShift(2, 5))).toBe("narrative.clearer.big");
      expect(shiftNarrativeKey(computeShift(4, 3))).toBe("narrative.lessSure.small");
      expect(shiftNarrativeKey(computeShift(5, 1))).toBe("narrative.lessSure.big");
    });
  });
});
