/**
 * Compare Shortlist store — the single source of truth for the "Add to compare"
 * shortlist, shared across every surface and persisted per user.
 *
 * Why a module store (not React state): the shortlist must persist as the user
 * roams the whole site and survive refresh ("save 3 over time"), and several
 * components read it at once (the radar, the global CompareHost). A tiny
 * external store + `useSyncExternalStore` keeps them all in sync without a
 * provider, and localStorage gives the persistence — the same privacy-first,
 * device-local pattern as Interest Level.
 *
 * Max 3 careers. No server/DB involvement.
 */

import type { Career } from "@/lib/career-pathways";

export const COMPARE_MAX = 3;

const STORAGE_PREFIX = "endeavrly:compare-shortlist";

export type AddResult = "added" | "duplicate" | "full";

/**
 * Pure up-crossing detector for the "you now have 3 — compare?" nudge.
 *
 * Fires ONLY on a genuine single-step add that lands on the max (max-1 → max).
 * Deliberately NOT `prev < max` — a bulk jump like 0 → max happens when the
 * persisted shortlist hydrates from localStorage on page load (or loadSet
 * replaces the whole set), and must NOT be read as "the user just added the
 * third", which previously made the prompt fire randomly on refresh.
 */
export function shouldPromptForCompare(prev: number, next: number, max: number): boolean {
  return prev === max - 1 && next === max;
}

function storageKey(userKey: string): string {
  return `${STORAGE_PREFIX}:${userKey}`;
}

/** Keep only the fields we rely on when re-reading from storage. */
function isCareerLike(x: unknown): x is Career {
  return !!x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string";
}

function createStore() {
  let userKey = "guest";
  let careers: Career[] = []; // current snapshot — replaced (never mutated) on change
  const listeners = new Set<() => void>();
  let storageBound = false;

  function read(): Career[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey(userKey));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isCareerLike).slice(0, COMPARE_MAX);
    } catch {
      return [];
    }
  }

  function persist(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(userKey), JSON.stringify(careers));
    } catch {
      /* private tab / quota — in-memory snapshot still stands */
    }
  }

  function emit(): void {
    listeners.forEach((l) => l());
  }

  /** Replace the snapshot, persist, notify. */
  function commit(next: Career[]): void {
    careers = next;
    persist();
    emit();
  }

  function bindStorageEvent(): void {
    if (storageBound || typeof window === "undefined") return;
    storageBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== storageKey(userKey)) return;
      careers = read();
      emit();
    });
  }

  return {
    MAX: COMPARE_MAX,

    subscribe(cb: () => void): () => void {
      bindStorageEvent();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    /** Stable reference until a mutation — required by useSyncExternalStore. */
    getSnapshot(): Career[] {
      return careers;
    },

    /** SSR snapshot — always empty (localStorage is client-only). */
    getServerSnapshot(): Career[] {
      return EMPTY;
    },

    /** Point the store at a user; reloads that user's persisted shortlist. */
    setUser(uid: string | null | undefined): void {
      const next = uid || "guest";
      if (next === userKey && careers.length) return;
      userKey = next;
      careers = read();
      emit();
    },

    isInShortlist(id: string): boolean {
      return careers.some((c) => c.id === id);
    },

    add(career: Career): AddResult {
      if (careers.some((c) => c.id === career.id)) return "duplicate";
      if (careers.length >= COMPARE_MAX) return "full";
      commit([...careers, career]);
      return "added";
    },

    remove(id: string): void {
      if (!careers.some((c) => c.id === id)) return;
      commit(careers.filter((c) => c.id !== id));
    },

    toggle(career: Career): void {
      if (careers.some((c) => c.id === career.id)) {
        commit(careers.filter((c) => c.id !== career.id));
      } else if (careers.length < COMPARE_MAX) {
        commit([...careers, career]);
      }
    },

    clear(): void {
      if (careers.length === 0) return;
      commit([]);
    },

    loadSet(next: Career[]): void {
      commit(next.slice(0, COMPARE_MAX));
    },
  };
}

const EMPTY: Career[] = [];

export const compareShortlistStore = createStore();
