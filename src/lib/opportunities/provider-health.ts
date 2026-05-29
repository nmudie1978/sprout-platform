/**
 * PROVIDER HEALTH — OPPORTUNITIES
 *
 * Same shape as src/lib/events/provider-health.ts. Distinct data file
 * so opportunity-provider health is tracked separately from events.
 */

import * as fs from "fs";
import * as path from "path";
import type { OpportunityProvider, ProviderHealth } from "./types";
import { PROVIDER_PRIORITY } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "opportunities");
const HEALTH_FILE = path.join(DATA_DIR, "provider-health.json");

export interface ProviderHealthStore {
  providers: Record<OpportunityProvider, ProviderHealth>;
  lastUpdated: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultHealth(): ProviderHealthStore {
  const providers: Record<OpportunityProvider, ProviderHealth> = {} as Record<
    OpportunityProvider,
    ProviderHealth
  >;
  for (const id of PROVIDER_PRIORITY) {
    providers[id] = {
      provider: id,
      status: "healthy",
      consecutiveFailures: 0,
    };
  }
  return {
    providers,
    lastUpdated: new Date().toISOString(),
  };
}

export function loadHealthStore(): ProviderHealthStore {
  ensureDataDir();
  try {
    if (fs.existsSync(HEALTH_FILE)) {
      const data = fs.readFileSync(HEALTH_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Error loading opportunity provider health store:", err);
  }
  return getDefaultHealth();
}

export function saveHealthStore(store: ProviderHealthStore): void {
  ensureDataDir();
  store.lastUpdated = new Date().toISOString();
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(store, null, 2));
}

export function getAllProviderHealth(): ProviderHealth[] {
  return Object.values(loadHealthStore().providers);
}

export function getProviderHealth(
  providerId: OpportunityProvider,
): ProviderHealth {
  const store = loadHealthStore();
  return (
    store.providers[providerId] || {
      provider: providerId,
      status: "healthy",
      consecutiveFailures: 0,
    }
  );
}

export function recordSuccess(
  providerId: OpportunityProvider,
  itemsFound: number,
): void {
  const store = loadHealthStore();
  store.providers[providerId] = {
    provider: providerId,
    status: itemsFound > 0 ? "healthy" : "degraded",
    lastRun: new Date().toISOString(),
    lastSuccess: new Date().toISOString(),
    consecutiveFailures: 0,
    itemsFound,
  };
  saveHealthStore(store);
}

export function recordFailure(
  providerId: OpportunityProvider,
  error: string,
): void {
  const store = loadHealthStore();
  const current = store.providers[providerId] || {
    provider: providerId,
    status: "healthy",
    consecutiveFailures: 0,
  };
  const consecutiveFailures = current.consecutiveFailures + 1;
  store.providers[providerId] = {
    ...current,
    status: consecutiveFailures >= 3 ? "failed" : "degraded",
    lastRun: new Date().toISOString(),
    consecutiveFailures,
    lastError: error,
  };
  saveHealthStore(store);
}

export function updateProviderHealth(health: ProviderHealth[]): void {
  const store = loadHealthStore();
  for (const h of health) {
    const existing = store.providers[h.provider];
    let consecutiveFailures = h.consecutiveFailures;
    if (h.status === "failed" && existing?.consecutiveFailures) {
      consecutiveFailures = existing.consecutiveFailures + 1;
    }
    store.providers[h.provider] = {
      ...h,
      consecutiveFailures,
      status: consecutiveFailures >= 3 ? "failed" : h.status,
    };
  }
  saveHealthStore(store);
}

export function getHealthSummary(): {
  healthy: number;
  degraded: number;
  failed: number;
  lastUpdated: string;
} {
  const store = loadHealthStore();
  const health = Object.values(store.providers);
  return {
    healthy: health.filter((h) => h.status === "healthy").length,
    degraded: health.filter((h) => h.status === "degraded").length,
    failed: health.filter((h) => h.status === "failed").length,
    lastUpdated: store.lastUpdated,
  };
}

/**
 * Stale detection — used by admin UI to surface "provider X has been
 * dark for N days". Defaults to 3 days for daily providers, 10 for
 * weekly ones.
 */
export function getStaleProviders(
  now: Date = new Date(),
  staleThresholdDays = 3,
): ProviderHealth[] {
  const store = loadHealthStore();
  const threshold = now.getTime() - staleThresholdDays * 24 * 60 * 60 * 1000;
  return Object.values(store.providers).filter((h) => {
    if (!h.lastSuccess) return true;
    return new Date(h.lastSuccess).getTime() < threshold;
  });
}
