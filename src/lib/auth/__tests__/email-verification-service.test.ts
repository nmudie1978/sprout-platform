import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Behaviour tests for the verification service against an in-memory stand-in
 * for Prisma. The point is the state machine — single use, expiry, the address
 * a token was issued for, and what happens when two requests race — none of
 * which needs a real database to pin down.
 */

interface TokenRow {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

interface UserRow {
  id: string;
  email: string;
  emailVerified: Date | null;
  deletedAt: Date | null;
}

const db = {
  users: [] as UserRow[],
  tokens: [] as TokenRow[],
  seq: 0,
};

const sentMail: { to: string; subject: string; html: string; text: string }[] = [];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      findFirst: vi.fn(async ({ where, orderBy }: any) => {
        const rows = db.tokens
          .filter((t) => t.userId === where.userId)
          .sort((a, b) =>
            orderBy?.createdAt === "desc"
              ? b.createdAt.getTime() - a.createdAt.getTime()
              : a.createdAt.getTime() - b.createdAt.getTime(),
          );
        return rows[0] ?? null;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const token = db.tokens.find((t) => t.tokenHash === where.tokenHash);
        if (!token) return null;
        const user = db.users.find((u) => u.id === token.userId);
        return { ...token, user: user ? { ...user } : null };
      }),
      create: vi.fn(async ({ data }: any) => {
        const row: TokenRow = {
          id: `tok_${++db.seq}`,
          usedAt: null,
          createdAt: new Date(),
          ...data,
        };
        db.tokens.push(row);
        return row;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        for (const t of db.tokens) {
          if (where.id && t.id !== where.id) continue;
          if (where.userId && t.userId !== where.userId) continue;
          if (where.usedAt === null && t.usedAt !== null) continue;
          Object.assign(t, data);
          count++;
        }
        return { count };
      }),
    },
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        const user = db.users.find((u) =>
          where.id ? u.id === where.id : u.email === where.email,
        );
        return user ? { ...user } : null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const user = db.users.find((u) => u.id === where.id);
        if (user) Object.assign(user, data);
        return user;
      }),
    },
    // The service uses $transaction([...]) purely for atomicity; the promises
    // are already constructed by the time they arrive here.
    $transaction: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));

vi.mock("@/lib/mail", () => ({
  sendMail: vi.fn(async (args: any) => {
    sentMail.push(args);
    return { ok: true, id: "mock" };
  }),
}));

vi.mock("@/lib/observability", () => ({
  logAndSwallow: () => () => {},
}));

import {
  issueVerificationEmail,
  consumeVerificationToken,
  sendExistingAccountNotice,
} from "@/lib/auth/email-verification-service";
import { hashVerificationToken, VERIFICATION_TOKEN_TTL_MS } from "@/lib/auth/email-verification";

/** Pull the raw token out of the most recent email's link. */
function tokenFromLastEmail(): string {
  const last = sentMail[sentMail.length - 1];
  const match = last.text.match(/token=([0-9a-f]{64})/);
  if (!match) throw new Error("no verification token in the email body");
  return match[1];
}

function seedUser(overrides: Partial<UserRow> = {}): UserRow {
  const user: UserRow = {
    id: `usr_${++db.seq}`,
    email: "young.person@example.com",
    emailVerified: null,
    deletedAt: null,
    ...overrides,
  };
  db.users.push(user);
  return user;
}

beforeEach(() => {
  db.users = [];
  db.tokens = [];
  db.seq = 0;
  sentMail.length = 0;
  process.env.NEXT_PUBLIC_APP_URL = "https://endeavrly.test";
});

describe("issueVerificationEmail", () => {
  it("emails a link and stores only the token's hash", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });

    expect(sentMail).toHaveLength(1);
    expect(sentMail[0].to).toBe(user.email);

    const raw = tokenFromLastEmail();
    // The raw token must never be what we persisted.
    expect(db.tokens[0].tokenHash).not.toBe(raw);
    expect(db.tokens[0].tokenHash).toBe(hashVerificationToken(raw));
  });

  it("builds the link from the configured origin, not a hard-coded host", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    expect(sentMail[0].text).toContain("https://endeavrly.test/api/auth/verify-email?token=");
  });

  it("identifies Endeavrly and says why the email arrived", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    expect(sentMail[0].subject).toContain("Endeavrly");
    expect(sentMail[0].text).toMatch(/used to create an Endeavrly account/i);
    expect(sentMail[0].html).toMatch(/Confirm my email/);
  });

  it("greets by name when there is one, and stays grammatical when there isn't", async () => {
    const user = seedUser();
    await issueVerificationEmail({
      userId: user.id, email: user.email, firstName: "Ada", respectCooldown: false,
    });
    expect(sentMail[0].text).toContain("Hi Ada,");

    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    expect(sentMail[1].text).toContain("Hi,");
    expect(sentMail[1].text).not.toContain("Hi ,");
  });

  it("invalidates the previous link when a new one is issued", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const firstToken = tokenFromLastEmail();

    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const secondToken = tokenFromLastEmail();

    expect(await consumeVerificationToken(firstToken)).toBe("expired");
    expect(await consumeVerificationToken(secondToken)).toBe("success");
  });

  it("enforces the resend cooldown when asked to", async () => {
    const user = seedUser();
    const t0 = Date.now();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false, now: t0 });
    expect(sentMail).toHaveLength(1);

    const blocked = await issueVerificationEmail({
      userId: user.id, email: user.email, respectCooldown: true, now: t0 + 5_000,
    });
    expect(blocked.sent).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(sentMail).toHaveLength(1); // nothing new was sent

    const allowed = await issueVerificationEmail({
      userId: user.id, email: user.email, respectCooldown: true, now: t0 + 61_000,
    });
    expect(allowed.sent).toBe(true);
    expect(sentMail).toHaveLength(2);
  });

  it("never puts the raw token anywhere but the link", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const raw = tokenFromLastEmail();
    // Present in the mail (that's the point), absent from every stored row.
    for (const row of db.tokens) {
      expect(JSON.stringify(row)).not.toContain(raw);
    }
  });
});

