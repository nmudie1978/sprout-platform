'use client';

/**
 * useCompareShortlist — local React state for the Compare Careers feature.
 *
 * - Max 3 careers, enforced at toggle time
 * - Temporary (not persisted) — closing the page clears it
 * - Toast feedback when the user hits the limit
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { Career } from '@/lib/career-pathways';

const MAX_COMPARE = 3;

export function useCompareShortlist() {
  const [shortlist, setShortlist] = useState<Career[]>([]);

  const isInShortlist = useCallback(
    (id: string) => shortlist.some((c) => c.id === id),
    [shortlist],
  );

  const toggle = useCallback(
    (career: Career) => {
      setShortlist((prev) => {
        const exists = prev.some((c) => c.id === career.id);
        if (exists) {
          return prev.filter((c) => c.id !== career.id);
        }
        if (prev.length >= MAX_COMPARE) {
          toast.info(`You can compare up to ${MAX_COMPARE} at a time`, {
            description: 'Remove one to add another.',
          });
          return prev;
        }
        return [...prev, career];
      });
    },
    [],
  );

  const clear = useCallback(() => setShortlist([]), []);

  const remove = useCallback((id: string) => {
    setShortlist((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /** Replace the entire shortlist (used to load saved comparisons). */
  const loadSet = useCallback((careers: Career[]) => {
    setShortlist(careers.slice(0, MAX_COMPARE));
  }, []);

  return {
    shortlist,
    toggle,
    isInShortlist,
    clear,
    remove,
    loadSet,
    max: MAX_COMPARE,
  };
}
