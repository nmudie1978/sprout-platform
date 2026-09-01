/**
 * Writes the AI usage ledger (`AiUsageEvent`). Server-only — touches Prisma.
 *
 * Recording is ALWAYS best-effort: a ledger write must never take down a
 * conversation the user is mid-way through. Failures are logged and swallowed.
 *
 * Privacy: metadata only. Never pass prompt or response text into `detail`.
 */
import { prisma } from "@/lib/prisma";
import { logAndSwallow } from "@/lib/observability";
import { estimateCostUsd } from "./pricing";
import { DAY_MS, startOfMonthUtc } from "./limits";
import type { AiFeature, AiUsageStatus } from "./types";

export interface RecordUsageInput {
  userId: string;
  feature: AiFeature;
  status: AiUsageStatus;
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  /** Short machine-readable note, e.g. "openai_error". No user content. */
  detail?: string | null;
}

/**
 * Record one metered request attempt (allowed or refused).
 * Returns the estimated cost so callers can log it; never throws.
 */
export async function recordAiUsage(input: RecordUsageInput): Promise<number> {
  const inputTokens = Math.max(0, Math.round(input.inputTokens ?? 0));
  const outputTokens = Math.max(0, Math.round(input.outputTokens ?? 0));
  // Refused requests never reached the provider, so they cost nothing — but
  // they're still recorded, so refusal rates are as visible as spend.
  const estimatedCostUsd =
    inputTokens + outputTokens > 0 ? estimateCostUsd(input.model, inputTokens, outputTokens) : 0;

  try {
    await prisma.aiUsageEvent.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        status: input.status,
        model: input.model ?? null,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCostUsd,
        detail: input.detail ?? null,
      },
    });
  } catch (error) {
    logAndSwallow("ai-usage:record")(error);
  }
  return estimatedCostUsd;
}

/**
 * Timestamps of a user's most recent SUCCESSFUL requests for one feature
 * inside the rolling window, newest first, capped at `limit` rows.
 *
 * Only successful calls count: a request we refused (or that the provider
 * failed) never cost anything and must not burn the user's allowance.
 */
export async function recentSuccessfulRequests(
  userId: string,
  feature: AiFeature,
  limit: number,
  windowMs: number = DAY_MS,
  now: Date = new Date(),
): Promise<Date[]> {
  if (limit <= 0) return [];
  const rows = await prisma.aiUsageEvent.findMany({
    where: {
      userId,
      feature,
      status: "successful",
      createdAt: { gte: new Date(now.getTime() - windowMs) },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { createdAt: true },
  });
  return rows.map((r) => r.createdAt);
}

// The monthly aggregate is a full-month scan; caching it keeps the guard cheap
// on a hot path. 60s of staleness is immaterial against a monthly ceiling.
const SPEND_CACHE_MS = 60_000;
let spendCache: { periodStart: number; total: number; fetchedAt: number } | null = null;

/** Test-only: drop the memoised monthly spend so a test can re-stub Prisma. */
export function __resetMonthlySpendCache(): void {
  spendCache = null;
}

/**
 * Total estimated USD spend across ALL users and features for the current
 * UTC calendar month. Memoised for 60s.
 */
export async function monthlySpendUsd(now: Date = new Date()): Promise<number> {
  const periodStart = startOfMonthUtc(now).getTime();
  if (
    spendCache &&
    spendCache.periodStart === periodStart &&
    now.getTime() - spendCache.fetchedAt < SPEND_CACHE_MS
  ) {
    return spendCache.total;
  }

  const agg = await prisma.aiUsageEvent.aggregate({
    _sum: { estimatedCostUsd: true },
    where: { createdAt: { gte: new Date(periodStart) } },
  });
  // Prisma returns a Decimal (or null when there are no rows).
  const total = Number(agg._sum.estimatedCostUsd ?? 0);
  spendCache = { periodStart, total: Number.isFinite(total) ? total : 0, fetchedAt: now.getTime() };
  return spendCache.total;
}
