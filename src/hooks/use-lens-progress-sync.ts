"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ensureLensProgressHydrated,
  LENS_PROGRESS_HYDRATED_EVENT,
} from "@/lib/journey/lens-sync";

/**
 * Hydrates the journey lens-progress cache from the server once per load and
 * returns a tick that bumps when hydration completes. Include the tick in the
 * deps of any `computeLensProgress` / `journeyStageLabel` memo so it re-reads
 * the (now server-synced) localStorage cache — making the dashboard ring,
 * stage labels and completion cue reflect progress made on other devices.
 */
export function useLensProgressSync(): number {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    void ensureLensProgressHydrated(userId);
    const onHydrated = () => setTick((t) => t + 1);
    window.addEventListener(LENS_PROGRESS_HYDRATED_EVENT, onHydrated);
    return () => window.removeEventListener(LENS_PROGRESS_HYDRATED_EVENT, onHydrated);
  }, [userId]);

  return tick;
}
