import { describe, it, expect } from "vitest";
import { wrapIndex, stepIndex } from "../carousel-nav";

describe("wrapIndex", () => {
  it("leaves in-range indices unchanged", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(2, 3)).toBe(2);
  });

  it("wraps past the end and before the start", () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(4, 3)).toBe(1);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-3, 3)).toBe(0);
  });

  it("is total-safe", () => {
    expect(wrapIndex(5, 0)).toBe(0);
    expect(wrapIndex(0, -2)).toBe(0);
  });
});

describe("stepIndex", () => {
  it("steps forward and backward with wrap-around", () => {
    expect(stepIndex(0, 3, 1)).toBe(1);
    expect(stepIndex(2, 3, 1)).toBe(0); // next from last → first
    expect(stepIndex(0, 3, -1)).toBe(2); // prev from first → last
  });

  it("handles a single group (no movement)", () => {
    expect(stepIndex(0, 1, 1)).toBe(0);
    expect(stepIndex(0, 1, -1)).toBe(0);
  });
});
