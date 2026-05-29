/**
 * OPPORTUNITY PROVIDERS INDEX
 *
 * Registry + aggregate-fetch helpers. Cadence-aware — a refresh can
 * target only "daily" providers (fast-changing sources like NAV jobs)
 * or only "weekly" ones (slower sources like scholarship boards) so
 * one pipeline can serve both crons without per-provider branching.
 */

import type {
  OpportunitiesProvider,
  OpportunityProvider,
  OpportunityItem,
  FetchProviderParams,
  ProviderHealth,
  ProviderCadence,
} from "../types";
import { PROVIDER_PRIORITY, PROVIDER_CADENCE } from "../types";
import {
  getEnabledProviders,
  getProvidersForCadence,
  getThrottleDelay,
} from "../config";
import { navJobsProvider } from "./nav-jobs";

// ============================================
// REGISTRY
// ============================================

const PROVIDERS: Record<OpportunityProvider, OpportunitiesProvider> = {
  "nav-jobs": navJobsProvider,
};

export function getProvider(id: OpportunityProvider): OpportunitiesProvider | null {
  return PROVIDERS[id] || null;
}

export function getAllProviders(): OpportunitiesProvider[] {
  return Object.values(PROVIDERS);
}

export function getConfiguredProviders(): OpportunitiesProvider[] {
  return getEnabledProviders().map((id) => PROVIDERS[id]).filter(Boolean);
}

export function getProvidersByPriority(): OpportunitiesProvider[] {
  const enabled = getEnabledProviders();
  return PROVIDER_PRIORITY.filter((id) => enabled.includes(id)).map(
    (id) => PROVIDERS[id],
  );
}

export function getProvidersByCadence(
  cadence: ProviderCadence,
): OpportunitiesProvider[] {
  return getProvidersForCadence(cadence).map((id) => PROVIDERS[id]);
}

// ============================================
// SLEEP UTIL
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================
// AGGREGATE FETCHING
// ============================================

export interface FetchAllResult {
  items: Omit<OpportunityItem, "verified" | "verifiedAtISO">[];
  stats: {
    provider: OpportunityProvider;
    fetched: number;
    errors: string[];
  }[];
  health: ProviderHealth[];
}

async function fetchFromProviderList(
  providers: OpportunitiesProvider[],
  params: FetchProviderParams,
): Promise<FetchAllResult> {
  const items: Omit<OpportunityItem, "verified" | "verifiedAtISO">[] = [];
  const stats: FetchAllResult["stats"] = [];
  const health: ProviderHealth[] = [];

  for (const provider of providers) {
    const runAt = new Date().toISOString();
    let h: ProviderHealth = {
      provider: provider.id,
      status: "healthy",
      lastRun: runAt,
      consecutiveFailures: 0,
    };

    try {
      console.log(`Fetching from ${provider.displayName}...`);
      const fetched = await provider.fetchItems(params);
      items.push(...fetched);
      stats.push({
        provider: provider.id,
        fetched: fetched.length,
        errors: [],
      });
      h.lastSuccess = new Date().toISOString();
      h.itemsFound = fetched.length;
      if (fetched.length === 0) h.status = "degraded";

      await sleep(getThrottleDelay(provider.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error fetching from ${provider.displayName}:`, message);
      stats.push({
        provider: provider.id,
        fetched: 0,
        errors: [message],
      });
      h.status = "failed";
      h.lastError = message;
      h.consecutiveFailures = 1;
    }

    health.push(h);
  }

  return { items, stats, health };
}

export function fetchFromAllProviders(
  params: FetchProviderParams,
): Promise<FetchAllResult> {
  return fetchFromProviderList(getConfiguredProviders(), params);
}

export function fetchByCadence(
  cadence: ProviderCadence,
  params: FetchProviderParams,
): Promise<FetchAllResult> {
  return fetchFromProviderList(getProvidersByCadence(cadence), params);
}

export async function fetchFromProvider(
  providerId: OpportunityProvider,
  params: FetchProviderParams,
): Promise<Omit<OpportunityItem, "verified" | "verifiedAtISO">[]> {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`Unknown opportunity provider: ${providerId}`);
  return provider.fetchItems(params);
}

// ============================================
// RE-EXPORTS
// ============================================

export { navJobsProvider } from "./nav-jobs";
export { PROVIDER_PRIORITY, PROVIDER_CADENCE };
