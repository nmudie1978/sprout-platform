/**
 * POST /api/admin/events/refresh
 *
 * Triggers a manual refresh of events from all providers.
 * Protected by x-admin-key header.
 * Uses locking to prevent overlapping refresh runs.
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { fetchFromAllProviders } from "@/lib/events/providers";
import { dedupeEvents } from "@/lib/events/dedupe-events";
import { verifyEvents } from "@/lib/events/verify-url";
import { updateProviderHealth } from "@/lib/events/provider-health";
import type { EventItem, RefreshMetadata, ScrapeProviderParams } from "@/lib/events/types";

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(process.cwd(), "data", "career-events");
const LOCK_FILE = path.join(DATA_DIR, ".refresh-lock");
const EVENTS_FILE = path.join(DATA_DIR, "verified-events.json");
const METADATA_FILE = path.join(DATA_DIR, "refresh-metadata.json");
const ADMIN_KEY = process.env.ADMIN_API_KEY || "dev-admin-key";

// ============================================
// LOCK MANAGEMENT
// ============================================

function acquireLock(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Check if lock exists and is recent (within 10 minutes)
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));
      const lockTime = new Date(lockData.timestamp).getTime();
      const now = Date.now();

      // If lock is less than 10 minutes old, refresh is still running
      if (now - lockTime < 10 * 60 * 1000) {
        return false;
      }
    }

    // Create/update lock file
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      pid: process.pid,
    }));

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
  // Verify admin key
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Try to acquire lock
  if (!acquireLock()) {
    return NextResponse.json(
      { error: "Refresh already in progress" },
      { status: 409 }
    );
  }

  try {
    // Parse request body for options
    let months = 12;
    let skipVerify = false;

    try {
      const body = await request.json();
      if (body.months) months = parseInt(body.months, 10) || 12;
      if (body.skipVerify) skipVerify = true;
    } catch {
      // Use defaults
    }

    console.log(`[Admin Refresh] Starting refresh with months=${months}, skipVerify=${skipVerify}`);

    // Fetch from all providers
    const params: ScrapeProviderParams = {
      months,
      countryScope: "Norway+Europe",
    };

    const { events: fetchedEvents, stats, health } = await fetchFromAllProviders(params);
    console.log(`[Admin Refresh] Fetched ${fetchedEvents.length} events`);

    // Update provider health
    updateProviderHealth(health);

    // Filter by date range
    const now = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + months);

    const eventsInRange = fetchedEvents.filter((event) => {
      const eventDate = new Date(event.startDateISO);
      return eventDate >= now && eventDate <= maxDate;
    });
    console.log(`[Admin Refresh] ${eventsInRange.length} events within date range`);

    // Deduplicate
    const eventsWithVerified = eventsInRange.map((e) => ({
      ...e,
      verified: false,
    })) as EventItem[];

    const dedupedEvents = dedupeEvents(eventsWithVerified);
    const duplicatesRemoved = eventsInRange.length - dedupedEvents.length;
    console.log(`[Admin Refresh] ${dedupedEvents.length} unique events (${duplicatesRemoved} duplicates removed)`);

    // Verify URLs
    let verifiedEvents: EventItem[];
    let failedCount = 0;

    if (skipVerify) {
      verifiedEvents = dedupedEvents.map((e) => ({
        ...e,
        verified: true,
        verifiedAtISO: new Date().toISOString(),
      }));
    } else {
      console.log(`[Admin Refresh] Verifying ${dedupedEvents.length} URLs...`);
      const verificationResult = await verifyEvents(dedupedEvents, 5);
      verifiedEvents = verificationResult.verified;
      failedCount = verificationResult.stats.failed;
      console.log(`[Admin Refresh] ${verifiedEvents.length} verified, ${failedCount} failed`);
    }

    // Save results
    saveEvents(verifiedEvents);

    // Build provider stats
    const providerStats = stats.map((s) => ({
      provider: s.provider,
      fetched: s.fetched,
      normalized: s.fetched,
      verified: verifiedEvents.filter((e) => e.provider === s.provider).length,
      failed: s.errors.length > 0 ? s.fetched : 0,
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

    return NextResponse.json({
      status: "ok",
      message: "Refresh completed successfully",
      stats: {
        fetched: fetchedEvents.length,
        inRange: eventsInRange.length,
        deduplicated: dedupedEvents.length,
        verified: verifiedEvents.length,
        failed: failedCount,
        duplicatesRemoved,
      },
      providerStats: stats.map((s) => ({
        provider: s.provider,
        fetched: s.fetched,
        errors: s.errors.length,
      })),
    });
  } catch (error) {
    console.error("[Admin Refresh] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    releaseLock();
  }
}
