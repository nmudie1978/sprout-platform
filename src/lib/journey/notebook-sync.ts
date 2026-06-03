"use client";

/**
 * One-time, per-session reconciliation of the device-local "My Journey"
 * reflection notebooks with the server (`JourneyNotebook` via
 * `/api/journey/notebook`).
 *
 * The server is the source of truth: on first authenticated mount we GET the
 * user's notebooks and write them into the localStorage cache (the
 * `endeavrly-journey-reflections:{userId}:{slug}` keys the dashboard, library
 * and JourneyReflectionsTray read) so reflections follow the user across
 * devices. If the server has none but the device does, we back them up first.
 *
 * localStorage stays the optimistic/offline layer the hooks read
 * synchronously — this just keeps it in sync once per load.
 */

const STORAGE_PREFIX = "endeavrly-journey-reflections";
const API = "/api/journey/notebook";

/** Fired once the cache has been reconciled with the server, so every mounted
 *  reader (dashboard, library, tray hook) can re-read localStorage. */
export const JOURNEY_NOTEBOOKS_HYDRATED_EVENT = "endeavrly:journey-notebooks-hydrated";

interface ServerNotebook {
  careerSlug: string;
  discover: string;
  understand: string;
  clarity: string;
  updatedAt: string;
}

function storageKey(userId: string, careerSlug: string) {
  return `${STORAGE_PREFIX}:${userId}:${careerSlug}`;
}

/** Read every local notebook for a user → backfill payload. */
function readLocalNotebooks(userId: string): ServerNotebook[] {
  const prefix = `${STORAGE_PREFIX}:${userId}:`;
  const out: ServerNotebook[] = [];
  const ls = window.localStorage;
  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const careerSlug = key.slice(prefix.length);
    if (!careerSlug) continue;
    try {
      const parsed = JSON.parse(ls.getItem(key) || "{}");
      const discover = typeof parsed?.discover === "string" ? parsed.discover : "";
      const understand = typeof parsed?.understand === "string" ? parsed.understand : "";
      const clarity = typeof parsed?.clarity === "string" ? parsed.clarity : "";
      if (!discover && !understand && !clarity) continue;
      out.push({
        careerSlug,
        discover,
        understand,
        clarity,
        updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : "",
      });
    } catch {
      /* skip malformed entry */
    }
  }
  return out;
}

/** Promise-cache so concurrent mounts share a single network round-trip. */
const inFlight = new Map<string, Promise<void>>();

export function ensureJourneyNotebooksHydrated(userId: string | undefined): Promise<void> {
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
    let notebooks: ServerNotebook[] = Array.isArray(json?.notebooks) ? json.notebooks : [];

    if (notebooks.length === 0) {
      // Server empty → one-time backfill from the device.
      const local = readLocalNotebooks(userId);
      if (local.length > 0) {
        const put = await fetch(API, {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: local }),
        });
        if (put.ok) {
          const pj = await put.json().catch(() => null);
          if (Array.isArray(pj?.notebooks)) notebooks = pj.notebooks;
        }
      }
    }

    // Server authoritative → refresh the localStorage cache.
    for (const nb of notebooks) {
      try {
        window.localStorage.setItem(
          storageKey(userId, nb.careerSlug),
          JSON.stringify({
            discover: nb.discover,
            understand: nb.understand,
            clarity: nb.clarity,
            updatedAt: nb.updatedAt || null,
          }),
        );
      } catch {
        /* private tab — skip cache write */
      }
    }

    window.dispatchEvent(
      new CustomEvent(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, { detail: { userId } }),
    );
  } catch {
    inFlight.delete(userId); // transient/offline — allow a retry
  }
}

/** Best-effort server write for one career's notebook (debounced by callers). */
export function persistNotebook(
  careerSlug: string,
  lenses: { discover: string; understand: string; clarity: string },
): void {
  if (typeof window === "undefined" || !careerSlug) return;
  void fetch(API, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ careerSlug, ...lenses }),
    keepalive: true,
  }).catch(() => {});
}
