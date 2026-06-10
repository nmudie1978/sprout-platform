// src/lib/journey/celebration.ts
//
// One-shot guard so the "journey complete" moment of arrival fires ONCE per
// career per device — never re-popping on every revisit. Device-local by
// design: this is a UI moment, not data worth syncing. Worst case on a new
// device is one extra (still positive) celebration.

const KEY_PREFIX = 'endeavrly:journey-celebrated:';

function key(careerId: string): string {
  return `${KEY_PREFIX}${careerId}`;
}

/** Has the completion moment already been shown for this career on this device? */
export function hasCelebratedJourney(careerId: string | null | undefined): boolean {
  if (!careerId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key(careerId)) === '1';
  } catch {
    return false;
  }
}

/** Record that the completion moment has been shown for this career. */
export function markJourneyCelebrated(careerId: string | null | undefined): void {
  if (!careerId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(careerId), '1');
  } catch {
    /* private mode / storage disabled — degrade silently */
  }
}

// ── Completion-transition detector ──────────────────────────────────
//
// The celebration must fire ONCE when a career actually crosses from
// incomplete → complete, and must NOT fire merely because an
// already-complete journey is re-opened (the interest level is persisted
// and re-loads as "set", so a reactive "if complete then celebrate" check
// re-pops on every visit). We track a per-career baseline of completeness
// and fire only on a real in-session transition. This is what makes the
// modal appear "each time a career is completed" but never "randomly".

export interface CelebrationBaseline {
  careerId: string | null;
  complete: boolean;
}

/**
 * Pure transition reducer. Given the previous baseline and the current
 * `(careerId, complete)` state, returns the next baseline plus whether to
 * celebrate now.
 *
 * Rules:
 *  - First observation for a career (no baseline, or the career changed):
 *    record the current state WITHOUT celebrating. This silences the
 *    initial load of an already-complete journey AND switching to another
 *    already-complete career.
 *  - Same career, baseline was incomplete and is now complete → celebrate.
 *  - A later re-completion (complete → incomplete → complete) celebrates
 *    again, so it pops every genuine completion.
 */
export function nextCelebrationState(
  baseline: CelebrationBaseline | null,
  careerId: string | null,
  complete: boolean,
): { baseline: CelebrationBaseline; celebrate: boolean } {
  if (!baseline || baseline.careerId !== careerId) {
    return { baseline: { careerId, complete }, celebrate: false };
  }
  const celebrate = !baseline.complete && complete;
  return { baseline: { careerId, complete }, celebrate };
}
