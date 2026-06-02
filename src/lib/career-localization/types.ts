import type { Career } from "@/lib/career-pathways";

/** A localised value that MUST carry a citation. Omit the whole field if unverified. */
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
  /** EUR range, verified. */
  salary?: Cited<string>;
  /** Local education path, verified. */
  educationPath?: Cited<string>;
}

export interface LocalizedCareerView extends Career {
  /** false → render a "not yet tailored" marker; salary/path suppressed. */
  isLocalized: boolean;
}
