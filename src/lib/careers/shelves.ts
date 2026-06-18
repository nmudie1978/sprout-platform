import type { Career, CareerCategory, EducationRoute } from "@/lib/career-pathways";
import { peopleIntensityFor } from "@/lib/matching/lookups";

/**
 * Context a shelf rule needs to resolve traits that aren't always set
 * explicitly on a Career. `categoryOf` comes from the catalog's category
 * index (see useCareerCatalog.getCategoryForCareer) so we can resolve
 * work-setting / people-intensity defaults WITHOUT importing the
 * career-pathways god-module into the client bundle.
 */
export interface ShelfContext {
  categoryOf: (id: string) => CareerCategory | null | undefined;
}

export interface ShelfDef {
  id: string;
  /** Display title (shelf header). */
  title: string;
  emoji: string;
  /** One calm line under the title. */
  blurb: string;
  /** Auto-selection rule over the catalogue. */
  match: (career: Career, ctx: ShelfContext) => boolean;
  /** Editor adds — these lead the shelf, in the order given. */
  pinnedIds?: string[];
  /** Editor removes — never appear in the shelf. */
  hiddenIds?: string[];
}

/** Max cards in a single shelf — keeps the front door finite and calm. */
export const SHELF_LIMIT = 12;
/** A shelf with fewer than this many results is not worth rendering. */
export const SHELF_MIN = 3;

const NON_UNIVERSITY_ROUTES: ReadonlySet<EducationRoute> = new Set<EducationRoute>([
  "vocational",
  "certification",
  "on-the-job",
]);

const NON_UNIVERSITY_TEXT =
  /vocational|fagbrev|apprentic|no formal|certificate|on[- ]the[- ]job/i;

/**
 * "No degree needed" predicate. Explicit route wins; otherwise entry-level
 * flag; otherwise sniff the free-text education path. Retained as a shared
 * utility (and unit-tested) even though the shelves that used it have been
 * removed from the front door.
 */
export function isNonUniversity(career: Career): boolean {
  if (career.educationRoute) return NON_UNIVERSITY_ROUTES.has(career.educationRoute);
  if (career.entryLevel) return true;
  return NON_UNIVERSITY_TEXT.test(career.educationPath ?? "");
}

export const SHELVES: ShelfDef[] = [
  {
    id: "helping-people",
    title: "Careers that help people",
    emoji: "🤝",
    blurb: "Work centred on other people.",
    match: (c, ctx) => peopleIntensityFor(c, ctx.categoryOf(c.id)) === "high",
  },
];

/**
 * Build one shelf: pinned ids (that exist, in order) lead, followed by the
 * auto-matched pool in catalogue order, with hidden ids removed throughout
 * and the whole thing capped at `limit`. Pure — no I/O, no randomness.
 */
export function buildShelf(
  def: ShelfDef,
  careers: Career[],
  ctx: ShelfContext,
  limit: number = SHELF_LIMIT,
): Career[] {
  const hidden = new Set(def.hiddenIds ?? []);
  const pinnedIds = (def.pinnedIds ?? []).filter((id) => !hidden.has(id));
  const pinnedSet = new Set(pinnedIds);
  const byId = new Map(careers.map((c) => [c.id, c]));

  const pinned: Career[] = pinnedIds
    .map((id) => byId.get(id))
    .filter((c): c is Career => Boolean(c));

  const auto = careers.filter(
    (c) => !hidden.has(c.id) && !pinnedSet.has(c.id) && def.match(c, ctx),
  );

  return [...pinned, ...auto].slice(0, limit);
}
