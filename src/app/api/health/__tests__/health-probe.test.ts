import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The probe must fail loudly when Redis is configured but unreachable.
 *
 * On 2026-06 the owner's Redis was deprovisioned for unpaid invoices while
 * REDIS_URL stayed set. Every rate-limited route hung to a 504 for EIGHT WEEKS
 * and "A Day in the Life" was blank for every career — while /api/health
 * returned {"status":"ok"} the whole time, because it only ran SELECT 1.
 *
 * An external uptime monitor alerts on the STATUS CODE, not the body. So a
 * dead-but-configured Redis returns 503 here: the site still serves (the
 * limiter degrades to in-memory), but an operator has to know. `db: "up"` and
 * `degraded: true` in the body tell them instantly it is not a full outage.
 */

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  getRedisClient: vi.fn(),
  isRedisConfigured: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: mocks.queryRaw } }));
vi.mock("@/lib/rate-limit", () => ({
  getRedisClient: mocks.getRedisClient,
  isRedisConfigured: mocks.isRedisConfigured,
}));

const { GET } = await import("../route");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.queryRaw.mockResolvedValue([{ "?column?": 1 }]);
  mocks.isRedisConfigured.mockReturnValue(true);
  mocks.getRedisClient.mockResolvedValue({ ping: vi.fn().mockResolvedValue("PONG") });
});

describe("GET /api/health", () => {
  it("reports ok when the database and Redis both answer", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("up");
    expect(body.redis).toBe("up");
  });

  it("returns 503 when Redis is configured but unreachable", async () => {
    mocks.getRedisClient.mockResolvedValue(null);
    const res = await GET();
    // The whole point: an uptime monitor watching status codes must see this.
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.redis).toBe("down");
    // ...but it is NOT a full outage, and the body has to say so.
    expect(body.db).toBe("up");
    expect(body.degraded).toBe(true);
  });

  it("returns 503 when Redis connects but does not answer PING", async () => {
    // A half-open client is the failure the July incident actually had.
    mocks.getRedisClient.mockResolvedValue({ ping: vi.fn().mockRejectedValue(new Error("no")) });
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).redis).toBe("down");
  });

  it("stays ok when Redis is deliberately not configured", async () => {
    // dev and preview run without Redis on purpose; alerting there is noise.
    mocks.isRedisConfigured.mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.redis).toBe("not-configured");
    expect(mocks.getRedisClient).not.toHaveBeenCalled();
  });

  it("still returns 503 with db down, and does not mask it as a Redis problem", async () => {
    mocks.queryRaw.mockRejectedValue(new Error("connection refused"));
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("error");
    expect(body.db).toBe("down");
  });

  it("never caches", async () => {
    const res = await GET();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
