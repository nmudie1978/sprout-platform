/**
 * Pure limit maths + the user-facing copy for a refused request.
 *
 * Kept free of Prisma/Redis so the window arithmetic — the part that is easy
 * to get subtly wrong — is directly unit testable.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Decide the rolling-window verdict from the timestamps of a user's recent
 * successful requests.
 *
 * @param recentDesc timestamps of the `limit` most recent successful requests
 *                   INSIDE the window, newest first.
 * @param limit      how many are allowed per window.
 * @param windowMs   window length (24h for the daily question limit).
 *
 * When the window is full, the next slot frees up when the OLDEST of those
 * `limit` requests leaves the window — at that moment only `limit - 1` remain,
 * so one more is allowed.
 */
export function evaluateRollingWindow(
  recentDesc: Date[],
  limit: number,
  windowMs: number = DAY_MS,
): { allowed: boolean; used: number; remaining: number; retryAt?: Date } {
  const used = recentDesc.length;
  if (limit <= 0) {
    // A limit of 0 means "closed" — surface a retryAt only if we have one.
    return { allowed: false, used, remaining: 0, retryAt: undefined };
  }
  if (used < limit) {
    return { allowed: true, used, remaining: limit - used };
  }
  const oldestOfWindow = recentDesc[limit - 1] ?? recentDesc[recentDesc.length - 1];
  return {
    allowed: false,
    used,
    remaining: 0,
    retryAt: new Date(oldestOfWindow.getTime() + windowMs),
  };
}

/**
 * "in about 3 hours" / "in about 20 minutes" / "in a moment".
 * Deliberately approximate: a young person wants to know roughly when to come
 * back, not a countdown to the second.
 */
export function formatWhenAvailable(retryAt: Date | undefined, now: Date = new Date()): string {
  if (!retryAt) return "shortly";
  const ms = retryAt.getTime() - now.getTime();
  if (ms <= 60_000) return "in a moment";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `in about ${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `in about ${hours} hour${hours === 1 ? "" : "s"}`;
  return "tomorrow";
}

/**
 * Copy for a spent daily allowance. Calm and encouraging — hitting a limit
 * should feel like a natural pause, never a punishment or a paywall nudge.
 */
export function dailyLimitMessage(limit: number, retryAt?: Date, now: Date = new Date()): string {
  return (
    `That's your ${limit} Career Twin questions for today — you've done some real thinking. ` +
    `Sit with what came up, and you can pick this conversation back up ${formatWhenAvailable(retryAt, now)}. ` +
    `Everything you've explored is saved.`
  );
}

/** Copy for the per-minute burst guard. */
export function rateLimitMessage(retryAt?: Date, now: Date = new Date()): string {
  return (
    `We're going a bit fast — give your Career Twin a moment to catch up and try again ` +
    `${formatWhenAvailable(retryAt, now)}. Your future self isn't going anywhere.`
  );
}

/** Copy for the kill switch / monthly cost ceiling (Twin temporarily off). */
export function unavailableMessage(): string {
  return (
    "Your Career Twin is taking a short break and can't chat right now. " +
    "Nothing you've saved is lost — try again a little later. " +
    "In the meantime, exploring a career's Understand tab is a great next move."
  );
}

/** Start of the current UTC calendar month — the monthly cost accounting period. */
export function startOfMonthUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
