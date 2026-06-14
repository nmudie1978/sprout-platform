/**
 * Clarity Shift — how clear/sure a young person feels about whether a career
 * is right for them, measured BEFORE and AFTER exploring it.
 *
 * This is distinct from Interest Level (how much they *like* a career). Clarity
 * is about *certainty / direction* — the core thing Endeavrly exists to grow
 * ("from uncertainty to clarity to momentum"). Comparing before → after turns
 * invisible internal progress into a visible, honest emotional signal.
 *
 * Pure module (no React / DOM): shared by the API route, the client hook and
 * the UI, and unit-tested in isolation.
 *
 * NOTE ON NAMING: requested as "Confidence Shift". The team deliberately
 * retired the "confidence" metric in favour of Interest Level
 * (see src/lib/interest-level/types.ts), so this uses "clarity" to avoid
 * re-introducing retired language and clashing with the interest rating.
 */

export type ClarityScore = 1 | 2 | 3 | 4 | 5;

export type ClarityPhase = "before" | "after";

export interface ClarityLevelMeta {
  score: ClarityScore;
  /** i18n key (under the `clarityShift` namespace) for the scale label. */
  labelKey: string;
}

/** Five levels, least → most clear. Labels live in i18n. */
export const CLARITY_LEVELS: readonly ClarityLevelMeta[] = [
  { score: 1, labelKey: "levels.veryUnsure" },
  { score: 2, labelKey: "levels.unsure" },
  { score: 3, labelKey: "levels.gettingClearer" },
  { score: 4, labelKey: "levels.fairlyClear" },
  { score: 5, labelKey: "levels.clear" },
] as const;

const LABEL_BY_SCORE = new Map<ClarityScore, string>(
  CLARITY_LEVELS.map((l) => [l.score, l.labelKey]),
);

export function isClarityScore(n: unknown): n is ClarityScore {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

export function clarityLevelLabelKey(score: ClarityScore): string {
  return LABEL_BY_SCORE.get(score)!;
}

export type ShiftDirection = "clearer" | "steady" | "less-sure";
export type ShiftMagnitude = "small" | "big";

export interface ClarityShiftResult {
  /** after − before. */
  delta: number;
  direction: ShiftDirection;
  /** "big" once the user moved two or more steps in either direction. */
  magnitude: ShiftMagnitude;
}

/** Pure comparison of the two endpoints. */
export function computeShift(before: ClarityScore, after: ClarityScore): ClarityShiftResult {
  const delta = after - before;
  const direction: ShiftDirection = delta > 0 ? "clearer" : delta < 0 ? "less-sure" : "steady";
  const magnitude: ShiftMagnitude = Math.abs(delta) >= 2 ? "big" : "small";
  return { delta, direction, magnitude };
}

/**
 * i18n key for the calm narrative that reflects a shift back to the user.
 * "steady" has no magnitude variant; the directional cases do so we can be
 * warmer about a big jump and gentle about a small one. Downward shifts are
 * handled honestly, never spun (see the `lessSure` copy).
 */
export function shiftNarrativeKey(shift: ClarityShiftResult): string {
  if (shift.direction === "steady") return "narrative.steady";
  const dir = shift.direction === "clearer" ? "clearer" : "lessSure";
  return `narrative.${dir}.${shift.magnitude}`;
}
