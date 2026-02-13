/**
 * EVENT TYPES
 *
 * Shared types for the Youth Career Events system.
 * Scrape-based architecture using Norwegian and European sources.
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type EventProvider = "tautdanning" | "oslomet" | "bi-karrieredagene" | "eures";

export const PROVIDER_PRIORITY: EventProvider[] = [
  "tautdanning",
  "oslomet",
  "bi-karrieredagene",
  "eures",
];

export const PROVIDER_DISPLAY_NAMES: Record<EventProvider, string> = {
  tautdanning: "Ta Utdanning",
  oslomet: "OsloMet",
  "bi-karrieredagene": "BI Karrieredagene",
  eures: "EURES Job Days",
};

// ============================================
// CORE EVENT ITEM TYPE
// ============================================

export type EventFormat = "Online" | "In-person" | "Hybrid";
export type VerificationMethod = "content" | "headless" | "http-only";
export type EventCategory = "Job Fair" | "Workshop" | "Webinar/Seminar" | "Meetup" | "Conference" | "Other";
export type AudienceFit = "15–23" | "18+" | "Students" | "General" | "Unknown";
export type EventCountry = "Norway" | "Europe";

export interface EventItem {
  id: string;                     // stable internal ID (provider:providerEventId)
  provider: EventProvider;
  providerEventId: string;        // slug or extracted id
  title: string;
  description?: string;
  startDateISO: string;           // ISO datetime (or date if time unknown)
  endDateISO?: string;
  locationLabel: string;          // "Oslo, Norway" or "Online"
  city?: string;
  country: EventCountry;
  format: EventFormat;
  category: EventCategory;
  audienceFit: AudienceFit;
  registrationUrl: string;        // canonical registration/sign-up URL (https only)
  sourceUrl: string;              // event detail page URL on source site
  organizerName?: string;
  verified: boolean;
  verifiedAtISO?: string;
  lastCheckedAtISO?: string;      // when the agent last re-verified this event's link
  tags?: string[];                // include "youth-friendly" when appropriate
  verificationMethod?: VerificationMethod;  // how the event was verified
  contentVerifiedAtISO?: string;            // when content markers were last checked
  finalUrl?: string;                        // URL after redirect resolution
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface ScrapeProviderParams {
  months: number;                 // 6 or 12 (default 12)
  countryScope: "Norway" | "Norway+Europe";
}

export interface EventsProvider {
  id: EventProvider;
  displayName: string;
  type: "scrape";
  fetchEvents(params: ScrapeProviderParams): Promise<Omit<EventItem, "verified" | "verifiedAtISO">[]>;
}

// ============================================
// PROVIDER HEALTH STATUS
// ============================================

export type ProviderHealthStatus = "healthy" | "degraded" | "failed";

export interface ProviderHealth {
  provider: EventProvider;
  status: ProviderHealthStatus;
  lastRun?: string;
  lastSuccess?: string;
  consecutiveFailures: number;
  lastError?: string;
  eventsFound?: number;
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
// API REQUEST/RESPONSE TYPES
// ============================================

export interface YouthEventsQueryParams {
  months?: number;
  page?: number;
  pageSize?: number;
  query?: string;
  city?: string;
  category?: EventCategory | "";
  format?: EventFormat | "";
  provider?: EventProvider | "";
  audienceFit?: AudienceFit | "";
  youthFriendlyOnly?: boolean;
  sort?: "startDate" | "-startDate" | "title";
  includeUnverified?: boolean;
}

export interface YouthEventsResponse {
  items: EventItem[];
  total: number;
  page: number;
  pageSize: number;
  lastRefreshISO: string;
  dataFresh: boolean;
  staleSinceISO?: string;
  filters: {
    cities: string[];
    categories: EventCategory[];
    formats: EventFormat[];
    providers: EventProvider[];
  };
}

// ============================================
// REFRESH METADATA
// ============================================

export interface RefreshRunStats {
  provider: EventProvider;
  fetched: number;
  normalized: number;
  verified: number;
  failed: number;
  errors: string[];
}

export interface AgentRunReport {
  runAtISO: string;
  durationMs: number;
  eventsActive: number;
  eventsRemoved: number;
  eventsAdded: number;
  linksRechecked: number;
  linksFailed: number;
  providerHealth: ProviderHealth[];
}

export interface RefreshMetadata {
  lastRefreshISO: string;
  totalFetched: number;
  totalNormalized: number;
  totalVerified: number;
  totalFailed: number;
  duplicatesRemoved: number;
  providerStats: RefreshRunStats[];
  providerHealth: ProviderHealth[];
  lastAgentRunReport?: AgentRunReport;
}

// ============================================
// MAPPING HELPERS
// ============================================

/**
 * Generate stable event ID
 */
export function generateEventId(provider: EventProvider, providerEventId: string): string {
  return `${provider}:${providerEventId}`;
}

/**
 * Parse provider and ID from combined event ID
 */
