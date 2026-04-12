"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSubtleHint — lightweight, once-per-session hint system.
 *
 * Shows a hint after `delayMs` of inactivity. The hint auto-dismisses
 * after `durationMs`. Once shown for a given `hintKey`, it won't show
 * again in the same session (sessionStorage) or ever (localStorage)
 * depending on `persistence`.
 *
 * Returns `{ visible, dismiss }` — the consumer renders the hint
 * element only when `visible` is true.
 */

interface UseSubtleHintOptions {
  /** Unique key for this hint (e.g. "dashboard-goal") */
  hintKey: string;
  /** Delay before showing the hint (ms). Default: 3000 */
  delayMs?: number;
  /** How long the hint stays visible (ms). Default: 4000 */
  durationMs?: number;
  /** Whether the hint can show. Default: true */
  enabled?: boolean;
  /** "session" = once per browser session, "permanent" = never again. Default: "permanent" */
  persistence?: "session" | "permanent";
}

const STORAGE_PREFIX = "hint-seen-";

function hasBeenSeen(key: string, persistence: "session" | "permanent"): boolean {
  try {
    const store = persistence === "session" ? sessionStorage : localStorage;
    return store.getItem(STORAGE_PREFIX + key) === "1";
  } catch {
    return false;
  }
}

function markSeen(key: string, persistence: "session" | "permanent"): void {
  try {
    const store = persistence === "session" ? sessionStorage : localStorage;
    store.setItem(STORAGE_PREFIX + key, "1");
  } catch { /* noop */ }
}

export function useSubtleHint({
  hintKey,
  delayMs = 3000,
  durationMs = 4000,
  enabled = true,
  persistence = "permanent",
}: UseSubtleHintOptions) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const dismissed = useRef(false);

  // Reset interaction timer on any user activity
  const resetTimer = useCallback(() => {
    if (dismissed.current) return;
    if (showTimer.current) clearTimeout(showTimer.current);
  }, []);

  useEffect(() => {
    if (!enabled || hasBeenSeen(hintKey, persistence)) return;

    // Start the inactivity timer
    showTimer.current = setTimeout(() => {
      if (dismissed.current) return;
      setVisible(true);
      markSeen(hintKey, persistence);

      // Auto-dismiss after duration
      hideTimer.current = setTimeout(() => {
        setVisible(false);
      }, durationMs);
    }, delayMs);

    // Listen for interactions that should reset the timer
    const events = ["pointerdown", "keydown", "scroll"];
    const handler = () => {
      // If hint is already showing or was dismissed, don't reset
      if (visible || dismissed.current) return;
      resetTimer();
      // Re-start the timer
      showTimer.current = setTimeout(() => {
        if (dismissed.current) return;
        setVisible(true);
        markSeen(hintKey, persistence);
        hideTimer.current = setTimeout(() => setVisible(false), durationMs);
      }, delayMs);
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      events.forEach((e) => window.removeEventListener(e, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hintKey, delayMs, durationMs, persistence]);

  const dismiss = useCallback(() => {
    dismissed.current = true;
    setVisible(false);
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    markSeen(hintKey, persistence);
  }, [hintKey, persistence]);

  return { visible, dismiss };
}
