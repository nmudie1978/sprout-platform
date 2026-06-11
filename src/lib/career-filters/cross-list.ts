import type { Career, CareerCategory } from "@/lib/career-pathways";

/**
 * Browse-only category cross-listing.
 *
 * When a young person filters the Browse Careers page by one of these
 * categories, the listing (and the dropdown count) also surfaces careers
 * from the linked categories. This is deliberately a *browse-surface*
 * concern only — it does NOT change a career's primary category, its
 * sector, or what the detail page / radar show. So a career keeps living
 * in exactly one place in the data, and we just widen what a given filter
 * reveals.
 *
 * Military is a form of public service, so the "Public Service" filter
 * also shows military careers (the user can still pick the dedicated
 * "Military" filter to see only those).
 */
export const BROWSE_CATEGORY_INCLUDES: Partial<
  Record<CareerCategory, CareerCategory[]>
> = {
  PUBLIC_SERVICE_SAFETY: ["MILITARY_DEFENCE"],
};

/**
 * Careers to show for a selected browse category: the category's own
 * careers plus any cross-listed categories, deduped by id (a career that
 * already appears in the base list — e.g. Coast Guard Officer in Public
 * Service — is never added twice).
 */
export function browseCareersForCategory(
  category: CareerCategory,
  getCareersForCategory: (c: CareerCategory) => Career[],
): Career[] {
  const base = getCareersForCategory(category);
  const includes = BROWSE_CATEGORY_INCLUDES[category];
  if (!includes?.length) return base;

  const seen = new Set(base.map((c) => c.id));
  const extra = includes
    .flatMap((c) => getCareersForCategory(c))
    .filter((c) => !seen.has(c.id));
  return [...base, ...extra];
}

/**
 * Apply the cross-list to a category→count map in place-safe fashion,
 * returning a new map where each cross-listing category's count includes
 * its linked categories. Categories are disjoint in the source data
 * (a career lives in one array), so a plain sum is correct.
 */
export function withBrowseCrossListCounts(
  counts: Record<string, number>,
): Record<string, number> {
  const next = { ...counts };
  for (const [category, includes] of Object.entries(BROWSE_CATEGORY_INCLUDES)) {
    for (const inc of includes ?? []) {
      next[category] = (next[category] ?? 0) + (next[inc] ?? 0);
    }
  }
  return next;
}
