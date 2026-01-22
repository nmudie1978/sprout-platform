/**
 * URL VERIFICATION UTILITY
 *
 * Server-side URL verification for career event registration links.
 * - Rejects non-https URLs
 * - Attempts HEAD first, falls back to GET
 * - Accepts only 200-399 status codes
 * - Caches results for configurable TTL (default 24 hours)
 */

import { promises as fs } from "fs";
import path from "path";
import type { UrlCheckResult, UrlCheckCache, EventItem } from "./types";
import { getEventsConfig } from "./config";

// ============================================
// CONFIGURATION
// ============================================

const REQUEST_TIMEOUT_MS = 8000;
const CACHE_FILE_PATH = path.join(process.cwd(), "data", "career-events", "url-cache.json");

function getCacheTtlHours(): number {
  return getEventsConfig().refreshTtlHours;
}

// ============================================
// CACHE MANAGEMENT
// ============================================

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(CACHE_FILE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory exists
  }
}

async function loadCache(): Promise<UrlCheckCache> {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveCache(cache: UrlCheckCache): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

function isCacheValid(entry: UrlCheckCache[string]): boolean {
  if (!entry?.ttlExpiresAtISO) return false;
  return new Date(entry.ttlExpiresAtISO) > new Date();
}

// ============================================
// URL VALIDATION
// ============================================

/**
 * Check if a URL is valid HTTPS
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ============================================
// FETCH WITH TIMEOUT
// ============================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// CORE VERIFICATION
// ============================================

/**
 * Verify a single URL
 * Returns the verification result with status code
 */
export async function verifyUrl(url: string, skipCache = false): Promise<UrlCheckResult> {
  const now = new Date().toISOString();

  // Validate HTTPS
  if (!isValidHttpsUrl(url)) {
    return {
      url,
      status: null,
      ok: false,
      checkedAtISO: now,
      error: "URL must use HTTPS protocol",
    };
  }

  // Check cache first (unless skipping)
  if (!skipCache) {
    const cache = await loadCache();
    const cached = cache[url];
    if (cached && isCacheValid(cached)) {
      return {
        url,
        status: cached.status,
        ok: cached.ok,
        checkedAtISO: cached.checkedAtISO,
        error: cached.error,
      };
    }
  }

  // Perform verification
  let status: number | null = null;
  let ok = false;
  let error: string | undefined;

  try {
    // Try HEAD first (lighter request)
    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Sprout-EventVerifier/1.0)",
          },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS
      );
    } catch {
      // HEAD might be blocked, try GET
      response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Sprout-EventVerifier/1.0)",
          },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS
      );
    }

    status = response.status;
    ok = status >= 200 && status < 400;

    if (!ok) {
      error = `HTTP ${status}`;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    if (error.includes("aborted")) {
      error = "Request timeout";
    }
  }

  // Update cache
  const cache = await loadCache();
  const ttlExpires = new Date();
  ttlExpires.setHours(ttlExpires.getHours() + getCacheTtlHours());

  cache[url] = {
    status,
    ok,
    checkedAtISO: now,
    ttlExpiresAtISO: ttlExpires.toISOString(),
    error,
  };
  await saveCache(cache);

  return {
    url,
    status,
    ok,
    checkedAtISO: now,
    error,
  };
}

/**
 * Verify multiple URLs in parallel (with concurrency limit)
 */
export async function verifyUrls(
  urls: string[],
  concurrency = 5,
  skipCache = false
): Promise<Map<string, UrlCheckResult>> {
  const results = new Map<string, UrlCheckResult>();
  const queue = [...urls];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const result = await verifyUrl(url, skipCache);
      results.set(url, result);
    }
  }

  // Run workers in parallel
  const workers = Array(Math.min(concurrency, urls.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return results;
}

/**
 * Clear expired cache entries
 */
export async function cleanExpiredCache(): Promise<number> {
  const cache = await loadCache();
  const now = new Date();
  let removed = 0;

  for (const [url, entry] of Object.entries(cache)) {
    if (!isCacheValid(entry)) {
      delete cache[url];
      removed++;
    }
  }

  if (removed > 0) {
    await saveCache(cache);
  }

  return removed;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  total: number;
  valid: number;
  expired: number;
}> {
  const cache = await loadCache();
  let valid = 0;
  let expired = 0;

  for (const entry of Object.values(cache)) {
    if (isCacheValid(entry)) {
      valid++;
    } else {
      expired++;
    }
  }

  return {
    total: Object.keys(cache).length,
    valid,
    expired,
  };
}

// ============================================
// EVENT VERIFICATION
// ============================================

export interface EventVerificationResult {
  verified: EventItem[];
  failed: EventItem[];
  stats: {
    total: number;
    verified: number;
    failed: number;
  };
}

/**
 * Verify events by checking their registration URLs
 * Returns events with verified flag set and verifiedAtISO timestamp
 */
export async function verifyEvents(
  events: EventItem[],
  concurrency = 5,
  skipCache = false
): Promise<EventVerificationResult> {
  const urls = events.map((e) => e.registrationUrl);
  const results = await verifyUrls(urls, concurrency, skipCache);

  const verified: EventItem[] = [];
  const failed: EventItem[] = [];
  const now = new Date().toISOString();

  for (const event of events) {
    const result = results.get(event.registrationUrl);
    if (result?.ok) {
      verified.push({
        ...event,
        verified: true,
        verifiedAtISO: now,
      });
    } else {
      failed.push({
        ...event,
        verified: false,
      });
    }
  }

  return {
    verified,
    failed,
    stats: {
      total: events.length,
      verified: verified.length,
      failed: failed.length,
    },
  };
}
