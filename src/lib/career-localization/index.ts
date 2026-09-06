import type { Career } from "@/lib/career-pathways";
import type { LocalizedCareerView } from "./types";
import { getPack } from "@/lib/country-packs";

/**
 * Return a render view of a career for a given user country.
 * Pure + total. Apply ONLY at render — filtering/sorting/matching keep
 * using the raw Career (English/NOK) so they stay consistent.
 *
 * - No country / Norway / default / not-a-pack-country → unchanged, isLocalized true.
 * - Pack country + career has overrides → apply overrides (per-field English fallback).
 * - Pack country + career has NO overrides → keep universal title/description/skills,
 *   SUPPRESS the Norway-specific salary + educationPath, isLocalized false (drives the marker).
 *
 * The country data now lives in `country-packs/` rather than in hand-written
 * override tables; this function's contract is unchanged, so consumers did
 * not move.
 */
export function localizeCareer(
  career: Career,
  country?: string | null,
): LocalizedCareerView {
  const pack = getPack(country);
  if (!pack) return { ...career, isLocalized: true };

  const entry = pack.careers[career.id];
  if (!entry) {
    return { ...career, avgSalary: "", educationPath: "", isLocalized: false };
  }
  return {
    ...career,
    description: entry.description ?? career.description,
    dailyTasks: entry.dailyTasks ?? career.dailyTasks,
    keySkills: entry.keySkills ?? career.keySkills,
    // suppress NOK if no verified local figure was supplied
    avgSalary: entry.salary?.value ?? "",
    educationPath: entry.educationPath?.value ?? "",
    // Carried through so the UI can mark an estimate as an estimate.
    salaryTier: entry.salary?.tier,
    educationPathTier: entry.educationPath?.tier,
    isLocalized: true,
  };
}
