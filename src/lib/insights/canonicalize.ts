/**
 * URL Canonicalization & Hashing
 *
 * Normalizes URLs for deduplication: strips tracking params, lowercases host,
 * removes trailing slashes and fragments. Produces SHA-256 hash for fast lookup.
 */

import { createHash } from "crypto";

/** Tracking / referral params to strip */
const STRIP_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "ref",
  "source",
  "mc_cid",
  "mc_eid",
]);

/**
 * Canonicalize a URL for deduplication:
 * - Lowercase host
 * - Remove tracking params
 * - Remove fragment
 * - Remove trailing slash (except root "/")
 */
export function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = "";

    for (const key of [...parsed.searchParams.keys()]) {
      if (STRIP_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.searchParams.sort();

    let canonical = parsed.toString();
    if (canonical.endsWith("/") && parsed.pathname !== "/") {
      canonical = canonical.slice(0, -1);
    }
    return canonical;
  } catch {
    return url;
  }
}

/** SHA-256 hex hash of canonicalized URL */
export function hashUrl(url: string): string {
  const canonical = canonicalizeUrl(url);
  return createHash("sha256").update(canonical).digest("hex");
}

/** Extract domain without www. prefix */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return url;
  }
}
