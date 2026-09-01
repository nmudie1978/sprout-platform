import { describe, it, expect, vi, beforeEach } from "vitest";
import { readSigninGrant } from "@/lib/auth/signin-grant";

/**
 * Duplicate-account prevention and the enumeration guard on POST /api/auth/signup.
 *
 * The invariants under test are the ones a user's safety actually rests on:
 *   • one address can only ever produce one account, including when two
 *     requests race and the lookup can't see the other's insert yet;
 *   • a duplicate creates no YouthProfile and no LegalAcceptance either;
 *   • the response is byte-identical whether or not the address was taken.
 */

interface UserRow {
  id: string;
  email: string;
  password: string;
  role: string;
}

const db = {
  users: [] as UserRow[],
  youthProfiles: [] as { userId: string }[],
  legalAcceptances: [] as { userId: string }[],
  seq: 0,
};

const notices: string[] = [];
const verifications: { userId: string; email: string }[] = [];

class UniqueViolation extends Error {
  code = "P2002";
  constructor() {
    super("Unique constraint failed on the fields: (`email`)");
  }
}

/**
 * Simulates the database's unique index on User.email — the real guarantee.
 * The route's findUnique only narrows the race window; this is what closes it.
 */
function insertUser(data: any): UserRow {
  if (db.users.some((u) => u.email === data.email)) throw new UniqueViolation();
  const row = { id: `usr_${++db.seq}`, ...data };
  db.users.push(row);
  return row;
}

/** Set to delay the insert, so two in-flight signups overlap. */
let insertDelayMs = 0;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        const u = db.users.find((x) => x.email === where.email || x.id === where.id);
        return u ? { ...u } : null;
      }),
    },
    $transaction: vi.fn(async (fn: any) => {
      if (insertDelayMs) await new Promise((r) => setTimeout(r, insertDelayMs));
      // Mirrors the interactive-transaction form the route uses: all-or-nothing,
      // so a rejected insert leaves no profile or acceptance row behind.
      const created: { users: UserRow[]; profiles: any[]; acceptances: any[] } = {
        users: [], profiles: [], acceptances: [],
      };
      const tx = {
        user: { create: async ({ data }: any) => { const u = insertUser(data); created.users.push(u); return u; } },
        youthProfile: { create: async ({ data }: any) => { created.profiles.push(data); return data; } },
        legalAcceptance: { create: async ({ data }: any) => { created.acceptances.push(data); return data; } },
      };
      try {
        const result = await fn(tx);
        db.youthProfiles.push(...created.profiles);
        db.legalAcceptances.push(...created.acceptances);
        return result;
      } catch (err) {
        // Roll back: drop anything this transaction managed to add.
        for (const u of created.users) {
          const i = db.users.indexOf(u);
          if (i >= 0) db.users.splice(i, 1);
        }
        throw err;
      }
    }),
  },
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async () => ({
      success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000,
    })),
    getRateLimitHeaders: () => ({}),
  };
});

vi.mock("@/lib/auth/email-verification-service", () => ({
  issueVerificationEmail: vi.fn(async ({ userId, email }: any) => {
    verifications.push({ userId, email });
    return { sent: true, retryAfterMs: 0 };
  }),
  sendExistingAccountNotice: vi.fn(async (email: string) => {
    notices.push(email);
  }),
}));

vi.mock("@/lib/safety", () => ({
  logAuditAction: vi.fn(async () => {}),
  validateAgeBracket: vi.fn(() => null),
}));

vi.mock("@/lib/observability", () => ({ logAndSwallow: () => () => {} }));

import { POST } from "@/app/api/auth/signup/route";

/** A valid youth signup payload; override any field per test. */
function payload(overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Ada",
    surname: "Lovelace",
    email: "ada@example.com",
    password: "correct-horse-battery",
    role: "YOUTH",
    dateOfBirth: "2006-01-01",
    country: "NO",
    acceptedTerms: true,
    acceptedPrivacy: true,
    ...overrides,
  };
}

function request(body: Record<string, unknown>) {
  return new Request("https://endeavrly.test/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5" },
    body: JSON.stringify(body),
  }) as any;
}

beforeEach(() => {
  db.users = [];
  db.youthProfiles = [];
  db.legalAcceptances = [];
  db.seq = 0;
  notices.length = 0;
  verifications.length = 0;
  insertDelayMs = 0;
  process.env.NEXT_PUBLIC_APP_URL = "https://endeavrly.test";
});

describe("new account", () => {
  it("creates exactly one user, profile and acceptance", async () => {
    const res = await POST(request(payload()));
    expect(res.status).toBe(200);
    expect(db.users).toHaveLength(1);
    expect(db.youthProfiles).toHaveLength(1);
    expect(db.legalAcceptances).toHaveLength(1);
  });

  it("triggers the verification email", async () => {
    await POST(request(payload()));
    expect(verifications).toHaveLength(1);
    expect(verifications[0].email).toBe("ada@example.com");
  });

  it("does not claim the address is verified", async () => {
    const res = await POST(request(payload()));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/verified/i);
    expect(body.message).toMatch(/check your email/i);
  });

  it("stores the address normalised, so case can't create a second account", async () => {
    await POST(request(payload({ email: "  ADA@Example.COM  " })));
    expect(db.users[0].email).toBe("ada@example.com");
  });
});

