// src/lib/career-voices/match.ts
/** Normalise a free-text tag/title to the canonical tag form: lowercase,
 *  spaces→hyphens, punctuation stripped, hyphens collapsed. */
export function normalizeTag(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CareerLike {
  id: string;
  title: string;
}

/** The set of normalized tag strings that identify a career. */
export function careerTagVariants(career: CareerLike): Set<string> {
  return new Set([normalizeTag(career.id), normalizeTag(career.title)]);
}

/** True if any of the item's careerTags identifies this career. */
export function matchesCareer(careerTags: string[], career: CareerLike): boolean {
  const variants = careerTagVariants(career);
  return careerTags.some((t) => variants.has(normalizeTag(t)));
}
