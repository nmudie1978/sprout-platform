/**
 * URL VERIFICATION FOR OPPORTUNITIES
 *
 * Same shape as src/lib/events/verify-url.ts — HTTPS-only, HEAD then
 * GET fallback, 200-399 accepted, file-cached for a configurable TTL.
 * Separate cache file so opportunity checks don't thrash the events
 * cache (and vice-versa).
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  UrlCheckResult,
  UrlCheckCache,
  OpportunityItem,
} from "./types";
import { getOpportunitiesConfig, USER_AGENT } from "./config";

const REQUEST_TIMEOUT_MS = 10000;
const CACHE_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "opportunities",
  "url-cache.json",
);

function getCacheTtlHours(): number {
  return getOpportunitiesConfig().urlVerificationTtlHours;
}

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(CACHE_FILE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // already exists
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

export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function verifyUrl(
  url: string,
  skipCache = false,
): Promise<UrlCheckResult> {
  const now = new Date().toISOString();

  if (!isValidHttpsUrl(url)) {
    return {
      url,
      status: null,
      ok: false,
      checkedAtISO: now,
      error: "URL must use HTTPS protocol",
    };
  }

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

  let status: number | null = null;
  let ok = false;
  let error: string | undefined;

  try {
    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        {
          method: "HEAD",
          headers: { "User-Agent": USER_AGENT },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS,
      );
    } catch {
      response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: { "User-Agent": USER_AGENT },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS,
      );
    }

    status = response.status;
    ok = status >= 200 && status < 400;
    if (!ok) error = `HTTP ${status}`;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    if (error.includes("aborted")) error = "Request timeout";
  }

  const cache = await loadCache();
  const ttl = new Date();
  ttl.setHours(ttl.getHours() + getCacheTtlHours());
  cache[url] = {
    status,
    ok,
    checkedAtISO: now,
    ttlExpiresAtISO: ttl.toISOString(),
    error,
  };
  await saveCache(cache);

  return { url, status, ok, checkedAtISO: now, error };
}

export async function verifyUrls(
  urls: string[],
  concurrency = 6,
  skipCache = false,
): Promise<Map<string, UrlCheckResult>> {
  const results = new Map<string, UrlCheckResult>();
  const queue = [...urls];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      results.set(url, await verifyUrl(url, skipCache));
    }
  }

  await Promise.all(
    Array(Math.min(concurrency, urls.length))
      .fill(null)
      .map(() => worker()),
  );
  return results;
}

export interface OpportunityVerificationResult {
  verified: OpportunityItem[];
  failed: OpportunityItem[];
  stats: { total: number; verified: number; failed: number };
}

export async function verifyOpportunities(
  items: OpportunityItem[],
  concurrency = 6,
  skipCache = false,
): Promise<OpportunityVerificationResult> {
  const urls = Array.from(new Set(items.map((i) => i.applicationUrl)));
  const results = await verifyUrls(urls, concurrency, skipCache);

  const verified: OpportunityItem[] = [];
  const failed: OpportunityItem[] = [];
  const now = new Date().toISOString();

  for (const item of items) {
    const r = results.get(item.applicationUrl);
    if (r?.ok) {
      verified.push({
        ...item,
        verified: true,
        verifiedAtISO: now,
        lastCheckedAtISO: now,
      });
    } else {
      failed.push({ ...item, verified: false, lastCheckedAtISO: now });
    }
  }

  return {
    verified,
    failed,
    stats: {
      total: items.length,
      verified: verified.length,
      failed: failed.length,
    },
  };
}

export async function cleanExpiredCache(): Promise<number> {
  const cache = await loadCache();
  let removed = 0;
  for (const [url, entry] of Object.entries(cache)) {
    if (!isCacheValid(entry)) {
      delete cache[url];
      removed += 1;
    }
  }
  if (removed > 0) await saveCache(cache);
  return removed;
}
