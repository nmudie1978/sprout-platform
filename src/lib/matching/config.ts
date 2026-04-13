/**
 * Matching Engine — Configuration
 *
 * All tunable weights and constants live here.
 * Adjust these to change how the radar feels without
 * touching scoring logic.
 *
 * Weights should sum to ~1.0. Each weight controls how much
 * that dimension contributes to the final 0-100 match score.
 */

import type { MatchingConfig } from "./types";

export const MATCHING_CONFIG: MatchingConfig = {
  weights: {
    /**
     * How much school subject alignment matters.
     * This is the strongest signal — if a user picks Chemistry,
     * careers related to Chemistry should rank higher.
     */
    subjectMatch: 0.35,

    /**
     * How much work environment fit matters.
     * "At a desk" user should see desk careers ranked higher,
     * but NOT see hands-on careers vanish entirely.
     */
    workStyleMatch: 0.22,

    /**
     * How much people interaction preference matters.
     * "With people" user should see high-people careers rank higher.
     */
    peopleMatch: 0.15,

    /**
     * How much creative vs analytical alignment matters.
     * Derived from subject choices and career character.
     */
    creativeAnalytical: 0.10,

    /**
     * How much work variety preference matters.
     * Some careers are routine, others are varied day-to-day.
     */
    varietyFit: 0.08,

    /**
     * How much academic pathway alignment matters.
     * Soft signal — doesn't gate, just gently ranks.
     * Entry-level careers get a slight boost for younger users.
     */
    academicFit: 0.10,
  },

  /** Minimum match % to appear on radar. Below this, career is hidden. */
  scoreFloor: 25,

  /** No single category may claim more than 45% of the top band.
   *  Raised from 0.35 — when a user picks a single subject, their
   *  primary category should dominate rather than being diluted to
   *  a minority by diversity constraints. */
  maxCategoryShare: 0.45,

  /** Number of top results to enforce concentration limits on. */
  topBandSize: 30,

  /** Top results should span at least this many categories. */
  minCategorySpread: 3,

  /** Reserve this many slots for "discovery/stretch" matches. */
  stretchSlots: 1,

  /** Bonus added per interest keyword hit (in percentage points). */
  interestBonus: 3,

  /**
   * Minimum subject relevance for careers on curated boost lists.
   * Ensures boosted careers always have meaningful subject signal
   * even if the category weight is low.
   */
  explicitBoostFloor: 0.5,
};

// ── Work environment dimension mappings ───────────────────────────
// How each WorkSetting maps to continuous 0-1 dimensions.
// A career can score on multiple dimensions (e.g. "mixed" = 0.5 everywhere).

export const WORK_SETTING_TO_DIMENSIONS: Record<
  string,
  { desk: number; handsOn: number; outdoors: number; creative: number }
> = {
  desk:       { desk: 1.0, handsOn: 0.0,  outdoors: 0.0, creative: 0.15 },
  "hands-on": { desk: 0.0, handsOn: 1.0,  outdoors: 0.3, creative: 0.2  },
  outdoors:   { desk: 0.0, handsOn: 0.4,  outdoors: 1.0, creative: 0.1  },
  creative:   { desk: 0.3, handsOn: 0.25, outdoors: 0.05, creative: 1.0 },
  mixed:      { desk: 0.4, handsOn: 0.4,  outdoors: 0.3, creative: 0.3  },
};

// ── People intensity mapping ──────────────────────────────────────

export const PEOPLE_INTENSITY_TO_SCORE: Record<string, number> = {
  high: 0.9,
  medium: 0.5,
  low: 0.1,
};

// ── People preference mapping ─────────────────────────────────────

export const PEOPLE_PREF_TO_SCORE: Record<string, number> = {
  "with-people": 0.85,
  mixed: 0.5,
  "mostly-alone": 0.15,
};

// ── Academic demand mapping ───────────────────────────────────────

export const ACADEMIC_DEMAND_TO_SCORE: Record<string, number> = {
  low: 0.15,
  moderate: 0.4,
  strong: 0.7,
  "very-strong": 0.95,
};

// ── Subject display labels ────────────────────────────────────────

export const SUBJECT_LABELS: Record<string, string> = {
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  math: "Math",
  computing: "Computing / IT",
  english: "English",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  pe: "PE",
  business: "Business",
  languages: "Languages",
  psychology: "Psychology",
  "design-tech": "Design & Tech",
  "workshop-making": "Workshop & Making",
  "health-social": "Health & Social",
  drama: "Drama",
  "food-tech": "Food Tech",
  "media-studies": "Media Studies",
};

// ── Work style display labels ─────────────────────────────────────

export const WORK_STYLE_LABELS: Record<string, string> = {
  "hands-on": "Hands-on",
  desk: "At a desk",
  outdoors: "Outdoors",
  creative: "Creative",
  mixed: "A mix",
};

// ── Analytical keywords ───────────────────────────────────────────
// Used to derive the analytical dimension for careers.

export const ANALYTICAL_KEYWORDS = [
  "analys", "data", "research", "statistic", "calculat", "math",
  "logic", "diagnos", "audit", "financ", "quantit", "algorithm",
  "model", "forecast", "assess", "evaluat", "investigat", "test",
  "measure", "optimis", "strateg",
];
