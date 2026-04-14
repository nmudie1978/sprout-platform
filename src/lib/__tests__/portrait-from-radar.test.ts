import { describe, it, expect } from "vitest";
import {
  buildRadarPortrait,
  hasEnoughForPortrait,
} from "../discover/portrait-from-radar";

describe("hasEnoughForPortrait", () => {
  it("rejects null/undefined", () => {
    expect(hasEnoughForPortrait(null)).toBe(false);
    expect(hasEnoughForPortrait(undefined)).toBe(false);
  });
  it("rejects entirely empty preferences", () => {
    expect(hasEnoughForPortrait({})).toBe(false);
    expect(hasEnoughForPortrait({ subjects: [], workStyles: [] })).toBe(false);
  });
  it("accepts any single signal", () => {
    expect(hasEnoughForPortrait({ subjects: ["math"] })).toBe(true);
    expect(hasEnoughForPortrait({ workStyles: ["hands-on"] })).toBe(true);
    expect(hasEnoughForPortrait({ peoplePref: "with-people" })).toBe(true);
  });
});

describe("buildRadarPortrait", () => {
  it("returns null when there is not enough data", () => {
    expect(buildRadarPortrait({})).toBeNull();
    expect(buildRadarPortrait(null)).toBeNull();
  });

  it("uses subject + work style + people pref signals together", () => {
    const p = buildRadarPortrait({
      subjects: ["chemistry", "biology"],
      workStyles: ["hands-on"],
      peoplePref: "with-people",
    })!;
    expect(p.summary).toContain("Chemistry");
    expect(p.summary).toContain("Biology");
    expect(p.summary.toLowerCase()).toContain("hands-on");
    expect(p.summary.toLowerCase()).toContain("people");
    expect(p.topTags).toContain("Chemistry");
    expect(p.topTags).toContain("Biology");
    expect(p.topTags).toContain("Hands-on");
    expect(p.topTags).toContain("People person");
  });

  it("caps tags at 6", () => {
    const p = buildRadarPortrait({
      subjects: ["chemistry", "biology", "math", "physics", "history"],
      workStyles: ["hands-on", "outdoors"],
      peoplePref: "mixed",
    })!;
    expect(p.topTags.length).toBeLessThanOrEqual(6);
  });

  it("works with only a single subject", () => {
    const p = buildRadarPortrait({ subjects: ["art"] })!;
    expect(p.summary.startsWith("You're drawn to Art")).toBe(true);
    expect(p.topTags).toEqual(["Art"]);
  });
});