export function parseEventId(id: string): { provider: EventProvider; providerEventId: string } | null {
  const [provider, ...rest] = id.split(":");
  if (!provider || rest.length === 0) return null;
  const validProviders: EventProvider[] = ["tautdanning", "oslomet", "bi-karrieredagene", "eures"];
  if (!validProviders.includes(provider as EventProvider)) return null;
  return { provider: provider as EventProvider, providerEventId: rest.join(":") };
}

/**
 * Infer event format from data
 */
export function inferFormat(isOnline?: boolean, hasVenue?: boolean): EventFormat {
  if (isOnline && hasVenue) return "Hybrid";
  if (isOnline) return "Online";
  return "In-person";
}

/**
 * Infer event category from text
 */
export function inferCategory(text: string, providerCategory?: string): EventCategory {
  const searchStr = (text + " " + (providerCategory || "")).toLowerCase();

  if (searchStr.includes("job fair") || searchStr.includes("career fair") || searchStr.includes("recruitment fair") || searchStr.includes("karrieredag") || searchStr.includes("jobbmesse") || searchStr.includes("studentfair")) {
    return "Job Fair";
  }
  if (searchStr.includes("workshop") || searchStr.includes("hands-on") || searchStr.includes("training")) {
    return "Workshop";
  }
  if (searchStr.includes("webinar") || searchStr.includes("seminar") || searchStr.includes("online session")) {
    return "Webinar/Seminar";
  }
  if (searchStr.includes("meetup") || searchStr.includes("meet-up") || searchStr.includes("networking")) {
    return "Meetup";
  }
  if (searchStr.includes("conference") || searchStr.includes("summit") || searchStr.includes("expo")) {
    return "Conference";
  }
  return "Other";
}

/**
 * Infer audience fit from text
 */
export function inferAudienceFit(text: string): AudienceFit {
  const searchStr = text.toLowerCase();

  if (
    searchStr.includes("youth") ||
    searchStr.includes("16-21") ||
    searchStr.includes("15-23") ||
    searchStr.includes("teen") ||
    searchStr.includes("young people")
  ) {
    return "15–23";
  }
  if (searchStr.includes("18+") || searchStr.includes("adults only")) {
    return "18+";
  }
  if (searchStr.includes("student") || searchStr.includes("university") || searchStr.includes("graduate") || searchStr.includes("studenter")) {
    return "Students";
  }
  if (searchStr.includes("all ages") || searchStr.includes("everyone") || searchStr.includes("open to all")) {
    return "General";
  }
  return "Unknown";
}

/**
 * Check if event should be tagged as youth-friendly
 */
export function isYouthFriendly(audienceFit: AudienceFit, text: string): boolean {
  if (audienceFit === "15–23") return true;
  if (audienceFit === "18+") return false;

  const searchStr = text.toLowerCase();
  const youthIndicators = [
    "youth", "young people", "student", "graduate", "entry level",
    "entry-level", "first job", "career start", "beginner", "internship",
    "apprentice", "trainee", "studenter", "ungdom"
  ];

  return youthIndicators.some((indicator) => searchStr.includes(indicator));
}

/**
 * Build location label
 */
export function buildLocationLabel(city?: string, country?: string, format?: EventFormat): string {
  if (format === "Online") return "Online";
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "Location TBA";
}

// ============================================
// PRISMA MAPPING HELPERS (for DB storage)
// ============================================

/**
 * Map Prisma CareerEventType to EventCategory
 */
export function mapEventType(type: string): EventCategory {
  const mapping: Record<string, EventCategory> = {
    JOBFAIR: "Job Fair",
    WEBINAR: "Webinar/Seminar",
    MEETUP: "Meetup",
    WORKSHOP: "Workshop",
    CONFERENCE: "Conference",
  };
  return mapping[type] || "Other";
}

/**
 * Map Prisma LocationMode to EventFormat
 */
export function mapLocationMode(mode: string): EventFormat {
  const mapping: Record<string, EventFormat> = {
    IN_PERSON: "In-person",
    ONLINE: "Online",
    HYBRID: "Hybrid",
  };
  return mapping[mode] || "In-person";
}

/**
 * Map string format to Prisma LocationMode
 */
export function mapFormatToLocationMode(format: string): string {
  const mapping: Record<string, string> = {
    "In-person": "IN_PERSON",
    "Online": "ONLINE",
    "Hybrid": "HYBRID",
  };
  return mapping[format] || "IN_PERSON";
}

/**
 * Map string category to Prisma CareerEventType
 */
export function mapCategoryToEventType(category: string): string {
  const mapping: Record<string, string> = {
    "Job Fair": "JOBFAIR",
    "Webinar/Seminar": "WEBINAR",
    "Meetup": "MEETUP",
    "Workshop": "WORKSHOP",
    "Conference": "CONFERENCE",
    "Other": "MEETUP",
  };
  return mapping[category] || "MEETUP";
}
