/**
 * Shared types for the AI usage guardrails.
 * Pure types + constants only — safe to import from anywhere.
 */

/** Metered AI features. One key per surface so cost is attributable. */
export const AI_FEATURES = {
  /** The Career Twin conversation — the surface the 15/day limit applies to. */
  CAREER_TWIN: "career_twin",
  /** "Experience the job" scenario runner (same feature family, own budget). */
  CAREER_TWIN_EXPERIENCE: "career_twin_experience",
  /** Background rolling-summary calls that keep conversation context bounded. */
  CAREER_TWIN_SUMMARY: "career_twin_summary",
} as const;

export type AiFeature = (typeof AI_FEATURES)[keyof typeof AI_FEATURES];

/**
 * Outcome recorded for every metered request attempt.
 * Stored as a plain string column so new reasons need no migration.
 */
export type AiUsageStatus =
  /** The provider was called and returned a usable answer. */
  | "successful"
  /** Refused: too many requests in the short (per-minute) window. */
  | "rate_limited"
  /** Refused: the rolling 24h per-user question limit is spent. */
  | "daily_limit_reached"
  /** Called the provider (or tried to) and it errored / returned nothing. */
  | "failed"
  /** Refused: the emergency kill switch is on. */
  | "disabled"
  /** Refused: the monthly platform cost ceiling is reached. */
  | "cost_capped";

/** Why a request was refused. `allowed` means "call the provider". */
export type AiGuardDecision =
  | { allowed: true }
  | {
      allowed: false;
      status: Exclude<AiUsageStatus, "successful" | "failed">;
      /** Friendly, youth-appropriate copy, safe to render straight to the UI. */
      message: string;
      /** When the user may try again (absent when it isn't time-based). */
      retryAt?: Date;
    };

/** Token counts for one provider call. */
export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
}
