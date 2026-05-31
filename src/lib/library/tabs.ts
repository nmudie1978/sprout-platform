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
