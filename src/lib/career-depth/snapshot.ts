// src/lib/career-depth/snapshot.ts
import type { CareerDetails } from "@/lib/career-typical-days";
import type { CareerProgression, CareerLevel } from "@/lib/career-progressions";

export interface DaySnapshot {
  realityCheck: string | null;
  doing: string[];
}

/** A compact day-in-life snapshot, ONLY for curated content (hasDetails).
 *  Generated/default templates are not surfaced (generic filler). */
export function daySnapshot(details: CareerDetails, hasDetails: boolean): DaySnapshot | null {
  if (!hasDetails) return null;
  const rc = details.realityCheck?.trim();
  const realityCheck = rc ? rc : null;
  const doing = (details.whatYouActuallyDo ?? []).slice(0, 3);
  if (!realityCheck && doing.length === 0) return null;
  return { realityCheck, doing };
}

/** The salary-progression levels, or [] when absent. */
export function salaryLevels(progression: CareerProgression | null): CareerLevel[] {
  return progression?.levels ?? [];
}

export interface FitSnapshot {
  whoThisIsGoodFor: string[];
  entryPaths: string[];
}

/** "Who tends to thrive here" + "common ways in", ONLY for curated content. */
export function fitSnapshot(details: CareerDetails, hasDetails: boolean): FitSnapshot | null {
  if (!hasDetails) return null;
  const whoThisIsGoodFor = (details.whoThisIsGoodFor ?? []).slice(0, 3);
  const entryPaths = (details.entryPaths ?? []).slice(0, 3);
  if (whoThisIsGoodFor.length === 0 && entryPaths.length === 0) return null;
  return { whoThisIsGoodFor, entryPaths };
}
