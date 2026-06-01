import { describe, it, expect } from "vitest";
import {
  INTEREST_LEVELS,
  isInterestLevel,
  clampInterestLevel,
  interestLevelLabel,
  confidenceToInterestLevel,
  readInterestLevel,
  readAllInterestLevels,
  readLegacyConfidenceTracker,
  interestLevelStorageKey,
} from "../types";

/** Minimal in-memory Storage stand-in for the pure readers. */
function fakeStorage(map: Record<string, string>): Pick<Storage, "length" | "key" | "getItem"> {
  const keys = Object.keys(map);
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
    getItem: (k: string) => (k in map ? map[k] : null),
  };
}

describe("interest level config", () => {
  it("has exactly five levels in ascending order with the brand labels", () => {
    expect(INTEREST_LEVELS.map((m) => m.level)).toEqual([1, 2, 3, 4, 5]);
    expect(INTEREST_LEVELS.map((m) => m.label)).toEqual([
      "Curious",
      "Interested",
      "Excited",
      "Very Interested",
      "This Feels Right",
    ]);
  });

  it("isInterestLevel guards the 1–5 range", () => {
    expect(isInterestLevel(3)).toBe(true);
    expect(isInterestLevel(0)).toBe(false);
    expect(isInterestLevel(6)).toBe(false);
    expect(isInterestLevel("3")).toBe(false);
  });

  it("clampInterestLevel coerces and bounds", () => {
    expect(clampInterestLevel(3)).toBe(3);
    expect(clampInterestLevel(0)).toBe(1);
    expect(clampInterestLevel(99)).toBe(5);
    expect(clampInterestLevel(2.6)).toBe(3);
    expect(clampInterestLevel("x")).toBeNull();
    expect(clampInterestLevel(null)).toBeNull();
  });

  it("interestLevelLabel maps each level and is empty for nullish", () => {
    expect(interestLevelLabel(5)).toBe("This Feels Right");
    expect(interestLevelLabel(1)).toBe("Curious");
    expect(interestLevelLabel(null)).toBe("");
  });
});

describe("confidence migration", () => {
  it("maps legacy goal confidence safely (low/medium/high)", () => {
    expect(confidenceToInterestLevel("low")).toBe(2);
    expect(confidenceToInterestLevel("medium")).toBe(3);
    expect(confidenceToInterestLevel("high")).toBe(4);
  });
  it("defaults unknown/missing confidence to the middle (Excited)", () => {
    expect(confidenceToInterestLevel(undefined)).toBe(3);
    expect(confidenceToInterestLevel("bogus")).toBe(3);
  });

  it("reads the latest score from the legacy confidence-tracker store", () => {
    const s = fakeStorage({
      "confidence-tracker-nurse": JSON.stringify([
        { score: 2, timestamp: 1 },
        { score: 4, timestamp: 2 },
      ]),
    });
    expect(readLegacyConfidenceTracker("nurse", s)).toBe(4);
    expect(readLegacyConfidenceTracker("pilot", s)).toBeNull();
  });
});

describe("readInterestLevel", () => {
  it("returns null for empty user/career", () => {
    const s = fakeStorage({});
    expect(readInterestLevel("", "nurse", s)).toBeNull();
    expect(readInterestLevel("u1", "", s)).toBeNull();
  });

  it("reads a stored level for the right user+career", () => {
    const s = fakeStorage({
      [interestLevelStorageKey("u1", "nurse")]: JSON.stringify({ level: 5, updatedAt: "2026-06-01" }),
    });
    expect(readInterestLevel("u1", "nurse", s)).toBe(5);
    expect(readInterestLevel("u2", "nurse", s)).toBeNull();
  });

  it("falls back to the legacy confidence-tracker store when no new value exists", () => {
    const s = fakeStorage({
      "confidence-tracker-pilot": JSON.stringify([{ score: 3, timestamp: 1 }]),
    });
    expect(readInterestLevel("u1", "pilot", s)).toBe(3);
  });

  it("prefers the new value over the legacy store", () => {
    const s = fakeStorage({
      [interestLevelStorageKey("u1", "pilot")]: JSON.stringify({ level: 1, updatedAt: null }),
      "confidence-tracker-pilot": JSON.stringify([{ score: 5, timestamp: 1 }]),
    });
    expect(readInterestLevel("u1", "pilot", s)).toBe(1);
  });

  it("ignores malformed / out-of-range stored data", () => {
    const s = fakeStorage({
      [interestLevelStorageKey("u1", "a")]: "{not json",
      [interestLevelStorageKey("u1", "b")]: JSON.stringify({ level: 99 }),
    });
    expect(readInterestLevel("u1", "a", s)).toBeNull();
    expect(readInterestLevel("u1", "b", s)).toBe(5); // 99 clamps to 5
  });
});

describe("readAllInterestLevels", () => {
  it("collects only the given user's levels, keyed by careerId", () => {
    const s = fakeStorage({
      [interestLevelStorageKey("u1", "nurse")]: JSON.stringify({ level: 4 }),
      [interestLevelStorageKey("u1", "pilot")]: JSON.stringify({ level: 2 }),
      [interestLevelStorageKey("u2", "nurse")]: JSON.stringify({ level: 5 }),
      "unrelated-key": "ignore",
    });
    expect(readAllInterestLevels("u1", s)).toEqual({ nurse: 4, pilot: 2 });
    expect(readAllInterestLevels("", s)).toEqual({});
  });
});
