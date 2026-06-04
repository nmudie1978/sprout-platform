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
