/**
 * EVENTS CONFIG
 *
 * Configuration for scrape-based event providers.
 * No external API tokens required - uses web scraping.
 */

import type { EventProvider } from "./types";

// ============================================
// CONFIGURATION INTERFACE
// ============================================

export interface ScrapeProviderConfig {
  enabled: boolean;
  baseUrl: string;
  userAgent: string;
  timeoutMs: number;
  throttleMs: number;
  cacheTtlHours: number;
}

export interface EventsConfig {
  providers: Record<EventProvider, ScrapeProviderConfig>;
  defaultMonths: number;
  refreshTtlHours: number;
  urlVerificationTtlHours: number;
  countryScope: "Norway" | "Norway+Europe";
}

// ============================================
// DEFAULT SCRAPE USER AGENT
// ============================================

export const SCRAPE_USER_AGENT = "SproutYouthPlatform/1.0 (+https://sprout.no/about)";

// ============================================
// PROVIDER BASE URLS
// ============================================

export const PROVIDER_BASE_URLS: Record<EventProvider, string> = {
  tautdanning: "https://www.tautdanning.no",
  oslomet: "https://www.oslomet.no",
  "bi-karrieredagene": "https://www.karrieredagene.no",
  eures: "https://europeanjobdays.eu",
};

// ============================================
// DEFAULT SEARCH KEYWORDS (for filtering)
// ============================================

export const DEFAULT_SEARCH_KEYWORDS = [
  "career",
  "job",
  "workshop",
  "seminar",
  "webinar",
  "student",
  "employer",
  "industry",
  "intern",
  "skills",
  "network",
  "karriere",
  "jobb",
];

// ============================================
// CONFIG LOADER
// ============================================

let _config: EventsConfig | null = null;

/**
 * Load and validate events configuration.
 * Scrape providers don't require tokens - just enable/disable.
 */
export function getEventsConfig(): EventsConfig {
  if (_config) return _config;

  const defaultMonths = parseInt(process.env.EVENTS_DEFAULT_MONTHS || "12", 10);
  const refreshTtlHours = parseInt(process.env.EVENTS_REFRESH_TTL_HOURS || "24", 10);
  const urlVerificationTtlHours = parseInt(process.env.URL_VERIFICATION_TTL_HOURS || "24", 10);

  // All scrape providers enabled by default
  const defaultProviderConfig = (baseUrl: string): ScrapeProviderConfig => ({
    enabled: true,
    baseUrl,
    userAgent: SCRAPE_USER_AGENT,
    timeoutMs: 8000,
    throttleMs: 500,      // 300-800ms between requests
    cacheTtlHours: 6,     // Cache HTML responses for 6 hours
  });

  _config = {
    providers: {
      tautdanning: {
        ...defaultProviderConfig(PROVIDER_BASE_URLS.tautdanning),
        enabled: process.env.DISABLE_TAUTDANNING !== "true",
      },
      oslomet: {
        ...defaultProviderConfig(PROVIDER_BASE_URLS.oslomet),
        enabled: process.env.DISABLE_OSLOMET !== "true",
      },
      "bi-karrieredagene": {
        ...defaultProviderConfig(PROVIDER_BASE_URLS["bi-karrieredagene"]),
        enabled: process.env.DISABLE_BI_KARRIEREDAGENE !== "true",
      },
      eures: {
        ...defaultProviderConfig(PROVIDER_BASE_URLS.eures),
        enabled: process.env.DISABLE_EURES !== "true",
      },
    },
    defaultMonths: isNaN(defaultMonths) || defaultMonths < 1 ? 12 : Math.min(defaultMonths, 24),
    refreshTtlHours: isNaN(refreshTtlHours) || refreshTtlHours < 1 ? 24 : refreshTtlHours,
    urlVerificationTtlHours: isNaN(urlVerificationTtlHours) || urlVerificationTtlHours < 1 ? 24 : urlVerificationTtlHours,
    countryScope: "Norway+Europe",
  };

  return _config;
}

/**
 * Reset config cache (useful for testing)
 */
export function resetConfigCache(): void {
  _config = null;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if any provider is enabled
 */
export function hasEnabledProviders(): boolean {
  const config = getEventsConfig();
  return Object.values(config.providers).some((p) => p.enabled);
}

/**
 * Get list of enabled providers
 */
export function getEnabledProviders(): EventProvider[] {
  const config = getEventsConfig();
  return (Object.keys(config.providers) as EventProvider[]).filter(
    (id) => config.providers[id].enabled
  );
}

/**
 * Get provider-specific config
 */
export function getProviderConfig(provider: EventProvider): ScrapeProviderConfig {
  const config = getEventsConfig();
  return config.providers[provider];
}

/**
 * Validate config and log warnings if providers are disabled
 */
export function validateConfig(): void {
  const enabledProviders = getEnabledProviders();
  if (enabledProviders.length === 0) {
    console.warn("All event providers are disabled. No events will be fetched.");
  }
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

/**
 * Get throttle delay for a provider
 */
export function getThrottleDelay(provider: EventProvider): number {
  const config = getProviderConfig(provider);
  // Add some randomness to avoid detection (300-800ms range)
  const baseDelay = config.throttleMs;
  return baseDelay + Math.floor(Math.random() * 300);
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(attempt: number): number {
  return BACKOFF_BASE_MS * Math.pow(2, attempt);
}

/**
 * Get max retries for requests
 */
export function getMaxRetries(): number {
  return MAX_RETRIES;
}

/**
 * Get request timeout in milliseconds
 */
export function getRequestTimeout(provider: EventProvider): number {
  const config = getProviderConfig(provider);
  return config.timeoutMs;
}
