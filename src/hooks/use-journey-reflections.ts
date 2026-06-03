"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ensureJourneyNotebooksHydrated,
  persistNotebook,
  JOURNEY_NOTEBOOKS_HYDRATED_EVENT,
} from "@/lib/journey/notebook-sync";

export type ReflectionLens = "discover" | "understand" | "clarity";

export interface ReflectionRecord {
  discover: string;
  understand: string;
  clarity: string;
  updatedAt: string | null;
}

const STORAGE_PREFIX = "endeavrly-journey-reflections";

const SYNC_EVENT = "endeavrly:journey-reflections-changed";

const EMPTY: ReflectionRecord = {
  discover: "",
  understand: "",
  clarity: "",
  updatedAt: null,
};

function storageKey(userId: string, careerSlug: string) {
  return `${STORAGE_PREFIX}:${userId}:${careerSlug}`;
}

function load(
  userId: string | undefined,
  careerSlug: string | null,
): ReflectionRecord {
  if (typeof window === "undefined" || !userId || !careerSlug) return EMPTY;
  try {
    const raw = localStorage.getItem(storageKey(userId, careerSlug));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        discover: typeof parsed?.discover === "string" ? parsed.discover : "",
        understand: typeof parsed?.understand === "string" ? parsed.understand : "",
        clarity: typeof parsed?.clarity === "string" ? parsed.clarity : "",
        updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : null,
      };
    }
    // One-shot migration from the legacy per-phase keys written by the
    // old `reflection-panel` component (`reflection-{slug}-{phase}`).
    const legacy: ReflectionRecord = {
      discover: localStorage.getItem(`reflection-${careerSlug}-discover`) ?? "",
      understand: localStorage.getItem(`reflection-${careerSlug}-understand`) ?? "",
      clarity: localStorage.getItem(`reflection-${careerSlug}-clarity`) ?? "",
      updatedAt: null,
    };
    if (legacy.discover || legacy.understand || legacy.clarity) {
      const record: ReflectionRecord = {
        ...legacy,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(storageKey(userId, careerSlug), JSON.stringify(record));
        // Remove the now-merged legacy keys so future writes are
        // single-source-of-truth via the new key.
        if (legacy.discover) localStorage.removeItem(`reflection-${careerSlug}-discover`);
        if (legacy.understand) localStorage.removeItem(`reflection-${careerSlug}-understand`);
        if (legacy.clarity) localStorage.removeItem(`reflection-${careerSlug}-clarity`);
      } catch {
        /* migration is best-effort */
      }
      return record;
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Per-career, per-lens reflections store — written by the
 * JourneyReflectionsTray on /my-journey. Keyed by user + career slug
 * so switching primary goal opens a fresh notebook for the new
 * career, and existing reflections don't bleed across careers.
 *
 * Persistence is localStorage (no DB). Cross-instance sync via a
 * custom DOM event so multiple mounts in the same document stay
 * coherent (e.g. if a future feature surfaces reflections elsewhere).
 */
export function useJourneyReflections(careerSlug: string | null) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [reflections, setReflections] = useState<ReflectionRecord>(EMPTY);
  const loadedRef = useRef(false);
  const externalUpdateRef = useRef(false);
  const serverWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWriteRef = useRef<
    { slug: string; snapshot: { discover: string; understand: string; clarity: string } } | null
  >(null);

  // Reload when the user or chosen career changes
  useEffect(() => {
    loadedRef.current = false;
    setReflections(load(userId, careerSlug));
    if (userId && careerSlug) {
      Promise.resolve().then(() => {
        loadedRef.current = true;
      });
    }
  }, [userId, careerSlug]);

  // One-time server reconciliation, then re-read the (now server-synced) cache.
  useEffect(() => {
    if (!userId) return;
    void ensureJourneyNotebooksHydrated(userId);
    const onHydrated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { userId?: string } | undefined;
      if (detail?.userId !== userId) return;
      externalUpdateRef.current = true;
      setReflections(load(userId, careerSlug));
    };
    window.addEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, onHydrated);
    return () => window.removeEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, onHydrated);
  }, [userId, careerSlug]);

  // Persist on change + broadcast
  useEffect(() => {
    if (typeof window === "undefined" || !userId || !careerSlug) return;
    if (!loadedRef.current) return;
    if (externalUpdateRef.current) {
      externalUpdateRef.current = false;
      return;
    }
    localStorage.setItem(
      storageKey(userId, careerSlug),
      JSON.stringify(reflections),
    );
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: { userId, careerSlug } }),
    );
    // Debounced best-effort server write (the tray fires updateLens per
    // keystroke; localStorage above is the immediate optimistic layer).
    if (serverWriteTimer.current) clearTimeout(serverWriteTimer.current);
    const slug = careerSlug;
    const snapshot = {
      discover: reflections.discover,
      understand: reflections.understand,
      clarity: reflections.clarity,
    };
    pendingWriteRef.current = { slug, snapshot };
    serverWriteTimer.current = setTimeout(() => {
      persistNotebook(slug, snapshot);
      pendingWriteRef.current = null;
    }, 800);
  }, [reflections, userId, careerSlug]);

  // Flush any pending server write on unmount so the last keystrokes aren't
  // lost (a fast navigate-away inside the debounce window would otherwise let
  // stale server data overwrite the local cache on the next hydration).
  useEffect(() => {
    return () => {
      if (serverWriteTimer.current) clearTimeout(serverWriteTimer.current);
      if (pendingWriteRef.current) {
        persistNotebook(pendingWriteRef.current.slug, pendingWriteRef.current.snapshot);
        pendingWriteRef.current = null;
      }
    };
  }, []);

  // Same-document sync
  useEffect(() => {
    if (!userId || !careerSlug) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { userId?: string; careerSlug?: string }
        | undefined;
      if (detail?.userId !== userId || detail?.careerSlug !== careerSlug) return;
      externalUpdateRef.current = true;
      setReflections(load(userId, careerSlug));
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, [userId, careerSlug]);

  // Cross-tab sync
  useEffect(() => {
    if (!userId || !careerSlug) return;
    const key = storageKey(userId, careerSlug);
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      externalUpdateRef.current = true;
      setReflections(load(userId, careerSlug));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [userId, careerSlug]);

  const updateLens = useCallback(
    (lens: ReflectionLens, text: string) => {
      setReflections((prev) => ({
        ...prev,
        [lens]: text,
        updatedAt: new Date().toISOString(),
      }));
    },
    [],
  );

  const clearLens = useCallback((lens: ReflectionLens) => {
    setReflections((prev) => ({
      ...prev,
      [lens]: "",
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return {
    reflections,
    updateLens,
    clearLens,
    /** True if the current career has any reflection text in any lens. */
    hasAny:
      reflections.discover.trim().length > 0 ||
      reflections.understand.trim().length > 0 ||
      reflections.clarity.trim().length > 0,
    /** True iff a careerSlug is provided and the user is signed in. */
    enabled: Boolean(userId && careerSlug),
  };
}
