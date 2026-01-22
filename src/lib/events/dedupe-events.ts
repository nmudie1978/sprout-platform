/**
 * EVENT DEDUPLICATION UTILITY
 *
 * De-duplicates events by: normalizedTitle + startDateISO + normalizedCity
 * Prefers:
 * 1. verified === true
 * 2. Richer location info
 * 3. Provider priority (Norwegian sources > European sources)
 * 4. Most recent verifiedAtISO
 */

import type { EventItem, EventProvider } from "./types";
import { PROVIDER_PRIORITY } from "./types";

// ============================================
// PROVIDER PRIORITY (index-based, lower = higher priority)
// ============================================

function getProviderPriority(provider: EventProvider): number {
  const index = PROVIDER_PRIORITY.indexOf(provider);
  return index >= 0 ? index : PROVIDER_PRIORITY.length;
}

// ============================================
// NORMALIZATION HELPERS
// ============================================

/**
 * Normalize a string for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Normalize a title for deduplication
 */
export function normalizeTitle(title: string): string {
  return normalizeString(title)
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-");
}

/**
 * Normalize a city name
 */
export function normalizeCity(city: string | undefined): string {
  if (!city) return "";
  return normalizeString(city)
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, "-");
}

// ============================================
// DEDUPLICATION KEY
// ============================================

/**
 * Generate a deduplication key for an event
 */
export function generateDedupeKey(event: EventItem): string {
  const normalizedTitlePart = normalizeTitle(event.title);
  const datePart = event.startDateISO.slice(0, 10); // YYYY-MM-DD
  const cityPart = normalizeCity(event.city) || "online";

  return `${normalizedTitlePart}::${datePart}::${cityPart}`;
}

// ============================================
// LOCATION RICHNESS SCORING
// ============================================

/**
 * Calculate location richness score
 * Higher = more complete location information
 */
function getLocationRichness(event: EventItem): number {
  let score = 0;
  if (event.city) score += 3;
  if (event.locationLabel && event.locationLabel !== "Online" && event.locationLabel !== "Location TBA") score += 2;
  if (event.format !== "Online") score += 1;
  return score;
}

// ============================================
// COMPARISON
// ============================================

/**
 * Compare two events and return the preferred one
 * Returns 1 if eventA is preferred, -1 if eventB is preferred, 0 if equal
 */
export function compareEventPriority(eventA: EventItem, eventB: EventItem): number {
  // 1. Prefer verified
  if (eventA.verified && !eventB.verified) return 1;
  if (!eventA.verified && eventB.verified) return -1;

  // 2. Prefer richer location info
  const locationA = getLocationRichness(eventA);
  const locationB = getLocationRichness(eventB);
  if (locationA > locationB) return 1;
  if (locationA < locationB) return -1;

  // 3. Prefer higher priority provider (lower index = higher priority)
  const providerPriorityA = getProviderPriority(eventA.provider);
  const providerPriorityB = getProviderPriority(eventB.provider);
  if (providerPriorityA < providerPriorityB) return 1;
  if (providerPriorityA > providerPriorityB) return -1;

  // 4. Prefer most recent verification
  if (eventA.verifiedAtISO && eventB.verifiedAtISO) {
    const dateA = new Date(eventA.verifiedAtISO).getTime();
    const dateB = new Date(eventB.verifiedAtISO).getTime();
    if (dateA > dateB) return 1;
    if (dateA < dateB) return -1;
  } else if (eventA.verifiedAtISO && !eventB.verifiedAtISO) {
    return 1;
  } else if (!eventA.verifiedAtISO && eventB.verifiedAtISO) {
    return -1;
  }

  // 5. Prefer event with description
  if (eventA.description && !eventB.description) return 1;
  if (!eventA.description && eventB.description) return -1;

  return 0;
}

// ============================================
// MAIN DEDUPLICATION
// ============================================

/**
 * De-duplicate a list of events
 * Returns the deduplicated list with the preferred event for each group
 */
export function dedupeEvents(events: EventItem[]): EventItem[] {
  const eventMap = new Map<string, EventItem>();

  for (const event of events) {
    const key = generateDedupeKey(event);
    const existing = eventMap.get(key);

    if (!existing) {
      eventMap.set(key, event);
    } else {
      // Compare and keep the preferred one
      const comparison = compareEventPriority(event, existing);
      if (comparison > 0) {
        eventMap.set(key, event);
      }
    }
  }

  return Array.from(eventMap.values());
}

/**
 * Find duplicate events in a list
 * Returns groups of duplicates (for debugging/analysis)
 */
export function findDuplicates(events: EventItem[]): Map<string, EventItem[]> {
  const groups = new Map<string, EventItem[]>();

  for (const event of events) {
    const key = generateDedupeKey(event);
    const existing = groups.get(key) || [];
    existing.push(event);
    groups.set(key, existing);
  }

  // Filter to only groups with duplicates
  const duplicates = new Map<string, EventItem[]>();
  for (const [key, group] of groups) {
    if (group.length > 1) {
      duplicates.set(key, group);
    }
  }

  return duplicates;
}

/**
 * Merge new events into existing events, handling duplicates
 */
export function mergeEvents(
  existingEvents: EventItem[],
  newEvents: EventItem[]
): { merged: EventItem[]; added: number; updated: number; unchanged: number; duplicatesRemoved: number } {
  const resultMap = new Map<string, EventItem>();
  let added = 0;
  let updated = 0;
  let unchanged = 0;

  // Add existing events first
  for (const event of existingEvents) {
    const key = generateDedupeKey(event);
    resultMap.set(key, event);
  }

  const existingCount = resultMap.size;

  // Process new events
  for (const newEvent of newEvents) {
    const key = generateDedupeKey(newEvent);
    const existing = resultMap.get(key);

    if (!existing) {
      resultMap.set(key, newEvent);
      added++;
    } else {
      const comparison = compareEventPriority(newEvent, existing);
      if (comparison > 0) {
        resultMap.set(key, newEvent);
        updated++;
      } else {
        unchanged++;
      }
    }
  }

  // Calculate duplicates removed
  const totalInput = existingEvents.length + newEvents.length;
  const duplicatesRemoved = totalInput - resultMap.size;

  return {
    merged: Array.from(resultMap.values()),
    added,
    updated,
    unchanged,
    duplicatesRemoved,
  };
}

/**
 * Get deduplication statistics
 */
export function getDedupeStats(events: EventItem[]): {
  total: number;
  unique: number;
  duplicates: number;
  byProvider: Record<EventProvider, number>;
} {
  const deduped = dedupeEvents(events);
  const byProvider: Record<EventProvider, number> = {
    tautdanning: 0,
    oslomet: 0,
    "bi-karrieredagene": 0,
    eures: 0,
  };

  for (const event of deduped) {
    byProvider[event.provider]++;
  }

  return {
    total: events.length,
    unique: deduped.length,
    duplicates: events.length - deduped.length,
    byProvider,
  };
}
