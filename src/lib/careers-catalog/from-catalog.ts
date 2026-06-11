// Client-safe helpers that operate on a fetched career catalog.
//
// The full CAREER_PATHWAYS constant (~728KB) must NOT ship in client
// bundles — see /api/careers/catalog + use-career-catalog. These pure
// functions mirror the server-side index/search semantics in
// src/lib/career-pathways.ts EXACTLY (first-occurrence-wins dedupe;
// title/description/keySkills search) so consumers behave identically
// whether they read the static module (server) or the fetched catalog
// (client). Only `import type` is used here, so this file carries zero
// runtime data.
import type { Career, CareerCategory } from "@/lib/career-pathways";

/** The catalog shape returned by /api/careers/catalog (mirrors CAREER_PATHWAYS). */
export type CareerCatalog = Record<string, Career[]>;

export interface CatalogIndexes {
  /** Flat, deduped career list (first occurrence wins). */
  all: Career[];
  byId: Map<string, Career>;
  categoryById: Map<string, CareerCategory>;
}

/**
 * Build the flat list + lookup maps once from a fetched catalog. Mirrors
 * `buildIndexes()` in career-pathways.ts: careers can be cross-listed
 * across categories, and the first occurrence by iteration order wins.
 */
export function buildCatalogIndexes(catalog: CareerCatalog): CatalogIndexes {
  const seen = new Set<string>();
  const all: Career[] = [];
  const byId = new Map<string, Career>();
  const categoryById = new Map<string, CareerCategory>();
  for (const [category, careers] of Object.entries(catalog)) {
    for (const career of careers) {
      if (seen.has(career.id)) continue;
      seen.add(career.id);
      all.push(career);
      byId.set(career.id, career);
      categoryById.set(career.id, category as CareerCategory);
    }
  }
  return { all, byId, categoryById };
}

/**
 * Text search over a flat career list. Mirrors `searchCareers()`:
 * case-insensitive match on title, description, or any keySkill.
 */
export function searchCatalog(all: Career[], query: string): Career[] {
  const q = query.toLowerCase();
  return all.filter(
    (career) =>
      career.title.toLowerCase().includes(q) ||
      career.description.toLowerCase().includes(q) ||
      career.keySkills.some((skill) => skill.toLowerCase().includes(q)),
  );
}
