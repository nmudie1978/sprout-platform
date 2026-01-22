/**
 * PROVIDER HEALTH TRACKING
 *
 * Tracks provider status (healthy/degraded/failed) and stores
 * metrics for monitoring scrape health.
 */

import * as fs from "fs";
import * as path from "path";
import type { ProviderHealth, EventProvider } from "./types";
import { PROVIDER_PRIORITY } from "./types";

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "career-events");
const HEALTH_FILE = path.join(DATA_DIR, "provider-health.json");

// ============================================
// TYPES
// ============================================

export interface ProviderHealthStore {
  providers: Record<EventProvider, ProviderHealth>;
  lastUpdated: string;
}

// ============================================
// FILE OPERATIONS
// ============================================

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultHealth(): ProviderHealthStore {
  const providers: Record<EventProvider, ProviderHealth> = {} as Record<EventProvider, ProviderHealth>;

  for (const providerId of PROVIDER_PRIORITY) {
    providers[providerId] = {
      provider: providerId,
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
  } catch (error) {
    console.warn("Error loading provider health store:", error);
  }

  return getDefaultHealth();
}

export function saveHealthStore(store: ProviderHealthStore): void {
  ensureDataDir();
  store.lastUpdated = new Date().toISOString();
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(store, null, 2));
}

// ============================================
// HEALTH TRACKING
// ============================================

/**
 * Get current health status for all providers
 */
export function getAllProviderHealth(): ProviderHealth[] {
  const store = loadHealthStore();
  return Object.values(store.providers);
}

/**
 * Get health status for a specific provider
 */
export function getProviderHealth(providerId: EventProvider): ProviderHealth {
  const store = loadHealthStore();
  return store.providers[providerId] || {
    provider: providerId,
    status: "healthy",
    consecutiveFailures: 0,
  };
}

/**
 * Record a successful run for a provider
 */
export function recordSuccess(providerId: EventProvider, eventsFound: number): void {
  const store = loadHealthStore();

  store.providers[providerId] = {
    provider: providerId,
    status: eventsFound > 0 ? "healthy" : "degraded",
    lastRun: new Date().toISOString(),
    lastSuccess: new Date().toISOString(),
    consecutiveFailures: 0,
    eventsFound,
  };

  saveHealthStore(store);
}

/**
 * Record a failed run for a provider
 */
export function recordFailure(providerId: EventProvider, error: string): void {
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

/**
 * Update provider health from fetch results
 */
export function updateProviderHealth(health: ProviderHealth[]): void {
  const store = loadHealthStore();

  for (const h of health) {
    const existing = store.providers[h.provider];

    // Track consecutive failures
    let consecutiveFailures = h.consecutiveFailures;
    if (h.status === "failed" && existing?.consecutiveFailures) {
      consecutiveFailures = existing.consecutiveFailures + 1;
    }

    store.providers[h.provider] = {
      ...h,
      consecutiveFailures,
      // Escalate to "failed" after 3 consecutive failures
      status: consecutiveFailures >= 3 ? "failed" : h.status,
    };
  }

  saveHealthStore(store);
}

/**
 * Reset health status for a provider
 */
export function resetProviderHealth(providerId: EventProvider): void {
  const store = loadHealthStore();

  store.providers[providerId] = {
    provider: providerId,
    status: "healthy",
    consecutiveFailures: 0,
  };

  saveHealthStore(store);
}

/**
 * Get summary statistics
 */
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
