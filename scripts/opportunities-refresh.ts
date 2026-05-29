#!/usr/bin/env npx tsx
/**
 * LIVE OPPORTUNITIES REFRESH
 *
 * Fetches job / apprenticeship / scholarship opportunities from all
 * configured providers (or a specific cadence), dedupes, verifies
 * application URLs, prunes expired items, and writes the result to
 * data/opportunities/verified-opportunities.json.
 *
 *   npm run opportunities:refresh                  # all enabled providers
 *   npm run opportunities:refresh -- --cadence=daily
 *   npm run opportunities:refresh -- --cadence=weekly
 *   npm run opportunities:refresh -- --provider=nav-jobs
 *   npm run opportunities:refresh -- --dry-run
 *   npm run opportunities:refresh -- --skip-verify
 *   npm run opportunities:refresh -- --since-days=3
 *   npm run opportunities:refresh -- --max-items=500
 *
 * Environment variables:
 *   NAV_PAM_PUBLIC_TOKEN   NAV bearer token (registered-consumer).
 *                          Falls back to the public rotating token
 *                          at /api/publicToken in dev — NEVER rely on
 *                          that in prod (rate-limited, rotates).
 *   DISABLE_NAV_JOBS       "true" to skip the NAV provider
 *   NAV_JOBS_SINCE_DAYS    Lookback window in days (default: 2)
 *   NAV_JOBS_MAX_ITEMS     Upper bound on items per run (default: 1000)
 */

import * as fs from "fs";
import * as path from "path";
import {
  fetchFromAllProviders,
  fetchByCadence,
  fetchFromProvider,
  getConfiguredProviders,
  PROVIDER_PRIORITY,
} from "../src/lib/opportunities/providers";
import { dedupeOpportunities } from "../src/lib/opportunities/dedupe";
import {
  verifyOpportunities,
  cleanExpiredCache,
} from "../src/lib/opportunities/verify-url";
import { updateProviderHealth } from "../src/lib/opportunities/provider-health";
import type {
  OpportunityItem,
  OpportunityProvider,
  FetchProviderParams,
  ProviderCadence,
  ProviderHealth,
  RefreshMetadata,
  RefreshRunStats,
} from "../src/lib/opportunities/types";

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "opportunities");
const ITEMS_FILE = path.join(DATA_DIR, "verified-opportunities.json");
const METADATA_FILE = path.join(DATA_DIR, "refresh-metadata.json");

// ============================================
// COLORS
// ============================================

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(msg: string, color: keyof typeof colors = "reset"): void {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}
const success = (m: string) => log(`✓ ${m}`, "green");
const warn = (m: string) => log(`⚠ ${m}`, "yellow");
const error = (m: string) => log(`✗ ${m}`, "red");
const info = (m: string) => log(`→ ${m}`, "cyan");
function header(m: string): void {
  console.log();
  log(m, "bold");
  log("=".repeat(60), "dim");
}

// ============================================
// ARGS
// ============================================

interface CliArgs {
  cadence?: ProviderCadence;
  provider?: OpportunityProvider;
  dryRun: boolean;
  skipVerify: boolean;
  verbose: boolean;
  sinceDays?: number;
  maxItems?: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    dryRun: false,
    skipVerify: false,
    verbose: false,
  };
  for (const arg of args) {
    if (arg === "--dry-run") result.dryRun = true;
    else if (arg === "--skip-verify") result.skipVerify = true;
    else if (arg === "--verbose" || arg === "-v") result.verbose = true;
    else if (arg.startsWith("--cadence=")) {
      const c = arg.split("=")[1];
      if (c === "daily" || c === "weekly") result.cadence = c;
      else warn(`Unknown cadence: ${c} (expected daily|weekly)`);
    } else if (arg.startsWith("--provider=")) {
      const p = arg.split("=")[1] as OpportunityProvider;
      if ((PROVIDER_PRIORITY as string[]).includes(p)) result.provider = p;
      else warn(`Unknown provider: ${p}. Valid: ${PROVIDER_PRIORITY.join(", ")}`);
    } else if (arg.startsWith("--since-days=")) {
      const n = parseInt(arg.split("=")[1], 10);
      if (!isNaN(n) && n > 0) result.sinceDays = n;
    } else if (arg.startsWith("--max-items=")) {
      const n = parseInt(arg.split("=")[1], 10);
      if (!isNaN(n) && n > 0) result.maxItems = n;
    }
  }
  return result;
}

