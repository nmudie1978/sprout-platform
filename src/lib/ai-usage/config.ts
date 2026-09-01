/**
 * ══════════════════════════════════════════════════════════════════════
 *  THE ONE PLACE AI COST/USAGE LIMITS ARE CONFIGURED
 * ══════════════════════════════════════════════════════════════════════
 *
 * Every guardrail number lives here and every one of them is overridable by
 * an environment variable, so limits can be re-tuned in the Vercel dashboard
 * (or a `.env`) and take effect on the next request — no code change, no
 * rewrite, no redeploy of new logic.
 *
 * Read at call time (not module load) so an ops change to an env var applies
 * to warm serverless instances too, and so tests can vary a single knob.
 *
 * See docs/ai-usage-guardrails.md for the operator-facing runbook.
 */

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  // A typo'd env var must never silently disable a limit — fall back loudly.
  if (!Number.isFinite(n) || n < 0) {
    console.warn(`[AI Usage] Ignoring invalid ${name}="${raw}" — using ${fallback}.`);
    return fallback;
  }
  return Math.floor(n);
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    console.warn(`[AI Usage] Ignoring invalid ${name}="${raw}" — using ${fallback}.`);
    return fallback;
  }
  return n;
}

function envTrue(name: string): boolean {
  return (process.env[name] ?? "").trim().toLowerCase() === "true";
}

export interface CareerTwinAiConfig {
  /** Provider model used for Career Twin conversation turns. */
  model: string;
  /** Cheaper model used for the background conversation summariser. */
  summaryModel: string;
  /** Questions allowed per user per ROLLING 24 hours. */
  dailyQuestionLimit: number;
  /** Requests allowed per user per minute (burst / automation guard). */
  requestsPerMinute: number;
  /** Hard cap on generated answer length. Keeps replies concise + cheap. */
  maxOutputTokens: number;
  /** Verbatim conversation turns replayed into the prompt (user+assistant). */
  maxContextTurns: number;
  /** Token budget for the replayed turns; older turns are dropped to fit. */
  maxContextTokens: number;
  /** Older turns must reach this count before a summary is generated. */
  summaryTriggerTurns: number;
  /** Hard cap on the rolling summary itself, so IT cannot grow unbounded. */
  summaryMaxTokens: number;
}

/** Career Twin guardrail settings. Env overrides in brackets. */
export function getCareerTwinConfig(): CareerTwinAiConfig {
  return {
    // [CAREER_TWIN_MODEL] gpt-4o-mini is the cost/quality sweet spot here.
    model: process.env.CAREER_TWIN_MODEL?.trim() || "gpt-4o-mini",
    // [CAREER_TWIN_SUMMARY_MODEL]
    summaryModel: process.env.CAREER_TWIN_SUMMARY_MODEL?.trim() || "gpt-4o-mini",
    // [CAREER_TWIN_DAILY_LIMIT] 15 questions / rolling 24h.
    dailyQuestionLimit: envInt("CAREER_TWIN_DAILY_LIMIT", 15),
    // [CAREER_TWIN_REQUESTS_PER_MINUTE] 5/min.
    requestsPerMinute: envInt("CAREER_TWIN_REQUESTS_PER_MINUTE", 5),
    // [CAREER_TWIN_MAX_OUTPUT_TOKENS] ~400 tokens ≈ 300 words: a warm,
    // complete answer without an essay.
    maxOutputTokens: envInt("CAREER_TWIN_MAX_OUTPUT_TOKENS", 400),
    // [CAREER_TWIN_MAX_CONTEXT_TURNS]
    maxContextTurns: envInt("CAREER_TWIN_MAX_CONTEXT_TURNS", 6),
    // [CAREER_TWIN_MAX_CONTEXT_TOKENS]
    maxContextTokens: envInt("CAREER_TWIN_MAX_CONTEXT_TOKENS", 1200),
    // [CAREER_TWIN_SUMMARY_TRIGGER_TURNS]
    summaryTriggerTurns: envInt("CAREER_TWIN_SUMMARY_TRIGGER_TURNS", 6),
    // [CAREER_TWIN_SUMMARY_MAX_TOKENS]
    summaryMaxTokens: envInt("CAREER_TWIN_SUMMARY_MAX_TOKENS", 220),
  };
}

/**
 * Monthly platform-wide spend ceiling in USD, summed across ALL users and
 * metered features. Once reached, metered AI requests degrade to their
 * non-AI fallback instead of spending more. [AI_MONTHLY_COST_CEILING_USD]
 *
 * NOTE: the authoritative hard ceiling is the cap set in the OpenAI billing
 * dashboard. This is an in-app early-trip backstop, not a substitute.
 */
export function getMonthlyCostCeilingUsd(): number {
  return envNumber("AI_MONTHLY_COST_CEILING_USD", 200);
}

/**
 * EMERGENCY KILL SWITCH.
 *
 * `true` → no metered AI request reaches the provider; every surface serves
 * its grounded non-AI fallback. Two independent triggers:
 *
 *   AI_KILL_SWITCH=true            — all metered AI features
 *   CAREER_TWIN_AI_DISABLED=true   — Career Twin surfaces only
 *
 * A no-deploy runtime override also exists (a Redis flag) — see
 * `isAiKillSwitchOn` in ./guard.ts.
 */
export function isKillSwitchEnvOn(feature?: string): boolean {
  if (envTrue("AI_KILL_SWITCH")) return true;
  return !!feature && feature.startsWith("career_twin") && envTrue("CAREER_TWIN_AI_DISABLED");
}

/** Redis key an operator can SET to trip the kill switch without a deploy. */
export const KILL_SWITCH_REDIS_KEY = "ai:kill-switch";
