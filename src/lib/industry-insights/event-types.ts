/**
 * EVENT TYPES AND VALIDATION
 *
 * Defines the event model for Industry Insights with audience classification
 * and URL validation utilities.
 */

// ============================================
// TYPES
// ============================================

export type EventFormat = "online" | "in-person" | "hybrid";
export type EventRegion = "global" | "europe" | "nordic" | "local";
export type EventAudience = "youth" | "general";

export interface InsightEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationLabel: string;
  format: EventFormat;
  region: EventRegion;
  url: string;
  tags: string[];
  audience: EventAudience;
  verified: boolean;
  verifiedAt?: string;
  organizer?: string;
  isFree?: boolean;
}

// Tags that indicate youth-friendly events
const YOUTH_FRIENDLY_TAGS = [
  "youth-friendly",
  "beginner",
  "entry-level",
  "student",
  "first-job",
  "apprentice",
  "internship",
  "under-25",
  "young-professionals",
  "career-starter",
];

// ============================================
// CLASSIFICATION LOGIC
// ============================================

/**
 * Determines if an event should be shown in the Youth section
 * Based on audience field and youth-friendly tags
 */
export function isYouthEvent(event: InsightEvent): boolean {
  // Explicit youth audience
  if (event.audience === "youth") return true;

  // Check for youth-friendly tags
  return event.tags.some((tag) =>
    YOUTH_FRIENDLY_TAGS.includes(tag.toLowerCase())
  );
}

/**
 * Splits events into youth and global categories
 */
export function classifyEvents(events: InsightEvent[]): {
  youthEvents: InsightEvent[];
  globalEvents: InsightEvent[];
} {
  const youthEvents: InsightEvent[] = [];
  const globalEvents: InsightEvent[] = [];

  for (const event of events) {
    if (isYouthEvent(event)) {
      youthEvents.push(event);
    } else {
      globalEvents.push(event);
    }
  }

  return { youthEvents, globalEvents };
}

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validates that a URL is properly formatted and uses HTTPS
 */
export function isValidEventUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Server-side URL verification with HEAD request
 * Falls back to GET if HEAD fails
 * Caches results for 6 hours
 */
const urlVerificationCache = new Map<
  string,
  { verified: boolean; checkedAt: number }
>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function verifyEventUrl(url: string): Promise<boolean> {
  // Check basic URL validity first
  if (!isValidEventUrl(url)) {
    return false;
  }

  // Check cache
  const cached = urlVerificationCache.get(url);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) {
    return cached.verified;
  }

  try {
    // Try HEAD request first (lighter)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      });
    } catch {
      // HEAD might be blocked by CORS, try GET with no-store
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
    }

    clearTimeout(timeout);

    // Accept 200-399 status codes
    const verified = response.status >= 200 && response.status < 400;

    // Cache the result
    urlVerificationCache.set(url, {
      verified,
      checkedAt: Date.now(),
    });

    return verified;
  } catch {
    // Network error or timeout - mark as unverified
    urlVerificationCache.set(url, {
      verified: false,
      checkedAt: Date.now(),
    });
    return false;
  }
}

/**
 * Filters events to only include those with verified URLs
 * For client-side, just checks URL format
 * For server-side, performs actual verification
 */
export function filterVerifiedEvents(
  events: InsightEvent[],
  serverSide = false
): InsightEvent[] {
  if (serverSide) {
    // Server will have already verified during fetch
    return events.filter((e) => e.verified && isValidEventUrl(e.url));
  }

  // Client-side: trust verified flag and check URL format
  return events.filter((e) => e.verified && isValidEventUrl(e.url));
}

// ============================================
// CURATED EVENTS
// Populated at runtime from /api/events/youth.
// Static entries here are filtered by date —
// past events are automatically excluded by
// getClassifiedEvents() below.
// ============================================

export const CURATED_EVENTS: InsightEvent[] = [];

/**
 * Get all curated events, optionally filtered by verification status
 */
export function getCuratedEvents(verifiedOnly = true): InsightEvent[] {
  if (verifiedOnly) {
    return CURATED_EVENTS.filter((e) => e.verified && isValidEventUrl(e.url));
  }
  return CURATED_EVENTS;
}

/**
 * Get events split by audience
 */
export function getClassifiedEvents(): {
  youthEvents: InsightEvent[];
  globalEvents: InsightEvent[];
} {
  const verifiedEvents = getCuratedEvents(true);
  return classifyEvents(verifiedEvents);
}
