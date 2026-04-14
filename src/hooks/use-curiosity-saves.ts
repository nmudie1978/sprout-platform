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

export function useCuriositySaves() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [curiosities, setCuriosities] = useState<SavedCuriosity[]>([]);
  const loadedRef = useRef(false);
  // When a sync event tells us to reload from storage we don't want the
  // resulting state change to fire ANOTHER sync event — that would loop.
  const externalUpdateRef = useRef(false);

  // Load when userId becomes available
  useEffect(() => {
    loadedRef.current = false;
    const data = load(userId);
    setCuriosities(data);
    if (userId) {
      // Use a microtask so the flag flips after React processes the state update
      Promise.resolve().then(() => { loadedRef.current = true; });
    }
  }, [userId]);

  // Persist on change — and broadcast so peer instances refresh.
  // Skips the broadcast when the change came from a peer (to break the loop).
  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !loadedRef.current) return;
    if (externalUpdateRef.current) {
      externalUpdateRef.current = false;
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
    },
    []
  );

  const removeCuriosity = useCallback((careerId: string) => {
    setCuriosities((prev) => prev.filter((c) => c.careerId !== careerId));
  }, []);

  const updateNote = useCallback((careerId: string, note: string) => {
    setCuriosities((prev) =>
      prev.map((c) => (c.careerId === careerId ? { ...c, note } : c))
    );
  }, []);

  const isSaved = useCallback(
    (careerId: string) => curiosities.some((c) => c.careerId === careerId),
    [curiosities]
  );

  return { curiosities, saveCuriosity, removeCuriosity, updateNote, isSaved };
}
