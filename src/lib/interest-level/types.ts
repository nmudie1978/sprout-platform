/**
 * Interest Level — how strongly a young person feels a career (a "possible
 * future") resonates with them. A calm 1–5 scale that replaces the old
 * "confidence" metric as the headline way to track careers.
 *
 * Pure module (no React / DOM) so it can be unit-tested in isolation and
 * reused by the device-local hook, dashboard, library and journey surfaces.
 *
 * Persistence is DEVICE-LOCAL (localStorage), per user + career — the same
 * privacy-first pattern as saved careers, reflections and lens progress.
 * Nothing here writes to the server, so existing goal data can't break.
 */

export type InterestLevel = 1 | 2 | 3 | 4 | 5;

export interface InterestLevelMeta {
  level: InterestLevel;
  /** Short brand label shown to the user. */
  label: string;
  /** One-line helper for pickers / tooltips. */
  hint: string;
}

/** The five levels, lowest → highest. Brand language, kept in English here
 *  (mirrors how Career Twin mode labels live in the lib); the picker prompt
 *  and the "Interest level" heading are localised via the `interest` i18n
 *  namespace. */
export const INTEREST_LEVELS: readonly InterestLevelMeta[] = [
  { level: 1, label: "Curious", hint: "Just starting to wonder about this one." },
  { level: 2, label: "Interested", hint: "Worth a proper look." },
  { level: 3, label: "Excited", hint: "This is pulling at me." },
  { level: 4, label: "Very Interested", hint: "I keep coming back to this." },
  { level: 5, label: "This Feels Right", hint: "This feels like a real possible future." },
] as const;

const META_BY_LEVEL = new Map<InterestLevel, InterestLevelMeta>(
  INTEREST_LEVELS.map((m) => [m.level, m]),
);

export function isInterestLevel(n: unknown): n is InterestLevel {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

/** Coerce an arbitrary number to a valid InterestLevel, or null if unusable. */
export function clampInterestLevel(n: unknown): InterestLevel | null {
  const num = typeof n === "number" ? Math.round(n) : NaN;
  if (Number.isNaN(num)) return null;
  if (num < 1) return 1;
  if (num > 5) return 5;
  return num as InterestLevel;
}

export function interestLevelMeta(level: InterestLevel): InterestLevelMeta {
  return META_BY_LEVEL.get(level)!;
}

export function interestLevelLabel(level: InterestLevel | null | undefined): string {
  if (!level || !isInterestLevel(level)) return "";
  return META_BY_LEVEL.get(level)!.label;
}

/** Legacy goal `confidence` (low|medium|high) → Interest Level, for a safe,
 *  non-destructive migration of existing goal data. */
export function confidenceToInterestLevel(
  confidence: string | null | undefined,
): InterestLevel {
  switch (confidence) {
    case "low":
      return 2; // Interested
    case "high":
      return 4; // Very Interested
    case "medium":
    default:
      return 3; // Excited
  }
}

// ── Device-local storage (pure read helpers) ─────────────────────────────

/** Must match the key built in src/hooks/use-interest-level.ts. */
export const INTEREST_LEVEL_PREFIX = "endeavrly-interest-level";

export function interestLevelStorageKey(userId: string, careerId: string): string {
  return `${INTEREST_LEVEL_PREFIX}:${userId}:${careerId}`;
}

interface StoredInterestLevel {
  level: InterestLevel;
  updatedAt: string | null;
}

function parseStored(raw: string | null): StoredInterestLevel | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { level?: unknown; updatedAt?: unknown };
    const level = clampInterestLevel(parsed?.level);
    if (!level) return null;
    return {
      level,
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return null;
  }
}

/** Latest score from the legacy `confidence-tracker-{careerId}` store, if any
 *  — so a user who rated a career before this feature keeps their value. */
export function readLegacyConfidenceTracker(
  careerId: string,
  storage: Pick<Storage, "getItem">,
): InterestLevel | null {
  try {
    const raw = storage.getItem(`confidence-tracker-${careerId}`);
    if (!raw) return null;
    const entries = JSON.parse(raw) as Array<{ score?: unknown }>;
    if (!Array.isArray(entries) || entries.length === 0) return null;
    return clampInterestLevel(entries[entries.length - 1]?.score);
  } catch {
    return null;
  }
}

/** Read the saved Interest Level for one career (falling back to the legacy
 *  confidence-tracker store). Pure: takes a Storage-like object. */
export function readInterestLevel(
  userId: string,
  careerId: string,
  storage: Pick<Storage, "getItem">,
): InterestLevel | null {
  if (!userId || !careerId) return null;
  const current = parseStored(storage.getItem(interestLevelStorageKey(userId, careerId)));
  if (current) return current.level;
  return readLegacyConfidenceTracker(careerId, storage);
}

/** Read every saved Interest Level for a user, keyed by careerId — for list
 *  surfaces (My Library, dashboard) that render many careers at once. */
export function readAllInterestLevels(
  userId: string,
  storage: Pick<Storage, "length" | "key" | "getItem">,
): Record<string, InterestLevel> {
  const out: Record<string, InterestLevel> = {};
  if (!userId) return out;
  const prefix = `${INTEREST_LEVEL_PREFIX}:${userId}:`;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const careerId = key.slice(prefix.length);
    if (!careerId) continue;
    const stored = parseStored(storage.getItem(key));
    if (stored) out[careerId] = stored.level;
  }
  return out;
}
