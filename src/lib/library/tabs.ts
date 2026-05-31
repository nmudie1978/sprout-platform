/**
 * My Library — pure tab helpers.
 *
 * Kept free of React / DOM so they can be unit-tested in isolation and
 * reused by both the /library page and the dashboard reflections preview.
 */
import type { ReflectionData } from "@/lib/journey/reflections-service";

export type LibraryTab = "saved" | "compared" | "reflections";

export interface LibraryTabDef {
  key: LibraryTab;
  label: string;
}

export const LIBRARY_TABS: readonly LibraryTabDef[] = [
  { key: "saved", label: "Saved careers" },
  { key: "compared", label: "Compared" },
  { key: "reflections", label: "Reflections" },
] as const;

const KNOWN = new Set<LibraryTab>(["saved", "compared", "reflections"]);

/** Resolve the active tab from a `?tab=` query value, defaulting to "saved". */
export function resolveLibraryTab(param: string | null | undefined): LibraryTab {
  const v = (param ?? "").toLowerCase() as LibraryTab;
  return KNOWN.has(v) ? v : "saved";
}

/** Keep only reflections the user actually answered (non-skipped, non-empty response). */
export function filterAnsweredReflections(reflections: ReflectionData[]): ReflectionData[] {
  return reflections.filter(
    (r) => !r.skipped && !!r.response && r.response.trim().length > 0
  );
}

// ── Device-local My Journey reflections ──────────────────────────────────
// The JourneyReflectionsTray persists reflections to localStorage (not the
// server), so My Library reads them straight from the device — same pattern
// as the Saved/Compared tabs.

export type ReflectionLens = "discover" | "understand" | "clarity";

export interface LocalReflectionEntry {
  /** Stable key for React lists: `${careerSlug}:${lens}`. */
  id: string;
  careerSlug: string;
  lens: ReflectionLens;
  lensLabel: string;
  text: string;
  updatedAt: string | null;
}

/** Must match STORAGE_PREFIX in src/hooks/use-journey-reflections.ts. */
const JOURNEY_REFLECTIONS_PREFIX = "endeavrly-journey-reflections";

const LENS_ORDER: readonly ReflectionLens[] = ["discover", "understand", "clarity"] as const;
const LENS_LABEL: Record<ReflectionLens, string> = {
  discover: "Discover",
  understand: "Understand",
  clarity: "Clarity",
};

/**
 * Read the user's My Journey reflections from device storage (where the
 * JourneyReflectionsTray writes them) and flatten to one entry per
 * non-empty lens, newest first. Pure — takes a Storage-like object so it
 * can be unit-tested without a DOM.
 */
export function readLocalJourneyReflections(
  userId: string,
  storage: Pick<Storage, "length" | "key" | "getItem">,
): LocalReflectionEntry[] {
  if (!userId) return [];
  const prefix = `${JOURNEY_REFLECTIONS_PREFIX}:${userId}:`;
  const entries: LocalReflectionEntry[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const careerSlug = key.slice(prefix.length);
    if (!careerSlug) continue;

    let parsed: Record<string, unknown>;
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }

    const updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : null;
    for (const lens of LENS_ORDER) {
      const value = parsed[lens];
      if (typeof value !== "string" || value.trim().length === 0) continue;
      entries.push({
        id: `${careerSlug}:${lens}`,
        careerSlug,
        lens,
        lensLabel: LENS_LABEL[lens],
        text: value,
        updatedAt,
      });
    }
  }

  // Newest first; entries without a timestamp sort last.
  return entries.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}
