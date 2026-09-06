import type { Career, DiscoveryPreferences } from "@/lib/career-pathways";
import { UNIVERSITY_ROUTES } from "@/lib/matching/lookups";

/**
 * The `excludeUniversity` filter.
 *
 * Lives here rather than with the old grade-matching code because it is a
 * different kind of signal. Grade matching asked a 15-year-old to predict
 * their own results, which the platform no longer does; this is the user
 * saying "I don't want to go to university", which is a stated preference
 * about a route, not a self-assessment. Returns true if the career should be
 * HIDDEN — use as the predicate in a `.filter(!)` call.
 *
 * Only hides careers whose entryRoute is explicitly a university route.
 * Un-annotated careers are always kept: we don't hide what we lack data on.
 */
export function shouldExcludeByRoute(
  career: Pick<Career, "entryRoute">,
  prefs: Pick<DiscoveryPreferences, "excludeUniversity">,
): boolean {
  if (!prefs.excludeUniversity) return false;
  if (!career.entryRoute) return false;
  return UNIVERSITY_ROUTES.has(career.entryRoute);
}
