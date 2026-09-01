import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), aggregate: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { aiUsageEvent: { create: mocks.create, aggregate: mocks.aggregate } },
}));

const { recordAiUsage, monthlySpendUsd, __resetMonthlySpendCache } = await import(
  "@/lib/ai-usage/record"
);

beforeEach(() => {
  vi.clearAllMocks();
  __resetMonthlySpendCache();
  mocks.create.mockResolvedValue({});
  mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: 0 } });
});

describe("recordAiUsage", () => {
  it("stores every field the cost report needs", async () => {
    await recordAiUsage({
      userId: "u1",
      feature: "career_twin",
      status: "successful",
      model: "gpt-4o-mini",
      inputTokens: 1200,
      outputTokens: 400,
    });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      feature: "career_twin",
      status: "successful",
      model: "gpt-4o-mini",
      inputTokens: 1200,
      outputTokens: 400,
      totalTokens: 1600,
      estimatedCostUsd: 0.00042,
    });
  });

  it("records a refusal at zero cost — it never reached the provider", async () => {
    await recordAiUsage({ userId: "u1", feature: "career_twin", status: "daily_limit_reached" });
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      status: "daily_limit_reached",
      totalTokens: 0,
      estimatedCostUsd: 0,
    });
  });

  it("never throws — a ledger outage must not break a conversation", async () => {
    mocks.create.mockRejectedValue(new Error("db down"));
    await expect(
      recordAiUsage({ userId: "u1", feature: "career_twin", status: "successful" }),
    ).resolves.toBe(0);
  });
});

describe("monthlySpendUsd", () => {
  it("sums the current UTC month and memoises the aggregate", async () => {
    mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: 12.5 } });
    expect(await monthlySpendUsd()).toBe(12.5);
    expect(await monthlySpendUsd()).toBe(12.5);
    expect(mocks.aggregate).toHaveBeenCalledTimes(1);
    expect(mocks.aggregate.mock.calls[0][0].where.createdAt.gte.getUTCDate()).toBe(1);
  });

  it("reads an empty month as zero spend, not NaN", async () => {
    mocks.aggregate.mockResolvedValue({ _sum: { estimatedCostUsd: null } });
    expect(await monthlySpendUsd()).toBe(0);
  });
});
