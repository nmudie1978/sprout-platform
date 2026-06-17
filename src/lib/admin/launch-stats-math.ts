/**
 * Pure derivation helpers for the admin launch-validation statistics.
 *
 * These functions hold the metric *math* with no database access, so the
 * funnel cascade, completion rate, Career Twin session bucketing, retention
 * windows and signal-ranking logic can be unit-tested in isolation. The DB
 * orchestrator (`launch-stats.ts`) fetches rows and feeds them through here.
 */

/** A stable UTC YYYY-MM-DD key for grouping activity by calendar day. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface FunnelInput {
  /** Distinct users who viewed any career (approximated upstream). */
  viewedUserIds: Set<string>;
  /** Distinct users who started a journey (have a JourneyGoalData row). */
  startedUserIds: Set<string>;
  /** Per-user union of completed lens steps across all their goals. */
  stepsByUser: Map<string, Set<string>>;
}

export interface FunnelCounts {
  viewed: number;
  started: number;
  discover: number;
  understand: number;
  clarity: number;
}

/**
 * Distinct-user counts for each funnel stage. Applies the same
 * discover<-understand<-clarity cascade as `lens-progress.ts`: reaching a
 * higher checkpoint implies the lower ones, keeping the funnel monotonic.
 */
export function computeFunnel(input: FunnelInput): FunnelCounts {
  let discover = 0;
  let understand = 0;
  let clarity = 0;

  for (const steps of input.stepsByUser.values()) {
    const hasClarity = steps.has("clarity");
    const hasUnderstand = steps.has("understand") || hasClarity;
    const hasDiscover = steps.has("discover") || hasUnderstand;
    if (hasDiscover) discover++;
    if (hasUnderstand) understand++;
    if (hasClarity) clarity++;
  }

  return {
    viewed: input.viewedUserIds.size,
    started: input.startedUserIds.size,
    discover,
    understand,
    clarity,
  };
}

/** Completed / started as a rounded percentage; 0 when nothing started. */
export function completionRate(completed: number, started: number): number {
  if (started <= 0) return 0;
  return Math.round((completed / started) * 100);
}

/**
 * Count distinct Career Twin "sessions", approximated as unique
 * (user, career, UTC day) combinations across all messages.
 */
export function countDistinctTwinSessions(
  messages: { userId: string; careerId: string; createdAt: Date }[],
): number {
  const seen = new Set<string>();
  for (const m of messages) {
    seen.add(`${m.userId} ${m.careerId} ${dayKey(m.createdAt)}`);
  }
  return seen.size;
}

export interface RetentionInput {
  userId: string;
  /** Distinct UTC day-keys on which the user produced any write activity. */
  activeDays: Set<string>;
}

export interface RetentionResult {
  active7d: number;
  active30d: number;
  returning: number;
  avgActiveDaysPerUser: number;
}

/**
 * Approximate retention from per-user active-day sets. Cutoffs are inclusive
 * UTC day-keys; YYYY-MM-DD strings compare correctly lexicographically.
 */
export function computeRetention(
  users: RetentionInput[],
  cutoffs: { cutoff7: string; cutoff30: string },
): RetentionResult {
  if (users.length === 0) {
    return { active7d: 0, active30d: 0, returning: 0, avgActiveDaysPerUser: 0 };
  }

  let active7d = 0;
  let active30d = 0;
  let returning = 0;
  let totalActiveDays = 0;

  for (const u of users) {
    let latest = "";
    for (const d of u.activeDays) if (d > latest) latest = d;
    if (latest >= cutoffs.cutoff7) active7d++;
    if (latest >= cutoffs.cutoff30) active30d++;
    if (u.activeDays.size > 1) returning++;
    totalActiveDays += u.activeDays.size;
  }

  return {
    active7d,
    active30d,
    returning,
    avgActiveDaysPerUser: totalActiveDays / users.length,
  };
}

export interface LaunchSignal {
  key: string;
  label: string;
  value: number;
  /** The "healthy" target this signal is judged against. */
  threshold: number;
}

/**
 * Rank signals by how far they clear their threshold (value / threshold) and
 * return the strongest and weakest. Null when there are no signals.
 */
export function pickLaunchSignals(signals: LaunchSignal[]): {
  strongest: LaunchSignal | null;
  weakest: LaunchSignal | null;
} {
  if (signals.length === 0) return { strongest: null, weakest: null };

  const ratio = (s: LaunchSignal) => (s.threshold > 0 ? s.value / s.threshold : s.value);
  let strongest = signals[0];
  let weakest = signals[0];
  for (const s of signals) {
    if (ratio(s) > ratio(strongest)) strongest = s;
    if (ratio(s) < ratio(weakest)) weakest = s;
  }
  return { strongest, weakest };
}
