/**
 * Weekly rotation — pure, deterministic selection keyed on the ISO week.
 *
 * Same ISO week (UTC) always yields the same featured window (cache-friendly);
 * consecutive weeks advance the window so content visibly changes every Monday
 * and cycles over the full set across weeks. No randomness, no storage.
 */

/** Stable integer for the ISO week of `date` (UTC), e.g. 202625. */
export function getISOWeekSeed(date: Date): number {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  // ISO week is Thursday-based: shift to the Thursday of this week.
  const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return d.getUTCFullYear() * 100 + week;
}

/** Deterministic seeded shuffle (mulberry32-based Fisher–Yates). */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = items.slice();
  let s = (seed >>> 0) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Reorder `items` by `seed`; if `count` given, return that many. */
export function rotateWeekly<T>(items: T[], seed: number, count?: number): T[] {
  if (items.length === 0) return [];
  const shuffled = seededShuffle(items, seed);
  return typeof count === "number" ? shuffled.slice(0, count) : shuffled;
}

/** Pick a single item deterministically by seed. */
export function pickWeekly<T>(items: T[], seed: number): T | undefined {
  if (items.length === 0) return undefined;
  return rotateWeekly(items, seed, 1)[0];
}
