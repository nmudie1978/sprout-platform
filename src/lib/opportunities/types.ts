/**
 * OPPORTUNITY TYPES
 *
 * Shared types for the Live Opportunities system — jobs, apprenticeships,
 * internships, and scholarships sourced from ETL provider adapters.
 *
 * Parallel to src/lib/events/ but opportunity-shaped: items have an
 * application deadline (not a start date), an employer, and a posting
 * kind ("job", "apprenticeship", etc.) rather than an event category.
 *
 * Cadence is per-provider ("daily" for churning sources like NAV jobs,
 * "weekly" for slower-moving ones). The refresh script dispatches per
 * cadence so the same pipeline can serve both.
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type OpportunityProvider = "nav-jobs";

export const PROVIDER_PRIORITY: OpportunityProvider[] = ["nav-jobs"];

export const PROVIDER_DISPLAY_NAMES: Record<OpportunityProvider, string> = {
  "nav-jobs": "NAV Arbeidsplassen",
};

/** How often a provider should be re-fetched. */
export type ProviderCadence = "daily" | "weekly";

export const PROVIDER_CADENCE: Record<OpportunityProvider, ProviderCadence> = {
  "nav-jobs": "daily",
};

// ============================================
// CORE OPPORTUNITY ITEM TYPE
// ============================================

export type OpportunityKind =
  | "job"
  | "apprenticeship"
  | "internship"
  | "scholarship";

export type OpportunityCountry = "Norway";

export type WorkMode = "On-site" | "Remote" | "Hybrid" | "Unknown";

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Temporary"
  | "Seasonal"
  | "Apprenticeship"
  | "Unknown";

export type AudienceFit = "15–23" | "18+" | "Students" | "General" | "Unknown";

export interface OpportunityItem {
  /** Stable internal ID: `${provider}:${providerOpportunityId}` */
  id: string;
  provider: OpportunityProvider;
  /** Source-side ID (e.g. NAV ad uuid) */
  providerOpportunityId: string;
  kind: OpportunityKind;
  title: string;
  description?: string;

  employerName?: string;
  locationLabel: string;
  city?: string;
  municipality?: string;
  country: OpportunityCountry;

  workMode: WorkMode;
  employmentType: EmploymentType;

  /** ISO timestamp — when the listing was posted by the source */
  publishedISO: string;
  /** ISO date — application deadline, if the source provides one */
  applicationDeadlineISO?: string;
  /**
   * ISO timestamp — when this item should stop being displayed.
   * Either the deadline + 1 day, or a provider-default TTL if no
   * deadline is given. Filter on this at read time.
   */
  expiresAtISO: string;

  applicationUrl: string;
  sourceUrl: string;

  /**
   * Career tags — which of our canonical careerIds this opportunity
   * best fits. Populated later by the semantic-tag pass; always empty
   * at source time so the ETL pipeline never calls AI.
   */
  careerTags?: string[];

  audienceFit: AudienceFit;

