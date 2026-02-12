/**
 * Pool Item Verification Service
 *
 * Verifies URLs in the insights pool are live and accessible.
 * Pattern: HEAD first → GET fallback → content sanity checks.
 * Matches the approach in src/lib/events/verify-url.ts.
 */

import type { PoolItem } from "./pool-types";
import { isAllowedDomain } from "./domain-allowlist";

const REQUEST_TIMEOUT_MS = 8_000;
const MIN_BODY_LENGTH = 1_000; // Detect soft 404 pages

const USER_AGENT =
  "Mozilla/5.0 (compatible; Sprout-InsightsVerifier/1.0)";

/** Common login/auth redirect indicators */
const LOGIN_SIGNALS = [
  "meta http-equiv=\"refresh\"",
  "window.location",
  "/login",
  "/signin",
  "/auth",
  "/sso",
  "id=\"login-form\"",
];

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

/** Check response body for login wall indicators */
export function isLoginWall(headers: Headers, body?: string): boolean {
  const location = headers.get("location") ?? "";
  if (LOGIN_SIGNALS.some((s) => location.toLowerCase().includes(s))) {
    return true;
  }
  if (!body) return false;
  const lower = body.toLowerCase().slice(0, 5_000); // Only check start
  return LOGIN_SIGNALS.some((s) => lower.includes(s));
}

// ---------------------------------------------------------------------------
// Single item verification
// ---------------------------------------------------------------------------

export async function verifyPoolItem(item: PoolItem): Promise<PoolItem> {
  const now = new Date().toISOString();

  // 1. Domain allowlist check
  if (!isAllowedDomain(item.domain)) {
    return {
      ...item,
      verificationStatus: "failed",
      lastVerifiedAt: now,
    };
  }

  try {
    // 2. Try HEAD first
    let response: Response;
    let usedGet = false;
    try {
      response = await fetchWithTimeout(
        item.sourceUrl,
        {
          method: "HEAD",
          headers: { "User-Agent": USER_AGENT },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS,
      );
    } catch {
      // HEAD blocked — fall back to GET
      response = await fetchWithTimeout(
        item.sourceUrl,
        {
          method: "GET",
          headers: { "User-Agent": USER_AGENT },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS,
      );
      usedGet = true;
    }

    // 3. HTTP status check
    if (response.status < 200 || response.status >= 400) {
      return {
        ...item,
        verificationStatus: "failed",
        lastVerifiedAt: now,
      };
    }

    // 4. Content-type sanity
    const ct = (response.headers.get("content-type") ?? "").toLowerCase();
    if (item.contentType === "pdf" && !ct.includes("pdf") && !ct.includes("html")) {
      return { ...item, verificationStatus: "failed", lastVerifiedAt: now };
    }

    // 5. For GET responses, check body length + login wall
    if (usedGet) {
      const body = await response.text();
      if (body.length < MIN_BODY_LENGTH) {
        return { ...item, verificationStatus: "failed", lastVerifiedAt: now };
      }
      if (isLoginWall(response.headers, body)) {
        return { ...item, verificationStatus: "failed", lastVerifiedAt: now };
      }
    }

    return {
      ...item,
      verificationStatus: "verified",
      lastVerifiedAt: now,
    };
  } catch (err) {
    return {
      ...item,
      verificationStatus: "failed",
      lastVerifiedAt: now,
    };
  }
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
