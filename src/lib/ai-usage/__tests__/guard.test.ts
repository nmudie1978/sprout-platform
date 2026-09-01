import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The guard is the thing standing between a young person's message and the
 * OpenAI bill. These tests pin the two properties that matter most:
 *   1. a refused request NEVER reaches the provider, and
 *   2. every refusal is written to the usage ledger.
 */

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  aggregate: vi.fn(),
  create: vi.fn(),
  checkRateLimitAsync: vi.fn(),
  getRedisClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiUsageEvent: {
      findMany: mocks.findMany,
      aggregate: mocks.aggregate,
      create: mocks.create,
    },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: mocks.checkRateLimitAsync,
  getRedisClient: mocks.getRedisClient,
}));

const { checkAiGuardrails, checkCareerTwinGuardrails, __resetKillSwitchCache } = await import(
  "@/lib/ai-usage/guard"
);
const { __resetMonthlySpendCache } = await import("@/lib/ai-usage/record");
const { AI_FEATURES } = await import("@/lib/ai-usage/types");

const USER = "user-1";
const DAY_MS = 24 * 60 * 60 * 1000;
const envBackup = { ...process.env };

/** The status of every ledger row written during a test. */
const recordedStatuses = () => mocks.create.mock.calls.map((c) => c[0].data.status);

beforeEach(() => {
  vi.clearAllMocks();
  __resetKillSwitchCache();
  __resetMonthlySpendCache();
  delete process.env.AI_KILL_SWITCH;
  delete process.env.CAREER_TWIN_AI_DISABLED;
  delete process.env.CAREER_TWIN_DAILY_LIMIT;
  delete process.env.CAREER_TWIN_REQUESTS_PER_MINUTE;
  delete process.env.AI_MONTHLY_COST_CEILING_USD;

  // Defaults: nothing tripped.
  mocks.checkRateLimitAsync.mockResolvedValue({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60_000,
  });
  mocks.findMany.mockResolvedValue([]);
  mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: 0 } });
  mocks.create.mockResolvedValue({});
  mocks.getRedisClient.mockResolvedValue(null);
});

afterEach(() => {
  process.env = { ...envBackup };
});

describe("checkCareerTwinGuardrails — happy path", () => {
  it("allows a normal question and writes no refusal row", async () => {
    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("applies 5 requests/minute by default", async () => {
    await checkCareerTwinGuardrails(USER);
    expect(mocks.checkRateLimitAsync).toHaveBeenCalledWith(`career_twin:minute:${USER}`, {
      interval: 60_000,
      maxRequests: 5,
    });
  });

  it("counts only SUCCESSFUL requests in the last 24h against the allowance", async () => {
    await checkCareerTwinGuardrails(USER);
    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.status).toBe("successful");
    expect(where.feature).toBe("career_twin");
    expect(where.userId).toBe(USER);
    expect(Date.now() - where.createdAt.gte.getTime()).toBeGreaterThan(DAY_MS - 5_000);
  });
});

describe("per-minute rate limit", () => {
  it("refuses, records rate_limited, and reports when to retry", async () => {
    const reset = Date.now() + 42_000;
    mocks.checkRateLimitAsync.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset });

    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (decision.allowed) return;
    expect(decision.status).toBe("rate_limited");
    expect(decision.retryAt?.getTime()).toBe(reset);
    expect(recordedStatuses()).toEqual(["rate_limited"]);
    // Short-circuited: the daily check never ran.
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("honours CAREER_TWIN_REQUESTS_PER_MINUTE without a code change", async () => {
    process.env.CAREER_TWIN_REQUESTS_PER_MINUTE = "2";
    await checkCareerTwinGuardrails(USER);
    expect(mocks.checkRateLimitAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ maxRequests: 2 }),
    );
  });
});

