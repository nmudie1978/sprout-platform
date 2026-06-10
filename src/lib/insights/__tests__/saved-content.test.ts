import { describe, it, expect } from "vitest";
import { badgeToSavedItemType, SKILLS_CONTENT_TAG } from "../saved-content";

describe("SKILLS_CONTENT_TAG", () => {
  it("is the stable marker shared by save + list", () => {
    expect(SKILLS_CONTENT_TAG).toBe("skills-that-matter");
  });
});

describe("badgeToSavedItemType", () => {
  it("maps the three gallery badges (case-insensitive)", () => {
    expect(badgeToSavedItemType("Article")).toBe("ARTICLE");
    expect(badgeToSavedItemType("podcast")).toBe("PODCAST");
    expect(badgeToSavedItemType("VIDEO")).toBe("VIDEO");
  });
  it("falls back to ARTICLE for unknown/missing badges", () => {
    expect(badgeToSavedItemType(undefined)).toBe("ARTICLE");
    expect(badgeToSavedItemType("something-else")).toBe("ARTICLE");
  });
});
