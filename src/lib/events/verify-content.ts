/**
 * CONTENT VERIFICATION — Stage B
 *
 * Verifies that a URL actually points to an event page, not a generic
 * homepage, soft-404, or login wall. Uses content markers to confirm
 * the page contains event-related information.
 *
 * Pass conditions (ALL required):
 * 1. HTTP 200 (via fetchHtml)
 * 2. Body length >= 1000 bytes
 * 3. No login wall detected
 * 4. No soft 404 detected
 * 5. 2+ content markers found from 5 categories
 */

import { fetchHtml, stripHtml } from "./scrape-utils";
import { isValidHttpsUrl } from "./verify-url";
import type { EventItem } from "./types";

// ============================================
// TYPES
// ============================================

export type ContentMarkerType =
  | "date-pattern"
  | "title-match"
  | "registration-keyword"
  | "event-schema"
  | "calendar-indicator";

export interface ContentMarkerHit {
  type: ContentMarkerType;
  detail: string;
}

export interface ContentVerificationResult {
  url: string;
  passed: boolean;
  httpStatus: number | null;
  bodyLength: number;
  markers: ContentMarkerHit[];
  markerScore: number;
  loginWall: boolean;
  soft404: boolean;
  error?: string;
  checkedAtISO: string;
}

export interface BatchContentVerificationResult {
  verified: EventItem[];
  failed: EventItem[];
  results: Map<string, ContentVerificationResult>;
  stats: {
    total: number;
    verified: number;
    failed: number;
    avgMarkerScore: number;
  };
}

// ============================================
// CONSTANTS
// ============================================

const MIN_BODY_LENGTH = 1000;
const MIN_MARKER_SCORE = 2;

const LOGIN_WALL_PATTERNS = [
  /\/login\b/i,
  /\/auth\b/i,
  /window\.location\s*=/i,
  /<meta\s+http-equiv=["']refresh["']/i,
];

const SOFT_404_PATTERNS = [
  /page\s*not\s*found/i,
  /side\s*ikke\s*funnet/i,
  /\b404\b/,
  /not\s*found/i,
  /denne\s*siden\s*finnes\s*ikke/i,
];

const REGISTRATION_KEYWORDS = [
  "register",
  "sign up",
  "signup",
  "p\u00E5melding",
  "meld deg p\u00E5",
  "registrer",
  "delta",
  "book now",
  "book your",
  "get tickets",
  "buy tickets",
  "rsvp",
  "enroll",
  "join now",
  "apply now",
  "bestill",
  "billetter",
];

const CALENDAR_KEYWORDS = [
  "add to calendar",
  ".ics",
  "ical",
  "icalendar",
  "legg til i kalender",
  "google calendar",
  "outlook calendar",
  "add to google",
];

// ============================================
// MARKER DETECTION
// ============================================

/**
 * Check for date patterns in page text.
 */
function detectDatePattern(text: string): ContentMarkerHit | null {
  // ISO date: 2026-03-15
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) {
    return { type: "date-pattern", detail: `ISO date: ${isoMatch[0]}` };
  }

  // Norwegian date: 15. mars, 3. juni 2026
  const noMatch = text.match(
    /\b\d{1,2}\.\s*(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)\b/i,
  );
  if (noMatch) {
    return { type: "date-pattern", detail: `Norwegian date: ${noMatch[0]}` };
  }

  // English date: March 15, 15 March, March 15 2026
  const enMatch = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i,
  );
  if (enMatch) {
    return { type: "date-pattern", detail: `English date: ${enMatch[0]}` };
  }

  // DD.MM.YYYY
  const euroMatch = text.match(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/);
  if (euroMatch) {
    return { type: "date-pattern", detail: `Euro date: ${euroMatch[0]}` };
  }

  return null;
}

/**
 * Check if significant words from the event title appear in the page text.
 * Requires 2+ words longer than 3 chars to match.
 */
function detectTitleMatch(text: string, eventTitle: string): ContentMarkerHit | null {
  const textLower = text.toLowerCase();
  const significantWords = eventTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (significantWords.length === 0) return null;

  const matched = significantWords.filter((w) => textLower.includes(w));

  if (matched.length >= 2) {
    return {
      type: "title-match",
      detail: `Matched ${matched.length}/${significantWords.length} words: ${matched.join(", ")}`,
    };
  }

  return null;
}

/**
 * Check for registration-related keywords.
 */
function detectRegistrationKeyword(text: string): ContentMarkerHit | null {
  const textLower = text.toLowerCase();
  for (const keyword of REGISTRATION_KEYWORDS) {
    if (textLower.includes(keyword)) {
      return { type: "registration-keyword", detail: `Found: "${keyword}"` };
    }
  }
  return null;
}

/**
 * Check for Event schema.org markup (JSON-LD or microdata).
 */