  verified: boolean;
  verifiedAtISO?: string;
  /** When the URL was last re-checked during a refresh */
  lastCheckedAtISO?: string;
  /** URL after redirect resolution (for user-facing display) */
  finalUrl?: string;
  tags?: string[];
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface FetchProviderParams {
  /**
   * Only fetch items published within the last N days. Providers that
   * support incremental fetching (If-Modified-Since etc.) should honour
   * this; providers that don't can ignore it.
   */
  sincePublishedDays: number;
  /** Max items to fetch in a single run. */
  maxItems: number;
}

export interface OpportunitiesProvider {
  id: OpportunityProvider;
  displayName: string;
  cadence: ProviderCadence;
  fetchItems(
    params: FetchProviderParams,
  ): Promise<Omit<OpportunityItem, "verified" | "verifiedAtISO">[]>;
}

// ============================================
// PROVIDER HEALTH
// ============================================

export type ProviderHealthStatus = "healthy" | "degraded" | "failed";

export interface ProviderHealth {
  provider: OpportunityProvider;
  status: ProviderHealthStatus;
  lastRun?: string;
  lastSuccess?: string;
  consecutiveFailures: number;
  lastError?: string;
  itemsFound?: number;
}

// ============================================
// URL CHECK RESULT
// ============================================

export interface UrlCheckResult {
  url: string;
  status: number | null;
  ok: boolean;
  checkedAtISO: string;
  error?: string;
}

export interface UrlCheckCache {
  [url: string]: {
    status: number | null;
    ok: boolean;
    checkedAtISO: string;
    ttlExpiresAtISO: string;
    error?: string;
  };
}

// ============================================
// REFRESH METADATA
// ============================================

export interface RefreshRunStats {
  provider: OpportunityProvider;
  fetched: number;
  normalized: number;
  verified: number;
  failed: number;
  expired: number;
  errors: string[];
}

export interface RefreshMetadata {
  lastRefreshISO: string;
  cadence: ProviderCadence | "mixed";
  totalFetched: number;
  totalNormalized: number;
  totalVerified: number;
  totalFailed: number;
  totalExpired: number;
  duplicatesRemoved: number;
  providerStats: RefreshRunStats[];
  providerHealth: ProviderHealth[];
}

// ============================================
// MAPPING HELPERS
// ============================================

export function generateOpportunityId(
  provider: OpportunityProvider,
  providerOpportunityId: string,
): string {
  return `${provider}:${providerOpportunityId}`;
}

export function parseOpportunityId(
  id: string,
): { provider: OpportunityProvider; providerOpportunityId: string } | null {
  const [provider, ...rest] = id.split(":");
  if (!provider || rest.length === 0) return null;
  if (!(PROVIDER_PRIORITY as string[]).includes(provider)) return null;
  return {
    provider: provider as OpportunityProvider,
    providerOpportunityId: rest.join(":"),
  };
}

/**
 * Build a "Oslo, Norway" / "Remote" location label.
 */
export function buildLocationLabel(
  city: string | undefined,
  country: OpportunityCountry,
  workMode: WorkMode,
): string {
  if (workMode === "Remote") return "Remote";
  if (city) return `${city}, ${country}`;
  return country;
}

/**
 * Default TTL for items without a deadline. Governs when a listing
 * drops out of the displayed set, regardless of source behaviour.
 * Jobs without a deadline on NAV typically sit active ~60 days.
 */
export const DEFAULT_TTL_DAYS: Record<OpportunityKind, number> = {
  job: 60,
  apprenticeship: 120,
  internship: 90,
  scholarship: 180,
};

export function computeExpiresAtISO(
  kind: OpportunityKind,
  publishedISO: string,
  applicationDeadlineISO?: string,
): string {
  if (applicationDeadlineISO) {
    const d = new Date(applicationDeadlineISO);
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  const d = new Date(publishedISO);
  d.setDate(d.getDate() + DEFAULT_TTL_DAYS[kind]);
  return d.toISOString();
}

/**
 * Heuristic: does the text mention youth, internship, apprentice,
 * entry-level, learnership, or similar youth-friendly language?
 */
export function isYouthFriendlyText(text: string): boolean {
  const t = text.toLowerCase();
  const indicators = [
    "ungdom",
    "lærling",
    "læreling",
    "lærlingplass",
    "trainee",
    "intern",
    "internship",
    "entry level",
    "entry-level",
    "nyutdannet",
    "student",
    "summer job",
    "sommerjobb",
    "deltid",
    "part-time",
  ];
  return indicators.some((i) => t.includes(i));
}

/**
 * Classify an audience fit from title+description text.
 */
export function inferAudienceFit(text: string): AudienceFit {
  const t = text.toLowerCase();
  if (
    t.includes("ungdom") ||
    t.includes("15-23") ||
    t.includes("16-21") ||
    t.includes("teen")
  ) {
    return "15–23";
  }
  if (t.includes("18+") || t.includes("only adults")) return "18+";
  if (
    t.includes("student") ||
    t.includes("graduate") ||
    t.includes("studenter") ||
    t.includes("nyutdannet")
  ) {
    return "Students";
  }
  return "Unknown";
}

/**
 * Classify work mode from structured flags + free text.
 */
export function inferWorkMode(opts: {
  remoteFlag?: boolean;
  hybridFlag?: boolean;
  text?: string;
}): WorkMode {
  if (opts.hybridFlag) return "Hybrid";
  if (opts.remoteFlag) return "Remote";
  const t = (opts.text ?? "").toLowerCase();
  if (t.includes("hjemmekontor") || t.includes("remote work")) return "Hybrid";
  if (t.includes("fully remote") || t.includes("100% remote")) return "Remote";
  return "On-site";
}

/**
 * Map NAV's extent / engagementType strings into our EmploymentType.
 */
export function inferEmploymentType(raw?: string): EmploymentType {
  if (!raw) return "Unknown";
  const t = raw.toLowerCase();
  if (t.includes("heltid") || t.includes("full")) return "Full-time";
  if (t.includes("deltid") || t.includes("part")) return "Part-time";
  if (t.includes("midlertidig") || t.includes("temporary")) return "Temporary";
  if (t.includes("sesong") || t.includes("seasonal")) return "Seasonal";
  if (t.includes("lærling") || t.includes("apprentice"))
    return "Apprenticeship";
  return "Unknown";
}
