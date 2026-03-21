/**
 * YOUTH LENS — CANONICAL TAGS
 *
 * Standard tag vocabulary for matching videos to stat insights.
 * All tags use snake_case. Normalisation strips whitespace,
 * lowercases, and converts hyphens/spaces to underscores.
 */

// ============================================
// CANONICAL TAG SET
// ============================================

export const CANONICAL_TAGS = [
  // Career direction & identity
  "career_uncertainty",
  "identity",
  "decision_making",
  "overwhelm",
  "career_pathways",

  // Workplace exposure
  "job_shadowing",
  "workplace_exposure",
  "first_job",
  "internship",

  // Skills & readiness
  "skills_gap",
  "confidence",
  "soft_skills",
  "employability",
  "communication",
  "adaptability",

  // Support & guidance
  "mentorship",
  "guidance",
  "networking",

  // Future of work
  "future_jobs",
  "technology",
  "remote_work",

  // Motivation & mindset
  "motivation",
  "grit",
  "resilience",
  "growth_mindset",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];

// ============================================
// TAG NORMALISATION
// ============================================

/**
 * Normalise a tag string to canonical form.
 * - Trims whitespace
 * - Lowercases
 * - Replaces hyphens and spaces with underscores
 * - Strips non-alphanumeric characters (except underscores)
 */
export function normaliseTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Normalise an array of tags.
 */
export function normaliseTags(raw: string[]): string[] {
  return raw.map(normaliseTag).filter(Boolean);
}

/**
 * Check if a tag is in the canonical set.
 */
export function isCanonicalTag(tag: string): tag is CanonicalTag {
  return (CANONICAL_TAGS as readonly string[]).includes(tag);
}
