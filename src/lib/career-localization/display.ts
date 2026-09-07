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

/**
 * Countries whose salaries are quoted per MONTH rather than per year.
 * Sweden and Denmark both quote månadslön / månedsløn; Norway quotes annual.
 * Getting this wrong overstates or understates pay by a factor of twelve.
 */
const MONTHLY_COUNTRIES = new Set(["Sweden", "Denmark"]);

/** "Annual Salary" or "Monthly Salary", for a stat-card label. */
export function salaryPeriodLabel(country: string | null | undefined): string {
  return country && MONTHLY_COUNTRIES.has(country) ? "Monthly Salary" : "Annual Salary";
}

/**
 * The compact form of a salary string, for cards and chips.
 *
 * Callers used to do `avgSalary.split(" ")[0]`, which works for the Norwegian
 * format ("550,000 - 850,000 kr/year" → "550,000") and silently breaks the
 * Swedish one ("38 800–72 500 kr/mån" → "38"), because Swedish uses a SPACE as
 * its thousands separator. Anything rendering a shortened salary must use this.
 */
export function formatSalaryCompact(raw: string | null | undefined): string {
  if (!raw?.trim()) return "—";
  // Drop any parenthetical (the Swedish median annotation).
  const head = raw.replace(/\s*\(.*$/, "").trim();
  // Take the text before the range separator: hyphen or en/em dash, but only
  // when it separates the bounds rather than sitting inside a number.
  const lower = head.split(/\s*[–—]\s*|\s+-\s+/)[0].trim();
  // Strip a trailing unit if the figure had no range at all.
  return lower.replace(/\s*kr\/(year|mån|måned).*$/i, "").trim() || "—";
}

/**
 * User-facing note for a figure's provenance, or null when none is needed.
 *
 * An unlabelled estimate is indistinguishable from a verified fact. This
 * platform shows salary and education guidance to 15-year-olds, so an estimate
 * has to say so.
 */
export function estimateNote(
  tier: "verified" | "estimated" | undefined,
): string | null {
  return tier === "estimated"
    ? "Estimated — based on the typical route, not verified for this specific career"
    : null;
}
