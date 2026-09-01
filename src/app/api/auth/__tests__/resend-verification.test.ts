import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * POST /api/auth/resend-verification.
 *
 * Two properties matter here and they pull against each other, so both are
 * pinned: the endpoint must be useful to a real user who didn't get the email,
 * and it must reveal nothing to anyone probing it — not whether an address is
 * registered, and not whether it is already verified.
 */

const db = {
  users: [] as { id: string; email: string; emailVerified: Date | null; deletedAt: Date | null }[],
};

const issued: { userId: string; email: string }[] = [];

/** Records every bucket the route consults, so limits can be asserted. */
const buckets: Record<string, { count: number; limit: number; reset: number }> = {};
let session: { user: { id: string; email: string } } | null = null;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        const u = db.users.find((x) => x.email === where.email);
        return u ? { ...u, youthProfile: { displayName: "Ada" } } : null;
      }),
    },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => session) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/observability", () => ({ logAndSwallow: () => () => {} }));

vi.mock("@/lib/auth/email-verification-service", () => ({
  issueVerificationEmail: vi.fn(async ({ userId, email }: any) => {
    issued.push({ userId, email });
    return { sent: true, retryAfterMs: 0 };
  }),
}));

vi.mock("@/lib/rate-limit", async (orig) => {
  const actual = await (orig() as Promise<any>);
  return {
    ...actual,
    checkRateLimitAsync: vi.fn(async (key: string, config: any) => {
      const b = (buckets[key] ??= {
        count: 0,
        limit: config.maxRequests,
        reset: Date.now() + config.interval,
      });
      b.count++;
      return {
        success: b.count <= b.limit,
        limit: b.limit,
        remaining: Math.max(0, b.limit - b.count),
        reset: b.reset,
      };
    }),
  };
});

import { POST } from "@/app/api/auth/resend-verification/route";

/**
 * Builds a request whose pending address arrives the only way the route now
 * accepts one from a signed-out caller: the httpOnly cookie signup set.
 * `NextRequest`-style `cookies.get` is stubbed on the plain Request.
 */
function request(body: Record<string, unknown> = {}, ip = "203.0.113.9") {
  const req = new Request("https://endeavrly.test/api/auth/resend-verification", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  }) as any;
  const pending = typeof body.email === "string" ? body.email : undefined;
  req.cookies = {
    get: (name: string) =>
      name === "endeavrly_pending_verification" && pending
        ? { name, value: pending }
        : undefined,
  };
  return req;
}

/** A request with neither a session nor the signup cookie. */
function bareRequest(ip = "203.0.113.9") {
  const req = new Request("https://endeavrly.test/api/auth/resend-verification", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: "{}",
  }) as any;
  req.cookies = { get: () => undefined };
  return req;
}

beforeEach(() => {
  db.users = [
    { id: "u1", email: "unverified@example.com", emailVerified: null, deletedAt: null },
    { id: "u2", email: "verified@example.com", emailVerified: new Date(), deletedAt: null },
    { id: "u3", email: "deleted@example.com", emailVerified: null, deletedAt: new Date() },
  ];
  issued.length = 0;
  session = null;
  for (const k of Object.keys(buckets)) delete buckets[k];
});

describe("sending", () => {
  it("sends a fresh link to an unverified account", async () => {
    const res = await POST(request({ email: "unverified@example.com" }));
    expect(res.status).toBe(200);
    expect(issued).toEqual([{ userId: "u1", email: "unverified@example.com" }]);
  });

  it("normalises the address, so casing doesn't defeat the lookup", async () => {
    await POST(request({ email: "  UNVERIFIED@Example.COM " }));
    expect(issued).toHaveLength(1);
  });

  it("prefers the signed-in account over the cookie", async () => {
    session = { user: { id: "u1", email: "unverified@example.com" } };
    await POST(request({ email: "verified@example.com" }));
    // The session's address won — a signed-in user can only resend for self.
    expect(issued).toEqual([{ userId: "u1", email: "unverified@example.com" }]);
  });

  it("REFUSES an address supplied in the request body", async () => {
    // The classic abuse: point the endpoint at someone else's inbox. With no
    // session and no signup cookie, a body address must achieve nothing.
    const res = await POST(bareRequest());
    expect(res.status).toBe(200);
    expect(issued).toHaveLength(0);

    // Even with a body naming a real unverified account.
    const req = bareRequest("198.51.100.99");
    (req as any).json = async () => ({ email: "unverified@example.com" });
    await POST(req);
    expect(issued).toHaveLength(0);
  });

  it("sends nothing for an already-verified account", async () => {
    await POST(request({ email: "verified@example.com" }));
    expect(issued).toHaveLength(0);
  });

  it("sends nothing for an unknown address", async () => {
    await POST(request({ email: "nobody@example.com" }));
    expect(issued).toHaveLength(0);
  });

  it("sends nothing for a soft-deleted account", async () => {
    await POST(request({ email: "deleted@example.com" }));
    expect(issued).toHaveLength(0);
  });

  it("tolerates a missing cookie and an empty body", async () => {
    const res = await POST(bareRequest());
    expect(res.status).toBe(200);
    expect(issued).toHaveLength(0);
  });
});

