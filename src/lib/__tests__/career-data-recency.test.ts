import { describe, it, expect } from "vitest";
import {
  CAREER_DATA_MAX_AGE_DAYS,
  catalogueRecencySummary,
  isCareerSalaryStale,
} from "../career-data-recency";

const NOW = new Date("2026-04-15T00:00:00Z");

describe("isCareerSalaryStale", () => {
  it("treats missing lastVerifiedAt as stale", () => {
    expect(isCareerSalaryStale({}, NOW)).toBe(true);
  });

  it("treats malformed lastVerifiedAt as stale", () => {
    expect(isCareerSalaryStale({ lastVerifiedAt: "not-a-date" }, NOW)).toBe(true);
  });

  it("treats verified-yesterday as fresh", () => {
    const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000).toISOString();
    expect(isCareerSalaryStale({ lastVerifiedAt: yesterday }, NOW)).toBe(false);
  });

  it("treats >12 months ago as stale", () => {
    const tooOld = new Date(
      NOW.getTime() - (CAREER_DATA_MAX_AGE_DAYS + 1) * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isCareerSalaryStale({ lastVerifiedAt: tooOld }, NOW)).toBe(true);
  });

  it("treats exactly-at-cap as fresh", () => {
    const atCap = new Date(
      NOW.getTime() - CAREER_DATA_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isCareerSalaryStale({ lastVerifiedAt: atCap }, NOW)).toBe(false);
  });
});

describe("catalogueRecencySummary", () => {
  it("returns zeros for empty input", () => {
    expect(catalogueRecencySummary([])).toEqual({
      total: 0,
      fresh: 0,
      stale: 0,
      stalePct: 0,
    });
  });

  it("rolls up fresh / stale counts and percentage", () => {
    const fresh = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const stale = new Date(
      NOW.getTime() - (CAREER_DATA_MAX_AGE_DAYS + 30) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const summary = catalogueRecencySummary([
      { lastVerifiedAt: fresh },
      { lastVerifiedAt: stale },
      { lastVerifiedAt: undefined },
      { lastVerifiedAt: fresh },
    ]);
    expect(summary.total).toBe(4);
    expect(summary.fresh).toBe(2);
    expect(summary.stale).toBe(2);
    expect(summary.stalePct).toBe(50);
  });
});
