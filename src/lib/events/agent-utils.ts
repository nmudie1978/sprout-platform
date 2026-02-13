/**
 * AGENT UTILITIES
 *
 * Shared helpers used by the background events agent route.
 * - Remove expired events (past dates)
 * - Re-check event registration links
 * - Remove stale events (unverified for too long)
 */

import type { EventItem } from "./types";
import { isPastEvent } from "./date-range";
import { verifyUrl } from "./verify-url";
import { verifyEventsContent } from "./verify-content";

// ============================================
// CONSTANTS
// ============================================

/** Events not re-checked within this window are considered stale */
export const STALE_THRESHOLD_HOURS = 48;

/** Minimum interval between link re-checks for the same event */
export const RECHECK_INTERVAL_HOURS = 24;

// ============================================
// REMOVE EXPIRED EVENTS
// ============================================

/**
 * Filter out events whose start date is in the past.
 */
export function removeExpiredEvents(events: EventItem[]): {
  active: EventItem[];
  expired: EventItem[];
} {
  const active: EventItem[] = [];
  const expired: EventItem[] = [];

  for (const event of events) {
    if (isPastEvent(event.startDateISO)) {
      expired.push(event);
    } else {
      active.push(event);
    }
  }

  return { active, expired };
}

// ============================================
// RE-CHECK EVENT LINKS
// ============================================

/**
 * Re-verify registration URLs for events whose last check is older
 * than RECHECK_INTERVAL_HOURS. Sets `lastCheckedAtISO` on success.
 */
export async function recheckEventLinks(
  events: EventItem[],
  concurrency = 5,
): Promise<{ valid: EventItem[]; failed: EventItem[] }> {
  const now = Date.now();
  const recheckThresholdMs = RECHECK_INTERVAL_HOURS * 60 * 60 * 1000;

  // Split into events needing re-check vs those still fresh
  const needsRecheck: EventItem[] = [];
  const stillFresh: EventItem[] = [];

  for (const event of events) {
    const lastCheck = event.lastCheckedAtISO ?? event.verifiedAtISO;
    if (!lastCheck || now - new Date(lastCheck).getTime() > recheckThresholdMs) {
      needsRecheck.push(event);
    } else {
      stillFresh.push(event);
    }
  }

  if (needsRecheck.length === 0) {
    return { valid: stillFresh, failed: [] };
  }

  // Concurrent worker pool for re-checks
  const valid: EventItem[] = [...stillFresh];
  const failed: EventItem[] = [];
  const queue = [...needsRecheck];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const event = queue.shift();
      if (!event) break;

      const result = await verifyUrl(event.registrationUrl, true);
      if (result.ok) {
        valid.push({
          ...event,
          lastCheckedAtISO: result.checkedAtISO,
        });
      } else {
        failed.push(event);
      }
    }
  }

  const workers = Array(Math.min(concurrency, needsRecheck.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return { valid, failed };
}

// ============================================
// REMOVE STALE EVENTS
// ============================================

/**
 * Remove events where the most recent verification timestamp
 * (lastCheckedAtISO or verifiedAtISO) is older than maxAgeHours.
 */
export function removeStaleEvents(
  events: EventItem[],
  maxAgeHours: number = STALE_THRESHOLD_HOURS,
): { fresh: EventItem[]; stale: EventItem[] } {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const fresh: EventItem[] = [];
  const stale: EventItem[] = [];

  for (const event of events) {
    const lastVerified = event.lastCheckedAtISO ?? event.verifiedAtISO;
    if (!lastVerified || now - new Date(lastVerified).getTime() > maxAgeMs) {
      stale.push(event);
    } else {
      fresh.push(event);
    }
  }

  return { fresh, stale };
}

// ============================================
// RE-CHECK EVENT CONTENT (Stage B)
// ============================================

/**
 * Re-verify events using content-level verification.
 * Splits events into "needs content recheck" (>24h since contentVerifiedAtISO)
 * vs "still fresh", then runs content verification on stale events.
 */
export async function recheckEventContent(
  events: EventItem[],
  concurrency = 3,
): Promise<{ valid: EventItem[]; failed: EventItem[] }> {
  const now = Date.now();
  const recheckThresholdMs = RECHECK_INTERVAL_HOURS * 60 * 60 * 1000;

  const needsRecheck: EventItem[] = [];
  const stillFresh: EventItem[] = [];

  for (const event of events) {
    const lastCheck = event.contentVerifiedAtISO ?? event.lastCheckedAtISO ?? event.verifiedAtISO;
    if (!lastCheck || now - new Date(lastCheck).getTime() > recheckThresholdMs) {
      needsRecheck.push(event);
    } else {
      stillFresh.push(event);
    }
  }

  if (needsRecheck.length === 0) {
    return { valid: stillFresh, failed: [] };
  }

  const { verified, failed } = await verifyEventsContent(needsRecheck, concurrency);

  return {
    valid: [...stillFresh, ...verified],
    failed,
  };
}
