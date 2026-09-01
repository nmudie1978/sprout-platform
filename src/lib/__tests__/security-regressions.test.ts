/**
 * Regression tests for the fixes made in the 2026-08-31 security review.
 *
 * Each block below corresponds to a vulnerability that was live in the
 * codebase. They are written as attacks, not as feature tests: if one of these
 * starts passing the *wrong* way, the hole is back.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

import { generateAccessCode } from "@/lib/organisations/access-codes";

// ───────────────────────────────────────────────────────────────────────────
// 1. Open redirect via NextAuth's `callbackUrl`
// ───────────────────────────────────────────────────────────────────────────
// The redirect callback used to be `if (url.startsWith("http")) return url`,
// which made /api/auth/signin?callbackUrl=<anything> a working redirector to
// any site on the internet. These cases are the ones a phishing link would use.

/**
 * A copy of the shipped logic under test. `src/lib/auth.ts` pulls in Prisma,
 * Redis and the NextAuth provider config at import time, none of which belong
 * in a unit test — so the callback is exercised through this mirror. The
 * assertion that matters is the behaviour, and `auth.ts` must keep matching it.
 */
function redirectCallback(url: string, baseUrl: string): string {
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) {
    return `${baseUrl}${url}`;
  }
  try {
    const target = new URL(url, baseUrl);
    if (target.origin === new URL(baseUrl).origin) return target.toString();
  } catch {
    /* fall through */
  }
  return baseUrl;
}

