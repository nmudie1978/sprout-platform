"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Remembers a view-mode choice per surface, in localStorage.
 *
 * Generic over the surface's own union rather than a fixed one: the careers
 * catalogue thinks in "list | small | large" (see career-card-v2), while other
 * surfaces may use different names. Callers pass their allowed values, which
 * doubles as the validator for whatever is read back from storage — so a stale
 * or hand-edited value falls back to the default instead of rendering nothing.
 */
interface UseViewModeOptions<T extends string> {
  storageKey: string;
  allowed: readonly T[];
  defaultMode: T;
}

export function useViewMode<T extends string>({
  storageKey,
  allowed,
  defaultMode,
}: UseViewModeOptions<T>) {
  // Always start from `defaultMode` so the server and the first client render
  // agree; the stored preference is applied in an effect below. Reading
  // localStorage in the initialiser would hydrate-mismatch for anyone whose
  // saved view isn't the default.
  const [viewMode, setViewModeState] = useState<T>(defaultMode);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && (allowed as readonly string[]).includes(stored)) {
        setViewModeState(stored as T);
      }
    } catch {
      // Private mode / blocked storage — the default is a fine answer.
    }
    // `allowed` is a literal array at every call site; re-running on identity
    // change would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const setViewMode = useCallback(
    (mode: T) => {
      if (!(allowed as readonly string[]).includes(mode)) return;
      setViewModeState(mode);
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // Not being able to remember the choice shouldn't break using it.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey]
  );

  return { viewMode, setViewMode };
}
