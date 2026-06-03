"use client";

/**
 * One-time, per-session reconciliation of device-local journey lens progress
 * (Discover / Understand / Clarity checkpoints in `lens-progress.ts`) with the
 * server (`JourneyGoalData.journeyCompletedSteps` via `/api/journey/...`).
 *
 * The server is the source of truth: on first authenticated mount we GET the
 * user's goals + their completed steps and write them into the localStorage
 * cache so journey progress (the 3/3 ring, stage labels, completion cue)
 * follows the user across devices. We then back any local-only completion up
 * to the server (idempotent union — completion is monotonic). localStorage
 * stays the optimistic/offline layer the synchronous lens-progress getters
 * read; this just keeps it in sync once per load.
 *
 * Mirrors src/lib/interest-level/sync.ts. Builds only on the existing
 * journeyCompletedSteps model — no competing stage store.
 */

import { cacheServerLensSteps, currentLensSteps } from "./lens-progress";

/** Fired once the cache has been reconciled with the server, so mounted
 *  surfaces can re-read the synchronous lens-progress getters. */
export const LENS_PROGRESS_HYDRATED_EVENT = "endeavrly:lens-progress-hydrated";

interface ServerGoal {
  goalId: string;
  goalTitle: string;
  journeyCompletedSteps?: string[];
}

/** Promise-cache so concurrent mounts share a single network round-trip. */
const inFlight = new Map<string, Promise<void>>();

export function ensureLensProgressHydrated(userId: string | undefined): Promise<void> {
  if (typeof window === "undefined" || !userId) return Promise.resolve();
  const existing = inFlight.get(userId);
  if (existing) return existing;
  const p = hydrate(userId);
  inFlight.set(userId, p);
  return p;
}

async function hydrate(userId: string): Promise<void> {
  try {
    const res = await fetch("/api/journey/goal-data/list", { credentials: "same-origin" });
    if (!res.ok) {
      inFlight.delete(userId); // allow a retry on the next mount
      return;
    }
    const json = await res.json().catch(() => null);
    const goals = (json?.goals ?? []) as ServerGoal[];

    // Server → local cache (additive; never clears a locally-set flag).
    for (const g of goals) {
      cacheServerLensSteps(g.goalTitle, g.journeyCompletedSteps ?? []);
    }

    // Back any local-only completion up to the server (idempotent union).
    const completions: Record<string, string[]> = {};
    for (const g of goals) {
      const steps = currentLensSteps(g.goalTitle);
      if (steps.length > 0) completions[g.goalId] = steps;
    }
    if (Object.keys(completions).length > 0) {
      await fetch("/api/journey/completion/sync", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completions }),
      }).catch(() => {});
    }

    window.dispatchEvent(
      new CustomEvent(LENS_PROGRESS_HYDRATED_EVENT, { detail: { userId } }),
    );
  } catch {
    inFlight.delete(userId); // transient/offline — allow a retry
  }
}