// ============================================
// FILE OPS
// ============================================

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadExistingItems(): OpportunityItem[] {
  try {
    if (!fs.existsSync(ITEMS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ITEMS_FILE, "utf-8")) as OpportunityItem[];
  } catch {
    return [];
  }
}

function saveItems(items: OpportunityItem[]): void {
  ensureDataDir();
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
}

function saveMetadata(metadata: RefreshMetadata): void {
  ensureDataDir();
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  const startTime = Date.now();
  const args = parseArgs();

  console.log();
  log("💼 LIVE OPPORTUNITIES REFRESH", "bold");
  log(`Generated: ${new Date().toISOString()}`, "dim");
  console.log();

  const enabled = getConfiguredProviders();
  info(`Enabled providers: ${enabled.map((p) => p.id).join(", ") || "(none)"}`);
  if (enabled.length === 0) {
    error("No providers enabled. Set NAV_PAM_PUBLIC_TOKEN or unset DISABLE_NAV_JOBS.");
    process.exit(1);
  }

  if (args.cadence) info(`Cadence filter: ${args.cadence}`);
  if (args.provider) info(`Single-provider mode: ${args.provider}`);
  if (args.dryRun) warn("DRY RUN — no files will be saved");
  if (args.skipVerify) warn("Skipping URL verification");

  // Prune URL verification cache
  const cacheCleaned = await cleanExpiredCache();
  if (cacheCleaned > 0) info(`Pruned ${cacheCleaned} expired URL cache entries`);

  // ──────────────────────────────────────────────────────────────
  // FETCH
  // ──────────────────────────────────────────────────────────────
  const params: FetchProviderParams = {
    sincePublishedDays: args.sinceDays ?? 2,
    maxItems: args.maxItems ?? 1000,
  };

  header(`Fetching opportunities (since ${params.sincePublishedDays}d, cap ${params.maxItems})…`);

  let fetched: Omit<OpportunityItem, "verified" | "verifiedAtISO">[];
  let runStats: { provider: OpportunityProvider; fetched: number; errors: string[] }[];
  let runHealth: ProviderHealth[];

  if (args.provider) {
    try {
      fetched = await fetchFromProvider(args.provider, params);
      runStats = [
        { provider: args.provider, fetched: fetched.length, errors: [] },
      ];
      runHealth = [
        {
          provider: args.provider,
          status: fetched.length > 0 ? "healthy" : "degraded",
          lastRun: new Date().toISOString(),
          lastSuccess: fetched.length > 0 ? new Date().toISOString() : undefined,
          consecutiveFailures: 0,
          itemsFound: fetched.length,
        },
      ];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      error(`Single-provider fetch failed: ${msg}`);
      process.exit(1);
    }
  } else {
    const result = args.cadence
      ? await fetchByCadence(args.cadence, params)
      : await fetchFromAllProviders(params);
    fetched = result.items;
    runStats = result.stats;
    runHealth = result.health;
  }

  info(`Fetched ${fetched.length} raw items across ${runStats.length} provider(s)`);
  for (const s of runStats) {
    const status = s.errors.length > 0 ? "✗" : s.fetched > 0 ? "✓" : "·";
    log(
      `  ${status} ${s.provider}: ${s.fetched} items${s.errors.length ? ` — ${s.errors.join("; ")}` : ""}`,
      s.errors.length ? "red" : s.fetched ? "green" : "yellow",
    );
  }

  // Coerce to full-shape items (verified=false pre-verification)
  const rawItems: OpportunityItem[] = fetched.map((f) => ({
    ...f,
    verified: false,
  }));

  // ──────────────────────────────────────────────────────────────
  // MERGE WITH EXISTING + PRUNE EXPIRED
  // ──────────────────────────────────────────────────────────────
  header("Merging with existing items and pruning expired…");
  const existing = loadExistingItems();
  info(`Loaded ${existing.length} existing items from disk`);

  const now = Date.now();
  const existingNotExpired = existing.filter(
    (item) => new Date(item.expiresAtISO).getTime() > now,
  );
  const expiredCount = existing.length - existingNotExpired.length;
  if (expiredCount > 0) info(`Pruned ${expiredCount} expired items`);

  // New items take precedence over stale copies — dedupe keeps the
  // best record per dedupe-key below, but we also drop existing
  // records for the same ID so freshly-fetched data wins.
  const newIds = new Set(rawItems.map((i) => i.id));
  const carried = existingNotExpired.filter((i) => !newIds.has(i.id));

  const combined = [...rawItems, ...carried];
  info(`Combined pool: ${combined.length} items (${rawItems.length} new + ${carried.length} carried)`);

  // ──────────────────────────────────────────────────────────────
  // DEDUPE
  // ──────────────────────────────────────────────────────────────
  const { deduped, duplicatesRemoved } = dedupeOpportunities(combined);
  if (duplicatesRemoved > 0) {
    info(`Removed ${duplicatesRemoved} duplicates`);
  }

  // ──────────────────────────────────────────────────────────────
  // VERIFY
  // ──────────────────────────────────────────────────────────────
  let verifiedItems: OpportunityItem[];
  let failedItems: OpportunityItem[];

  if (args.skipVerify) {
    verifiedItems = deduped.map((i) => ({
      ...i,
      verified: i.verified,
      lastCheckedAtISO: new Date().toISOString(),
    }));
    failedItems = [];
  } else {
    header("Verifying application URLs…");
    const result = await verifyOpportunities(deduped, 6);
    verifiedItems = result.verified;
    failedItems = result.failed;
    info(
      `Verified ${result.stats.verified} / ${result.stats.total} (${result.stats.failed} failed)`,
    );
  }

  // ──────────────────────────────────────────────────────────────
  // HEALTH
  // ──────────────────────────────────────────────────────────────
  updateProviderHealth(runHealth);

  // ──────────────────────────────────────────────────────────────
  // SAVE
  // ──────────────────────────────────────────────────────────────
  const metadata: RefreshMetadata = {
    lastRefreshISO: new Date().toISOString(),
    cadence: args.cadence ?? "mixed",
    totalFetched: fetched.length,
    totalNormalized: combined.length,
    totalVerified: verifiedItems.length,
    totalFailed: failedItems.length,
    totalExpired: expiredCount,
    duplicatesRemoved,
    providerStats: runStats.map<RefreshRunStats>((s) => ({
      provider: s.provider,
      fetched: s.fetched,
      normalized: s.fetched,
      verified: verifiedItems.filter((i) => i.provider === s.provider).length,
      failed: failedItems.filter((i) => i.provider === s.provider).length,
      expired: expiredCount,
      errors: s.errors,
    })),
    providerHealth: runHealth,
  };

  if (args.dryRun) {
    warn("DRY RUN — not writing files");
  } else {
    saveItems(verifiedItems);
    saveMetadata(metadata);
    success(
      `Wrote ${verifiedItems.length} items → ${path.relative(process.cwd(), ITEMS_FILE)}`,
    );
  }

  const durationMs = Date.now() - startTime;
  console.log();
  log(
    `Completed in ${(durationMs / 1000).toFixed(1)}s — ${verifiedItems.length} verified, ${failedItems.length} failed, ${duplicatesRemoved} dupes, ${expiredCount} expired`,
    "bold",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
