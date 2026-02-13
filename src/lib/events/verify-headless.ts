/**
 * HEADLESS VERIFICATION — Stage C (Stub)
 *
 * Structural interface for future Playwright-based verification.
 * Currently returns false/unavailable since Playwright is not installed.
 * When Playwright is added, only this file needs to change.
 */

import type { EventItem } from "./types";

// ============================================
// TYPES
// ============================================

export interface HeadlessVerificationResult {
  url: string;
  passed: boolean;
  error?: string;
  checkedAtISO: string;
}

// ============================================
// TIER 1 DOMAINS
// ============================================

/** Known event provider domains that may require JS rendering */
const TIER1_DOMAINS = [
  "europeanjobdays.eu",
  "karrieredagene.no",
  "tautdanning.no",
  "oslomet.no",
  "eventbrite.com",
  "eventbrite.no",
  "hopin.com",
];

/**
 * Check if Playwright (headless browser) is available.
 * Currently always returns false.
 */
export function isHeadlessAvailable(): boolean {
  return false;
}

/**
 * Check if a URL belongs to a known Tier 1 event provider domain
 * that may need headless rendering for full verification.
 */
export function isTier1Domain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return TIER1_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

/**
 * Attempt headless verification of an event URL.
 * Currently always returns a failure result since Playwright is not installed.
 */
export async function verifyEventHeadless(
  event: EventItem,
): Promise<HeadlessVerificationResult> {
  return {
    url: event.registrationUrl,
    passed: false,
    error: "Playwright not installed",
    checkedAtISO: new Date().toISOString(),
  };
}
