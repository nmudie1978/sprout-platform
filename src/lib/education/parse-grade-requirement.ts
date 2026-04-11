/**
 * Parses the free-text `minimumGrade` field on a CareerRequirements record
 * into a structured shape suitable for conditional UI rendering.
 *
 * The source JSON uses a handful of consistent sentence templates, all
 * referencing the Norwegian school grade scale (1-6, where 6 is top):
 *
 *   "Solid pass in core subjects, no specific grade requirement"
 *   "Top grades in mathematics and science subjects, typically 5-6 in Norwegian scale"
 *   "Good grades in relevant subjects, typically 4-6 in Norwegian scale"
 *   "Strong grades in business-related subjects, typically 4-6 in Norwegian scale"
 *   "Solid pass in core subjects, typically 3-4 in Norwegian scale"
 *
 * The parser extracts a numeric range (via regex) and a qualitative tier
 * (top | strong | good | pass). A result is only considered to have a
 * real cutoff when BOTH a numeric range is present AND the "no specific
 * grade requirement" opt-out phrase is absent. Callers should render a
 * grade pill only when `hasCutoff === true` — vocational / entry-
 * accessible careers have no cutoff and the pill should be hidden rather
 * than filled with a placeholder.
 */

export type GradeTier = "top" | "strong" | "good" | "pass";

export interface GradeRequirement {
  /** True when a real numeric cutoff was found in the source text. */
  hasCutoff: boolean;
  /** Lower bound of the typical grade range on the Norwegian 1-6 scale. */
  gradeMin: number | null;
  /** Upper bound of the typical grade range on the Norwegian 1-6 scale. */
  gradeMax: number | null;
  /** Qualitative tier parsed from the leading phrase, if present. */
  tier: GradeTier | null;
  /** The original text, preserved for tooltip / debug display. */
  rawText: string;
}

const NO_CUTOFF_PHRASE = "no specific grade requirement";

export function parseGradeRequirement(
  text: string | null | undefined,
): GradeRequirement {
  const raw = (text ?? "").trim();
  const lower = raw.toLowerCase();

  const empty: GradeRequirement = {
    hasCutoff: false,
    gradeMin: null,
    gradeMax: null,
    tier: null,
    rawText: raw,
  };

  if (!raw || lower.includes(NO_CUTOFF_PHRASE)) {
    return empty;
  }

  // Extract a "N-M" / "N\u2013M" / "N\u2014M" digit range (hyphen, en-dash,
  // or em-dash). We intentionally restrict to single-digit bounds so the
  // regex can't accidentally match a year or multi-digit sequence.
  const rangeMatch = raw.match(/(\d)\s*[-\u2013\u2014]\s*(\d)/);
  if (!rangeMatch) return empty;

  const min = parseInt(rangeMatch[1], 10);
  const max = parseInt(rangeMatch[2], 10);

  // Sanity-check against the Norwegian scale. Anything outside 1-6 or
  // where min > max is almost certainly a false match and should be
  // treated as "no cutoff" rather than rendered as a bogus grade pill.
  if (min < 1 || min > 6 || max < 1 || max > 6 || min > max) {
    return empty;
  }

  let tier: GradeTier | null = null;
  if (lower.includes("top grades")) tier = "top";
  else if (lower.includes("strong grades")) tier = "strong";
  else if (lower.includes("good grades")) tier = "good";
  else if (lower.includes("solid pass")) tier = "pass";

  return {
    hasCutoff: true,
    gradeMin: min,
    gradeMax: max,
    tier,
    rawText: raw,
  };
}

const TIER_LABEL: Record<GradeTier, string> = {
  top: "Top grades",
  strong: "Strong grades",
  good: "Good grades",
  pass: "Passing grades",
};

/**
 * Human-readable short label for a grade pill — e.g. "Top grades (5-6)".
 * Returns null when the requirement has no cutoff.
 */
export function formatGradeLabel(grade: GradeRequirement): string | null {
  if (!grade.hasCutoff || grade.gradeMin === null || grade.gradeMax === null) {
    return null;
  }
  const range = `${grade.gradeMin}\u2013${grade.gradeMax}`;
  const prefix = grade.tier ? TIER_LABEL[grade.tier] : "Grades";
  return `${prefix} (${range})`;
}

/**
 * Multi-line tooltip content describing the typical grade cutoff, the
 * Norwegian scale context, and the original free-text string. Returns
 * null when there is no cutoff.
 */
export function formatGradeTooltip(grade: GradeRequirement): string | null {
  if (!grade.hasCutoff || grade.gradeMin === null || grade.gradeMax === null) {
    return null;
  }
  const range = `${grade.gradeMin}\u2013${grade.gradeMax}`;
  return [
    `Typical grade average: ${range}.`,
    `Norwegian scale 1\u20136 (6 is the top grade).`,
    "",
    grade.rawText,
  ].join("\n");
}
