/**
 * Unified API error response shape.
 *
 * Before this helper, error responses were ad-hoc strings across
 * 100+ routes. Problems: the client can't distinguish retryable
 * failures from permanent ones, there's no stable `code` to
 * pattern-match, and Sentry breadcrumbs have no request ID to
 * correlate against server logs.
 *
 * New shape (backwards-compatible):
 *   {
 *     error: string,           // human-readable — existing frontend
 *                              //   `throw new Error(data.error || ...)`
 *                              //   keeps working unchanged
 *     code: ApiErrorCode,      // NEW: stable machine identifier
 *     requestId: string,       // NEW: echoed in x-request-id header
 *     details?: unknown,       // NEW: optional structured context
 *   }
 *
 * The request ID is taken from the incoming `x-request-id` header
 * if present (Vercel sets this), otherwise generated. Clients can
 * pass this to support tickets for fast log correlation.
 *
 * Migration strategy: new routes use `apiError()` from day one.
 * Existing routes migrate gradually — `{ error: "..." }` still
 * works for un-migrated routes because the shape above is a
 * strict superset of the ad-hoc one.
 */

import { NextRequest, NextResponse } from "next/server";

export type ApiErrorCode =
  // Auth / authorization
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ACCOUNT_INACTIVE"
  | "GUARDIAN_CONSENT_REQUIRED"
  // Input validation
  | "BAD_REQUEST"
  | "VALIDATION_FAILED"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  // Resource state
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "PAYLOAD_TOO_LARGE"
  // Server-side
  | "INTERNAL"
  | "UPSTREAM_UNAVAILABLE"
  | "DB_ERROR"
  // Domain-specific
  | "SAFETY_BLOCK";

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  requestId: string;
  details?: unknown;
}

interface ApiErrorOptions {
  status?: number;
  details?: unknown;
  request?: NextRequest | Request;
  /** Extra headers to set on the response (e.g. rate-limit headers) */
  headers?: Record<string, string>;
}

/**
 * HTTP status code defaults by error code. Can be overridden via
 * the `status` option when a specific route needs something else.
 */
const DEFAULT_STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  ACCOUNT_INACTIVE: 403,
  GUARDIAN_CONSENT_REQUIRED: 403,
  BAD_REQUEST: 400,
  VALIDATION_FAILED: 400,
  INVALID_TOKEN: 400,
  TOKEN_EXPIRED: 410,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 429,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL: 500,
  UPSTREAM_UNAVAILABLE: 502,
  DB_ERROR: 500,
  SAFETY_BLOCK: 400,
};

/**
 * Extract or generate a request ID. Prefers the incoming
 * `x-request-id` header (Vercel sets this for every request),
 * falls back to a fresh crypto-random ID if missing.
 */
export function getRequestId(request?: NextRequest | Request): string {
  if (request) {
    const existing = request.headers.get("x-request-id");
    if (existing) return existing;
  }
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Build a structured error response.
 *
 * @example
 *   if (!session) return apiError("UNAUTHORIZED", "Please sign in", { request: req });
 *
 * @example
 *   return apiError("VALIDATION_FAILED", "Title is required", {
 *     request: req,
 *     details: { field: "title" },
 *   });
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  options: ApiErrorOptions = {},
): NextResponse<ApiErrorBody> {
  const status = options.status ?? DEFAULT_STATUS[code];
  const requestId = getRequestId(options.request);

  const body: ApiErrorBody = {
    error: message,
    code,
    requestId,
    ...(options.details !== undefined && { details: options.details }),
  };

  const response = NextResponse.json(body, { status });
  response.headers.set("x-request-id", requestId);

  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      response.headers.set(k, v);
    }
  }

  return response;
}
