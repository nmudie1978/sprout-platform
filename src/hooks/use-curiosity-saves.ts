'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { SavedCuriosity } from '@/lib/my-journey/human-features-types';

const STORAGE_PREFIX = 'endeavrly-curiosity-saves';

/** Legacy unscoped key — used for one-time migration to per-user keys */
const LEGACY_KEY = 'endeavrly-curiosity-saves';

/** Custom DOM event fired whenever any hook instance writes to the
 *  store. Other instances mounted in the same document listen for it
 *  and reload, so the dashboard stays in sync with edits made on the
 *  Career Radar tray (and vice versa) without a page refresh. */
const SYNC_EVENT = 'endeavrly:curiosity-saves-changed';

const API = '/api/saved-careers';

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function load(userId: string | undefined): SavedCuriosity[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    // Migrate legacy unscoped data once
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    const userKey = storageKey(userId);
    if (legacyRaw && !localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, legacyRaw);
      localStorage.removeItem(LEGACY_KEY);
    } else if (legacyRaw && localStorage.getItem(userKey)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    const raw = localStorage.getItem(userKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Server-authoritative saved careers, with localStorage as an offline /
 * optimistic cache. On first authenticated mount we GET the server list; if
 * the server is empty but localStorage has saves we back them up (PUT), then
 * treat the server as the source of truth. Mutations update local state
 * optimistically (so the UI is instant and peer instances/tabs stay in sync
 * via the cache) and fire a best-effort network write.
 */
export function useCuriositySaves() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [curiosities, setCuriosities] = useState<SavedCuriosity[]>([]);
  const loadedRef = useRef(false);
  // When a sync event tells us to reload from storage we don't want the
  // resulting state change to fire ANOTHER sync event — that would loop.
  const externalUpdateRef = useRef(false);
  // Guard so the one-time server hydration/backfill runs once per userId.
  const hydratedRef = useRef<string | undefined>(undefined);

  // Load from cache immediately when userId becomes available.
  useEffect(() => {
    loadedRef.current = false;
    const data = load(userId);
    setCuriosities(data);
    if (userId) {
      // Use a microtask so the flag flips after React processes the state update
      Promise.resolve().then(() => { loadedRef.current = true; });
    }
  }, [userId]);

  // One-time server hydration: GET the authoritative list. If the server is
  // empty but we have local saves, back them up first (PUT), then adopt the
  // server result. Runs once per userId; the cache render above covers the
  // gap before this resolves.
  useEffect(() => {
    if (!userId || hydratedRef.current === userId) return;
    hydratedRef.current = userId;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(API, { credentials: 'same-origin' });
        if (!res.ok) return; // keep cache; best-effort
        const json = await res.json();
        let careers: SavedCuriosity[] = Array.isArray(json?.careers) ? json.careers : [];

        const local = load(userId);
        if (careers.length === 0 && local.length > 0) {
          // Backfill localStorage → server, then adopt the server result.
          const put = await fetch(API, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: local }),
          });
          if (put.ok) {
            const pj = await put.json();
            if (Array.isArray(pj?.careers)) careers = pj.careers;
          }
        }

        if (cancelled) return;
        // Adopt server as source of truth (also refreshes the cache via the
        // persist effect below). Mark external so this doesn't loop-broadcast.
        externalUpdateRef.current = true;
        setCuriosities(careers);
      } catch {
        // Offline / network error → keep the localStorage cache.
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Persist to cache on change — and broadcast so peer instances refresh.
  // Skips the broadcast when the change came from a peer (to break the loop).
  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !loadedRef.current) return;
    if (externalUpdateRef.current) {
      externalUpdateRef.current = false;
      // still refresh the cache so other tabs see the server-authoritative list
      localStorage.setItem(storageKey(userId), JSON.stringify(curiosities));
      return;
    }
    localStorage.setItem(storageKey(userId), JSON.stringify(curiosities));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { userId } }));
  }, [curiosities, userId]);

  // Same-document sync: another component called save/remove → reload.
  useEffect(() => {
    if (!userId) return;
    const handler = (e: Event) => {
      const detailUserId = (e as CustomEvent).detail?.userId;
      if (detailUserId !== userId) return;
      externalUpdateRef.current = true;
      setCuriosities(load(userId));
    };
    window.addEventListener(SYNC_EVENT, handler);
    return () => window.removeEventListener(SYNC_EVENT, handler);
  }, [userId]);

  // Cross-tab sync: localStorage `storage` events fire in OTHER tabs.
  useEffect(() => {
    if (!userId) return;
    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey(userId)) return;
      externalUpdateRef.current = true;
      setCuriosities(load(userId));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [userId]);

  const saveCuriosity = useCallback(
    (careerId: string, careerTitle: string, careerEmoji: string) => {
      setCuriosities((prev) => {
        if (prev.some((c) => c.careerId === careerId)) return prev;
        return [{ careerId, careerTitle, careerEmoji, savedAt: new Date().toISOString() }, ...prev];
      });
      // Best-effort server write (idempotent upsert on [profileId, careerId]).
      fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, careerTitle, careerEmoji }),
      }).catch(() => {});
    },
    []
  );

  const removeCuriosity = useCallback((careerId: string) => {
    setCuriosities((prev) => prev.filter((c) => c.careerId !== careerId));
    fetch(`${API}?careerId=${encodeURIComponent(careerId)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    }).catch(() => {});
  }, []);

  const updateNote = useCallback((careerId: string, note: string) => {
    let title = '';
    let emoji = '';
    setCuriosities((prev) =>
      prev.map((c) => {
        if (c.careerId !== careerId) return c;
        title = c.careerTitle;
        emoji = c.careerEmoji;
        return { ...c, note };
      })
    );
    // Upsert with the note (POST is an upsert; updates note on existing row).
    if (title) {
      fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, careerTitle: title, careerEmoji: emoji, note }),
      }).catch(() => {});
    }
  }, []);

  const isSaved = useCallback(
    (careerId: string) => curiosities.some((c) => c.careerId === careerId),
    [curiosities]
  );

  return { curiosities, saveCuriosity, removeCuriosity, updateNote, isSaved };
}
