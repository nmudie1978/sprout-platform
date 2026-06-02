import type { Career } from "@/lib/career-pathways";
import type { CareerLocalizationEntry, LocalizedCareerView } from "./types";
import { ES_CAREER_LOCALIZATION } from "./es";

/** Country name → (careerId → overrides). Extend per launched country. */
const LOCALIZATION: Record<string, Record<string, CareerLocalizationEntry>> = {
  Spain: ES_CAREER_LOCALIZATION,
};

/**
 * Return a render view of a career for a given user country.
 * Pure + total. Apply ONLY at render — filtering/sorting/matching keep
 * using the raw Career (English/NOK) so they stay consistent.
 *
 * - No country / Norway / default / not-a-localized-country → unchanged, isLocalized true.
 * - Localized country + career has overrides → apply overrides (per-field English fallback).
 * - Localized country + career has NO overrides → keep universal title/description/skills,
 *   SUPPRESS the Norway-specific salary + educationPath, isLocalized false (drives the marker).
 */
export function localizeCareer(
  career: Career,
  country?: string | null,
): LocalizedCareerView {
  const table = country ? LOCALIZATION[country] : undefined;
  if (!table) return { ...career, isLocalized: true };

  const entry = table[career.id];
  if (!entry) {
    return { ...career, avgSalary: "", educationPath: "", isLocalized: false };
  }
  return {
    ...career,
    description: entry.description ?? career.description,
    dailyTasks: entry.dailyTasks ?? career.dailyTasks,
    keySkills: entry.keySkills ?? career.keySkills,
    // suppress NOK if no verified EUR figure was supplied
    avgSalary: entry.salary?.value ?? "",
    educationPath: entry.educationPath?.value ?? "",
    isLocalized: true,
  };
}
