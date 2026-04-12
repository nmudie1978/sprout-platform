"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type InsightUpdate,
  getToastedUpdateIds,
  markUpdateToasted,
  markUpdateSeen,
} from "@/lib/industry-insights/insight-updates";

// ============================================
// HOOK: useInsightUpdates
// ============================================

/**
 * Manages the insight-update toast queue for the Industry Insights page.
 *
 * - Fetches recent updates from /api/insights/updates
 * - Filters out already-toasted updates
 * - Queues new updates one-at-a-time
 * - Exposes the current toast + dismiss callback
 * - Provides the full recent-updates list for the history section
 */
export function useInsightUpdates() {
  const [toastQueue, setToastQueue] = useState<InsightUpdate[]>([]);
  const [activeToast, setActiveToast] = useState<InsightUpdate | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch updates (poll every 5 minutes while on the page)
  const { data } = useQuery<{ updates: InsightUpdate[] }>({
    queryKey: ["insight-updates"],
    queryFn: async () => {
      const res = await fetch("/api/insights/updates");
      if (!res.ok) return { updates: [] };
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  const allUpdates = data?.updates ?? [];

  // When updates arrive, queue any that haven't been toasted yet
  useEffect(() => {
    if (allUpdates.length === 0) return;

    const toasted = getToastedUpdateIds();
    const newUpdates = allUpdates.filter((u) => !toasted.has(u.id));

    if (newUpdates.length > 0) {
      setToastQueue((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const added = newUpdates.filter((u) => !existingIds.has(u.id));
        return added.length > 0 ? [...prev, ...added] : prev;
      });
    }
  }, [allUpdates]);

  // Advance the queue: show next toast when no active toast
  useEffect(() => {
    if (activeToast || toastQueue.length === 0) return;

    const next = toastQueue[0];
    setActiveToast(next);
    setToastQueue((q) => q.slice(1));
    markUpdateToasted(next.id);
    markUpdateSeen(next.id);

    // Auto-dismiss after 3 seconds
    dismissTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 3000);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [activeToast, toastQueue]);

  const dismissToast = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setActiveToast(null);
  }, []);

  return {
    /** The currently visible toast (null if none) */
    activeToast,
    /** Dismiss the current toast early */
    dismissToast,
    /** All recent updates for the history section */
    recentUpdates: allUpdates,
    /** Whether there are queued toasts waiting */
    hasQueuedUpdates: toastQueue.length > 0,
  };
}
