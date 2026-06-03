import { describe, it, expect } from "vitest";
import { archiveUrl } from "../archive-url";

describe("archiveUrl", () => {
  it("wraps a plain URL in the Wayback latest-snapshot form", () => {
    expect(archiveUrl("https://www.weforum.org/publications/the-future-of-jobs-report-2025/")).toBe(
      "https://web.archive.org/web/2/https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    );
  });

  it("preserves query strings", () => {
    expect(archiveUrl("https://example.org/x?a=1&b=2")).toBe(
      "https://web.archive.org/web/2/https://example.org/x?a=1&b=2",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(archiveUrl("  https://example.org/x  ")).toBe(
      "https://web.archive.org/web/2/https://example.org/x",
    );
  });

  it("returns empty string for empty input", () => {
    expect(archiveUrl("")).toBe("");
    expect(archiveUrl("   ")).toBe("");
  });
});
