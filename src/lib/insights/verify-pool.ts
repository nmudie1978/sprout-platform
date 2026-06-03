/**
 * Pool Item Verification Service
 *
 * Verifies URLs in the insights pool are live and accessible.
 * Pattern: HEAD first → GET fallback → content sanity checks.
 *
 * The pass/fail decision lives in `verify-classify.ts` (pure + unit
 * tested). This module owns the network I/O: realistic request headers,
 * HEAD→GET fallback, a single retry on transient network error, and the
 * 8s timeout.
 */

import type { PoolItem } from "./pool-types";
import { isAllowedDomain } from "./domain-allowlist";
import { classifyVerification, isLoginWall } from "./verify-classify";

const REQUEST_TIMEOUT_MS = 8_000;

// A realistic browser User-Agent + Accept headers. Many tier-1 sources
// (WEF, OECD, ILO, WIPO) 403/429 an obvious bot UA, which previously
// caused them to be marked dead. Looking like a browser cuts those
// false failures at the source.
const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
};

// Re-exported for backwards compatibility (was originally defined here).
export { isLoginWall };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** HEAD first, GET fallback. Returns the response + whether GET was used. */
async function fetchHeadThenGet(
  url: string,
): Promise<{ response: Response; usedGet: boolean }> {
  try {
    const response = await fetchWithTimeout(
      url,
      { method: "HEAD", headers: REQUEST_HEADERS, redirect: "follow" },
      REQUEST_TIMEOUT_MS,
    );
    return { response, usedGet: false };
  } catch {
    // HEAD blocked / errored — fall back to GET.
    const response = await fetchWithTimeout(
      url,
      { method: "GET", headers: REQUEST_HEADERS, redirect: "follow" },
      REQUEST_TIMEOUT_MS,
    );
    return { response, usedGet: true };
  }
}

// ---------------------------------------------------------------------------
// Single item verification
// ---------------------------------------------------------------------------

export async function verifyPoolItem(item: PoolItem): Promise<PoolItem> {
  const now = new Date().toISOString();
  const fail = (): PoolItem => ({
    ...item,
    verificationStatus: "failed",
    lastVerifiedAt: now,
  });

  // 1. Domain allowlist check — the pool only carries curated tier-1 domains.
  const trusted = isAllowedDomain(item.domain);
  if (!trusted) return fail();

  // 2. Fetch, with a single retry on transient network error before giving up.
  let response: Response;
  let usedGet: boolean;
  try {
    ({ response, usedGet } = await fetchHeadThenGet(item.sourceUrl));
  } catch {
    try {
      ({ response, usedGet } = await fetchHeadThenGet(item.sourceUrl));
    } catch {
      // Network-level failure: the request never returned an HTTP status —
      // DNS/TLS error, connection reset, timeout, or an anti-bot challenge
      // (Cloudflare etc.) that hangs our datacenter IP. For a curated tier-1
      // domain this is almost always bot-blocking or a transient blip, not a
      // dead page: a *removed* page returns a clean 404/410 (handled by the
      // classifier above), whereas a throw is host-level and the URL still
      // works fine in a real browser. So we keep trusted hosts as reachable
      // rather than stripping authoritative sources (WEF/OECD/ILO) from the
      // feed. This is the common failure mode on the GitHub Actions runner.
      return {
        ...item,
        verificationStatus: trusted ? "verified" : "failed",
        lastVerifiedAt: now,
      };
    }
  }

  // 3. Gather what the classifier needs. Read the body only on the GET path.
  const responseContentType = response.headers.get("content-type") ?? undefined;
  let body: string | undefined;
  if (usedGet) {
    try {
      body = await response.text();
    } catch {
      body = "";
    }
  }

  const status = classifyVerification({
    status: response.status,
    trusted,
    contentType: item.contentType,
    responseContentType,
    body,
    headers: response.headers,
  });

  return { ...item, verificationStatus: status, lastVerifiedAt: now };
}

// ---------------------------------------------------------------------------
// Batch verification with concurrency
// ---------------------------------------------------------------------------

export async function verifyPool(
  items: PoolItem[],
  concurrency = 5,
): Promise<{ verified: PoolItem[]; failed: PoolItem[] }> {
  const queue = [...items];
  const verified: PoolItem[] = [];
  const failed: PoolItem[] = [];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const result = await verifyPoolItem(item);
      if (result.verificationStatus === "verified") {
        verified.push(result);
      } else {
        failed.push(result);
      }
    }
  }

  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return { verified, failed };
}
