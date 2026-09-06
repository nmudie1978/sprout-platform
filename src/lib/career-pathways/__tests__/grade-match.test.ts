import { describe, it, expect } from "vitest";
import {
  matchCareerToGradeRange,
  gradeMatchScoreAdjustment,
  shouldExcludeByRoute,
} from "../grade-match";

/**
 * CHARACTERISATION TESTS.
 *
 * These pin the behaviour of grade matching on the Norwegian VGS 1–6 scale
 * exactly as it stands today. They exist because this module feeds
 * `matching/engine.ts` via `gradeMatchScoreAdjustment`, so a change here
 * silently re-ranks careers for every user — the kind of regression nobody
 * notices until the rankings look subtly wrong.
 *
 * They are also the prerequisite for making the scale country-aware. Sweden
 * uses meritvärde (a 0–22.5 range) and Denmark a 7-point scale, so the 1–6
 * assumptions baked in here have to be lifted eventually. Do not attempt that
 * refactor until these pass, and require them to still pass afterwards with
 * the Norwegian numbers unchanged.
 */
const band = (floor: number, ceiling: number) => ({ gradeBand: { floor, ceiling } });

describe("matchCareerToGradeRange", () => {
  it("returns unknown when either side is missing", () => {
    expect(matchCareerToGradeRange(band(4, 5), undefined).status).toBe("unknown");
    expect(matchCareerToGradeRange({ gradeBand: undefined }, { low: 3, high: 4 }).status).toBe("unknown");
  });

  it("is aligned when the ranges overlap", () => {
    expect(matchCareerToGradeRange(band(4, 5), { low: 3, high: 4 }).status).toBe("aligned");
    expect(matchCareerToGradeRange(band(3, 6), { low: 4, high: 5 }).status).toBe("aligned");
  });

  // A 5-grade student seeing "baker" must not be flagged as overqualified.
  it("is aligned — never stigmatised — when the user is above the band", () => {
    const r = matchCareerToGradeRange(band(2, 3), { low: 5, high: 6 });
    expect(r.status).toBe("aligned");
    expect(r.gap).toBe(0);
    expect(r.coachingHint).toBe("");
  });

  it("is a stretch at a gap of exactly one grade", () => {
    const r = matchCareerToGradeRange(band(5, 6), { low: 3, high: 4 });
    expect(r.status).toBe("stretch");
    expect(r.gap).toBe(1);
    expect(r.coachingHint).toContain("5");
  });

  it("is a reach at a gap of two or more", () => {
    const r = matchCareerToGradeRange(band(5, 6), { low: 2, high: 3 });
    expect(r.status).toBe("reach");
    expect(r.gap).toBe(2);
    expect(r.coachingHint).toContain("advisor");
  });

  // The core product principle: honest labelling, never hiding.
  it("never returns a status that would remove a career from view", () => {
    for (const high of [1, 2, 3, 4, 5, 6]) {
      const r = matchCareerToGradeRange(band(5, 6), { low: high, high });
      expect(["aligned", "stretch", "reach", "unknown"]).toContain(r.status);
    }
  });
});

describe("gradeMatchScoreAdjustment", () => {
  it("boosts aligned, demotes stretch and reach, ignores unknown", () => {
    expect(gradeMatchScoreAdjustment("aligned")).toBe(8);
    expect(gradeMatchScoreAdjustment("unknown")).toBe(0);
    expect(gradeMatchScoreAdjustment("stretch")).toBe(-6);
    expect(gradeMatchScoreAdjustment("reach")).toBe(-15);
  });

  it("demotes a reach more than a stretch", () => {
    expect(gradeMatchScoreAdjustment("reach")).toBeLessThan(
      gradeMatchScoreAdjustment("stretch"),
    );
  });
});

describe("shouldExcludeByRoute", () => {
  it("hides nothing unless the user opted out of university", () => {
    expect(shouldExcludeByRoute({ entryRoute: "bachelor" }, { excludeUniversity: false })).toBe(false);
  });

  it("never hides a career with no route data", () => {
    expect(shouldExcludeByRoute({ entryRoute: undefined }, { excludeUniversity: true })).toBe(false);
  });

  it("hides university routes when the user opted out", () => {
    expect(shouldExcludeByRoute({ entryRoute: "bachelor" }, { excludeUniversity: true })).toBe(true);
  });

  it("keeps vocational routes when the user opted out of university", () => {
    expect(shouldExcludeByRoute({ entryRoute: "fagbrev" }, { excludeUniversity: true })).toBe(false);
  });
});
