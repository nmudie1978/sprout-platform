import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";

/**
 * The hard gate as it behaves inside NextAuth's `authorize()`.
 *
 * The property that matters most here is ORDERING. The gate must fire only
 * after the password has been verified, so that "this address exists but isn't
 * confirmed" is only ever revealed to someone who already proved they know the
 * password. Check it earlier and the sign-in form becomes a free oracle for
 * which addresses have Endeavrly accounts — the exact thing the rest of this
 * feature works to prevent.
 */

const PASSWORD = "correct-horse-battery";
const HASH = bcrypt.hashSync(PASSWORD, 4); // low cost: this is a test

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

/**
 * Reach into the credentials provider's authorize() directly.
 *
 * NOTE: next-auth v4 leaves its own default `authorize` (which just returns
 * null) on the provider object and keeps the one we supplied under `.options`.
 * Calling the top-level function silently tests nothing, so prefer `.options`.
 */
function authorize(email: string, password: string) {
  const provider: any = (authOptions.providers as any[]).find(
    (p) => p.id === "credentials",
  );
  const fn = provider.options?.authorize ?? provider.authorize;
  return fn({ email, password }, { headers: {} });
}

function seed(overrides: Partial<any> = {}) {
  const u = {
    id: "u1",
    email: "young.person@example.com",
    password: HASH,
    role: "YOUTH",
    emailVerified: null,
    deletedAt: null,
    isPaused: false,
    accountStatus: "ACTIVE",
    ...overrides,
  };
  db.users.push(u);
  return u;
}

const env = process.env as Record<string, string | undefined>;
let savedFlag: string | undefined;

beforeEach(() => {
  db.users = [];
  savedFlag = env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
  delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED; // gate ON by default
});
afterEach(() => {
  if (savedFlag === undefined) delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
  else env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = savedFlag;
});

describe("hard gate at sign-in", () => {
  it("refuses an unverified account even with the right password", async () => {
    seed({ emailVerified: null });
    await expect(authorize("young.person@example.com", PASSWORD)).rejects.toThrow(
      /EmailNotVerified/,
    );
  });

  it("admits a verified account", async () => {
    seed({ emailVerified: new Date() });
    const user = await authorize("young.person@example.com", PASSWORD);
    expect(user).toMatchObject({ id: "u1", email: "young.person@example.com" });
  });

  it("admits an unverified account once the gate is switched off", async () => {
    seed({ emailVerified: null });
    env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = "false";
    const user = await authorize("young.person@example.com", PASSWORD);
    expect(user).toMatchObject({ id: "u1" });
  });

  it("normalises the address, so case can't dodge the gate", async () => {
    seed({ emailVerified: null });
    await expect(authorize("  YOUNG.PERSON@Example.COM ", PASSWORD)).rejects.toThrow(
      /EmailNotVerified/,
    );
  });
});

describe("the gate is not an enumeration oracle", () => {
  it("gives the SAME error for a wrong password whether or not the account is verified", async () => {
    seed({ id: "u1", email: "unverified@example.com", emailVerified: null });
    seed({ id: "u2", email: "verified@example.com", emailVerified: new Date() });

    const a = await authorize("unverified@example.com", "wrong-password").catch((e: Error) => e.message);
    const b = await authorize("verified@example.com", "wrong-password").catch((e: Error) => e.message);

    expect(a).toBe(b);
    expect(a).toBe("Invalid credentials");
    // Crucially, a wrong password must NOT reveal the verification state.
    expect(a).not.toMatch(/EmailNotVerified/);
  });

  it("gives the same error for a wrong password as for an address with no account", async () => {
    seed({ email: "unverified@example.com", emailVerified: null });

    const known = await authorize("unverified@example.com", "wrong-password").catch((e: Error) => e.message);
    const unknown = await authorize("nobody@example.com", "wrong-password").catch((e: Error) => e.message);

    expect(known).toBe(unknown);
  });

  it("reveals the unverified state ONLY to someone who knows the password", async () => {
    seed({ emailVerified: null });

    const wrong = await authorize("young.person@example.com", "wrong").catch((e: Error) => e.message);
    const right = await authorize("young.person@example.com", PASSWORD).catch((e: Error) => e.message);

    expect(wrong).toBe("Invalid credentials");
    expect(right).toMatch(/EmailNotVerified/);
  });
});

describe("the gate does not override other refusals", () => {
  it("still reports suspension for a suspended unverified account", async () => {
    seed({ emailVerified: null, accountStatus: "SUSPENDED" });
    // Suspension is checked first and is the more important thing to say.
    await expect(authorize("young.person@example.com", PASSWORD)).rejects.toThrow(
      /suspended/i,
    );
  });

  it("still reports suspension for a paused account", async () => {
    seed({ emailVerified: new Date(), isPaused: true });
    await expect(authorize("young.person@example.com", PASSWORD)).rejects.toThrow(
      /suspended/i,
    );
  });
});
