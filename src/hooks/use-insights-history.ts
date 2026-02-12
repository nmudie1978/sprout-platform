'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InsightHistoryEntry } from '@/lib/insights/pool-types';

const STORAGE_KEY = 'sprout-insights-history';
const MAX_AGE_DAYS = 90;
const DEFAULT_EXCLUDE_WINDOW_DAYS = 30;

function load(): InsightHistoryEntry[] {
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

/** Remove entries older than MAX_AGE_DAYS */
function prune(entries: InsightHistoryEntry[]): InsightHistoryEntry[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return entries.filter((e) => new Date(e.shownAt).getTime() > cutoff);
}

export function useInsightsHistory() {
  const [history, setHistory] = useState<InsightHistoryEntry[]>(() => prune(load()));

  // Sync to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  /** Record a batch of content IDs as shown */
  const recordShown = useCallback((contentIds: string[]) => {
    const now = new Date().toISOString();
    setHistory((prev) => {
      const newEntries: InsightHistoryEntry[] = contentIds.map((id) => ({
        contentId: id,
        shownAt: now,
      }));
      return [...newEntries, ...prev];
    });
  }, []);

  /** Get IDs shown within the given window (default 30 days) */
  const getExcludeIds = useCallback(
    (withinDays: number = DEFAULT_EXCLUDE_WINDOW_DAYS): string[] => {
      const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
      return history
        .filter((e) => new Date(e.shownAt).getTime() > cutoff)
        .map((e) => e.contentId);
    },
    [history],
  );

  /** Privacy: user can wipe all history */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, recordShown, getExcludeIds, clearHistory };
}
