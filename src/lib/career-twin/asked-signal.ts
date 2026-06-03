"use client";

/**
 * Tiny client signal: "has the user asked Future Me (the Career Twin) at least
 * one question for this career?" Used by the Clarity completion checklist,
 * which requires one Twin question. Per-career, device-local, with a DOM event
 * so the completion card updates live the moment a question is sent (the Twin
 * view and the card are mounted in the same document).
 *
 * Server `CareerTwinMessage` history remains the source of truth across
 * devices; the Twin view seeds this flag from that history on load.
 */

const PREFIX = "endeavrly:twin-asked";
export const TWIN_ASKED_EVENT = "endeavrly:twin-asked";

function key(careerId: string) {
  return `${PREFIX}:${careerId}`;
}

/** Record that the user has asked the Twin a question for this career. */
export function markTwinAsked(careerId: string | null | undefined): void {
  if (typeof window === "undefined" || !careerId) return;
  try {
    window.localStorage.setItem(key(careerId), "1");
  } catch {
    /* private tab — the event below still updates this session */
  }
  window.dispatchEvent(new CustomEvent(TWIN_ASKED_EVENT, { detail: { careerId } }));
}

/** Has the user already asked the Twin a question for this career (this device)? */
export function hasAskedTwin(careerId: string | null | undefined): boolean {
  if (typeof window === "undefined" || !careerId) return false;
  try {
    return window.localStorage.getItem(key(careerId)) === "1";
  } catch {
    return false;
  }
}
