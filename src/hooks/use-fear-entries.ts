'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FearEntry } from '@/lib/my-journey/human-features-types';

const STORAGE_KEY = 'sprout-fear-entries';

function load(): FearEntry[] {
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

export function useFearEntries() {
  const [entries, setEntries] = useState<FearEntry[]>(() => load());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  const addEntry = useCallback((text: string) => {
    setEntries((prev) => [
      { id: crypto.randomUUID(), createdAt: new Date().toISOString(), text },
      ...prev,
    ]);
  }, []);

  const updateEntry = useCallback((id: string, text: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, text } : e)));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry };
}
