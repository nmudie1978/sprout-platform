// src/lib/career-voices/__tests__/match.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTag, careerTagVariants, matchesCareer } from "../match";

describe("normalizeTag", () => {
  it("lowercases, hyphenates spaces, strips punctuation", () => {
    expect(normalizeTag("IT Project Manager")).toBe("it-project-manager");
    expect(normalizeTag("  Software   Developer ")).toBe("software-developer");
    expect(normalizeTag("Nurse (RN)")).toBe("nurse-rn");
    expect(normalizeTag("already-normalized")).toBe("already-normalized");
  });
});

describe("careerTagVariants", () => {
  it("includes the normalized id and title", () => {
    const v = careerTagVariants({ id: "software-developer", title: "Software Developer" });
    expect(v.has("software-developer")).toBe(true);
  });
});

describe("matchesCareer", () => {
  const career = { id: "software-developer", title: "Software Developer" };
  it("matches when a tag equals the id (any casing/spacing)", () => {
    expect(matchesCareer(["Software Developer"], career)).toBe(true);
    expect(matchesCareer(["software-developer"], career)).toBe(true);
  });
  it("matches when any of several tags matches", () => {
    expect(matchesCareer(["programme-manager", "software-developer"], career)).toBe(true);
  });
  it("does not match unrelated tags", () => {
    expect(matchesCareer(["nurse", "dentist"], career)).toBe(false);
  });
  it("is safe on empty tags", () => {
    expect(matchesCareer([], career)).toBe(false);
  });
});
