/**
 * INSIGHT URL VALIDATION
 *
 * Lightweight runtime validation to ensure curated content URLs are still live.
 *
 * - YouTube: oEmbed endpoint (free, no API key)
 * - External URLs: HEAD with GET fallback
 * - 24-hour in-memory cache to avoid redundant checks
 * - Parallel validation with concurrency limit
 */

// ============================================
// VALIDATION CACHE (24h TTL)
// ============================================

const VALIDATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ValidationEntry {
  valid: boolean;
  checkedAt: number;
}

const validationCache = new Map<string, ValidationEntry>();

function getCachedResult(key: string): boolean | null {
  const entry = validationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.checkedAt > VALIDATION_TTL_MS) {
    validationCache.delete(key);
    return null;
  }
  return entry.valid;
}

function setCachedResult(key: string, valid: boolean): void {
  validationCache.set(key, { valid, checkedAt: Date.now() });
}

export function clearValidationCache(): void {
  validationCache.clear();
}

// ============================================
// YOUTUBE VALIDATION (oEmbed)
// ============================================

/**
 * Validate a YouTube video is still live via the free oEmbed endpoint.
 * Returns true for live/public videos, false for removed/private.
 */
export async function validateYouTubeVideo(videoId: string): Promise<boolean> {
  const cacheKey = `yt:${videoId}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;

  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    const valid = res.ok;
    setCachedResult(cacheKey, valid);
    return valid;
  } catch {
    // Network error or timeout — assume valid to avoid false negatives
    setCachedResult(cacheKey, true);
    return true;
  }
}

// ============================================
// EXTERNAL URL VALIDATION (HEAD → GET fallback)
// ============================================

/**
 * Validate an external URL is live via HEAD request, falling back to a
 * ranged GET if HEAD fails (some servers don't support HEAD).
 */
export async function validateExternalUrl(url: string): Promise<boolean> {
  const cacheKey = `ext:${url}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;

  try {
    // Try HEAD first
    const headRes = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (headRes.ok || headRes.status === 304) {
      setCachedResult(cacheKey, true);
      return true;
    }

    // Some servers reject HEAD — fallback to ranged GET
    if (headRes.status === 405 || headRes.status === 403) {
      const getRes = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      const valid = getRes.ok || getRes.status === 206 || getRes.status === 304;
      setCachedResult(cacheKey, valid);
      return valid;
    }

    setCachedResult(cacheKey, false);
    return false;
  } catch {
    // Network error or timeout — assume valid to avoid false negatives
    setCachedResult(cacheKey, true);
    return true;
  }
}

// ============================================
// BATCH VALIDATION
// ============================================

const CONCURRENCY = 5;

/**
 * Validate items in parallel (batched, max CONCURRENCY concurrent).
 * Returns only items whose URL passes validation.
 */
export async function validateInsightItems<T>(
  items: T[],
  getKey: (item: T) => string,
  validator: (key: string) => Promise<boolean>
): Promise<T[]> {
  if (items.length === 0) return [];

  const results: boolean[] = new Array(items.length);

  // Process in batches of CONCURRENCY
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((item) => validator(getKey(item)))
    );

    for (let j = 0; j < settled.length; j++) {
      const result = settled[j];
      results[i + j] =
        result.status === "fulfilled" ? result.value : true; // assume valid on error
    }
  }

  const valid: T[] = [];
  for (let i = 0; i < items.length; i++) {
    if (results[i]) {
      valid.push(items[i]);
    } else {
      console.warn(
        `[insights] Filtered out invalid content: ${getKey(items[i])}`
      );
    }
  }

  return valid;
}
