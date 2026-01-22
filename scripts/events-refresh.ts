#!/usr/bin/env npx tsx
/**
 * CAREER EVENTS REFRESH SCRIPT
 *
 * Fetches events from all configured scrape providers, deduplicates,
 * verifies URLs, and saves to data files.
 *
 * Usage:
 *   npm run events:refresh
 *   npm run events:refresh -- --months=6
 *   npm run events:refresh -- --dry-run
 *   npm run events:refresh -- --skip-verify
 *   npm run events:refresh -- --provider=tautdanning
 *   npm run events:refresh -- --verbose
 *
 * Environment:
 *   DISABLE_TAUTDANNING=true        # Disable tautdanning provider
 *   DISABLE_OSLOMET=true            # Disable oslomet provider
 *   DISABLE_BI_KARRIEREDAGENE=true  # Disable bi-karrieredagene provider
 *   DISABLE_EURES=true              # Disable eures provider
 */

import * as fs from "fs";
import * as path from "path";
import {
  fetchFromAllProviders,
  fetchFromProvider,
  getConfiguredProviders,
} from "../src/lib/events/providers";
import { dedupeEvents, getDedupeStats } from "../src/lib/events/dedupe-events";
import { verifyEvents } from "../src/lib/events/verify-url";
import { updateProviderHealth } from "../src/lib/events/provider-health";
import { cleanExpiredHtmlCache } from "../src/lib/events/scrape-utils";
import type {
  EventItem,
  EventProvider,
  RefreshMetadata,
  ScrapeProviderParams,
  ProviderHealth,
} from "../src/lib/events/types";
import { PROVIDER_DISPLAY_NAMES, PROVIDER_PRIORITY } from "../src/lib/events/types";

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "career-events");
const EVENTS_FILE = path.join(DATA_DIR, "verified-events.json");
const METADATA_FILE = path.join(DATA_DIR, "refresh-metadata.json");

// ============================================
// CLI COLORS
// ============================================

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message: string, color: keyof typeof colors = "reset"): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string): void {
  log(`✓ ${message}`, "green");
}

function warn(message: string): void {
  log(`⚠ ${message}`, "yellow");
}

function error(message: string): void {
  log(`✗ ${message}`, "red");
}

function info(message: string): void {
  log(`→ ${message}`, "cyan");
}

function header(message: string): void {
  console.log();
  log(message, "bold");
  log("=".repeat(60), "dim");
}

// ============================================
// CLI ARGUMENTS
// ============================================

interface CliArgs {
  months: number;
  dryRun: boolean;
  skipVerify: boolean;
  verbose: boolean;
  provider?: EventProvider;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    months: 12,
    dryRun: false,
    skipVerify: false,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--months=")) {
      result.months = parseInt(arg.split("=")[1], 10) || 12;
    } else if (arg === "--dry-run") {
      result.dryRun = true;
    } else if (arg === "--skip-verify") {
      result.skipVerify = true;
    } else if (arg === "--verbose" || arg === "-v") {
      result.verbose = true;
    } else if (arg.startsWith("--provider=")) {
      const provider = arg.split("=")[1] as EventProvider;
      if (PROVIDER_PRIORITY.includes(provider)) {
        result.provider = provider;
      } else {
        warn(`Unknown provider: ${provider}`);
        log(`Valid providers: ${PROVIDER_PRIORITY.join(", ")}`);
      }
    }
  }

  return result;
}

