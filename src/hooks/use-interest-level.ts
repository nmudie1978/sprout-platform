"use client";

/**
 * Device-local Interest Level for a single career ("possible future").
 *
 * Persistence is localStorage, keyed by user + careerId — the same
 * privacy-first, no-DB pattern as saved careers and journey reflections.
 * On first read it falls back to the legacy `confidence-tracker-{careerId}`
 * store so existing users keep whatever they'd already rated.
 *
 * A custom DOM event keeps every mount in the same document coherent, so
 * rating a career in the detail sheet immediately updates the dashboard
 * list, My Library and the My Journey header without a refresh.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  type InterestLevel,
  interestLevelStorageKey,
  readInterestLevel,
  readAllInterestLevels,
} from "@/lib/interest-level/types";

const SYNC_EVENT = "endeavrly:interest-level-changed";

export function useInterestLevel(careerId: string | null | undefined) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [level, setLevelState] = useState<InterestLevel | null>(null);
  const externalUpdateRef = useRef(false);

  const load = useCallback(() => {
    if (typeof window === "undefined" || !userId || !careerId) return null;
    return readInterestLevel(userId, careerId, window.localStorage);
  }, [userId, careerId]);

  // Load whenever the user or career changes.
  useEffect(() => {
    setLevelState(load());
  }, [load]);

  // Same-document sync (another mount changed this career's level).
  useEffect(() => {
    if (!userId || !careerId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { userId?: string; careerId?: string }
        | undefined;
      if (detail?.userId !== userId || detail?.careerId !== careerId) return;
      externalUpdateRef.current = true;
      setLevelState(load());
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, [userId, careerId, load]);

  // Cross-tab sync.
  useEffect(() => {
    if (!userId || !careerId) return;
    const key = interestLevelStorageKey(userId, careerId);
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      externalUpdateRef.current = true;
      setLevelState(load());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [userId, careerId, load]);

  const setLevel = useCallback(
    (next: InterestLevel) => {
      if (typeof window === "undefined" || !userId || !careerId) return;
      setLevelState(next);
      try {
        window.localStorage.setItem(
          interestLevelStorageKey(userId, careerId),
          JSON.stringify({ level: next, updatedAt: new Date().toISOString() }),
        );
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { userId, careerId } }));
      } catch {
        /* private tab — keep the in-memory value */
      }
    },
    [userId, careerId],
  );

  return {
    level,
    setLevel,
    /** True iff a careerId is provided and the user is signed in. */
    enabled: Boolean(userId && careerId),
  };
}

/**
 * Read-only map of every careerId → Interest Level for the current user,
 * for list surfaces (My Library, dashboard) that render many careers. Keeps
 * itself fresh when a level changes elsewhere in the document.
 */
export function useAllInterestLevels(): Record<string, InterestLevel> {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [levels, setLevels] = useState<Record<string, InterestLevel>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !userId) {
      setLevels({});
      return;
    }
    const read = () => setLevels(readAllInterestLevels(userId, window.localStorage));
    read();
    const onChange = () => read();
    window.addEventListener(SYNC_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SYNC_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [userId]);

  return levels;
}
