import type { Career } from "@/lib/career-pathways";

export type SectorFilter = "all" | "public" | "private";

export interface BuildMorePoolOptions<P extends string = string> {
  /** Deep ranked slice of matches (rank order preserved). */
  deepPool: Career[];
  /** Career ids already drawn on the radar / shown in the band carousel. */
  visibleIds: Set<string>;
  /** Active sector filter ("all" = no sector constraint). */
  sectorFilter: SectorFilter;
  /** Active preset filter key, or null when no preset is selected. */
  presetFilter: P | null;
  /** Predicate: does this career match the given preset key? */
  matchesPreset: (career: Career, preset: P) => boolean;
  /** Resolve a career's employment sector. */
  getSector: (careerId: string) => "public" | "private" | "mixed";
}

/**
 * Derive the ordered "long tail" of careers eligible to be revealed by
 * the Matches Report "Show more matches" control.
 *
 * Pure function (no React, no globals) so the filter/dedupe/order logic
 * is unit-testable. The component supplies `deepPool` (a deeper ranked
 * slice than the radar draws), the ids already on screen, the active
 * filters, and the two predicates it already has in scope.
 *
 * Order is preserved from `deepPool` (which is already rank-ordered).
 * Rules, in order:
 *  1. keep careers whose sector matches `sectorFilter` (or "mixed",
 *     which counts as either) — skipped entirely when filter is "all";
 *  2. keep careers matching `presetFilter` when a preset is set;
 *  3. drop any career already shown on the radar/report.
 */
export function buildMorePool<P extends string = string>(
  opts: BuildMorePoolOptions<P>,
): Career[] {
  const {
    deepPool,
    visibleIds,
    sectorFilter,
    presetFilter,
    matchesPreset,
    getSector,
  } = opts;

  return deepPool.filter((career) => {
    if (visibleIds.has(career.id)) return false;
    if (presetFilter && !matchesPreset(career, presetFilter)) return false;
    if (sectorFilter !== "all") {
      const sector = getSector(career.id);
      if (sector !== sectorFilter && sector !== "mixed") return false;
    }
    return true;
  });
}
