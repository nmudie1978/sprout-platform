/**
 * Types for founder spotlights - real, verified entrepreneurship stories
 *
 * CRITICAL: All spotlights MUST have verified source URLs.
 * No fabricated or invented stories are permitted.
 */

export interface FounderSpotlight {
  id: string;
  title: string; // e.g. "From school project to real business"
  founderName: string; // real person or org name
  founderAgeAtStart?: number; // only if explicitly stated in the source
  country?: string;
  whatTheyBuilt: string; // factual summary, derived from source
  whyItMatters: string; // inspirational framing WITHOUT inventing facts
  keyLesson: string; // inspirational but not fabricated
  sourceName: string; // publication/site
  sourceUrl: string; // must be https
  publishedDateISO?: string; // if available in source
  tags?: FounderSpotlightTag[];
  verified: boolean;
  verifiedAtISO?: string;
  // Internal tracking
  addedAtISO: string;
  addedBy?: string;
  lastCheckedAtISO?: string;
  checkFailReason?: string;
}

export type FounderSpotlightTag =
  | "youth"
  | "student"
  | "side-hustle"
  | "tech"
  | "local-business"
  | "creative"
  | "social-impact"
  | "food-beverage"
  | "service"
  | "e-commerce";

export const FOUNDER_SPOTLIGHT_TAGS: {
  value: FounderSpotlightTag;
  label: string;
  description: string;
}[] = [
  { value: "youth", label: "Youth Founder", description: "Started under 25" },
  { value: "student", label: "Student", description: "Started while in school" },
  { value: "side-hustle", label: "Side Hustle", description: "Started alongside other commitments" },
  { value: "tech", label: "Tech", description: "Technology or software focused" },
  { value: "local-business", label: "Local Business", description: "Serving local community" },
  { value: "creative", label: "Creative", description: "Art, design, content creation" },
  { value: "social-impact", label: "Social Impact", description: "Mission-driven venture" },
  { value: "food-beverage", label: "Food & Beverage", description: "Food or drink business" },
  { value: "service", label: "Service", description: "Service-based business" },
  { value: "e-commerce", label: "E-commerce", description: "Online selling" },
];

/**
 * Micro-venture idea - generic inspiration prompts
 * NOT presented as real stories
 */
export interface MicroVentureIdea {
  id: string;
  title: string;
  description: string;
  skillsNeeded: string[];
  startupCost: "free" | "low" | "medium"; // free, <$100, <$500
  timeCommitment: "flexible" | "part-time" | "dedicated";
  category: "service" | "digital" | "creative" | "local";
}

/**
 * URL verification result
 */
export interface UrlVerificationResult {
  url: string;
  ok: boolean;
  status?: number;
  checkedAtISO: string;
  error?: string;
  ttlMs: number;
}

/**
 * Verification cache entry
 */
export interface VerificationCacheEntry {
  result: UrlVerificationResult;
  expiresAtISO: string;
}

/**
 * Store metadata
 */
export interface FounderStoreMetadata {
  lastRefreshISO: string;
  totalSpotlights: number;
  verifiedCount: number;
  pendingCount: number;
  failedCount: number;
}

/**
 * API response for founder spotlights
 */
export interface FounderSpotlightsResponse {
  spotlights: FounderSpotlight[];
  metadata: FounderStoreMetadata;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    availableTags: FounderSpotlightTag[];
    availableCountries: string[];
  };
}

/**
 * Admin request to add/update a spotlight
 */
export interface FounderSpotlightInput {
  title: string;
  founderName: string;
  founderAgeAtStart?: number;
  country?: string;
  whatTheyBuilt: string;
  whyItMatters: string;
  keyLesson: string;
  sourceName: string;
  sourceUrl: string;
  publishedDateISO?: string;
  tags?: FounderSpotlightTag[];
}

/**
 * Validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}
