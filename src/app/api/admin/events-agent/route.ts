/**
 * POST /api/admin/events-agent
 *
 * Background agent that maintains event data freshness:
 * 1. Remove expired (past) events
 * 2. Fetch new events from all providers
 * 3. Filter, dedupe, verify new events
 * 4. Re-check links on surviving existing events
 * 5. Remove stale events (unverified > 48h)
 * 6. Merge and save
 *
 * Auth: x-admin-key header or CRON_SECRET Bearer token.
 * Uses file lock to prevent overlapping runs.
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { fetchFromAllProviders } from "@/lib/events/providers";
import { dedupeEvents, mergeEvents } from "@/lib/events/dedupe-events";
import { verifyEvents } from "@/lib/events/verify-url";
import { updateProviderHealth } from "@/lib/events/provider-health";
import { isWithinDateRange } from "@/lib/events/date-range";
import {
  removeExpiredEvents,
  recheckEventLinks,
  removeStaleEvents,
  STALE_THRESHOLD_HOURS,
} from "@/lib/events/agent-utils";
import type {
  EventItem,
  RefreshMetadata,
  AgentRunReport,
  ScrapeProviderParams,
} from "@/lib/events/types";

export const maxDuration = 300;

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "career-events");
const LOCK_FILE = path.join(DATA_DIR, ".agent-lock");
const EVENTS_FILE = path.join(DATA_DIR, "verified-events.json");
const METADATA_FILE = path.join(DATA_DIR, "refresh-metadata.json");
const ADMIN_KEY = process.env.ADMIN_API_KEY || "dev-admin-key";

// ============================================
// AUTH
// ============================================

function isAuthorized(request: NextRequest): boolean {
  // x-admin-key header
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey === ADMIN_KEY) return true;

  // CRON_SECRET Bearer token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth === `Bearer ${cronSecret}`) return true;
  }

  return false;
}

// ============================================
// LOCK MANAGEMENT
// ============================================

function acquireLock(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));
      const lockTime = new Date(lockData.timestamp).getTime();
      if (Date.now() - lockTime < 10 * 60 * 1000) {
        return false;
      }
    }

    fs.writeFileSync(
      LOCK_FILE,
      JSON.stringify({ timestamp: new Date().toISOString(), pid: process.pid }),
    );
    return true;
  } catch {
    return false;
  }
}

function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch {
    // Ignore errors
  }
}

// ============================================
// FILE OPERATIONS
// ============================================

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadEvents(): EventItem[] {
  try {
    return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function loadMetadata(): RefreshMetadata | null {
  try {
    return JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
  } catch {
    return null;
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
// ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!acquireLock()) {
    return NextResponse.json(
      { error: "Agent run already in progress" },
      { status: 409 },
    );
  }

  const startTime = Date.now();

  try {
    console.log("[Events Agent] Starting agent run...");

    // Step 1: Load existing events
    const existingEvents = loadEvents();
    const existingMetadata = loadMetadata();
    console.log(`[Events Agent] Loaded ${existingEvents.length} existing events`);

    // Step 2: Remove expired events (past dates)
    const { active: nonExpired, expired } = removeExpiredEvents(existingEvents);
    console.log(
      `[Events Agent] Removed ${expired.length} expired events, ${nonExpired.length} remain`,
    );

    // Step 3: Fetch new events from all providers
    const params: ScrapeProviderParams = {
      months: 12,
      countryScope: "Norway+Europe",
    };

    const { events: fetchedEvents, stats, health } =
      await fetchFromAllProviders(params);
    console.log(`[Events Agent] Fetched ${fetchedEvents.length} events from providers`);

    // Update provider health
    updateProviderHealth(health);

    // Step 4: Filter new events by date range and dedupe
    const newInRange = fetchedEvents.filter((e) =>
      isWithinDateRange(e.startDateISO, 12),
    );

    const newWithVerifiedFlag = newInRange.map((e) => ({
      ...e,
      verified: false,
    })) as EventItem[];

    const newDeduped = dedupeEvents(newWithVerifiedFlag);
    console.log(
      `[Events Agent] ${newDeduped.length} new unique events after date filter + dedupe`,
    );

    // Step 5: Verify URLs on new events
    const { verified: newVerified } = await verifyEvents(newDeduped, 5);
    console.log(`[Events Agent] ${newVerified.length} new events verified`);

    // Step 6: Re-check links on surviving existing events
    const { valid: recheckedValid, failed: recheckedFailed } =
      await recheckEventLinks(nonExpired, 5);
    console.log(
      `[Events Agent] Re-checked links: ${recheckedValid.length} valid, ${recheckedFailed.length} failed`,
    );

    // Step 7: Remove stale events (unverified for > STALE_THRESHOLD_HOURS)
    const { fresh: freshExisting, stale } = removeStaleEvents(
      recheckedValid,
      STALE_THRESHOLD_HOURS,
    );
    console.log(
      `[Events Agent] Removed ${stale.length} stale events, ${freshExisting.length} fresh`,
    );

    // Step 8: Merge new verified events with surviving existing events
    const { merged } = mergeEvents(freshExisting, newVerified);
    console.log(`[Events Agent] Final merged total: ${merged.length} events`);

    // Step 9: Build agent report
    const totalRemoved = expired.length + recheckedFailed.length + stale.length;
    const agentReport: AgentRunReport = {
      runAtISO: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      eventsActive: merged.length,
      eventsRemoved: totalRemoved,
      eventsAdded: newVerified.length,
      linksRechecked: recheckedValid.length + recheckedFailed.length,
      linksFailed: recheckedFailed.length,
      providerHealth: health,
    };

    // Step 10: Save events and metadata
    saveEvents(merged);

    const providerStats = stats.map((s) => ({
      provider: s.provider,
      fetched: s.fetched,
      normalized: s.fetched,
      verified: newVerified.filter((e) => e.provider === s.provider).length,
      failed: s.errors.length > 0 ? s.fetched : 0,
      errors: s.errors,
    }));

    const metadata: RefreshMetadata = {
      lastRefreshISO: new Date().toISOString(),
      totalFetched: fetchedEvents.length,
      totalNormalized: newInRange.length,
      totalVerified: newVerified.length,
      totalFailed: newDeduped.length - newVerified.length,
      duplicatesRemoved: newInRange.length - newDeduped.length,
      providerStats,
      providerHealth: health,
      lastAgentRunReport: agentReport,
    };

    saveMetadata(metadata);

    console.log(
      `[Events Agent] Run complete in ${agentReport.durationMs}ms — ${merged.length} active, ${totalRemoved} removed, ${newVerified.length} added`,
    );

    return NextResponse.json({
      active_events: merged.length,
      removed_events: totalRemoved,
      added_events: newVerified.length,
      links_rechecked: agentReport.linksRechecked,
      links_failed: agentReport.linksFailed,
      duration_ms: agentReport.durationMs,
      source_health_status: health.map((h) => ({
        provider: h.provider,
        status: h.status,
        eventsFound: h.eventsFound ?? 0,
      })),
    });
  } catch (error) {
    console.error("[Events Agent] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: Date.now() - startTime,
      },
      { status: 500 },
    );
  } finally {
    releaseLock();
  }
}
