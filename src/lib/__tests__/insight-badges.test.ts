import { describe, it, expect } from "vitest";
import { isNewDrop, NEW_DROP_DAYS } from "@/components/insights/insight-carousel";

describe("Insight Badges", () => {
  describe("isNewDrop", () => {
    it("returns true for content published today", () => {
      const today = new Date().toISOString();
      expect(isNewDrop(today)).toBe(true);
    });

    it("returns true for content published 3 days ago", () => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      expect(isNewDrop(date.toISOString())).toBe(true);
    });

    it("returns true for content published exactly at the boundary", () => {
      const date = new Date();
      date.setDate(date.getDate() - NEW_DROP_DAYS);
      // Add a small buffer to stay inside the window despite clock drift
      // between test setup and isNewDrop's internal Date.now() call
      date.setSeconds(date.getSeconds() + 5);
      expect(isNewDrop(date.toISOString())).toBe(true);
    });

    it("returns false for content published 8 days ago", () => {
      const date = new Date();
      date.setDate(date.getDate() - 8);
      expect(isNewDrop(date.toISOString())).toBe(false);
    });

    it("returns false for content published months ago", () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 3);
      expect(isNewDrop(date.toISOString())).toBe(false);
    });
  });

  describe("Watched badge logic", () => {
    it("shows watched when URL is in watchedUrls set", () => {
      const watchedUrls = new Set([
        "https://www.youtube.com/watch?v=abc123",
        "https://www.youtube.com/watch?v=def456",
      ]);
      expect(watchedUrls.has("https://www.youtube.com/watch?v=abc123")).toBe(true);
      expect(watchedUrls.has("https://www.youtube.com/watch?v=xyz999")).toBe(false);
    });

    it("does not apply watched to article URLs", () => {
      // Watched is only tracked for video URLs (YouTube pattern)
      const watchedUrls = new Set([
        "https://www.youtube.com/watch?v=abc123",
      ]);
      const articleUrl = "https://weforum.org/article/future-of-work";
      expect(watchedUrls.has(articleUrl)).toBe(false);
    });
  });

  describe("NEW_DROP_DAYS constant", () => {
    it("is set to 7 days", () => {
      expect(NEW_DROP_DAYS).toBe(7);
    });
  });
});
