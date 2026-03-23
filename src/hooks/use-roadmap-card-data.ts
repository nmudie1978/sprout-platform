'use client';

import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'roadmap-card-data';

interface CardData {
  status: string;
  notes: string;
  resourceLink: string;
  confidence: string;
}

/**
 * Hook that manages roadmap card data with localStorage for instant UX
 * and background DB sync for persistence across devices.
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
          // Merge DB data into localStorage (DB is source of truth)
          try {
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const merged = { ...local, ...data.goalData.roadmapCardData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.goalData.roadmapCardData));
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
        fetch('/api/journey/goal-data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalId, roadmapCardData: allData }),
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
