'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SavedCuriosity } from '@/lib/my-journey/human-features-types';

const STORAGE_KEY = 'sprout-curiosity-saves';

function load(): SavedCuriosity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCuriositySaves() {
  const [curiosities, setCuriosities] = useState<SavedCuriosity[]>(() => load());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(curiosities));
    }
  }, [curiosities]);

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
