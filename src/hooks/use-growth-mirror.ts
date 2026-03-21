'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GrowthSnapshot } from '@/lib/my-journey/human-features-types';

const STORAGE_KEY = 'sprout-growth-snapshots';

function load(): GrowthSnapshot[] {
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

function isSameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function useGrowthMirror() {
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>(() => load());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    }
  }, [snapshots]);

  const todaySnapshot = snapshots.find((s) =>
    isSameDay(s.createdAt, new Date().toISOString())
  );

  const saveSnapshot = useCallback(
    (data: { traits?: string[]; highlights?: string[] }) => {
      setSnapshots((prev) => {
        const now = new Date().toISOString();
        const existingIdx = prev.findIndex((s) => isSameDay(s.createdAt, now));
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...data, createdAt: now };
          return updated;
        }
        return [{ id: crypto.randomUUID(), createdAt: now, ...data }, ...prev];
      });
    },
    []
  );

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { snapshots, todaySnapshot, saveSnapshot, deleteSnapshot };
}
