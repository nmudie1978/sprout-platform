/**
 * Pool URL verification — classification logic (pure, unit-tested).
 *
 * Separated from the network I/O in `verify-pool.ts` so the decision
 * "is this URL alive?" can be tested exhaustively without hitting the
 * network.
 *
 * Key principle: the insights pool only ever contains allow-listed
 * tier-1 domains (see `domain-allowlist.ts`). A 401/403/429/5xx from
 * such a domain means "the source blocked our verifier bot" or "a
 * momentary server error" — NOT "the page is gone". Only 404/410 (and
 * unreachable hosts / soft-404 stub pages) count as genuinely dead.
 *
 * Previously every status >= 400 was treated as dead, which silently
 * stripped WEF / OECD / ILO / WIPO (all anti-bot 403) from the feed and
 * skewed Industry Insights toward YouTube.
 */

import type { PoolContentType, VerificationStatus } from "./pool-types";

/** Bodies shorter than this are treated as soft-404 stub pages. */
export const MIN_BODY_LENGTH = 1_000;

/** Common login / auth redirect indicators. */
export const LOGIN_SIGNALS = [
  'meta http-equiv="refresh"',
  "window.location",
  "/login",
  "/signin",
  "/auth",
  "/sso",
  'id="login-form"',
];

/** Statuses that always mean the resource is genuinely gone. */
const DEAD_STATUSES = new Set([404, 410]);

/** Check a response for login-wall indicators (location header + body start). */
export function isLoginWall(headers: Headers, body?: string): boolean {
  const location = headers.get("location") ?? "";
  if (LOGIN_SIGNALS.some((s) => location.toLowerCase().includes(s))) {
    return true;
  }
  if (!body) return false;
  const lower = body.toLowerCase().slice(0, 5_000); // Only check the start
  return LOGIN_SIGNALS.some((s) => lower.includes(s));
}

export interface ClassifyInput {
  /** Final HTTP status after redirects are followed. */
  status: number;
  /** Is the domain on the curated tier-1 allow-list? */
  trusted: boolean;
  /** The content type we expect this item to be. */
  contentType: PoolContentType;
  /** `content-type` response header — only known when a body was fetched. */
  responseContentType?: string;
  /** Response body — only present on the GET path. */
  body?: string;
  /** Response headers — used for the login-wall location check. */
  headers?: Headers;
}

/**
 * Decide whether a fetched URL should be considered verified or failed.
 * Pure: no network, no clock.
 */
export function classifyVerification(input: ClassifyInput): VerificationStatus {
  const { status, trusted, contentType, responseContentType, body, headers } = input;

  // 1. Genuinely gone — dead regardless of trust.
  if (DEAD_STATUSES.has(status)) return "failed";

  // 2. Other error statuses (401/403/405/429/5xx, etc.): a trusted tier-1
  //    domain that blocks our bot or hiccups is reachable, not dead.
  if (status < 200 || status >= 400) {
    return trusted ? "verified" : "failed";
  }

  // 3. 2xx/3xx — content sanity.

  // PDF type check runs whenever we have a content-type header (HEAD or GET).
  if (responseContentType !== undefined) {
    const ct = responseContentType.toLowerCase();
    if (contentType === "pdf" && !ct.includes("pdf") && !ct.includes("html")) {
      return "failed";
    }
  }

  // Body checks only run when we actually fetched a body (GET path).
  if (body !== undefined) {
    // Soft-404 stub page — applies to every domain.
    if (body.length < MIN_BODY_LENGTH) {
      return "failed";
    }
    // Login-wall heuristic is too noisy for trusted tier-1 pages (their
    // analytics JS routinely contains "window.location" / "/auth"), so we
    // only enforce it for untrusted domains.
    if (!trusted && isLoginWall(headers ?? new Headers(), body)) {
      return "failed";
    }
  }

  return "verified";
}
