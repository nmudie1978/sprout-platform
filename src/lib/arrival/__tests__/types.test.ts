import { describe, it, expect } from "vitest";
import {
  ARRIVAL_MOODS,
  isArrivalMood,
  arrivalMoodMeta,
  moodAcknowledgementKey,
  isSameDay,
  type ArrivalMood,
} from "../types";

describe("arrival/types", () => {
  describe("ARRIVAL_MOODS", () => {
    it("exposes exactly four calm moods", () => {
      expect(ARRIVAL_MOODS).toHaveLength(4);
      const keys = ARRIVAL_MOODS.map((m) => m.key);
      expect(keys).toEqual(["lost", "curious", "pressured", "motivated"]);
    });

    it("gives every mood a label key and an acknowledgement key", () => {
      for (const m of ARRIVAL_MOODS) {
        expect(typeof m.labelKey).toBe("string");
        expect(m.labelKey.length).toBeGreaterThan(0);
        expect(typeof m.acknowledgementKey).toBe("string");
        expect(m.acknowledgementKey.length).toBeGreaterThan(0);
      }
    });
  });

  describe("isArrivalMood", () => {
    it("accepts the four valid moods", () => {
      for (const m of ["lost", "curious", "pressured", "motivated"] as ArrivalMood[]) {
        expect(isArrivalMood(m)).toBe(true);
      }
    });

    it("rejects anything else", () => {
      expect(isArrivalMood("happy")).toBe(false);
      expect(isArrivalMood("")).toBe(false);
      expect(isArrivalMood(null)).toBe(false);
      expect(isArrivalMood(3)).toBe(false);
      expect(isArrivalMood(undefined)).toBe(false);
    });
  });

  describe("arrivalMoodMeta", () => {
    it("returns the metadata for a mood", () => {
      expect(arrivalMoodMeta("curious").key).toBe("curious");
    });
  });

  describe("moodAcknowledgementKey", () => {
    it("maps a mood to its acknowledgement key", () => {
      expect(moodAcknowledgementKey("lost")).toBe(arrivalMoodMeta("lost").acknowledgementKey);
    });
  });

  describe("isSameDay", () => {
    // Constructed in LOCAL time on purpose: the once-per-day rule is about the
    // user's local calendar day, and this keeps the test deterministic in any
    // timezone.
    it("is true for two times on the same calendar day", () => {
      const a = new Date(2026, 5, 14, 1, 0, 0);
      const b = new Date(2026, 5, 14, 23, 0, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it("is false across day boundaries", () => {
      const a = new Date(2026, 5, 14, 23, 59, 59);
      const b = new Date(2026, 5, 15, 0, 0, 1);
      expect(isSameDay(a, b)).toBe(false);
    });
  });
});
