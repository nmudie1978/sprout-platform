import { describe, it, expect } from "vitest";
import { getNextBatch, isWithinMaxAge } from "../pool-service";
import type { PoolItem } from "../pool-types";

const NOW = new Date("2026-06-15T00:00:00Z").getTime();

function makeItem(overrides: Partial<PoolItem> = {}): PoolItem {
  return {
    id: Math.random().toString(36).slice(2),
    title: "t",
    summary: "s",
    sourceName: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/x",
    contentType: "article",
    tags: ["future-of-work"],
    domain: "weforum.org",
    addedAt: "2026-01-01T00:00:00Z",
    lastVerifiedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "verified",
    canonicalUrlHash: "h",
    ...overrides,
  };
}

describe("isWithinMaxAge", () => {
  it("accepts content published within the last 12 months", () => {
    expect(isWithinMaxAge({ publishDate: "2026-01-10" }, NOW)).toBe(true);
    expect(isWithinMaxAge({ publishDate: "2025-06-15" }, NOW)).toBe(true);
  });

  it("rejects content older than 12 months", () => {
    expect(isWithinMaxAge({ publishDate: "2025-06-14" }, NOW)).toBe(false);
    expect(isWithinMaxAge({ publishDate: "2024-01-07" }, NOW)).toBe(false);
    expect(isWithinMaxAge({ publishDate: "2023-11-20" }, NOW)).toBe(false);
  });

  it("rejects undated content (freshness cannot be proven)", () => {
    expect(isWithinMaxAge({ publishDate: undefined }, NOW)).toBe(false);
    expect(isWithinMaxAge({ publishDate: "not-a-date" }, NOW)).toBe(false);
  });
});

describe("getNextBatch recency filtering", () => {
  it("never returns content older than 1 year", () => {
    // Use a small enough age that the test stays valid as time passes: items
    // dated relative to today, not absolute, so the suite doesn't rot.
    const now = Date.now();
    const recent = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const stale = new Date(now - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const pool: PoolItem[] = [
      makeItem({ id: "fresh", publishDate: recent, domain: "weforum.org" }),
      makeItem({ id: "old", publishDate: stale, domain: "oecd.org" }),
      makeItem({ id: "undated", publishDate: undefined, domain: "unesco.org" }),
    ];

    const batch = getNextBatch(pool, { batchSize: 10 });
    const ids = batch.items.map((i) => i.id);
    expect(ids).toContain("fresh");
    expect(ids).not.toContain("old");
    expect(ids).not.toContain("undated");
  });

  it("returns an empty batch when every item is stale (rather than serving stale)", () => {
    const now = Date.now();
    const stale = new Date(now - 800 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const pool: PoolItem[] = [
      makeItem({ id: "a", publishDate: stale }),
      makeItem({ id: "b", publishDate: stale, domain: "oecd.org" }),
    ];
    const batch = getNextBatch(pool, { batchSize: 10 });
    expect(batch.items).toHaveLength(0);
  });
});
