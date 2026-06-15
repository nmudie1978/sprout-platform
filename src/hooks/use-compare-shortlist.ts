'use client';

/**
 * useCompareShortlist — React access to the shared, persistent Compare
 * shortlist (see src/lib/compare/shortlist-store.ts).
 *
 * - Max 3 careers, enforced by the store
 * - Persisted per user in localStorage and shared across every surface, so a
 *   shortlist built from the career modal survives navigation and refresh
 * - API preserved from the original in-memory version (shortlist, toggle,
 *   isInShortlist, clear, remove, loadSet, max) so existing consumers (the
 *   Career Radar) keep working unchanged; `add` is new for event-driven callers
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import type { Career } from '@/lib/career-pathways';
import { compareShortlistStore, type AddResult } from '@/lib/compare/shortlist-store';

export function useCompareShortlist() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Point the store at the current user so it loads their persisted shortlist.
  useEffect(() => {
    compareShortlistStore.setUser(userId);
  }, [userId]);

  const shortlist = useSyncExternalStore(
    compareShortlistStore.subscribe,
    compareShortlistStore.getSnapshot,
    compareShortlistStore.getServerSnapshot,
  );

  const isInShortlist = useCallback(
    (id: string) => shortlist.some((c) => c.id === id),
    [shortlist],
  );

  /** Add without toggling. Returns the outcome so callers can give feedback. */
  const add = useCallback((career: Career): AddResult => compareShortlistStore.add(career), []);

  const toggle = useCallback((career: Career) => {
    if (compareShortlistStore.isInShortlist(career.id)) {
      compareShortlistStore.remove(career.id);
      return;
    }
    const result = compareShortlistStore.add(career);
    if (result === 'full') {
      toast({
        title: `You can compare up to ${compareShortlistStore.MAX} at a time`,
        description: 'Remove one to add another.',
      });
    }
  }, []);

  const clear = useCallback(() => compareShortlistStore.clear(), []);
  const remove = useCallback((id: string) => compareShortlistStore.remove(id), []);
  const loadSet = useCallback((careers: Career[]) => compareShortlistStore.loadSet(careers), []);

  return useMemo(
    () => ({
      shortlist,
      toggle,
      add,
      isInShortlist,
      clear,
      remove,
      loadSet,
      max: compareShortlistStore.MAX,
    }),
    [shortlist, toggle, add, isInShortlist, clear, remove, loadSet],
  );
}
