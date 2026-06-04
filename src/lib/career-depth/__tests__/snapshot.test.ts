// src/lib/career-depth/__tests__/snapshot.test.ts
import { describe, it, expect } from "vitest";
import { daySnapshot, salaryLevels } from "../snapshot";

const details = {
  typicalDay: { morning: ["a"], midday: ["b"], afternoon: ["c"] },
  whatYouActuallyDo: ["diagnose", "treat", "chart", "consult"],
  whoThisIsGoodFor: ["empathetic"],
  topSkills: ["precision"],
  entryPaths: ["med school"],
  realityCheck: "Emotionally demanding but meaningful.",
} as never;

describe("daySnapshot", () => {
  it("returns null when content is not curated (hasDetails=false)", () => {
    expect(daySnapshot(details, false)).toBeNull();
  });
  it("returns realityCheck + up to 3 'doing' bullets when curated", () => {
    const s = daySnapshot(details, true);
    expect(s?.realityCheck).toBe("Emotionally demanding but meaningful.");
    expect(s?.doing).toEqual(["diagnose", "treat", "chart"]);
  });
  it("returns null when curated but there is nothing meaningful", () => {
    const empty = { ...details, whatYouActuallyDo: [], realityCheck: undefined } as never;
    expect(daySnapshot(empty, true)).toBeNull();
  });
});

describe("salaryLevels", () => {
  const progression = {
    careerId: "x",
    levels: [
      { level: "entry", title: "Junior", yearsExperience: "0-2 years", salaryRange: "450-550k kr" },
      { level: "mid", title: "Dev", yearsExperience: "2-5 years", salaryRange: "550-700k kr" },
    ],
  } as never;
  it("passes levels through when present", () => {
    expect(salaryLevels(progression)).toHaveLength(2);
  });
  it("returns [] for null or empty progression", () => {
    expect(salaryLevels(null)).toEqual([]);
    expect(salaryLevels({ careerId: "x", levels: [] } as never)).toEqual([]);
  });
});
