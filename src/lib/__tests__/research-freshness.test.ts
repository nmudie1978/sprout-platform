import { describe, it, expect } from "vitest";
import {
  analyzeItem,
  analyzeResearchFreshness,
  WARNING_WINDOW_DAYS,
  type ResearchSourceItem,
} from "../research-freshness";

const NOW = new Date("2026-06-03T00:00:00Z");

function item(overrides: Partial<ResearchSourceItem> = {}): ResearchSourceItem {
  return {
    id: "x",
    headline: "Some research headline",
    sourceName: "OECD",
    sourceUrl: "https://oecd.org/x",
    sourcePublishedAt: "2025-06-03",
    ...overrides,
  };
}

describe("analyzeItem", () => {
  it("is 'ok' when comfortably within the max age window", () => {
    // published 1 month ago, 24-month window → ~23 months left
    const r = analyzeItem(item({ sourcePublishedAt: "2026-05-03" }), 24, NOW);
    expect(r.status).toBe("ok");
    expect(r.daysUntilExpiry).toBeGreaterThan(WARNING_WINDOW_DAYS);
  });

  it("is 'expiring-soon' inside the warning window but not yet expired", () => {
    // published ~22.5 months ago → expires in ~1.5 months (< 180-day window, > 0)
    const r = analyzeItem(item({ sourcePublishedAt: "2024-07-20" }), 24, NOW);
    expect(r.status).toBe("expiring-soon");
    expect(r.daysUntilExpiry).toBeGreaterThanOrEqual(0);
    expect(r.daysUntilExpiry).toBeLessThan(WARNING_WINDOW_DAYS);
  });

  it("is 'expired' when past the max age window (negative daysUntilExpiry)", () => {
    // published >24 months ago
    const r = analyzeItem(item({ sourcePublishedAt: "2024-01-01" }), 24, NOW);
    expect(r.status).toBe("expired");
    expect(r.daysUntilExpiry).toBeLessThan(0);
  });

  it("treats evergreen items as 'ok' even when ancient", () => {
    const r = analyzeItem(item({ sourcePublishedAt: "2010-01-01", evergreen: true }), 24, NOW);
    expect(r.status).toBe("ok");
  });

  it("truncates long headlines", () => {
    const long = "x".repeat(100);
    const r = analyzeItem(item({ headline: long }), 24, NOW);
    expect(r.headline.length).toBeLessThanOrEqual(63); // 60 + "..."
    expect(r.headline.endsWith("...")).toBe(true);
  });
});

describe("analyzeResearchFreshness", () => {
  const facts: ResearchSourceItem[] = [
    item({ id: "f-ok", sourcePublishedAt: "2026-05-01" }),
    item({ id: "f-soon", sourcePublishedAt: "2024-07-20" }),
    item({ id: "f-exp", sourcePublishedAt: "2023-01-01" }),
  ];
  const stats: ResearchSourceItem[] = [
    item({ id: "s-ok", sourcePublishedAt: "2026-01-01" }),
    item({ id: "s-exp", sourcePublishedAt: "2023-01-01" }),
  ];

  it("rolls up per-bucket counts and the hasExpired flag", () => {
    const r = analyzeResearchFreshness(facts, stats, {
      maxFactAgeMonths: 24,
      maxEvidenceAgeMonths: 24,
      now: NOW,
    });
    expect(r.summary.facts).toEqual({ ok: 1, expiringSoon: 1, expired: 1, total: 3 });
    expect(r.summary.evidence).toEqual({ ok: 1, expiringSoon: 0, expired: 1, total: 2 });
    expect(r.summary.totalIssues).toBe(3); // 1 soon + 2 expired
    expect(r.summary.hasExpired).toBe(true);
    expect(r.generatedAt).toBe(NOW.toISOString());
  });

  it("hasExpired is false when nothing is expired", () => {
    const r = analyzeResearchFreshness(
      [item({ id: "ok", sourcePublishedAt: "2026-05-01" })],
      [],
      { maxFactAgeMonths: 24, maxEvidenceAgeMonths: 24, now: NOW },
    );
    expect(r.summary.hasExpired).toBe(false);
    expect(r.summary.totalIssues).toBe(0);
  });
});
