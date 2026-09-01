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
  consumeVerificationToken: vi.fn(async (token: string) => {
    consumed.push(token);
    if (consumeError) throw consumeError;
    return outcome;
  }),
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
  it("redirects to the success state and keeps the raw token out of the URL", async () => {
    const res = await GET(get(`?token=${TOKEN}`));
    expect(res.status).toBe(303);

    const url = location(res);
    expect(url.pathname).toBe("/auth/verify-email");
    expect(url.searchParams.get("status")).toBe("success");
    // The token must not follow the user into the address bar or Referer.
    expect(url.toString()).not.toContain(TOKEN);
    expect(url.searchParams.get("token")).toBeNull();
  });

  it("passes each outcome straight through", async () => {
    for (const value of ["success", "already", "expired", "invalid"]) {
      outcome = value;
      const res = await GET(get(`?token=${TOKEN}`));
      expect(location(res).searchParams.get("status")).toBe(value);
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
  it("honours a same-origin relative destination on success", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=%2Fmy-journey`));
    expect(location(res).searchParams.get("next")).toBe("/my-journey");
  });

  it("refuses to forward to another origin", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=https%3A%2F%2Fevil.example`));
    expect(location(res).searchParams.get("next")).toBe("/dashboard");
  });

  it("refuses a protocol-relative destination", async () => {
    const res = await GET(get(`?token=${TOKEN}&next=%2F%2Fevil.example`));
    expect(location(res).searchParams.get("next")).toBe("/dashboard");
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
