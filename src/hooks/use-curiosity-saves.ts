'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { SavedCuriosity } from '@/lib/my-journey/human-features-types';

const STORAGE_PREFIX = 'endeavrly-curiosity-saves';

/** Legacy unscoped key — used for one-time migration to per-user keys */
const LEGACY_KEY = 'endeavrly-curiosity-saves';

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

  // Load when userId becomes available
  useEffect(() => {
    loadedRef.current = false;
    const data = load(userId);
    setCuriosities(data);
    // Mark as loaded after state update — the next persist effect
    // will see loadedRef.current = true and write safely.
    if (userId) {
      // Use a microtask so the flag flips after React processes the state update
      Promise.resolve().then(() => { loadedRef.current = true; });
    }
  }, [userId]);

  // Persist — only after initial load completes
  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !loadedRef.current) return;
    localStorage.setItem(storageKey(userId), JSON.stringify(curiosities));
  }, [curiosities, userId]);

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
