/**
 * Model pricing → estimated USD cost per request.
 *
 * Pure and dependency-free so it can be unit tested and reused by any metered
 * feature. Prices are USD per 1M tokens (OpenAI list prices). Update here when
 * the provider changes prices — nothing else reads rates.
 */

export interface ModelRate {
  /** USD per 1,000,000 input tokens. */
  inputPerMillion: number;
  /** USD per 1,000,000 output tokens. */
  outputPerMillion: number;
}

/** Known model rates. Keys are matched case-insensitively by longest prefix. */
export const MODEL_RATES: Record<string, ModelRate> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "gpt-4.1-nano": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gpt-4.1": { inputPerMillion: 2, outputPerMillion: 8 },
};

/**
 * Rate used when a model isn't in the table. Deliberately the most expensive
 * known rate: an unknown model should OVER-estimate spend, so the monthly
 * ceiling trips early rather than late.
 */
export const FALLBACK_RATE: ModelRate = { inputPerMillion: 2.5, outputPerMillion: 10 };

/** Look up the rate for a model id (e.g. "gpt-4o-mini-2024-07-18"). */
export function getModelRate(model: string | null | undefined): ModelRate {
  if (!model) return FALLBACK_RATE;
  const id = model.trim().toLowerCase();
  const exact = MODEL_RATES[id];
  if (exact) return exact;

  // Dated/pinned ids ("gpt-4o-mini-2024-07-18") share their family's price.
  // Longest matching prefix wins so "gpt-4o-mini" beats "gpt-4o".
  let best: { key: string; rate: ModelRate } | null = null;
  for (const [key, rate] of Object.entries(MODEL_RATES)) {
    if (id.startsWith(key) && (!best || key.length > best.key.length)) {
      best = { key, rate };
    }
  }
  return best?.rate ?? FALLBACK_RATE;
}

/**
 * Estimated USD cost of one request, rounded to 6dp (the precision of the
 * `estimatedCostUsd` column). Negative/NaN token counts are treated as 0.
 */
export function estimateCostUsd(
  model: string | null | undefined,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = getModelRate(model);
  const input = Number.isFinite(inputTokens) ? Math.max(0, inputTokens) : 0;
  const output = Number.isFinite(outputTokens) ? Math.max(0, outputTokens) : 0;
  const cost = (input * rate.inputPerMillion + output * rate.outputPerMillion) / 1_000_000;
  return Math.round(cost * 1e6) / 1e6;
}

/**
 * Rough token count for a string when the provider didn't report usage
 * (e.g. a stream that errored mid-flight). ~4 chars per token is the standard
 * English approximation; we round UP so estimates never under-count spend.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