// ============================================
// FILE OPERATIONS
// ============================================

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveEvents(events: EventItem[]): void {
  ensureDataDir();
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
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

  // Header
  console.log();
  log("📅 CAREER EVENTS REFRESH", "bold");
  log(`Generated: ${new Date().toISOString()}`, "dim");
  console.log();

  // Show configuration
  const enabledProviders = getConfiguredProviders();
  info(`Enabled providers: ${enabledProviders.map((p) => p.id).join(", ")}`);

  if (enabledProviders.length === 0) {
    error("No providers enabled! Check your configuration.");
    process.exit(1);
  }

  if (args.provider) {
    info(`Single provider mode: ${args.provider}`);
  }
  if (args.dryRun) {
    warn("DRY RUN - no files will be saved");
  }
  if (args.skipVerify) {
    warn("Skipping URL verification");
  }

  // Clean expired HTML cache
  const expiredCacheEntries = cleanExpiredHtmlCache();
  if (expiredCacheEntries > 0) {
    info(`Cleaned ${expiredCacheEntries} expired HTML cache entries`);
  }

  // Fetch events
  header(`Fetching events for next ${args.months} months...`);

  const params: ScrapeProviderParams = {
    months: args.months,
    countryScope: "Norway+Europe",
  };

  let fetchedEvents: Omit<EventItem, "verified" | "verifiedAtISO">[];
  let stats: { provider: EventProvider; fetched: number; errors: string[] }[];
  let health: ProviderHealth[];

  if (args.provider) {
    // Single provider
    try {
      fetchedEvents = await fetchFromProvider(args.provider, params);
      stats = [{ provider: args.provider, fetched: fetchedEvents.length, errors: [] }];
      health = [{
        provider: args.provider,
        status: fetchedEvents.length > 0 ? "healthy" : "degraded",
        lastRun: new Date().toISOString(),
        lastSuccess: fetchedEvents.length > 0 ? new Date().toISOString() : undefined,
        consecutiveFailures: 0,
        eventsFound: fetchedEvents.length,
      }];
      success(`${PROVIDER_DISPLAY_NAMES[args.provider]}: Fetched ${fetchedEvents.length} events`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      error(`Error fetching from ${args.provider}: ${errorMessage}`);
      fetchedEvents = [];
      stats = [{ provider: args.provider, fetched: 0, errors: [errorMessage] }];
      health = [{
        provider: args.provider,
        status: "failed",
        lastRun: new Date().toISOString(),
        consecutiveFailures: 1,
        lastError: errorMessage,
      }];
    }
  } else {
    // All providers
    const result = await fetchFromAllProviders(params);
    fetchedEvents = result.events;
    stats = result.stats;
    health = result.health;

    for (const s of stats) {
      const displayName = PROVIDER_DISPLAY_NAMES[s.provider];
      if (s.fetched > 0) {
        success(`${displayName}: Fetched ${s.fetched} events`);
      } else if (s.errors.length > 0) {
        error(`${displayName}: ${s.errors[0]}`);
      } else {
        warn(`${displayName}: No events found`);
      }
    }
  }

  success(`Total fetched: ${fetchedEvents.length} events`);

  // Update provider health
  updateProviderHealth(health);

  // Filter by date range
  header("Filtering by date range...");
  const now = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + args.months);

  const eventsInRange = fetchedEvents.filter((event) => {
    const eventDate = new Date(event.startDateISO);
    return eventDate >= now && eventDate <= maxDate;
  });
  success(`${eventsInRange.length} events within date range`);

  // Deduplicate
  header("Deduplicating events...");
  const eventsWithVerified = eventsInRange.map((e) => ({
    ...e,
    verified: false,
  })) as EventItem[];

  const dedupedEvents = dedupeEvents(eventsWithVerified);
  const dedupeStats = getDedupeStats(eventsWithVerified);
  const duplicatesRemoved = eventsInRange.length - dedupedEvents.length;
  success(`${dedupedEvents.length} unique events`);
  if (duplicatesRemoved > 0) {
    info(`${duplicatesRemoved} duplicates removed`);
  }

  if (args.verbose) {
    log("  By provider:", "dim");
    for (const [provider, count] of Object.entries(dedupeStats.byProvider)) {
      log(`    • ${provider}: ${count}`, "dim");
    }
  }

  // Verify URLs
  let verifiedEvents: EventItem[];
  let failedCount = 0;

  if (args.skipVerify) {
    header("Skipping URL verification...");
    verifiedEvents = dedupedEvents.map((e) => ({
      ...e,
      verified: true,
      verifiedAtISO: new Date().toISOString(),
    }));
    success(`${verifiedEvents.length} events marked as verified (skipped check)`);
  } else {
    header("Verifying registration URLs...");
    const verificationResult = await verifyEvents(dedupedEvents, 5);
    verifiedEvents = verificationResult.verified;
    failedCount = verificationResult.stats.failed;
    success(`${verifiedEvents.length} events passed verification`);
    if (failedCount > 0) {
      warn(`${failedCount} events failed verification`);
    }

    if (args.verbose && verificationResult.failed.length > 0) {
      log("  Failed events:", "dim");
      for (const event of verificationResult.failed.slice(0, 5)) {
        log(`    • ${event.title.slice(0, 50)}...`, "dim");
      }
      if (verificationResult.failed.length > 5) {
        log(`    ... and ${verificationResult.failed.length - 5} more`, "dim");
      }
    }
  }

  // Save results
  if (!args.dryRun) {
    header("Saving events...");
    saveEvents(verifiedEvents);
    success(`Saved ${verifiedEvents.length} verified events`);

    // Build provider stats for metadata
    const providerStats = stats.map((s) => ({
      provider: s.provider,
      fetched: s.fetched,
      normalized: eventsInRange.filter((e) => e.provider === s.provider).length,
      verified: verifiedEvents.filter((e) => e.provider === s.provider).length,
      failed: s.errors.length > 0 ? s.fetched : dedupedEvents.filter((e) => e.provider === s.provider && !verifiedEvents.some((v) => v.id === e.id)).length,
      errors: s.errors,
    }));

    const metadata: RefreshMetadata = {
      lastRefreshISO: new Date().toISOString(),
      totalFetched: fetchedEvents.length,
      totalNormalized: eventsInRange.length,
      totalVerified: verifiedEvents.length,
      totalFailed: failedCount,
      duplicatesRemoved,
      providerStats,
      providerHealth: health,
    };

    saveMetadata(metadata);
    success("Saved refresh metadata");
  }

  // Summary
  header("SUMMARY");
  console.log();
  console.log(`  Providers:            ${stats.map((s) => s.provider).join(", ")}`);
  console.log(`  Months:               ${args.months}`);
  console.log(`  Total fetched:        ${fetchedEvents.length}`);
  console.log(`  Within date range:    ${eventsInRange.length}`);
  console.log(`  After deduplication:  ${dedupedEvents.length}`);
  console.log(`  Verified:             ${verifiedEvents.length}`);
  console.log(`  Failed verification:  ${failedCount}`);
  if (args.dryRun) {
    console.log(`\n  (DRY RUN - no changes saved)`);
  }
  console.log();

  // Provider breakdown
  log("Provider Breakdown:", "dim");
  for (const s of stats) {
    const displayName = PROVIDER_DISPLAY_NAMES[s.provider] || s.provider;
    const verified = verifiedEvents.filter((e) => e.provider === s.provider).length;
    log(`  ${displayName}:`, "dim");
    log(`    Fetched: ${s.fetched}`, "dim");
    log(`    Verified: ${verified}`, "dim");
    if (s.errors.length > 0) {
      error(`    Errors: ${s.errors.join(", ")}`);
    }
  }

  // Timing
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log();
  log(`Completed in ${elapsed}s`, "dim");
}

// Run
main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
