import type { PackGradeBand } from "./types";
import { SV_GRADE_BANDS } from "./sv/grade-bands";

/**
 * The grade band for a career, on a given grade scale.
 *
 * Deliberately a LEAF module: it imports only the hand-authored band table,
 * never the pack registry. The registry statically imports every
 * pack.generated.json, and the Swedish pack is 842KB — pulling that into the
 * matching engine would ship the entire Swedish catalog to every client,
 * including Norwegian ones.
 *
 * Keyed by SCALE rather than country on purpose: the scale id is persisted on
 * the user's stored gradeRange, so matching resolves the right band from the
 * preferences alone, without threading a country through the engine.
 *
 * Returns null when the scale has no band for that career — the common case,
 * and the honest one: matching then reports "unknown" rather than ranking
 * against a number nobody verified.
 */
export function getGradeBandForScale(
  scaleId: string | undefined,
  careerId: string,
): PackGradeBand | null {
  if (scaleId === "se-meritvarde") {
    return SV_GRADE_BANDS[careerId]?.value ?? null;
  }
  return null;
}
