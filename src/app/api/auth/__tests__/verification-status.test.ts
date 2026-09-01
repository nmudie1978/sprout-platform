import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * GET /api/auth/verification-status — polled by the check-email screen.
 *
 * The behaviour that matters: when the confirmation happened somewhere else
 * (a phone, another browser), this browser has no session cookie, so merely
 * reporting "verified" would send the user to /dashboard and straight back out
 * to sign-in via the auth redirect. Minting the session here is what makes the
 * cross-device case actually work.
 *
 * And it must not become an oracle: there is no way to ask it about an
 * address other than the one this browser signed up with.
 */

const db = {
  users: [] as { id: string; email: string; emailVerified: Date | null; deletedAt: Date | null }[],
};
let mintable = true;
let rateLimitOk = true;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        const u = db.users.find((x) => x.email === where.email);
        return u ? { ...u } : null;
      }),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  mintSessionToken: vi.fn(async () => (mintable ? "signed.jwt.value" : null)),
  sessionCookieName: () => "next-auth.session-token",
  sessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax", path: "/" }),
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async () => ({
      success: rateLimitOk, limit: 120, remaining: 0, reset: Date.now() + 60_000,
    })),
  };
});

vi.mock("@/lib/observability", () => ({ logAndSwallow: () => () => {} }));

import { GET } from "@/app/api/auth/verification-status/route";

/** Request carrying (or not carrying) the httpOnly signup cookie. */
function get(pending?: string) {
  const req = new Request("https://endeavrly.test/api/auth/verification-status", {
    headers: { "x-forwarded-for": "203.0.113.4" },
  }) as any;
  req.cookies = {
    get: (name: string) =>
      name === "endeavrly_pending_verification" && pending
        ? { name, value: pending }
        : undefined,
  };
  return req;
}

beforeEach(() => {
  db.users = [
    { id: "u1", email: "unverified@example.com", emailVerified: null, deletedAt: null },
    { id: "u2", email: "verified@example.com", emailVerified: new Date(), deletedAt: null },
    { id: "u3", email: "gone@example.com", emailVerified: new Date(), deletedAt: new Date() },
  ];
  mintable = true;
  rateLimitOk = true;
});

describe("waiting", () => {
  it("reports not-verified while the address is unconfirmed", async () => {
    const res = await GET(get("unverified@example.com"));
    expect(await res.json()).toMatchObject({ verified: false });
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("reports not-verified with no cookie at all", async () => {
    expect(await (await GET(get())).json()).toMatchObject({ verified: false });
  });

  it("never caches — the whole point is observing a change", async () => {
    const res = await GET(get("unverified@example.com"));
    expect(res.headers.get("cache-control")).toContain("no-store");
  });
});

describe("confirmation elsewhere signs this browser in", () => {
  it("mints a session so the cross-device case works", async () => {
    const res = await GET(get("verified@example.com"));
    const body = await res.json();

    expect(body).toMatchObject({ verified: true, signedIn: true });
    // Without this cookie the page would navigate to /dashboard and be
    // bounced straight back to sign-in.
    expect(res.headers.get("set-cookie")).toContain("next-auth.session-token");
  });

  it("clears the pending cookie once it has served its purpose", async () => {
    const res = await GET(get("verified@example.com"));
    const cookies = res.headers.get("set-cookie") ?? "";
    expect(cookies).toContain("endeavrly_pending_verification=");
    expect(cookies).toMatch(/Max-Age=0/i);
  });

  it("reports signedIn:false when the account cannot hold a session", async () => {
    // Suspended or paused: confirmed, but sign-in must explain the refusal
    // rather than this endpoint silently doing nothing.
    mintable = false;
    const res = await GET(get("verified@example.com"));
    expect(await res.json()).toMatchObject({ verified: true, signedIn: false });
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("does not sign in a soft-deleted account", async () => {
    const res = await GET(get("gone@example.com"));
    expect(await res.json()).toMatchObject({ verified: false });
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});

describe("it cannot be used as an oracle", () => {
  it("ignores any address the caller supplies — only the cookie counts", async () => {
    // There is no body and no query parameter; the only input is the httpOnly
    // cookie set at signup. A caller cannot ask about someone else's address.
    const req = new Request(
      "https://endeavrly.test/api/auth/verification-status?email=verified@example.com",
      { headers: { "x-forwarded-for": "203.0.113.4" } },
    ) as any;
    req.cookies = { get: () => undefined };

    const res = await GET(req);
    expect(await res.json()).toMatchObject({ verified: false });
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("answers identically for an unknown address and an unverified one", async () => {
    const unknown = await (await GET(get("nobody@example.com"))).json();
    const unverified = await (await GET(get("unverified@example.com"))).json();
    expect(unknown).toEqual(unverified);
  });

  it("throttles without claiming verification", async () => {
    rateLimitOk = false;
    const res = await GET(get("verified@example.com"));
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ verified: false, backoff: true });
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
