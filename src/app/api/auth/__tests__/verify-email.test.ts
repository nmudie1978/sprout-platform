import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * GET /api/auth/verify-email — the endpoint the emailed link points at.
 *
 * What's pinned here is the shape of the response rather than the token logic
 * (that lives in email-verification-service.test.ts): the raw token must not
 * survive into the redirect, the destination must be validated, and every
 * failure has to land on a safe generic state.
 */

let outcome: string = "success";
let consumeError: Error | null = null;
const consumed: string[] = [];
let rateLimitOk = true;

vi.mock("@/lib/auth/email-verification-service", () => ({
  consumeVerificationTokenDetailed: vi.fn(async (token: string) => {
    consumed.push(token);
    if (consumeError) throw consumeError;
    return { outcome, userId: outcome === "success" ? "user_1" : null };
  }),
}));

// Signing in on confirmation is exercised here only for its effect on the
// redirect; the token contents are the auth module's own concern.
let mintedToken: string | null = "signed.jwt.value";
vi.mock("@/lib/auth", () => ({
  mintSessionToken: vi.fn(async () => mintedToken),
  sessionCookieName: () => "next-auth.session-token",
  sessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax", path: "/" }),
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async () => ({
      success: rateLimitOk, limit: 10, remaining: 0, reset: Date.now() + 60_000,
    })),
  };
});

vi.mock("@/lib/observability", () => ({ logAndSwallow: () => () => {} }));

import { GET } from "@/app/api/auth/verify-email/route";

function get(query: string) {
  return new Request(`https://endeavrly.test/api/auth/verify-email${query}`, {
    headers: { "x-forwarded-for": "203.0.113.7" },
  }) as any;
}

/** The Location header, parsed. */
function location(res: Response): URL {
  return new URL(res.headers.get("location")!);
}

beforeEach(() => {
  outcome = "success";
  consumeError = null;
  consumed.length = 0;
  rateLimitOk = true;
});

const TOKEN = "a".repeat(64);

describe("outcomes", () => {
  it("signs the user in and lands them on the destination, token not in the URL", async () => {
    const res = await GET(get(`?token=${TOKEN}`));
    expect(res.status).toBe(303);

    const url = location(res);
    // Confirming proves inbox control, so we go straight in rather than via
    // an interstitial that asks for the password again.
    expect(url.pathname).toBe("/dashboard");
    expect(res.headers.get("set-cookie")).toContain("next-auth.session-token");
    // The token must not follow the user into the address bar or Referer.
    expect(url.toString()).not.toContain(TOKEN);
    expect(url.searchParams.get("token")).toBeNull();
  });

  it("falls back to the confirmation page when no session can be minted", async () => {
    mintedToken = null;
    try {
      const res = await GET(get(`?token=${TOKEN}`));
      const url = location(res);
      expect(url.pathname).toBe("/auth/verify-email");
      expect(url.searchParams.get("status")).toBe("success");
      expect(res.headers.get("set-cookie")).toBeNull();
    } finally {
      mintedToken = "signed.jwt.value";
    }
  });

  it("passes every non-success outcome straight through", async () => {
    // "already" deliberately does NOT sign anyone in: the link was burned
    // earlier, often by a mail scanner pre-fetching it, so whoever is holding
    // it now may not be the account owner.
    for (const value of ["already", "expired", "invalid"]) {
      outcome = value;
      const res = await GET(get(`?token=${TOKEN}`));
      expect(location(res).pathname).toBe("/auth/verify-email");
      expect(location(res).searchParams.get("status")).toBe(value);
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  });

  it("treats a missing token as invalid without pretending otherwise", async () => {
    outcome = "invalid";
    const res = await GET(get(""));
    expect(location(res).searchParams.get("status")).toBe("invalid");
  });

  it("decodes the token before handing it to the service", async () => {
    await GET(get(`?token=${encodeURIComponent(TOKEN)}`));
    expect(consumed[0]).toBe(TOKEN);
  });
});

describe("redirect safety", () => {
  // These now assert where the user actually LANDS, not merely that a query
  // parameter was sanitised — a stronger check, since success redirects
  // straight to the destination.
  it("honours a same-origin relative destination on success", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=%2Fmy-journey`));
    expect(location(res).pathname).toBe("/my-journey");
    expect(location(res).origin).toBe("https://endeavrly.test");
  });

  it("refuses to forward to another origin", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=https%3A%2F%2Fevil.example`));
    expect(location(res).origin).toBe("https://endeavrly.test");
    expect(location(res).pathname).toBe("/dashboard");
  });

  it("refuses a protocol-relative destination", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=%2F%2Fevil.example`));
    expect(location(res).origin).toBe("https://endeavrly.test");
    expect(location(res).pathname).toBe("/dashboard");
  });

  it("always redirects to our own origin", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=https%3A%2F%2Fevil.example`));
    expect(location(res).origin).toBe("https://endeavrly.test");
  });

  it("carries no destination on a failure state", async () => {
    outcome = "expired";
    const res = await GET(get(`?token=${TOKEN}&next=%2Fmy-journey`));
    expect(location(res).searchParams.get("next")).toBeNull();
  });
});

describe("resilience", () => {
  it("falls back to the safe generic state when the service throws", async () => {
    consumeError = new Error("P1001: can't reach database server at 10.0.0.4:5432");
    const res = await GET(get(`?token=${TOKEN}`));

    const url = location(res);
    expect(url.searchParams.get("status")).toBe("invalid");
    // No internals in anything the user can see.
    expect(url.toString()).not.toMatch(/10\.0\.0\.4|P1001|database/i);
  });

  it("throttles a hammering source without exposing why", async () => {
    rateLimitOk = false;
    const res = await GET(get(`?token=${TOKEN}`));
    expect(location(res).searchParams.get("status")).toBe("invalid");
    // The token was never even looked up.
    expect(consumed).toHaveLength(0);
  });
});
