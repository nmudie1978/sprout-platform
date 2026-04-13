/**
 * Matching Engine — Type Definitions
 *
 * All interfaces for the hybrid career matching engine.
 * Career profiles and user profiles share the same dimensional
 * space so scoring is a direct weighted comparison.
 */

// ── Career Match Profile ──────────────────────────────────────────

/** Per-career attribute vector derived from existing career data. */
export interface CareerMatchProfile {
  careerId: string;

  // Subject affinity: how strongly each school subject relates (0-1)
  subjectRelevance: Record<string, number>;

  // Work environment dimensions (0-1 each, can sum > 1 for mixed roles)
  desk: number;
  handsOn: number;
  outdoors: number;
  creative: number;

  // People & collaboration (0 = solo, 1 = highly social)
  peopleOrientation: number;

  // Career character (0-1)
  analytical: number;
  variety: number;
  academic: number;

  // Readiness (0-1, where 0 = entry-level, 1 = doctorate)
  academicDemand: number;
  pathwayType: string;

  // Metadata (not scored, used for diversity/filtering)
  category: string;
  sector: string;
  growthOutlook: string;
  entryLevel: boolean;
}

// ── User Match Profile ────────────────────────────────────────────

/** Normalized user preferences in the same dimensional space. */
export interface UserMatchProfile {
  // Subject preferences (0-1 per subject; starred = 1.0, normal = 0.7)
  subjects: Record<string, number>;

  // Work environment preferences (0-1 each)
  desk: number;
  handsOn: number;
  outdoors: number;
  creative: number;

  // People preference (0 = solo, 1 = highly social)
  peopleOrientation: number;

  // Whether the user expressed a work style preference at all
  hasWorkStylePreference: boolean;
  // Whether the user expressed a people preference at all
  hasPeoplePreference: boolean;

  // Free-form interest keywords
  interests: string[];
}

// ── Scoring Output ────────────────────────────────────────────────

/** Per-dimension contribution to the final score. */
export interface DimensionScore {
  dimension: string;
  label: string;
  weight: number;
  /** Raw similarity 0-1 before weighting */
  similarity: number;
  /** Weighted contribution to final score */
  contribution: number;
}

/** Full match result for a single career. */
export interface MatchResult {
  career: CareerMatchProfile;
  /** 0-100 match percentage */
  matchPercent: number;
  /** Per-dimension breakdown */
  dimensions: DimensionScore[];
  /** Top 1-3 human-readable reasons */
  reasons: string[];
  /** Strength tier for display */
  tier: "strong" | "good" | "discovery";
  /** Interest keyword hits (bonus) */
  interestHits: number;
  /** True if this career was inserted as a diversity/stretch pick */
  isStretchMatch: boolean;
}

// ── Configuration ─────────────────────────────────────────────────

/** Configurable weights for each scoring dimension. Must sum to ~1.0. */
export interface MatchingWeights {
  subjectMatch: number;
  workStyleMatch: number;
  peopleMatch: number;
  creativeAnalytical: number;
  varietyFit: number;
  academicFit: number;
}

/** Tuning constants for diversity, floors, caps. */
export interface MatchingConfig {
  weights: MatchingWeights;

  /** Minimum match % to appear on radar (0-100) */
  scoreFloor: number;

  /** Max share of top results from any one category (0-1) */
  maxCategoryShare: number;
  /** How many top results to check for concentration */
  topBandSize: number;

  /** Minimum number of distinct categories in top results */
  minCategorySpread: number;

  /** Number of "stretch/discovery" slots to reserve */
  stretchSlots: number;

  /** Bonus for interest keyword hits (added to raw score) */
  interestBonus: number;

  /** Subject boost for careers on curated boost lists (0-1) */
  explicitBoostFloor: number;

  /** Scoring bonus (percentage points) for well-known careers */
  popularityBonus: number;
}
