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

type UserRow = {
  emailVerified: Date | null;
  accountStatus: string;
  isPaused: boolean;
  deletedAt: Date | null;
} | null;

let user: UserRow = null;
let rateLimitOk = true;

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(async () => user) } },
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
function confirmedAfter(grantIssuedAt: number, ms: number): UserRow {
  return {
    emailVerified: new Date(grantIssuedAt + ms),
    accountStatus: "ACTIVE",
    isPaused: false,
    deletedAt: null,
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
    user = { emailVerified: null, accountStatus: "ACTIVE", isPaused: false, deletedAt: null };
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
    user = {
      emailVerified: new Date(now - 86_400_000),
      accountStatus: "ACTIVE",
      isPaused: false,
      deletedAt: null,
    };
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
    user = { emailVerified: new Date(now + 1_000), ...state } as UserRow;
    const res = await poll(createSigninGrant("user-1", { secret, now }));
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
