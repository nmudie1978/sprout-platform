/**
 * AI usage guardrails — daily limits, rate limiting, cost tracking and the
 * emergency kill switch for metered AI features.
 *
 * Limits are configured in ./config.ts; see docs/ai-usage-guardrails.md.
 * Everything here is SERVER-ONLY (Prisma + Redis) — never import from a
 * client component.
 */
export * from "./types";
export * from "./config";
export * from "./pricing";
export * from "./limits";
export { recordAiUsage, monthlySpendUsd, recentSuccessfulRequests } from "./record";
export { checkAiGuardrails, checkCareerTwinGuardrails, isAiKillSwitchOn } from "./guard";
