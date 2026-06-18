import type { Career } from "@/lib/career-pathways";

/**
 * Pick a diverse set of high-growth careers that spans industries, instead of
 * the first N in catalogue order (which clusters — e.g. all the genetics roles
 * sit together). Groups high-growth careers by category and round-robins one
 * per category, so the suggestion list reads as a mix.
 *
 * `rng` is injectable for deterministic tests; defaults to Math.random so each
 * time the modal opens the user sees a fresh, still-diverse mix.
 */
export function pickDiverseHighGrowth(
  careers: Career[],
  categoryOf: (id: string) => string | null | undefined,
  opts: { limit: number; exclude?: (c: Career) => boolean; rng?: () => number },
): Career[] {
  const { limit, exclude, rng = Math.random } = opts;
  if (limit <= 0) return [];

  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const groups = new Map<string, Career[]>();
  for (const c of careers) {
    if (c.growthOutlook !== "high") continue;
    if (exclude?.(c)) continue;
    const cat = categoryOf(c.id) ?? "other";
    const list = groups.get(cat);
    if (list) list.push(c);
    else groups.set(cat, [c]);
  }

  // Shuffle category order and the careers within each, then round-robin so
  // each successive pick comes from a different category until we run out.
  const cats = shuffle([...groups.keys()]);
  const shuffled = new Map(cats.map((cat) => [cat, shuffle(groups.get(cat)!)]));

  const result: Career[] = [];
  for (let round = 0; result.length < limit; round++) {
    let addedThisRound = false;
    for (const cat of cats) {
      const list = shuffled.get(cat)!;
      if (round < list.length) {
        result.push(list[round]);
        addedThisRound = true;
        if (result.length >= limit) break;
      }
    }
    if (!addedThisRound) break; // every category exhausted
  }
  return result;
}
