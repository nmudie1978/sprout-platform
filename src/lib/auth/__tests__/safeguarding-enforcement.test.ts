import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

/**
 * Does moderation actually DO anything?
 *
 * The 2026-08-31 security review's critical finding was that it did not. The
 * admin panel and the safeguarding report queue both "suspended" an account by
 * setting `User.isPaused` / `accountStatus`, and then notified the young person
 * that action had been taken — while nothing anywhere read those fields back.
 * `isAccountActive()` and `checkPlatformAccess()` had zero callers. A user
 * suspended for harmful behaviour kept full read and write access.
 *
 * That survived because every test asserted the MECHANISM (the field gets set)
 * and none asserted the OUTCOME (the user loses access). These tests assert the
 * outcome, on both routes into a session:
 *
 *   1. signing in fresh   -> authorize()
 *   2. an existing session -> the jwt callback, which must revoke it
 *
 * If someone later removes the enforcement, these fail. That is the point.
 */

const PASSWORD = "correct-horse-battery";
const HASH = bcrypt.hashSync(PASSWORD, 4);

const db = { users: [] as any[] };

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        const u = db.users.find((x) => x.email === where.email || x.id === where.id);
        return u ? { ...u } : null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const u = db.users.find((x) => x.id === where.id);
        if (u) Object.assign(u, data);
        return u;
      }),
    },
    legalAcceptance: { findUnique: vi.fn(async () => null) },
    auditLog: { create: vi.fn(async () => ({})) },
  },
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async () => ({
      success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000,
    })),
    resetRateLimit: vi.fn(async () => {}),
  };
});

vi.mock("@/lib/safety", () => ({ logAuditAction: vi.fn(async () => {}) }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));

import { authOptions } from "@/lib/auth";

function authorize(email: string, password: string) {
  const provider: any = (authOptions.providers as any[]).find((p) => p.id === "credentials");
  const fn = provider.options?.authorize ?? provider.authorize;
  return fn({ email, password }, { headers: {} });
}

/** Unique id per case — the session-field cache is keyed by user id. */
let seq = 0;
function seed(overrides: Record<string, unknown> = {}) {
  const id = `usr_${++seq}`;
  const u = {
    id,
    email: `${id}@example.com`,
    password: HASH,
    role: "YOUTH",
    // Verified, so the email gate can never be the reason a case fails.
    emailVerified: new Date(),
    deletedAt: null,
    isPaused: false,
    accountStatus: "ACTIVE",
    passwordChangedAt: null,
    youthProfile: { displayName: "Test", profileVisibility: true, guardianConsent: true },
    ...overrides,
  };
  db.users.push(u);
  return u;
}

/** Run the jwt callback for an established session, then the session callback. */
async function sessionFor(userId: string) {
  const jwt: any = authOptions.callbacks!.jwt!;
  const session: any = authOptions.callbacks!.session!;
  const token = await jwt({
    token: { id: userId, email: `${userId}@example.com`, authTime: Date.now() },
    trigger: "update", // forces a fresh DB read rather than the 60s cache
  });
  return session({ session: { user: { id: userId, email: "" } }, token });
}

beforeEach(() => {
  db.users = [];
});

describe("a moderated account cannot sign in", () => {
  it("refuses a suspended account", async () => {
    const u = seed({ accountStatus: "SUSPENDED" });
    await expect(authorize(u.email, PASSWORD)).rejects.toThrow(/suspended/i);
  });

  it("refuses a banned account", async () => {
    const u = seed({ accountStatus: "BANNED" });
    await expect(authorize(u.email, PASSWORD)).rejects.toThrow(/suspended/i);
  });

  it("refuses a paused account — the Community Guardian soft freeze", async () => {
    const u = seed({ isPaused: true });
    await expect(authorize(u.email, PASSWORD)).rejects.toThrow(/suspended/i);
  });

  it("still admits an ordinary active account", async () => {
    const u = seed();
    await expect(authorize(u.email, PASSWORD)).resolves.toMatchObject({ id: u.id });
  });

  it("checks moderation AFTER the password, so it can't be probed", async () => {
    // Otherwise the sign-in form would reveal which addresses belong to
    // moderated accounts to anyone who guessed the address.
    const u = seed({ accountStatus: "SUSPENDED" });
    await expect(authorize(u.email, "wrong-password")).rejects.toThrow("Invalid credentials");
  });
});

describe("an EXISTING session is revoked when the account is moderated", () => {
  // The half that was missing entirely. Blocking sign-in alone would have left
  // a suspended user with full access for the 30-day life of their JWT.

  it("revokes the session of a suspended account", async () => {
    const u = seed({ accountStatus: "SUSPENDED" });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe("");
  });

  it("revokes the session of a paused account", async () => {
    const u = seed({ isPaused: true });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe("");
  });

  it("revokes the session of a banned account", async () => {
    const u = seed({ accountStatus: "BANNED" });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe("");
  });

  it("revokes the session of a soft-deleted account", async () => {
    const u = seed({ deletedAt: new Date() });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe("");
  });

  it("leaves an ordinary active session alone", async () => {
    const u = seed();
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe(u.id);
  });

  it("takes effect on an account suspended AFTER the session was issued", async () => {
    // The real scenario: a young person is signed in, a report is upheld, and
    // an admin suspends them. Their existing session must stop working.
    const u = seed();
    expect((await sessionFor(u.id)).user.id).toBe(u.id);

    u.isPaused = true; // admin acts
    expect((await sessionFor(u.id)).user.id).toBe("");
  });
});

describe("states that must NOT cost a user their session", () => {
  it("keeps ONBOARDING usable — they still need the profile flow", async () => {
    const u = seed({ accountStatus: "ONBOARDING" });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe(u.id);
  });

  it("keeps PENDING_VERIFICATION usable for the same reason", async () => {
    const u = seed({ accountStatus: "PENDING_VERIFICATION" });
    const s = await sessionFor(u.id);
    expect(s.user.id).toBe(u.id);
  });
});