describe("daily question limit", () => {
  it("refuses the 16th question in 24h and records daily_limit_reached", async () => {
    const stamps = Array.from({ length: 15 }, (_, i) => ({
      createdAt: new Date(Date.now() - (i + 1) * 3_600_000),
    }));
    mocks.findMany.mockResolvedValue(stamps);

    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (decision.allowed) return;
    expect(decision.status).toBe("daily_limit_reached");
    expect(decision.message).toContain("15");
    expect(decision.retryAt).toBeInstanceOf(Date);
    expect(recordedStatuses()).toEqual(["daily_limit_reached"]);
  });

  it("allows the 15th", async () => {
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 14 }, (_, i) => ({ createdAt: new Date(Date.now() - i * 60_000) })),
    );
    expect((await checkCareerTwinGuardrails(USER)).allowed).toBe(true);
  });

  it("honours CAREER_TWIN_DAILY_LIMIT without a code change", async () => {
    process.env.CAREER_TWIN_DAILY_LIMIT = "3";
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 3 }, (_, i) => ({ createdAt: new Date(Date.now() - i * 60_000) })),
    );
    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.message).toContain("3");
  });

  it("can be opted out of per-feature (the scenario runner has its own budget)", async () => {
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 99 }, (_, i) => ({ createdAt: new Date(Date.now() - i * 1000) })),
    );
    const decision = await checkAiGuardrails({
      userId: USER,
      feature: AI_FEATURES.CAREER_TWIN_EXPERIENCE,
      dailyLimit: 0,
    });
    expect(decision.allowed).toBe(true);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

describe("monthly cost ceiling", () => {
  it("refuses once the month's estimated spend reaches the ceiling", async () => {
    process.env.AI_MONTHLY_COST_CEILING_USD = "50";
    mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: 50.01 } });

    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (decision.allowed) return;
    expect(decision.status).toBe("cost_capped");
    expect(recordedStatuses()).toEqual(["cost_capped"]);
  });

  it("allows while under the ceiling", async () => {
    process.env.AI_MONTHLY_COST_CEILING_USD = "50";
    mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: 49.99 } });
    expect((await checkCareerTwinGuardrails(USER)).allowed).toBe(true);
  });
});

describe("emergency kill switch", () => {
  it("stops every Career Twin request when AI_KILL_SWITCH=true", async () => {
    process.env.AI_KILL_SWITCH = "true";
    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (decision.allowed) return;
    expect(decision.status).toBe("disabled");
    expect(recordedStatuses()).toEqual(["disabled"]);
    // Nothing else even ran.
    expect(mocks.checkRateLimitAsync).not.toHaveBeenCalled();
  });

  it("CAREER_TWIN_AI_DISABLED stops the Twin surfaces only", async () => {
    process.env.CAREER_TWIN_AI_DISABLED = "true";
    expect((await checkCareerTwinGuardrails(USER)).allowed).toBe(false);
    __resetKillSwitchCache();
    const other = await checkAiGuardrails({
      userId: USER,
      // A non-Twin feature key must be unaffected by the Twin-only switch.
      feature: "some_other_feature" as never,
      dailyLimit: 0,
    });
    expect(other.allowed).toBe(true);
  });

  it("can be tripped at runtime through Redis, with no deploy", async () => {
    mocks.getRedisClient.mockResolvedValue({ get: vi.fn().mockResolvedValue("true") });
    const decision = await checkCareerTwinGuardrails(USER);
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.status).toBe("disabled");
  });

  it("stays OFF when Redis errors — a flag glitch must not disable the product", async () => {
    mocks.getRedisClient.mockResolvedValue({
      get: vi.fn().mockRejectedValue(new Error("redis down")),
    });
    expect((await checkCareerTwinGuardrails(USER)).allowed).toBe(true);
  });
});

describe("resilience", () => {
  it("fails OPEN when the ledger is unreachable", async () => {
    mocks.findMany.mockRejectedValue(new Error("db down"));
    expect((await checkCareerTwinGuardrails(USER)).allowed).toBe(true);
  });
});