describe("duplicate signup", () => {
  it("creates no second user", async () => {
    await POST(request(payload()));
    await POST(request(payload({ password: "a-different-password" })));
    expect(db.users).toHaveLength(1);
  });

  it("creates no duplicate profile or legal-acceptance rows", async () => {
    await POST(request(payload()));
    await POST(request(payload()));
    expect(db.youthProfiles).toHaveLength(1);
    expect(db.legalAcceptances).toHaveLength(1);
  });

  it("treats a case/whitespace variant as the same account", async () => {
    await POST(request(payload({ email: "ada@example.com" })));
    await POST(request(payload({ email: " Ada@EXAMPLE.com " })));
    expect(db.users).toHaveLength(1);
  });

  it("sends the existing owner a notice instead of creating an account", async () => {
    await POST(request(payload()));
    await POST(request(payload()));
    expect(notices).toEqual(["ada@example.com"]);
    // No new verification email for an account that already exists.
    expect(verifications).toHaveLength(1);
  });

  it("is indistinguishable from a fresh signup in status and body", async () => {
    const fresh = await POST(request(payload({ email: "new@example.com" })));
    const freshBody = await fresh.json();

    await POST(request(payload({ email: "taken@example.com" })));
    const dup = await POST(request(payload({ email: "taken@example.com" })));
    const dupBody = await dup.json();

    expect(dup.status).toBe(fresh.status);
    expect(dupBody).toEqual(freshBody);
  });

  // The sign-in grant is set on BOTH paths for exactly this reason: Set-Cookie
  // is visible to whoever made the request, so a cookie that appeared only for
  // new accounts would answer the question the identical body refuses to.
  it("sets an indistinguishable sign-in grant whether or not the address was taken", async () => {
    process.env.NEXTAUTH_SECRET = "test-secret-value-at-least-16-chars";

    const fresh = await POST(request(payload({ email: "grant-new@example.com" })));
    await POST(request(payload({ email: "grant-taken@example.com" })));
    const dup = await POST(request(payload({ email: "grant-taken@example.com" })));

    const real = fresh.cookies.get("endeavrly_signin_grant")?.value ?? "";
    const decoy = dup.cookies.get("endeavrly_signin_grant")?.value ?? "";

    expect(real).not.toBe("");
    expect(decoy).not.toBe("");
    expect(decoy.length).toBe(real.length);
    expect(decoy).not.toBe(real);

    // And the decoy names an account that does not exist, so it can never be
    // exchanged for a session.
    const parsed = readSigninGrant(decoy, { secret: process.env.NEXTAUTH_SECRET! });
    expect(parsed).not.toBeNull();
    expect(db.users.some((u) => u.id === parsed!.userId)).toBe(false);
  });

  it("does not leak existence through the old 409", async () => {
    await POST(request(payload()));
    const res = await POST(request(payload()));
    expect(res.status).not.toBe(409);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/already exists/i);
  });
});

describe("concurrent signup race", () => {
  it("lets the unique constraint decide, and still creates only one account", async () => {
    // Both requests read "no such user" before either writes.
    insertDelayMs = 25;

    const [a, b] = await Promise.all([
      POST(request(payload())),
      POST(request(payload({ password: "second-request-password" }))),
    ]);

    expect(db.users).toHaveLength(1);
    expect(db.youthProfiles).toHaveLength(1);
    expect(db.legalAcceptances).toHaveLength(1);

    // Neither caller gets a 500 — the loser takes the duplicate path.
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(await a.json()).toEqual(await b.json());
  });

  it("relies on the constraint, not the lookup: a blind insert still can't duplicate", async () => {
    // Force the pre-check to always miss, simulating the worst case where both
    // requests read before either wrote. Only the unique index stands between
    // us and two accounts on one address.
    const { prisma } = await import("@/lib/prisma");
    const spy = vi
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValue(null as never);

    await POST(request(payload()));
    const second = await POST(request(payload()));

    expect(db.users).toHaveLength(1);
    expect(db.youthProfiles).toHaveLength(1);
    expect(second.status).toBe(200);
    expect(notices).toEqual(["ada@example.com"]);

    spy.mockRestore();
  });

  it("notifies the owner exactly once when the race is lost", async () => {
    insertDelayMs = 25;
    await Promise.all([POST(request(payload())), POST(request(payload()))]);
    expect(notices).toHaveLength(1);
    expect(verifications).toHaveLength(1);
  });
});

describe("validation still applies before the duplicate branch", () => {
  it("rejects a short password without touching the database", async () => {
    const res = await POST(request(payload({ password: "short" })));
    expect(res.status).toBe(400);
    expect(db.users).toHaveLength(0);
  });

  it("rejects a malformed address", async () => {
    const res = await POST(request(payload({ email: "not-an-email" })));
    expect(res.status).toBe(400);
    expect(db.users).toHaveLength(0);
  });

  it("still refuses a privileged role", async () => {
    const res = await POST(request(payload({ role: "ADMIN" })));
    expect(res.status).toBe(400);
    expect(db.users).toHaveLength(0);
  });

  it("still enforces the 15+ floor", async () => {
    const res = await POST(request(payload({ dateOfBirth: "2020-01-01" })));
    expect(res.status).toBe(400);
    expect(db.users).toHaveLength(0);
  });
});
