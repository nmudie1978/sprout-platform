'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReflectionEntry } from '@/lib/my-journey/reflection-types';

const STORAGE_KEY = 'sprout-self-reflections';

function loadReflections(): ReflectionEntry[] {
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

export function useSelfReflection() {
  const [reflections, setReflections] = useState<ReflectionEntry[]>(() => loadReflections());

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
    }
  }, [reflections]);

  const createReflection = useCallback((entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) => {
    const newEntry: ReflectionEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReflections((prev) => [newEntry, ...prev]);
  }, []);

  const deleteReflection = useCallback((id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Already sorted by createdAt desc (newest first via prepend)
  return { reflections, createReflection, deleteReflection };
}