describe("enumeration safety", () => {
  it("answers identically for registered, unregistered and verified addresses", async () => {
    const a = await POST(request({ email: "unverified@example.com" }, "198.51.100.1"));
    const b = await POST(request({ email: "nobody@example.com" }, "198.51.100.2"));
    const c = await POST(request({ email: "verified@example.com" }, "198.51.100.3"));

    const bodies = await Promise.all([a.json(), b.json(), c.json()]);
    expect(a.status).toBe(b.status);
    expect(b.status).toBe(c.status);
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1]).toEqual(bodies[2]);
  });

  it("reports the cooldown identically for a real and a fake address", async () => {
    // Second request for the same address trips the 1-per-minute cooldown.
    await POST(request({ email: "unverified@example.com" }, "198.51.100.4"));
    const realSecond = await POST(request({ email: "unverified@example.com" }, "198.51.100.5"));

    await POST(request({ email: "nobody@example.com" }, "198.51.100.6"));
    const fakeSecond = await POST(request({ email: "nobody@example.com" }, "198.51.100.7"));

    const [realBody, fakeBody] = await Promise.all([realSecond.json(), fakeSecond.json()]);
    expect(realSecond.status).toBe(fakeSecond.status);
    expect(realBody.ok).toBe(fakeBody.ok);
    expect(realBody.message).toBe(fakeBody.message);
    // Both must offer a wait time; a wait time on only one is the leak.
    expect(typeof realBody.retryAfterSeconds).toBe("number");
    expect(typeof fakeBody.retryAfterSeconds).toBe("number");
  });
});

describe("abuse limits", () => {
  it("enforces a one-per-minute cooldown per address", async () => {
    await POST(request({ email: "unverified@example.com" }, "198.51.100.10"));
    expect(issued).toHaveLength(1);

    // Different source IP, same target address — the cooldown is keyed by the
    // address precisely so rotating hosts can't multiply the mail sent.
    const second = await POST(request({ email: "unverified@example.com" }, "198.51.100.11"));
    expect(issued).toHaveLength(1);

    const body = await second.json();
    expect(body.ok).toBe(false);
    expect(body.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("caps a single IP's burst", async () => {
    // STRICT is 10/min; the 11th from one host is refused outright.
    for (let i = 0; i < 10; i++) {
      await POST(request({ email: `person${i}@example.com` }, "198.51.100.20"));
    }
    const res = await POST(request({ email: "another@example.com" }, "198.51.100.20"));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keys the cooldown on the address, not the IP", async () => {
    await POST(request({ email: "unverified@example.com" }, "198.51.100.30"));
    // A different address from the same IP is unaffected by the first cooldown.
    db.users.push({ id: "u4", email: "second@example.com", emailVerified: null, deletedAt: null });
    await POST(request({ email: "second@example.com" }, "198.51.100.30"));
    expect(issued).toHaveLength(2);
  });

  it("never surfaces internal errors to the caller", async () => {
    const { prisma } = await import("@/lib/prisma");
    const spy = vi
      .spyOn(prisma.user, "findUnique")
      .mockRejectedValue(new Error("connection to database lost at 10.0.0.4:5432") as never);

    const res = await POST(request({ email: "unverified@example.com" }, "198.51.100.40"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toMatch(/10\.0\.0\.4|database|connection/i);
    spy.mockRestore();
  });
});
