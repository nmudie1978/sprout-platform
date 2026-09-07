// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * GET /api/auth/verification-status — what the "Check your email" screen polls.
 *
 * This endpoint can mint a credential that signs someone in without a
 * password, so what's pinned here is the set of conditions under which it
 * refuses to. In particular: signing up with an address that was ALREADY
 * confirmed must never produce a handoff, or the flow would be a way into
 * anyone's account.
 */

process.env.NEXTAUTH_SECRET = "test-secret-value-at-least-16-chars";

// Deliberately a FULL user row, not just the fields this route selects. The
// forged-cookie guard below is only meaningful if a reintroduced session-mint
// would actually succeed here — a mock missing `id` or the fields
// mintSessionToken reads would make that guard pass for the wrong reason.
type UserRow = {
  id: string;
  email: string;
  emailVerified: Date | null;
  accountStatus: string;
  isPaused: boolean;
  deletedAt: Date | null;
  role: string;
  ageBracket: string | null;
  isVerifiedAdult: boolean;
  passwordChangedAt: Date | null;
  youthProfile: null;
} | null;

let user: UserRow = null;
let rateLimitOk = true;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(async () => user) },
    legalAcceptance: { findUnique: vi.fn(async () => null) },
  },
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async () => ({
      success: rateLimitOk,
      limit: 120,
      remaining: 0,
      reset: Date.now() + 60_000,
    })),
  };
});

vi.mock("@/lib/observability", () => ({ logAndSwallow: () => () => {} }));

import { NextRequest } from "next/server";
import { GET, DELETE } from "@/app/api/auth/verification-status/route";
import {
  SIGNIN_GRANT_COOKIE,
  createSigninGrant,
  createDecoyGrant,
  readHandoffToken,
} from "@/lib/auth/signin-grant";

const secret = process.env.NEXTAUTH_SECRET!;

function poll(cookie?: string) {
  const headers: Record<string, string> = { "x-forwarded-for": "203.0.113.7" };
  if (cookie) headers.cookie = `${SIGNIN_GRANT_COOKIE}=${cookie}`;
  return GET(new NextRequest("https://endeavrly.test/api/auth/verification-status", { headers }));
}

/** An account confirmed `ms` after the grant was issued. */
function confirmedAfter(grantIssuedAt: number, ms: number): NonNullable<UserRow> {
  return {
    id: "user-1",
    email: "victim@example.com",
    emailVerified: new Date(grantIssuedAt + ms),
    accountStatus: "ACTIVE",
    isPaused: false,
    deletedAt: null,
    role: "YOUTH",
    ageBracket: null,
    isVerifiedAdult: true,
    passwordChangedAt: null,
    youthProfile: null,
  };
}

beforeEach(() => {
  user = null;
  rateLimitOk = true;
});

describe("waiting", () => {
  it("reports not-verified when there is no grant cookie at all", async () => {
    expect(await (await poll()).json()).toEqual({ verified: false });
  });

  it("reports not-verified for a junk cookie", async () => {
    expect(await (await poll("not-a-real-grant")).json()).toEqual({ verified: false });
  });

  // The enumeration-parity decoy signup sets: a perfectly valid grant naming a
  // user id that doesn't exist. It must simply never resolve.
  it("never resolves a decoy grant", async () => {
    user = null;
    const res = await poll(createDecoyGrant({ secret }));
    expect(await res.json()).toEqual({ verified: false });
  });

  it("reports not-verified while the address is still unconfirmed", async () => {
    const now = Date.now();
    user = { ...confirmedAfter(now, 0), emailVerified: null };
    const res = await poll(createSigninGrant("user-1", { secret, now }));
    expect(await res.json()).toEqual({ verified: false });
  });

  it("says nothing when the poll is rate-limited", async () => {
    rateLimitOk = false;
    const now = Date.now();
    user = confirmedAfter(now, 1_000);
    const res = await poll(createSigninGrant("user-1", { secret, now }));
    expect(await res.json()).toEqual({ verified: false });
  });
});

describe("confirmed", () => {
  it("mints a handoff token bound to the grant once the link is clicked", async () => {
    const now = Date.now();
    user = confirmedAfter(now, 2_000);
    const res = await poll(createSigninGrant("user-1", { secret, now }));
    const body = await res.json();

    expect(body.verified).toBe(true);
    const handoff = readHandoffToken(body.handoff, { secret });
    expect(handoff?.userId).toBe("user-1");
    expect(handoff?.grantIssuedAt).toBe(now);
  });
});

describe("refusals", () => {
  // THE ATTACK THIS CLOSES: sign up with a stranger's address, which is already
  // confirmed, and wait to be handed their account. The confirmation predates
  // the grant, so it proves nothing about who is holding this browser.
  it("refuses when the address was confirmed before the signup", async () => {
    const now = Date.now();
    user = { ...confirmedAfter(now, 0), emailVerified: new Date(now - 86_400_000) };
    const res = await poll(createSigninGrant("victim", { secret, now }));
    expect(await res.json()).toEqual({ verified: false });
  });

  it.each([
    ["suspended", { accountStatus: "SUSPENDED", isPaused: false, deletedAt: null }],
    ["banned", { accountStatus: "BANNED", isPaused: false, deletedAt: null }],
    ["paused", { accountStatus: "ACTIVE", isPaused: true, deletedAt: null }],
    ["deleted", { accountStatus: "ACTIVE", isPaused: false, deletedAt: new Date() }],
  ])("refuses a %s account", async (_label, state) => {
    const now = Date.now();
    user = { ...confirmedAfter(now, 1_000), ...state } as UserRow;
    const res = await poll(createSigninGrant("user-1", { secret, now }));
    expect(await res.json()).toEqual({ verified: false });
  });
});

// REGRESSION GUARD. An earlier draft of this endpoint resolved the account
// from the plaintext `endeavrly_pending_verification` cookie and minted a
// session from it. That is an account takeover from an address alone: httpOnly
// stops page scripts touching a cookie, but it authenticates nothing — any
// client can put any Cookie header on a request. The sealed grant exists
// precisely so the value cannot be chosen by the caller.
describe("forged cookies", () => {
  it("hands out nothing for a plaintext pending-verification cookie", async () => {
    const now = Date.now();
    user = confirmedAfter(now, 1_000);
    const res = await GET(
      new NextRequest("https://endeavrly.test/api/auth/verification-status", {
        headers: {
          "x-forwarded-for": "203.0.113.7",
          cookie: "endeavrly_pending_verification=victim@example.com",
        },
      }),
    );
    expect(await res.json()).toEqual({ verified: false });
    expect(res.headers.getSetCookie().join("\n")).not.toMatch(/session-token=/);
  });

  it("hands out nothing for a grant cookie the caller made up", async () => {
    const now = Date.now();
    user = confirmedAfter(now, 1_000);
    const res = await poll("endeavrly_signin_grant_forged_by_hand");
    expect(await res.json()).toEqual({ verified: false });
  });
});

describe("DELETE", () => {
  it("clears both signup cookies", async () => {
    const res = await DELETE();
    const cleared = res.headers.getSetCookie().join("\n");
    expect(cleared).toContain(SIGNIN_GRANT_COOKIE);
    expect(cleared).toContain("endeavrly_pending_verification");
    expect(cleared).toMatch(/Max-Age=0/);
  });
});
