import type { Career } from "@/lib/career-pathways";

/**
 * Pick a "Surprise me" career — a calm serendipity action for users who
 * don't yet know what they're looking for.
 *
 * Pure and deterministic given `rng`: excludes any career whose id is in
 * `recentIds` so consecutive presses don't repeat, falling back to the full
 * pool only when every career has recently been shown. Returns null for an
 * empty catalogue.
 *
 * @param careers   the catalogue to pick from
 * @param recentIds ids shown recently (excluded if possible)
 * @param rng       0..1 source; injectable for tests (defaults to Math.random)
 */
export function pickSurprise(
  careers: Career[],
  recentIds: string[] = [],
  rng: () => number = Math.random,
): Career | null {
  if (careers.length === 0) return null;

  const recent = new Set(recentIds);
  const fresh = careers.filter((c) => !recent.has(c.id));
  const pool = fresh.length > 0 ? fresh : careers;

  // Clamp the index defensively in case rng returns exactly 1.
  const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  return pool[index];
}
