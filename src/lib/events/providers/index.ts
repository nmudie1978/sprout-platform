/**
 * EVENT PROVIDERS INDEX
 *
 * Exports all scrape-based event providers and helper functions.
 */

import type {
  EventsProvider,
  EventProvider,
  EventItem,
  ScrapeProviderParams,
  ProviderHealth,
} from "../types";
import { PROVIDER_PRIORITY } from "../types";
import { getEnabledProviders, getThrottleDelay } from "../config";
import { tautdanningProvider } from "./tautdanning";
import { oslometProvider } from "./oslomet";
import { biKarrieredageneProvider } from "./bi-karrieredagene";
import { euresProvider } from "./eures";

// ============================================
// PROVIDER REGISTRY
// ============================================

const PROVIDERS: Record<EventProvider, EventsProvider> = {
  tautdanning: tautdanningProvider,
  oslomet: oslometProvider,
  "bi-karrieredagene": biKarrieredageneProvider,
  eures: euresProvider,
};

/**
 * Get a specific provider by ID
 */
export function getProvider(id: EventProvider): EventsProvider | null {
  return PROVIDERS[id] || null;
}

/**
 * Get all available providers (regardless of configuration)
 */
export function getAllProviders(): EventsProvider[] {
  return Object.values(PROVIDERS);
}

/**
 * Get all enabled providers (based on configuration)
 */
export function getConfiguredProviders(): EventsProvider[] {
  const enabledIds = getEnabledProviders();
  return enabledIds.map((id) => PROVIDERS[id]).filter(Boolean);
}

/**
 * Get providers in priority order
 */
export function getProvidersByPriority(): EventsProvider[] {
  const enabledIds = getEnabledProviders();
  return PROVIDER_PRIORITY
    .filter((id) => enabledIds.includes(id))
    .map((id) => PROVIDERS[id]);
}

// ============================================
// SLEEP UTILITY
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// AGGREGATE FETCHING
// ============================================

interface FetchAllResult {
  events: Omit<EventItem, "verified" | "verifiedAtISO">[];
  stats: {
    provider: EventProvider;
    fetched: number;
    errors: string[];
  }[];
  health: ProviderHealth[];
}

/**
 * Fetch events from all enabled providers
 */
export async function fetchFromAllProviders(
  params: ScrapeProviderParams
): Promise<FetchAllResult> {
  const providers = getConfiguredProviders();
  const allEvents: Omit<EventItem, "verified" | "verifiedAtISO">[] = [];
  const stats: FetchAllResult["stats"] = [];
  const health: ProviderHealth[] = [];

  for (const provider of providers) {
    const startTime = Date.now();
    let providerHealth: ProviderHealth = {
      provider: provider.id,
      status: "healthy",
      lastRun: new Date().toISOString(),
      consecutiveFailures: 0,
    };

    try {
      console.log(`Fetching from ${provider.displayName}...`);
      const events = await provider.fetchEvents(params);
      allEvents.push(...events);

      stats.push({
        provider: provider.id,
        fetched: events.length,
        errors: [],
      });

      providerHealth.lastSuccess = new Date().toISOString();
      providerHealth.eventsFound = events.length;

      if (events.length === 0) {
        providerHealth.status = "degraded";
      }

      // Throttle between providers
      await sleep(getThrottleDelay(provider.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching from ${provider.displayName}:`, errorMessage);

      stats.push({
        provider: provider.id,
        fetched: 0,
        errors: [errorMessage],
      });

      providerHealth.status = "failed";
      providerHealth.lastError = errorMessage;
      providerHealth.consecutiveFailures = 1;
    }

    health.push(providerHealth);
  }

  return { events: allEvents, stats, health };
}

/**
 * Fetch events from a specific provider
 */
export async function fetchFromProvider(
  providerId: EventProvider,
  params: ScrapeProviderParams
): Promise<Omit<EventItem, "verified" | "verifiedAtISO">[]> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider.fetchEvents(params);
}

// ============================================
// RE-EXPORTS
// ============================================

export { tautdanningProvider } from "./tautdanning";
export { oslometProvider } from "./oslomet";
export { biKarrieredageneProvider } from "./bi-karrieredagene";
export { euresProvider } from "./eures";
