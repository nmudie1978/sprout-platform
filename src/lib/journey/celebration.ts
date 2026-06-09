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