function detectEventSchema(html: string): ContentMarkerHit | null {
  // JSON-LD with @type: "Event" or "EducationEvent"
  const jsonLdMatch = html.match(
    /@type["'\s:]+["'](Event|EducationEvent|BusinessEvent|SocialEvent|MusicEvent)["']/i,
  );
  if (jsonLdMatch) {
    return { type: "event-schema", detail: `JSON-LD @type: ${jsonLdMatch[1]}` };
  }

  // Microdata: itemtype="https://schema.org/Event"
  const microdataMatch = html.match(
    /itemtype=["']https?:\/\/schema\.org\/(Event|EducationEvent)["']/i,
  );
  if (microdataMatch) {
    return { type: "event-schema", detail: `Microdata: ${microdataMatch[1]}` };
  }

  return null;
}

/**
 * Check for calendar-related indicators.
 */
function detectCalendarIndicator(text: string, html: string): ContentMarkerHit | null {
  const textLower = text.toLowerCase();
  const htmlLower = html.toLowerCase();

  for (const keyword of CALENDAR_KEYWORDS) {
    if (textLower.includes(keyword) || htmlLower.includes(keyword)) {
      return { type: "calendar-indicator", detail: `Found: "${keyword}"` };
    }
  }

  return null;
}

// ============================================
// CONTENT CHECKS
// ============================================

/**
 * Detect login walls by checking HTML for redirect/auth patterns.
 */
function hasLoginWall(html: string): boolean {
  return LOGIN_WALL_PATTERNS.some((pattern) => pattern.test(html));
}

/**
 * Detect soft 404 pages by checking body text for "not found" variants.
 */
function hasSoft404(text: string): boolean {
  return SOFT_404_PATTERNS.some((pattern) => pattern.test(text));
}

// ============================================
// SINGLE EVENT VERIFICATION
// ============================================

/**
 * Verify that a single event's URL points to a real event page.
 */
export async function verifyEventContent(
  event: EventItem,
): Promise<ContentVerificationResult> {
  const now = new Date().toISOString();
  const url = event.registrationUrl;

  // Validate URL
  if (!isValidHttpsUrl(url)) {
    return {
      url,
      passed: false,
      httpStatus: null,
      bodyLength: 0,
      markers: [],
      markerScore: 0,
      loginWall: false,
      soft404: false,
      error: "URL must use HTTPS protocol",
      checkedAtISO: now,
    };
  }

  let html: string;
  try {
    html = await fetchHtml(url, { useCache: false, timeoutMs: 12000 });
  } catch (err) {
    return {
      url,
      passed: false,
      httpStatus: null,
      bodyLength: 0,
      markers: [],
      markerScore: 0,
      loginWall: false,
      soft404: false,
      error: err instanceof Error ? err.message : "Fetch failed",
      checkedAtISO: now,
    };
  }

  const bodyLength = html.length;
  const text = stripHtml(html);

  // Check minimum body length
  if (bodyLength < MIN_BODY_LENGTH) {
    return {
      url,
      passed: false,
      httpStatus: 200,
      bodyLength,
      markers: [],
      markerScore: 0,
      loginWall: false,
      soft404: false,
      error: `Body too short: ${bodyLength} bytes (min ${MIN_BODY_LENGTH})`,
      checkedAtISO: now,
    };
  }

  // Check login wall
  const loginWall = hasLoginWall(html);
  if (loginWall) {
    return {
      url,
      passed: false,
      httpStatus: 200,
      bodyLength,
      markers: [],
      markerScore: 0,
      loginWall: true,
      soft404: false,
      error: "Login wall detected",
      checkedAtISO: now,
    };
  }

  // Check soft 404
  const soft404 = hasSoft404(text);
  if (soft404) {
    return {
      url,
      passed: false,
      httpStatus: 200,
      bodyLength,
      markers: [],
      markerScore: 0,
      loginWall: false,
      soft404: true,
      error: "Soft 404 detected",
      checkedAtISO: now,
    };
  }

  // Collect content markers
  const markers: ContentMarkerHit[] = [];

  const dateHit = detectDatePattern(text);
  if (dateHit) markers.push(dateHit);

  const titleHit = detectTitleMatch(text, event.title);
  if (titleHit) markers.push(titleHit);

  const regHit = detectRegistrationKeyword(text);
  if (regHit) markers.push(regHit);

  const schemaHit = detectEventSchema(html);
  if (schemaHit) markers.push(schemaHit);

  const calHit = detectCalendarIndicator(text, html);
  if (calHit) markers.push(calHit);

  const markerScore = markers.length;
  const passed = markerScore >= MIN_MARKER_SCORE;

  return {
    url,
    passed,
    httpStatus: 200,
    bodyLength,
    markers,
    markerScore,
    loginWall: false,
    soft404: false,
    error: passed ? undefined : `Only ${markerScore} marker(s) found (need ${MIN_MARKER_SCORE})`,
    checkedAtISO: now,
  };
}

// ============================================
// BATCH VERIFICATION
// ============================================

/**
 * Verify multiple events with a concurrent worker pool.
 */
export async function verifyEventsContent(
  events: EventItem[],
  concurrency = 3,
): Promise<BatchContentVerificationResult> {
  const verified: EventItem[] = [];
  const failed: EventItem[] = [];
  const results = new Map<string, ContentVerificationResult>();
  const queue = [...events];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const event = queue.shift();
      if (!event) break;

      const result = await verifyEventContent(event);
      results.set(event.id, result);

      console.log(
        `[Content Verify] ${result.passed ? "PASS" : "FAIL"} (score ${result.markerScore}) ${event.title} — ${result.markers.map((m) => m.type).join(", ") || "no markers"}${result.error ? ` — ${result.error}` : ""}`,
      );

      if (result.passed) {
        verified.push({
          ...event,
          verified: true,
          verifiedAtISO: result.checkedAtISO,
          verificationMethod: "content",
          contentVerifiedAtISO: result.checkedAtISO,
        });
      } else {
        failed.push({
          ...event,
          verified: false,
        });
      }
    }
  }

  const workers = Array(Math.min(concurrency, events.length || 1))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);

  const totalMarkerScore = Array.from(results.values()).reduce(
    (sum, r) => sum + r.markerScore,
    0,
  );

  return {
    verified,
    failed,
    results,
    stats: {
      total: events.length,
      verified: verified.length,
      failed: failed.length,
      avgMarkerScore: events.length > 0 ? totalMarkerScore / events.length : 0,
    },
  };
}
