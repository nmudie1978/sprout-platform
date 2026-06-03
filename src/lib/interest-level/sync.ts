"use client";

/**
 * One-time, per-session reconciliation of device-local Interest Levels with
 * the server (`CareerInterest` via `/api/career-interest`).
 *
 * The server is the source of truth: on first authenticated mount we GET the
 * user's saved levels and write them into the localStorage cache so the
 * rating follows the user across devices. If the server has none but the
 * device does (a pre-server user), we back the local levels up first.
 *
 * localStorage stays the optimistic/offline layer that the hooks read
 * synchronously — this just keeps it in sync with the server once per load.
 */

import {
  clampInterestLevel,
  interestLevelStorageKey,
  readAllInterestLevels,
} from "./types";

/** Fired (no per-career detail) once the cache has been reconciled with the
 *  server, so every mounted hook can re-read localStorage. */
export const INTEREST_LEVELS_HYDRATED_EVENT = "endeavrly:interest-levels-hydrated";

const API = "/api/career-interest";

/** Promise-cache so concurrent mounts share a single network round-trip. */
const inFlight = new Map<string, Promise<void>>();

export function ensureInterestLevelsHydrated(userId: string | undefined): Promise<void> {
  if (typeof window === "undefined" || !userId) return Promise.resolve();
  const existing = inFlight.get(userId);
  if (existing) return existing;
  const p = hydrate(userId);
  inFlight.set(userId, p);
  return p;
}

async function hydrate(userId: string): Promise<void> {
  try {
    const res = await fetch(API, { credentials: "same-origin" });
    if (!res.ok) {
      inFlight.delete(userId); // allow a retry on the next mount
      return;
    }
    const json = await res.json().catch(() => null);
    const interests = (json?.interests ?? {}) as Record<string, number>;
    const serverKeys = Object.keys(interests);

    if (serverKeys.length > 0) {
      // Server authoritative → refresh the localStorage cache.
      for (const careerId of serverKeys) {
        const level = clampInterestLevel(interests[careerId]);
        if (!level) continue;
        try {
          window.localStorage.setItem(
            interestLevelStorageKey(userId, careerId),
            JSON.stringify({ level, updatedAt: null }),
          );
        } catch {
          /* private tab — skip cache write */
        }
      }
    } else {
      // Server empty → one-time backfill from the device (best-effort).
      const local = readAllInterestLevels(userId, window.localStorage);
      await Promise.all(
        Object.entries(local).map(([careerId, level]) =>
          fetch(API, {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ careerId, level }),
          }).catch(() => {}),
        ),
      );
    }

    window.dispatchEvent(
      new CustomEvent(INTEREST_LEVELS_HYDRATED_EVENT, { detail: { userId } }),
    );
  } catch {
    inFlight.delete(userId); // transient/offline — allow a retry
  }
}
