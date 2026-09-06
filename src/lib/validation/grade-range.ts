import { clampToScale, quantizeToScale, type GradeScale } from "@/lib/country-packs/scales";

/**
 * The self-reported grade range stored on a profile.
 *
 * `scale` is persisted alongside the numbers so the value is self-describing.
 * Without it, a stored `{low: 4, high: 5}` is ambiguous the moment a second
 * country exists — 4–5 is a middling Norwegian grade and a near-failing
 * Swedish meritvärde. Rows written before country scales carry no `scale` and
 * are read as Norwegian, which is what they are.
 */
export interface StoredGradeRange {
  low: number;
  high: number;
  scale?: string;
}

/**
 * Validate and normalise a client-supplied grade range against a scale.
 *
 * Returns undefined for anything unusable rather than throwing: the quiz UI
 * only sends valid values, so this is defence-in-depth against direct API
 * callers, and silently dropping a bad range is friendlier than failing the
 * whole preferences save.
 *
 * Out-of-range values are CLAMPED rather than rejected. The previous
 * behaviour rejected anything above 6, which meant every Swedish meritvärde
 * — a 0–22.5 scale — was thrown away in its entirety.
 */
export function sanitizeGradeRange(
  raw: unknown,
  scale: GradeScale,
): StoredGradeRange | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  const { low, high } = raw as { low?: unknown; high?: unknown };
  const lo = Number(low);
  const hi = Number(high);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return undefined;
  // A reversed range is a client bug, not something to silently "fix" by
  // swapping — the user's intent is genuinely unknown.
  if (lo > hi) return undefined;

  return {
    low: quantizeToScale(clampToScale(lo, scale), scale),
    high: quantizeToScale(clampToScale(hi, scale), scale),
    scale: scale.id,
  };
}
