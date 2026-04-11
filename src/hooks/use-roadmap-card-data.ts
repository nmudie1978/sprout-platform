'use client';

import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'roadmap-card-data';

// Foundation ("my-foundation") is PROFILE-level data persisted via
// /api/journey/foundation-data — it survives career changes. It must
// NEVER be written to per-goal records or read back from them, because
// a stale per-goal copy will clobber the fresh profile-level value when
// the user switches careers. This constant is mirrored in
// src/components/journey/renderers/zigzag-renderer.tsx; kept duplicated
// here to avoid a cross-component import dependency from the hook.
const FOUNDATION_ITEM_ID = 'my-foundation';

// Strip the foundation slot from a card-data map so per-goal reads and
// writes can never touch profile-level foundation state.
function stripFoundation<T extends Record<string, unknown>>(data: T): T {
  if (!(FOUNDATION_ITEM_ID in data)) return data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [FOUNDATION_ITEM_ID]: _foundation, ...rest } = data;
  return rest as T;
}

interface CardData {
  status: string;
  notes: string;
  resourceLink: string;
  confidence: string;
}

/**
 * Hook that manages roadmap card data with localStorage for instant UX
 * and background DB sync for persistence across devices.
 *
 * Foundation data is deliberately excluded from this hook's read/write
 * path — it lives at profile scope under a separate endpoint
 * (/api/journey/foundation-data) and is managed by
 * personal-career-timeline.tsx directly.
 */
export function useRoadmapCardData(goalId: string | undefined) {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from DB on mount and populate localStorage
  useEffect(() => {
    if (!goalId) return;

    fetch(`/api/journey/goal-data?goalId=${goalId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.goalData?.roadmapCardData) {
          // Merge DB data into localStorage (DB is source of truth for
          // per-goal slots) — but strip any foundation entry first, so
          // stale per-goal foundation snapshots can never overwrite the
          // fresh profile-level foundation value written by
          // personal-career-timeline.tsx.
          const remoteCards = stripFoundation(
            data.goalData.roadmapCardData as Record<string, unknown>,
          );
          try {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const merged = { ...local, ...remoteCards };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCards));
          }
        }
      })
      .catch(() => {
        // Silently fail — localStorage still works
      });
  }, [goalId]);

  // Sync localStorage to DB (debounced)
  const syncToDb = useCallback(() => {
    if (!goalId) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      try {
        const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        // Strip foundation before sending — foundation is profile-level,
        // not goal-level, and must not leak into per-goal DB records.
        const payload = stripFoundation(allData as Record<string, unknown>);
        fetch('/api/journey/goal-data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalId, roadmapCardData: payload }),
        }).catch(() => {
          // Silent fail
        });
      } catch {
        // Silent fail
      }
    }, 2000); // 2 second debounce
  }, [goalId]);

  const saveCard = useCallback((itemId: string, data: CardData) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      all[itemId] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Silent fail
    }
    syncToDb();
  }, [syncToDb]);

  const loadCard = useCallback((itemId: string): CardData => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return all[itemId] || { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
    } catch {
      return { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
    }
  }, []);

  const getCardStatus = useCallback((itemId: string): string => {
    return loadCard(itemId).status;
  }, [loadCard]);

  return { saveCard, loadCard, getCardStatus, syncToDb };
}
