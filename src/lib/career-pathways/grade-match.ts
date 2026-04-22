/**
 * Grade-aware career matching.
 *
 * Two user-driven signals:
 *   1. `gradeRange` — a range like "I expect to land 3-4", used to
 *      RE-RANK careers (never to hide them). Career gradeBand
 *      overlaps with range → "aligned"; falls above the user's range
 *      → "stretch" or "reach" depending on the gap; falls below → also
 *      "aligned" (the youth comfortably exceeds the typical band).
 *   2. `excludeUniversity` — an explicit opt-out. University-route
 *      careers ARE filtered out when this is true (the user's
 *      stated choice, not a platform judgment).
 *
 * The core product principle: the platform shows honest information
 * about fit, but never makes the decision for the user. A 3-grade
 * student still sees medicine in the list — it's just marked
 * "reach" with a clear "what would change this?" line.
 */

import type {
  Career,
  DiscoveryPreferences,
  EntryRoute,
  GradeBand,
} from "../career-pathways";
import { UNIVERSITY_ROUTES } from "../career-pathways";

export type GradeMatchStatus =
  | "aligned"  // User's range overlaps the career's typical band
  | "stretch"  // Gap of 1 between user's ceiling and career's floor
  | "reach"    // Gap of 2+ — achievable but requires deliberate push
  | "unknown"; // Career has no gradeBand, or user has no gradeRange set

export interface GradeMatchResult {
  status: GradeMatchStatus;
  /**
   * Distance between user's ceiling and the career's floor, clamped
   * to 0 when the ranges overlap. Useful for sorting inside a status
   * bucket (lower gap → higher priority within "stretch" group).
   */
  gap: number;
  /**
   * User-facing copy suggesting what would change the status — e.g.
   * "Pull your average up to 4 to move this into aligned range."
   * Empty string when aligned or unknown.
   */
  coachingHint: string;
}

/**
 * Returns the fit status of a single career against a user's grade
 * range. Pure — safe in both server and client contexts.
 *
 * Semantics:
 *   - Both sides undefined → "unknown"
 *   - Overlap (range.high >= band.floor AND range.low <= band.ceiling)
 *       → "aligned"
 *   - User's range sits BELOW career's band by gap G:
 *       G === 1 → "stretch"
 *       G >= 2 → "reach"
 *   - User's range sits ABOVE career's band → "aligned" (they easily
 *     qualify; no need to stigmatise).
 */
export function matchCareerToGradeRange(
  career: Pick<Career, "gradeBand">,
  range: DiscoveryPreferences["gradeRange"],
): GradeMatchResult {
  if (!range || !career.gradeBand) {
    return { status: "unknown", gap: 0, coachingHint: "" };
  }

  const { floor, ceiling } = career.gradeBand;
  const { low, high } = range;

  // Overlap — common case for most users
  const overlaps = high >= floor && low <= ceiling;
  if (overlaps) {
    return { status: "aligned", gap: 0, coachingHint: "" };
  }

  // User comfortably above the career's band — still aligned, zero
  // stigma. (A 5-grade student seeing "baker" shouldn't get flagged
  // as "overqualified".)
  if (low > ceiling) {
    return { status: "aligned", gap: 0, coachingHint: "" };
  }

  // Below the career's band — this is where stretch/reach copy kicks in
  const gap = floor - high;
  if (gap === 1) {
    return {
      status: "stretch",
      gap,
      coachingHint: `Pull your top grade up to ${floor} to move this into range.`,
    };
  }
  return {
    status: "reach",
    gap,
    coachingHint: `Typical applicants land around ${floor}–${ceiling}. Worth talking to an advisor about a realistic plan.`,
  };
}

/**
 * Apply the `excludeUniversity` filter. Returns true if the career
 * should be HIDDEN — use as the predicate in a `.filter(!)` call.
 *
 * Only hides careers whose entryRoute is explicitly in UNIVERSITY_ROUTES.
 * Un-annotated careers (no entryRoute) are always kept — we don't
 * hide things we don't have data on.
 */
export function shouldExcludeByRoute(
  career: Pick<Career, "entryRoute">,
  prefs: Pick<DiscoveryPreferences, "excludeUniversity">,
): boolean {
  if (!prefs.excludeUniversity) return false;
  if (!career.entryRoute) return false;
  return UNIVERSITY_ROUTES.has(career.entryRoute);
}

/**
 * Score adjustment to layer into the existing Match % calculation.
 * Additive — callers apply this on top of the existing score.
 *
 *   aligned:  +8   (boost — clearly fits the user's grade trajectory)
 *   unknown:   0   (no opinion — un-annotated or user hasn't set range)
 *   stretch:  -6   (demote but visible)
 *   reach:    -15  (clearly demote but don't remove — honesty + autonomy)
 *
 * Values chosen so that grade-fit is meaningful but doesn't dominate
 * other signals (subjects, work-style, interests each can contribute
 * 10-20 points). A "reach" career with a perfect subject match still
 * surfaces — as it should.
 */
export function gradeMatchScoreAdjustment(status: GradeMatchStatus): number {
  switch (status) {
    case "aligned":  return 8;
    case "unknown":  return 0;
    case "stretch":  return -6;
    case "reach":    return -15;
  }
}

/**
 * Convenience: validate a gradeRange is sane. Returns the range
 * unchanged if valid, or undefined if not. Used by the profile PATCH
 * sanitiser to reject garbage input without rejecting the whole body.
 */
export function sanitizeGradeRange(
  value: unknown,
): DiscoveryPreferences["gradeRange"] {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const low = Number(v.low);
  const high = Number(v.high);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return undefined;
  if (low < 1 || high > 6) return undefined;
  if (low > high) return undefined;
  // Quantise to integers — partial grades aren't surfaced in the UI
  return { low: Math.round(low), high: Math.round(high) };
}

/**
 * Apply the combined grade-aware filter + ranking to a list of
 * careers. Does NOT replace the existing Match % engine — it augments
 * it. Caller supplies the existing score and gets back the adjusted
 * score plus a status badge for UI.
 */
export function enrichWithGradeMatch<T extends Pick<Career, "gradeBand" | "entryRoute">>(
  careers: T[],
  prefs: Pick<DiscoveryPreferences, "gradeRange" | "excludeUniversity">,
): Array<{ career: T; match: GradeMatchResult; excluded: boolean }> {
  return careers.map((career) => ({
    career,
    match: matchCareerToGradeRange(career, prefs.gradeRange),
    excluded: shouldExcludeByRoute(career, prefs),
  }));
}

/** Type-only export — only used for hint re-exports from consumers. */
export type { EntryRoute, GradeBand };
