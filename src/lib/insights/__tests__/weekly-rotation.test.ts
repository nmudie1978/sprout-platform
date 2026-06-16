import { describe, it, expect } from "vitest";
import { getISOWeekSeed, rotateWeekly, pickWeekly } from "../weekly-rotation";

describe("getISOWeekSeed", () => {
  it("is stable within the same ISO week (UTC)", () => {
    const a = getISOWeekSeed(new Date("2026-06-15T00:00:00Z")); // Mon
    const b = getISOWeekSeed(new Date("2026-06-21T23:59:59Z")); // Sun
    expect(a).toBe(b);
  });
  it("differs across consecutive weeks", () => {
    const a = getISOWeekSeed(new Date("2026-06-15T00:00:00Z"));
    const b = getISOWeekSeed(new Date("2026-06-22T00:00:00Z"));
    expect(a).not.toBe(b);
  });
});

describe("rotateWeekly", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it("is deterministic for the same seed", () => {
    expect(rotateWeekly(items, 42, 4)).toEqual(rotateWeekly(items, 42, 4));
  });
  it("changes window across seeds", () => {
    const w1 = rotateWeekly(items, 1, 4);
    const w2 = rotateWeekly(items, 2, 4);
    expect(w1).not.toEqual(w2);
  });
  it("returns count items when available", () => {
    expect(rotateWeekly(items, 7, 4)).toHaveLength(4);
  });
  it("returns all items (reordered) when count omitted", () => {
    expect(
      rotateWeekly(items, 7)
        .slice()
        .sort((a, b) => a - b)
    ).toEqual(items);
  });
  it("handles empty input", () => {
    expect(rotateWeekly([], 5, 3)).toEqual([]);
  });
  it("covers the whole set over enough weeks", () => {
    const seen = new Set<number>();
    for (let s = 0; s < 50; s++)
      rotateWeekly(items, s, 4).forEach((n) => seen.add(n));
    expect(seen.size).toBe(items.length);
  });
});

describe("pickWeekly", () => {
  it("is deterministic and in-range", () => {
    const items = ["a", "b", "c"];
    expect(pickWeekly(items, 9)).toBe(pickWeekly(items, 9));
    expect(items).toContain(pickWeekly(items, 9));
  });
  it("returns undefined for empty input", () => {
    expect(pickWeekly([], 9)).toBeUndefined();
  });
});
