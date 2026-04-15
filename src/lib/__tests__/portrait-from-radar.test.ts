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

  it("mentions every active signal — subject, work style, people pref", () => {
    const p = buildRadarPortrait({
      subjects: ["chemistry", "biology"],
      workStyles: ["hands-on"],
      peoplePref: "with-people",
    })!;
    // Subjects mentioned (properly cased by the label map).
    expect(p.summary).toContain("Chemistry");
    expect(p.summary).toContain("Biology");
    // Work-style has a few phrase variants — all of them mention
    // either "hands" or "build", so assert on either.
    expect(p.summary.toLowerCase()).toMatch(/hands|build/);
    // People-pref variants all mention either "people" or "room".
    expect(p.summary.toLowerCase()).toMatch(/people|room/);
    // Tags include the subject labels + derived style / people tags.
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
    // All single-subject variants mention the subject by name.
    expect(p.summary).toContain("Art");
    expect(p.topTags).toEqual(["Art"]);
  });

  it("never uses the word 'career' in the generated summary", () => {
    const p = buildRadarPortrait({
      subjects: ["drama", "english", "history"],
      workStyles: ["creative"],
      peoplePref: "mostly-alone",
    })!;
    expect(p.summary.toLowerCase()).not.toContain("career");
  });

  it("is deterministic for the same preferences", () => {
    const prefs = {
      subjects: ["biology"],
      workStyles: ["hands-on"] as string[],
      peoplePref: "with-people",
    };
    const a = buildRadarPortrait(prefs)!;
    const b = buildRadarPortrait(prefs)!;
    expect(a.summary).toBe(b.summary);
  });
});
