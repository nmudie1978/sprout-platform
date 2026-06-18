/**
 * Index helpers for the Reflections vertical carousel.
 *
 * The slider shows one career group at a time and cycles with wrap-around
 * (paging up from the first lands on the last, and vice versa), so these
 * stay pure and total-safe.
 */

/** Wrap `index` into the range [0, total). Returns 0 when total <= 0. */
export function wrapIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

/** Step `current` by `delta` (e.g. -1 = up/prev, +1 = down/next) with wrap. */
export function stepIndex(current: number, total: number, delta: number): number {
  return wrapIndex(current + delta, total);
}
