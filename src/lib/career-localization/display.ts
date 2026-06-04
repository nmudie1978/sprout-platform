// src/lib/career-localization/display.ts
import type { LocalizedCareerView } from "./types";

/** The salary to display, or null when the "not tailored for your country" marker should show.
 *  (localizeCareer suppresses avgSalary to "" for a localized country lacking an override.) */
export function displaySalary(lc: LocalizedCareerView): string | null {
  if (!lc.isLocalized) return null;
  return lc.avgSalary?.trim() ? lc.avgSalary : null;
}

/** The education path to display, or null for the marker. */
export function displayEducation(lc: LocalizedCareerView): string | null {
  if (!lc.isLocalized) return null;
  return lc.educationPath?.trim() ? lc.educationPath : null;
}

/** The salary-progression chart is Norway/NOK-only. Show it only for Norway or no country. */
export function showsSalaryProgression(country: string | null | undefined): boolean {
  return !country || country === "Norway";
}
