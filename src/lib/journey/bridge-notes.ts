/**
 * Bridge-notes — a user's personal comments on the Career Transition Map
 * branches.
 *
 * The mindmap branches are generic (the same ids — anchor, proof, network,
 * workplace-nav, training, tried, reality, related — for every career), so a
 * user's notes are ONE set keyed by branch id, shared across all careers, and
 * persisted per-user in youthProfile.journeySummary.bridgeNotes.
 *
 * These pure helpers sanitise + merge note edits; the API route and the UI
 * both go through them so the rules stay in one place.
 */

export type BridgeNotes = Record<string, string>;

export const MAX_NOTE_LEN = 500;
export const MAX_NOTES = 24;

/** Normalise a branch id to the safe `[a-z0-9-]` shape used as a map key. */
export function sanitizeBranchId(id: unknown): string | null {
  if (typeof id !== "string") return null;
  const s = id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48);
  return s.length > 0 ? s : null;
}

/** Trim + cap a note. Returns "" for a cleared/blank note. */
export function sanitizeNote(note: unknown): string {
  if (typeof note !== "string") return "";
  return note.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE_LEN);
}

/**
 * Apply one branch-note edit to the existing map. An empty note deletes the
 * key. New keys are ignored once MAX_NOTES distinct branches already carry a
 * note (editing an existing note always works).
 */
export function applyBranchNote(
  existing: BridgeNotes | null | undefined,
  rawId: unknown,
  rawNote: unknown,
): BridgeNotes {
  const next: BridgeNotes = { ...(existing ?? {}) };
  const id = sanitizeBranchId(rawId);
  if (!id) return next;
  const note = sanitizeNote(rawNote);
  if (!note) {
    delete next[id];
    return next;
  }
  if (!(id in next) && Object.keys(next).length >= MAX_NOTES) return next;
  next[id] = note;
  return next;
}

/** Coerce stored JSON into a clean BridgeNotes map (defensive on read). */
export function readBridgeNotes(raw: unknown): BridgeNotes {
  if (!raw || typeof raw !== "object") return {};
  const out: BridgeNotes = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = sanitizeBranchId(k);
    const note = sanitizeNote(v);
    if (id && note) out[id] = note;
  }
  return out;
}
