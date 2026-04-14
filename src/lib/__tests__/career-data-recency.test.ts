import { describe, it, expect } from "vitest";
import {
  CAREER_DATA_MAX_AGE_DAYS,
  CATALOGUE_BASELINE_VERIFIED_AT,
  catalogueRecencySummary,
  effectiveVerifiedAt,
  isCareerExplicitlyVerified,
  isCareerSalaryStale,
} from "../career-data-recency";

const NOW = new Date("2026-06-15T00:00:00Z"); // 2 months after baseline

describe("effectiveVerifiedAt", () => {
  it("falls back to the catalogue baseline when no per-career timestamp", () => {
    expect(effectiveVerifiedAt({})).toBe(CATALOGUE_BASELINE_VERIFIED_AT);
  });
  it("returns the explicit timestamp when present", () => {
    expect(effectiveVerifiedAt({ lastVerifiedAt: "2026-05-01" })).toBe("2026-05-01");
  });
});

describe("isCareerSalaryStale", () => {
  it("uses the baseline for careers without lastVerifiedAt — fresh shortly after baseline", () => {
    expect(isCareerSalaryStale({}, NOW)).toBe(false);
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

  it("baseline-only careers go stale once the baseline is older than 12 months", () => {
    const farFuture = new Date("2027-05-01T00:00:00Z"); // ~1 year + 16 days after baseline
    expect(isCareerSalaryStale({}, farFuture)).toBe(true);
  });
});

describe("isCareerExplicitlyVerified", () => {
  it("returns false for baseline-only careers (no explicit timestamp)", () => {
    expect(isCareerExplicitlyVerified({}, NOW)).toBe(false);
  });
  it("returns true when an explicit, fresh timestamp is set", () => {
    expect(isCareerExplicitlyVerified({ lastVerifiedAt: "2026-06-01" }, NOW)).toBe(true);
  });
  it("returns false when explicit timestamp is older than 12 months", () => {
    const tooOld = new Date(
      NOW.getTime() - (CAREER_DATA_MAX_AGE_DAYS + 30) * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isCareerExplicitlyVerified({ lastVerifiedAt: tooOld }, NOW)).toBe(false);
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

  it("baseline-only careers count as fresh shortly after baseline", () => {
    const summary = catalogueRecencySummary(
      [
        { lastVerifiedAt: undefined },
        { lastVerifiedAt: undefined },
        { lastVerifiedAt: undefined },
      ],
      NOW,
    );
    expect(summary.fresh).toBe(3);
    expect(summary.stale).toBe(0);
  });

  it("rolls up fresh / stale counts and percentage", () => {
    const fresh = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const stale = new Date(
      NOW.getTime() - (CAREER_DATA_MAX_AGE_DAYS + 30) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const summary = catalogueRecencySummary(
      [
        { lastVerifiedAt: fresh },
        { lastVerifiedAt: stale },
        { lastVerifiedAt: undefined }, // baseline → fresh (NOW is 2 months after baseline)
        { lastVerifiedAt: fresh },
      ],
      NOW,
    );
    expect(summary.total).toBe(4);
    expect(summary.fresh).toBe(3);
    expect(summary.stale).toBe(1);
    expect(summary.stalePct).toBe(25);
  });
});