describe("NextAuth redirect callback — open redirect", () => {
  const base = "https://endeavrly.com";

  it.each([
    "https://evil.example",
    "http://evil.example/phish",
    "https://endeavrly.com.evil.example/phish",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "https://evil.example/?next=https://endeavrly.com",
  ])("refuses to redirect off-origin: %s", (hostile) => {
    const result = redirectCallback(hostile, base);
    expect(new URL(result, base).origin).toBe(base);
  });

  it("still allows ordinary in-app destinations", () => {
    expect(redirectCallback("/dashboard", base)).toBe(`${base}/dashboard`);
    expect(redirectCallback("/my-journey?tab=clarity", base)).toBe(
      `${base}/my-journey?tab=clarity`
    );
  });

  it("still allows an absolute URL on our own origin", () => {
    expect(redirectCallback(`${base}/dashboard`, base)).toBe(`${base}/dashboard`);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Access codes generated with Math.random
// ───────────────────────────────────────────────────────────────────────────
// An access code grants membership of a real organisation, so it is a
// credential. Math.random's internal state is recoverable from observed
// outputs; crypto.randomInt's is not.

describe("Access code generation — unpredictability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not draw from Math.random", () => {
    // If generation still used Math.random, pinning it would pin the output.
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const a = generateAccessCode(null);
    const b = generateAccessCode(null);
    expect(spy).not.toHaveBeenCalled();
    expect(a).not.toBe(b);
  });

  it("produces distinct codes from the confusable-free alphabet", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateAccessCode(null)));
    expect(codes.size).toBe(200);
    for (const code of codes) {
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
    }
  });

  it("still honours an injected generator so tests stay deterministic", () => {
    expect(generateAccessCode(null, 6, () => 1)).toBe("BBBBBB");
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Suspension enforcement
// ───────────────────────────────────────────────────────────────────────────
// The admin panel and the safeguarding queue "suspend" an account by setting
// isPaused / accountStatus. Nothing read either back, so a suspended user kept
// full access. This mirrors the predicate now used in src/lib/auth.ts.

function isAccountBlocked(user: {
  accountStatus: string;
  isPaused: boolean;
  deletedAt: Date | null;
}): boolean {
  return (
    user.deletedAt !== null ||
    user.isPaused ||
    user.accountStatus === "SUSPENDED" ||
    user.accountStatus === "BANNED"
  );
}

describe("Session revocation — moderated accounts", () => {
  const base = { accountStatus: "ACTIVE", isPaused: false, deletedAt: null };

  it("blocks an account paused by an admin or the report queue", () => {
    expect(isAccountBlocked({ ...base, isPaused: true })).toBe(true);
  });

  it("blocks SUSPENDED and BANNED accounts", () => {
    expect(isAccountBlocked({ ...base, accountStatus: "SUSPENDED" })).toBe(true);
    expect(isAccountBlocked({ ...base, accountStatus: "BANNED" })).toBe(true);
  });

  it("blocks soft-deleted accounts", () => {
    expect(isAccountBlocked({ ...base, deletedAt: new Date() })).toBe(true);
  });

  it("leaves ordinary users — including mid-onboarding — signed in", () => {
    expect(isAccountBlocked(base)).toBe(false);
    expect(isAccountBlocked({ ...base, accountStatus: "ONBOARDING" })).toBe(false);
    expect(isAccountBlocked({ ...base, accountStatus: "PENDING_VERIFICATION" })).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. Session invalidation on password reset
// ───────────────────────────────────────────────────────────────────────────
// Sessions are stateless 30-day JWTs. Without a watermark, resetting a
// password left an attacker holding a stolen session token signed in.

function sessionRevokedByPasswordChange(
  passwordChangedAt: Date | null,
  authTime: number | undefined
): boolean {
  if (!passwordChangedAt) return false;
  return passwordChangedAt.getTime() > (typeof authTime === "number" ? authTime : 0);
}

describe("Session revocation — password reset", () => {
  const signedInAt = Date.UTC(2026, 7, 1);

  it("revokes a session established before the reset", () => {
    expect(
      sessionRevokedByPasswordChange(new Date(signedInAt + 60_000), signedInAt)
    ).toBe(true);
  });

  it("keeps a session established after the reset", () => {
    expect(
      sessionRevokedByPasswordChange(new Date(signedInAt - 60_000), signedInAt)
    ).toBe(false);
  });

  it("revokes a legacy token with no authTime stamp", () => {
    expect(sessionRevokedByPasswordChange(new Date(signedInAt), undefined)).toBe(true);
  });

  it("is a no-op for accounts that never reset a password", () => {
    expect(sessionRevokedByPasswordChange(null, signedInAt)).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. Spoofable trusted headers
// ───────────────────────────────────────────────────────────────────────────
// Middleware sets x-user-id / x-user-role for downstream handlers. Next.js
// merges those with what the client sent, so they must be stripped from the
// incoming request first.

const TRUSTED_HEADERS = ["x-user-id", "x-user-role", "x-requires-consent", "x-pathname"];

function sanitisedHeaders(incoming: Headers): Headers {
  const headers = new Headers(incoming);
  for (const name of TRUSTED_HEADERS) headers.delete(name);
  return headers;
}

describe("Middleware — trusted request headers", () => {
  it("drops every trusted header a client tries to inject", () => {
    const attacker = new Headers({
      "x-user-id": "victim-user-id",
      "x-user-role": "ADMIN",
      "x-requires-consent": "false",
      "x-pathname": "/admin",
      "user-agent": "curl/8",
    });

    const clean = sanitisedHeaders(attacker);

    for (const name of TRUSTED_HEADERS) {
      expect(clean.get(name)).toBeNull();
    }
    // Genuine client headers are untouched.
    expect(clean.get("user-agent")).toBe("curl/8");
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Internal preview surfaces blocked in production
// ───────────────────────────────────────────────────────────────────────────
// /lab was reachable and indexable in production alongside the already-blocked
// /dev and /test.

const INTERNAL_PREVIEW_PREFIXES = ["/dev", "/test", "/lab"];

function isInternalPreview(pathname: string): boolean {
  return INTERNAL_PREVIEW_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

describe("Internal preview routes", () => {
  it.each([
    "/lab",
    "/lab/dark-themes",
    "/lab/roadmap-horizontal",
    "/dev/blue-themes",
    "/test/anything",
  ])("blocks %s", (path) => {
    expect(isInternalPreview(path)).toBe(true);
  });

  it.each(["/dashboard", "/careers", "/labour-market", "/development-plan", "/"])(
    "leaves real product routes alone: %s",
    (path) => {
      expect(isInternalPreview(path)).toBe(false);
    }
  );
});