describe("consumeVerificationToken", () => {
  it("verifies the account on first use", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });

    expect(await consumeVerificationToken(tokenFromLastEmail())).toBe("success");
    expect(db.users[0].emailVerified).toBeInstanceOf(Date);
  });

  it("reports 'already' on a second click rather than an alarming error", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const raw = tokenFromLastEmail();

    expect(await consumeVerificationToken(raw)).toBe("success");
    expect(await consumeVerificationToken(raw)).toBe("already");
  });

  it("survives a mail scanner pre-fetching the link before the human clicks", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const raw = tokenFromLastEmail();

    // The scanner's fetch verifies the address and burns the token...
    expect(await consumeVerificationToken(raw)).toBe("success");
    // ...and the human's click still lands somewhere sensible.
    expect(await consumeVerificationToken(raw)).toBe("already");
    expect(db.users[0].emailVerified).toBeInstanceOf(Date);
  });

  it("rejects an expired token", async () => {
    const user = seedUser();
    const t0 = Date.now();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false, now: t0 });

    const outcome = await consumeVerificationToken(
      tokenFromLastEmail(),
      t0 + VERIFICATION_TOKEN_TTL_MS + 1,
    );
    expect(outcome).toBe("expired");
    expect(db.users[0].emailVerified).toBeNull();
  });

  it("rejects a token that was never issued", async () => {
    seedUser();
    expect(await consumeVerificationToken("f".repeat(64))).toBe("invalid");
    expect(await consumeVerificationToken("")).toBe("invalid");
  });

  it("refuses a link issued for an address the account no longer uses", async () => {
    const user = seedUser({ email: "old@example.com" });
    await issueVerificationEmail({ userId: user.id, email: "old@example.com", respectCooldown: false });
    const raw = tokenFromLastEmail();

    // The account's address changes before the old link is clicked.
    user.email = "new@example.com";

    expect(await consumeVerificationToken(raw)).toBe("invalid");
    expect(db.users[0].emailVerified).toBeNull();
  });

  it("refuses to verify a soft-deleted account", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const raw = tokenFromLastEmail();
    user.deletedAt = new Date();

    expect(await consumeVerificationToken(raw)).toBe("invalid");
  });

  it("verifies exactly once when two requests race on the same token", async () => {
    const user = seedUser();
    await issueVerificationEmail({ userId: user.id, email: user.email, respectCooldown: false });
    const raw = tokenFromLastEmail();

    const [a, b] = await Promise.all([
      consumeVerificationToken(raw),
      consumeVerificationToken(raw),
    ]);

    // Exactly one wins the atomic claim; the other is told it's already done.
    expect([a, b].filter((r) => r === "success")).toHaveLength(1);
    expect([a, b].filter((r) => r === "already")).toHaveLength(1);
    expect(db.users[0].emailVerified).toBeInstanceOf(Date);
  });
});

describe("sendExistingAccountNotice", () => {
  it("points the real owner at sign-in and password reset", async () => {
    await sendExistingAccountNotice("someone@example.com");

    expect(sentMail).toHaveLength(1);
    expect(sentMail[0].to).toBe("someone@example.com");
    expect(sentMail[0].subject).toMatch(/already have an Endeavrly account/i);
    expect(sentMail[0].text).toContain("https://endeavrly.test/auth/signin");
    expect(sentMail[0].text).toContain("https://endeavrly.test/auth/forgot-password");
  });

  it("carries no token, password, or account detail", async () => {
    await sendExistingAccountNotice("someone@example.com");
    const body = sentMail[0].text + sentMail[0].html;
    // No token of any kind: this email is a signpost, not a credential. Anyone
    // who intercepts it gains nothing they couldn't get from the login page.
    expect(body).not.toMatch(/token=/);
    // No bcrypt hash or other credential material leaked into the copy.
    expect(body).not.toMatch(/\$2[aby]\$/);
    // The only occurrences of "password" are the reset signposts.
    expect(body).not.toMatch(/your password is/i);
    // It must not confirm anything to a third party who intercepts it beyond
    // what the owner needs; the "if this wasn't you" line is the tell.
    expect(sentMail[0].text).toMatch(/If this wasn't you/i);
  });
});
