"use client";

import { useEffect, useState } from "react";

/** Local calendar date as YYYY-MM-DD (not UTC — "today" should mean the
 *  user's today). */
function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Gates the welcome-back card to once per calendar day, per user.
 *
 * Returns `show: true` only on the first visit of the day (then records
 * today's date so it stays hidden until tomorrow, even without dismissal).
 * Pass `userId: undefined` to disable (e.g. first-login users who get the
 * onboarding wizard instead), and `ready: false` while the activity data
 * the card describes is still loading — so the message is accurate on its
 * one appearance rather than flashing a generic line first.
 */
export function useDailyWelcome(
  userId: string | undefined,
  ready: boolean,
): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!userId || !ready) return;
    const key = `endeavrly:welcomeback:${userId}`;
    try {
      const today = todayKey();
      if (localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today);
        setShow(true);
      }
    } catch {
      // localStorage unavailable (private mode / blocked) — skip the card.
    }
  }, [userId, ready]);

  return { show, dismiss: () => setShow(false) };
}
