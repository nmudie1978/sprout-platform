/**
 * The gate every metered AI request passes through, in order:
 *
 *   1. emergency kill switch  (env var, or a Redis flag for no-deploy ops)
 *   2. per-minute rate limit  (burst / automation guard)
 *   3. rolling 24h usage limit
 *   4. monthly platform cost ceiling
 *
 * A refusal is recorded in the usage ledger and returned as friendly copy —
 * the provider is never called. Server-only (Prisma + Redis).
 *
 * Limits are configured in ./config.ts (all env-overridable).
 */
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { getRedisClient } from "@/lib/rate-limit";
import { logAndSwallow } from "@/lib/observability";
import {
  getCareerTwinConfig,
  getMonthlyCostCeilingUsd,
  isKillSwitchEnvOn,
  KILL_SWITCH_REDIS_KEY,
} from "./config";
import {
  DAY_MS,
  dailyLimitMessage,
  evaluateRollingWindow,
  rateLimitMessage,
  unavailableMessage,
} from "./limits";
import { monthlySpendUsd, recentSuccessfulRequests, recordAiUsage } from "./record";
import { AI_FEATURES, type AiFeature, type AiGuardDecision } from "./types";

// The Redis flag is polled per request; memoise it briefly so tripping the
// switch is fast (≤30s to take effect everywhere) without a lookup per call.
const KILL_SWITCH_CACHE_MS = 30_000;
let killSwitchCache: { on: boolean; fetchedAt: number } | null = null;

/** Test-only: drop the memoised kill-switch state. */
export function __resetKillSwitchCache(): void {
  killSwitchCache = null;
}

/**
 * Is the emergency kill switch on for this feature?
 *
 * Env vars win instantly. The Redis flag (`SET ai:kill-switch true`) exists so
 * an operator can stop AI spend during an incident WITHOUT waiting on a
 * deploy. Fails OPEN on a Redis error — a flag lookup glitch must not take the
 * product down (the env var remains the reliable brake).
 */
export async function isAiKillSwitchOn(feature: AiFeature): Promise<boolean> {
  if (isKillSwitchEnvOn(feature)) return true;

  const now = Date.now();
  if (killSwitchCache && now - killSwitchCache.fetchedAt < KILL_SWITCH_CACHE_MS) {
    return killSwitchCache.on;
  }
  let on = false;
  try {
    const redis = await getRedisClient();
    if (redis) {
      const raw = await redis.get(KILL_SWITCH_REDIS_KEY);
      on = raw !== null && ["1", "true", "on"].includes(String(raw).trim().toLowerCase());
    }
  } catch (error) {
    logAndSwallow("ai-usage:kill-switch")(error);
    on = false;
  }
  killSwitchCache = { on, fetchedAt: now };
  return on;
}

export interface GuardOptions {
  userId: string;
  feature: AiFeature;
  /** Requests per minute. Defaults to the feature's configured value. */
  requestsPerMinute?: number;
  /** Questions per rolling 24h. 0 disables the daily check for this feature. */
  dailyLimit?: number;
}

/**
 * Run all guardrails for one request. Records the refusal when it denies.
 *
 * Fails OPEN on an unexpected internal error (a broken counter must not break
 * the Career Twin) — the kill switch and the provider-side billing cap remain
 * the hard stops.
 */
export async function checkAiGuardrails(opts: GuardOptions): Promise<AiGuardDecision> {
  const { userId, feature } = opts;
  const cfg = getCareerTwinConfig();
  const perMinute = opts.requestsPerMinute ?? cfg.requestsPerMinute;
  const dailyLimit = opts.dailyLimit ?? cfg.dailyQuestionLimit;

  try {
    // 1 ── Emergency kill switch.
    if (await isAiKillSwitchOn(feature)) {
      await recordAiUsage({ userId, feature, status: "disabled", detail: "kill_switch" });
      return { allowed: false, status: "disabled", message: unavailableMessage() };
    }

    // 2 ── Per-minute burst limit (Redis-backed; shared across instances).
    const burst = await checkRateLimitAsync(`${feature}:minute:${userId}`, {
      interval: 60_000,
      maxRequests: perMinute,
    });
    if (!burst.success) {
      const retryAt = new Date(burst.reset);
      await recordAiUsage({ userId, feature, status: "rate_limited", detail: "per_minute" });
      return {
        allowed: false,
        status: "rate_limited",
        message: rateLimitMessage(retryAt),
        retryAt,
      };
    }

    // 3 ── Rolling 24h usage limit (counted from the ledger, so the window
    //      truly rolls and we can tell the user when a slot frees up).
    if (dailyLimit > 0) {
      const recent = await recentSuccessfulRequests(userId, feature, dailyLimit, DAY_MS);
      const daily = evaluateRollingWindow(recent, dailyLimit, DAY_MS);
      if (!daily.allowed) {
        await recordAiUsage({
          userId,
          feature,
          status: "daily_limit_reached",
          detail: `used_${daily.used}_of_${dailyLimit}`,
        });
        return {
          allowed: false,
          status: "daily_limit_reached",
          message: dailyLimitMessage(dailyLimit, daily.retryAt),
          retryAt: daily.retryAt,
        };
      }
    }

    // 4 ── Monthly platform-wide cost ceiling.
    const ceiling = getMonthlyCostCeilingUsd();
    if (ceiling > 0) {
      const spent = await monthlySpendUsd();
      if (spent >= ceiling) {
        console.error(
          `[AI Usage] Monthly cost ceiling reached: $${spent.toFixed(2)} >= $${ceiling.toFixed(2)}. ` +
            "Metered AI is serving fallbacks. Raise AI_MONTHLY_COST_CEILING_USD or investigate.",
        );
        await recordAiUsage({ userId, feature, status: "cost_capped", detail: "monthly_ceiling" });
        return { allowed: false, status: "cost_capped", message: unavailableMessage() };
      }
    }

    return { allowed: true };
  } catch (error) {
    // Fail open: a guardrail outage degrades protection, not the product.
    logAndSwallow("ai-usage:guard")(error);
    return { allowed: true };
  }
}

/** Convenience wrapper for the Career Twin conversation surface. */
export function checkCareerTwinGuardrails(userId: string): Promise<AiGuardDecision> {
  return checkAiGuardrails({ userId, feature: AI_FEATURES.CAREER_TWIN });
}
