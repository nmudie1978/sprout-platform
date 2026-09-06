import type { Career } from "@/lib/career-pathways";
import type { ProvenanceTier } from "@/lib/country-packs/types";

/**
 * Legacy shape from the hand-written override tables. Superseded by
 * `Provenanced<T>` in country-packs/types.ts, which adds a tier. Kept because
 * the type is still referenced; new data goes through the packs.
 */
export interface Cited<T> {
  value: T;
  /** URL or precise citation backing this figure. Required, non-empty. */
  source: string;
}

/** Partial per-career overrides for one country. Only fields that differ. */
export interface CareerLocalizationEntry {
  description?: string;
  dailyTasks?: string[];
  keySkills?: string[];
  salary?: Cited<string>;
  educationPath?: Cited<string>;
}

export interface LocalizedCareerView extends Career {
  /** false → render a "not yet tailored" marker; salary/path suppressed. */
  isLocalized: boolean;
  /**
   * Provenance of the displayed salary / education path, when the country has
   * a pack. `estimated` MUST be surfaced to the user as an estimate — an
   * unlabelled estimate is indistinguishable from a verified fact, which is
   * the failure the two-tier model exists to prevent.
   *
   * Absent when the field is absent or the country has no pack (Norway).
   */
  salaryTier?: ProvenanceTier;
  educationPathTier?: ProvenanceTier;
}
