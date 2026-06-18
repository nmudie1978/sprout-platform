/**
 * Builds the Career Twin's "memory" of a returning user from data that is
 * already persisted server-side. Server-only (touches Prisma).
 */
import { prisma } from "@/lib/prisma";
import type { TwinMemory } from "./types";

/** Days a user must be away before the Twin greets them as "returning". */
export const TWIN_CHECKIN_DAYS = 21;

/** Pure: whole days between an ISO timestamp and now (ms). Null on bad input. */
export function daysBetween(fromIso: string | null, nowMs: number): number | null {
  if (!fromIso) return null;
  const then = Date.parse(fromIso);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((nowMs - then) / 86_400_000));
}

/** Pure: should we show a warm "it's been a while" re-entry? */
export function isReturningAfterGap(daysSince: number | null): boolean {
  return daysSince != null && daysSince >= TWIN_CHECKIN_DAYS;
}

/** Pure: defensively pull string labels from the quiz `topIndustries` JSON. */
export function extractQuizLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const v = o.industry ?? o.name ?? o.label ?? o.title;
        return typeof v === "string" ? v : null;
      }
      return null;
    })
    .filter((s): s is string => !!s)
    .slice(0, 4);
}

/**
 * Rows that the GET route already fetches once and can inject so this loader
 * doesn't re-query them (the active goal + the last turn are also needed by
 * loadRecentActivity). When `injected` is omitted the loader fetches them
 * itself, so existing callers are unaffected.
 */
export interface TwinSharedRows {
  lastTurn?: { createdAt: Date } | null;
  activeGoal?: { goalTitle: string; updatedAt: Date } | null;
}

/** Load the Twin's memory of this user for this career. */
export async function loadTwinMemory(
  userId: string,
  careerId: string,
  nowMs: number = Date.now(),
  injected?: TwinSharedRows,
): Promise<TwinMemory> {
  const useInjected = injected !== undefined;
  const [lastTurn, reflections, activeGoal, quiz] = await Promise.all([
    useInjected
      ? Promise.resolve(injected!.lastTurn ?? null)
      : prisma.careerTwinMessage.findFirst({
          where: { userId, careerId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
    prisma.journeyReflection.findMany({
      where: { profile: { userId }, skipped: false, response: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { response: true, createdAt: true },
    }),
    useInjected
      ? Promise.resolve(injected!.activeGoal ?? null)
      : prisma.journeyGoalData.findFirst({
          where: { userId, isActive: true },
          orderBy: { updatedAt: "desc" },
          select: { goalTitle: true, updatedAt: true },
        }),
    prisma.careerQuizResult.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      select: { topIndustries: true },
    }),
  ]);

  const lastVisitAt = lastTurn?.createdAt?.toISOString() ?? null;
  const daysSinceLastVisit = daysBetween(lastVisitAt, nowMs);

  const recentReflections = reflections
    .map((r) => (r.response ?? "").trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, 2);

  const changedSinceLastVisit: string[] = [];
  if (lastVisitAt) {
    const since = Date.parse(lastVisitAt);
    if (activeGoal?.updatedAt && activeGoal.updatedAt.getTime() > since) {
      changedSinceLastVisit.push(`refocused on becoming a ${activeGoal.goalTitle}`);
    }
    const newReflections = reflections.filter((r) => r.createdAt.getTime() > since).length;
    if (newReflections > 0) {
      changedSinceLastVisit.push(`added ${newReflections} new reflection${newReflections > 1 ? "s" : ""}`);
    }
  }

  return {
    lastVisitAt,
    daysSinceLastVisit,
    recentReflections,
    changedSinceLastVisit,
    quizLabels: extractQuizLabels(quiz?.topIndustries ?? null),
  };
}
