/**
 * OPPORTUNITIES CONFIG
 *
 * Provider configuration for the live-opportunities ETL pipeline.
 * Distinct from src/lib/events/config.ts because API-based providers
 * need token + endpoint configuration that scrape providers don't.
 */

import type { OpportunityProvider, ProviderCadence } from "./types";
import { PROVIDER_PRIORITY, PROVIDER_CADENCE } from "./types";

// ============================================
// USER-AGENT
// ============================================

export const USER_AGENT =
  "EndeavrlyYouthPlatform/1.0 (+https://endeavrly.no/about)";

// ============================================
// PROVIDER CONFIG
// ============================================

export interface ProviderConfig {
  enabled: boolean;
  endpoint: string;
  userAgent: string;
  timeoutMs: number;
  throttleMs: number;
  /** Default page size when the provider supports paging. */
  pageSize: number;
  /**
   * Fetch items published within the last N days. Providers that
   * support incremental fetching cap their lookback at this value.
   */
  sincePublishedDays: number;
  /** Upper bound on items per run (safety net). */
  maxItems: number;
  /**
   * Bearer token, if the provider requires one. NAV is the only
   * tokened provider at the moment.
   */
  bearerToken?: string;
}

export interface OpportunitiesConfig {
  providers: Record<OpportunityProvider, ProviderConfig>;
  urlVerificationTtlHours: number;
}

// ============================================
// NAV ENDPOINTS
// ============================================

export const NAV_JOBS_FEED_URL =
  "https://pam-stilling-feed.nav.no/api/v1/feed";
export const NAV_JOBS_PUBLIC_TOKEN_URL =
  "https://pam-stilling-feed.nav.no/api/publicToken";

// ============================================
// CONFIG LOADER
// ============================================

let _config: OpportunitiesConfig | null = null;

export function getOpportunitiesConfig(): OpportunitiesConfig {
  if (_config) return _config;

  const urlVerificationTtlHours = parseInt(
    process.env.OPPORTUNITIES_URL_TTL_HOURS || "12",
    10,
  );

  _config = {
    providers: {
      "nav-jobs": {
        enabled: process.env.DISABLE_NAV_JOBS !== "true",
        endpoint: NAV_JOBS_FEED_URL,
        userAgent: USER_AGENT,
        timeoutMs: 15000,
        throttleMs: 300,
        pageSize: 100,
        sincePublishedDays: parseInt(
          process.env.NAV_JOBS_SINCE_DAYS || "2",
          10,
        ),
        maxItems: parseInt(process.env.NAV_JOBS_MAX_ITEMS || "1000", 10),
        bearerToken: process.env.NAV_PAM_PUBLIC_TOKEN,
      },
    },
    urlVerificationTtlHours:
      isNaN(urlVerificationTtlHours) || urlVerificationTtlHours < 1
        ? 12
        : urlVerificationTtlHours,
  };

  return _config;
}

export function resetConfigCache(): void {
  _config = null;
}

// ============================================
// HELPERS
// ============================================

export function getEnabledProviders(): OpportunityProvider[] {
  const config = getOpportunitiesConfig();
  return (Object.keys(config.providers) as OpportunityProvider[]).filter(
    (id) => config.providers[id].enabled,
  );
}

export function getProvidersForCadence(
  cadence: ProviderCadence,
): OpportunityProvider[] {
  return getEnabledProviders().filter(
    (id) => PROVIDER_CADENCE[id] === cadence,
  );
}

export function getProviderConfig(provider: OpportunityProvider): ProviderConfig {
  return getOpportunitiesConfig().providers[provider];
}

export function getThrottleDelay(provider: OpportunityProvider): number {
  const base = getProviderConfig(provider).throttleMs;
  return base + Math.floor(Math.random() * 200);
}

export function hasEnabledProviders(): boolean {
  return getEnabledProviders().length > 0;
}

/**
 * Re-export so call sites don't need to import from both files.
 */
export { PROVIDER_PRIORITY, PROVIDER_CADENCE };
