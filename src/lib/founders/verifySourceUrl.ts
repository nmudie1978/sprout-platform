/**
 * URL verification for founder spotlight sources
 *
 * Requirements:
 * - HTTPS only
 * - HEAD request first, GET fallback
 * - 8 second timeout
 * - Accept 200-399 status codes
 * - Cache results for 24 hours
 */

import fs from "fs";
import path from "path";
import { UrlVerificationResult, VerificationCacheEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "founders");
const CACHE_FILE = path.join(DATA_DIR, "url-cache.json");

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Request timeout: 8 seconds
const REQUEST_TIMEOUT_MS = 8000;

// Allowed status codes
const MIN_VALID_STATUS = 200;
const MAX_VALID_STATUS = 399;

/**
 * Ensure data directory exists
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load verification cache from disk
 */
function loadCache(): Map<string, VerificationCacheEntry> {
  ensureDataDir();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error("[founders] Failed to load URL cache:", error);
  }
  return new Map();
}

/**
 * Save verification cache to disk
 */
function saveCache(cache: Map<string, VerificationCacheEntry>): void {
  ensureDataDir();
  try {
    const data = Object.fromEntries(cache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[founders] Failed to save URL cache:", error);
  }
}

/**
 * Get cached result if still valid
 */
function getCachedResult(url: string): UrlVerificationResult | null {
  const cache = loadCache();
  const entry = cache.get(url);

  if (!entry) return null;

  const expiresAt = new Date(entry.expiresAtISO).getTime();
  if (Date.now() > expiresAt) {
    // Cache expired
    return null;
  }

  return entry.result;
}

/**
 * Store result in cache
 */
function cacheResult(url: string, result: UrlVerificationResult): void {
  const cache = loadCache();
  const expiresAtISO = new Date(Date.now() + CACHE_TTL_MS).toISOString();

  cache.set(url, { result, expiresAtISO });
  saveCache(cache);
}

/**
 * Verify a source URL is accessible
 */
export async function verifySourceUrl(url: string): Promise<UrlVerificationResult> {
  const now = new Date().toISOString();

  // Check HTTPS requirement
  if (!url.startsWith("https://")) {
    return {
      url,
      ok: false,
      checkedAtISO: now,
      error: "URL must use HTTPS",
      ttlMs: CACHE_TTL_MS,
    };
  }

  // Check cache first
  const cached = getCachedResult(url);
  if (cached) {
    return cached;
  }

  // Perform verification
  const result = await performVerification(url);

  // Cache the result
  cacheResult(url, result);

  return result;
}

/**
 * Perform the actual URL verification
 */
async function performVerification(url: string): Promise<UrlVerificationResult> {
  const now = new Date().toISOString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Try HEAD request first (more efficient)
    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Sprout-Platform/1.0 (Founder Story Verification)",
      },
      redirect: "follow",
    });

    // Some servers don't support HEAD, fallback to GET
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Sprout-Platform/1.0 (Founder Story Verification)",
          Range: "bytes=0-0", // Request minimal content
        },
        redirect: "follow",
      });
    }

    clearTimeout(timeoutId);

    const isValidStatus =
      response.status >= MIN_VALID_STATUS && response.status <= MAX_VALID_STATUS;

    if (isValidStatus) {
      return {
        url,
        ok: true,
        status: response.status,
        checkedAtISO: now,
        ttlMs: CACHE_TTL_MS,
      };
    } else {
      return {
        url,
        ok: false,
        status: response.status,
        checkedAtISO: now,
        error: `HTTP ${response.status}`,
        ttlMs: CACHE_TTL_MS,
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);

    const errorMessage =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Request timed out"
          : error.message
        : "Unknown error";

    return {
      url,
      ok: false,
      checkedAtISO: now,
      error: errorMessage,
      ttlMs: CACHE_TTL_MS,
    };
  }
}

/**
 * Verify multiple URLs concurrently with concurrency limit
 */
export async function verifyMultipleUrls(
  urls: string[],
  concurrencyLimit: number = 5
): Promise<Map<string, UrlVerificationResult>> {
  const results = new Map<string, UrlVerificationResult>();
  const queue = [...urls];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const url = queue.shift();
      if (url) {
        const result = await verifySourceUrl(url);
        results.set(url, result);
      }
    }
  }

  // Start workers up to concurrency limit
  const workers = Array(Math.min(concurrencyLimit, urls.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);

  return results;
}

/**
 * Clear expired entries from cache
 */
export function cleanCache(): number {
  const cache = loadCache();
  const now = Date.now();
  let removed = 0;

  for (const [url, entry] of cache.entries()) {
    const expiresAt = new Date(entry.expiresAtISO).getTime();
    if (now > expiresAt) {
      cache.delete(url);
      removed++;
    }
  }

  if (removed > 0) {
    saveCache(cache);
  }

  return removed;
}

/**
 * Invalidate cache for a specific URL
 */
export function invalidateCacheForUrl(url: string): boolean {
  const cache = loadCache();
  const existed = cache.has(url);
  cache.delete(url);
  saveCache(cache);
  return existed;
}
