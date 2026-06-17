/**
 * Launch-validation statistics for the admin dashboard.
 *
 * Computes — from existing tables only — the signals a founder needs to answer
 * "is the product being validated?": sign-ups, journey completion, the
 * Discover→Understand→Clarity funnel, Career Twin engagement, retention,
 * saved careers and interest ratings.
 *
 * Metrics that nothing records exactly are *approximated* from write-activity
 * timestamps and flagged `estimated: true` so the UI can label them honestly.
 * No mock/demo data is ever produced.
 */
import { prisma } from "@/lib/prisma";
import {
  dayKey,
  computeFunnel,
  completionRate,
  countDistinctTwinSessions,
  computeRetention,
  pickLaunchSignals,
  type LaunchSignal,
} from "./launch-stats-math";

/** Prettify a slug / id ("child-psychologist") into a label ("Child Psychologist"). */
function prettifyId(id: string): string {
  return id
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function topBy<T>(
  rows: T[],
  keyOf: (r: T) => string,
  labelOf: (r: T) => string,
  limit = 8,
): { key: string; label: string; count: number }[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const r of rows) {
    const key = keyOf(r);
    if (!key) continue;
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { label: labelOf(r), count: 1 });
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface LaunchStats {
  generatedAt: string;
  userGrowth: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: { week: string; count: number }[];
  };
  journeys: {
    started: number;
    completed: number;
    completionRate: number;
    avgCareersPerUser: number;
    mostExplored: { key: string; label: string; count: number }[];
    mostCompleted: { key: string; label: string; count: number }[];
  };
  funnel: {
    viewed: number;
    started: number;
    discover: number;
    understand: number;
    clarity: number;
    viewedIsEstimated: true;
  };
  twin: {
    sessions: number;
    usersOpened: number;
    avgSessionsPerUser: number;
    engagementRate: number;
    topTopics: { key: string; label: string; count: number }[];
    topCareers: { key: string; label: string; count: number }[];
    sessionsAreEstimated: true;
  };
  retention: {
    returning: number;
    repeatRate: number;
    active7d: number;
    active30d: number;
    avgSessionsPerUser: number;
    estimated: true;
  };
  saved: {
    total: number;
    avgPerUser: number;
    usersWith3Plus: number;
    mostSaved: { key: string; label: string; count: number }[];
    comparedTracked: false;
  };
  interest: {
    rated: number;
    average: number;
    distribution: { level: number; count: number }[];
    highest: { key: string; label: string; average: number; count: number }[];
    lowest: { key: string; label: string; average: number; count: number }[];
  };
  health: {
    signingUp: boolean;
    completingJourneys: boolean;
    usingTwin: boolean;
    returning: boolean;
    strongest: { key: string; label: string } | null;
    weakest: { key: string; label: string } | null;
  };
}

export async function getLaunchStats(): Promise<LaunchStats> {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const activeUser = { deletedAt: null as Date | null };

  const [
    totalUsers,
    newToday,
    newThisWeek,
    newThisMonth,
    growthRaw,
    goalRows,
    viewedEvents,
    twinMessages,
    timelineActivity,
    interestActivity,
    savedActivity,
    profileActivity,
    savedRows,
    interestRows,
  ] = await Promise.all([
    prisma.user.count({ where: activeUser }),
    prisma.user.count({ where: { ...activeUser, createdAt: { gte: today } } }),
    prisma.user.count({ where: { ...activeUser, createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { ...activeUser, createdAt: { gte: monthAgo } } }),
    prisma.$queryRaw<Array<{ week: Date; count: bigint | number }>>`
      SELECT DATE_TRUNC('week', "createdAt") AS week, COUNT(*) AS count
      FROM "User"
      WHERE "createdAt" >= ${threeMonthsAgo} AND "deletedAt" IS NULL
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY week ASC
    `,
    prisma.journeyGoalData.findMany({
      select: { userId: true, goalTitle: true, journeyCompletedSteps: true, isActive: true },
    }),
    prisma.timelineEvent.findMany({
      where: { type: "CAREER_EXPLORED" },
      select: { userId: true },
    }),
    prisma.careerTwinMessage.findMany({
      select: { userId: true, careerId: true, role: true, mode: true, createdAt: true },
    }),
    prisma.timelineEvent.findMany({ select: { userId: true, createdAt: true } }),
    prisma.careerInterest.findMany({ select: { userId: true, updatedAt: true } }),
    prisma.savedCareer.findMany({ select: { profile: { select: { userId: true } }, savedAt: true } }),
    prisma.youthProfile.findMany({
      where: { journeyLastUpdated: { not: null } },
      select: { userId: true, journeyLastUpdated: true },
    }),
    prisma.savedCareer.findMany({ select: { profileId: true, careerId: true, careerTitle: true } }),
    prisma.careerInterest.findMany({ select: { careerId: true, level: true } }),
  ]);

  // ---- User growth ----
  const trend = growthRaw.map((r) => ({
    week: dayKey(new Date(r.week)),
    count: typeof r.count === "bigint" ? Number(r.count) : r.count,
  }));

  // ---- Journey engagement ----
  const startedRows = goalRows.filter(
    (g) => g.journeyCompletedSteps.length > 0 || g.isActive,
  );
  const completedRows = goalRows.filter((g) => g.journeyCompletedSteps.includes("clarity"));
  const startedUserIds = new Set(startedRows.map((g) => g.userId));
  const journeysStarted = startedRows.length;
  const journeysCompleted = completedRows.length;
  const avgCareersPerUser = startedUserIds.size
    ? Math.round((journeysStarted / startedUserIds.size) * 10) / 10
    : 0;

  // ---- Funnel (distinct users per stage) ----
  const stepsByUser = new Map<string, Set<string>>();
  for (const g of goalRows) {
    const set = stepsByUser.get(g.userId) ?? new Set<string>();
    for (const s of g.journeyCompletedSteps) set.add(s);
    stepsByUser.set(g.userId, set);
  }
  const viewedUserIds = new Set(viewedEvents.map((e) => e.userId));
  for (const id of startedUserIds) viewedUserIds.add(id); // started implies viewed
  const funnel = computeFunnel({ viewedUserIds, startedUserIds, stepsByUser });

  // ---- Career Twin ----
  const twinSessions = countDistinctTwinSessions(twinMessages);
  const twinOpeners = new Set(
    twinMessages.filter((m) => m.role === "user").map((m) => m.userId),
  );
  const twinTopics = topBy(
    twinMessages.filter((m) => m.mode),
    (m) => m.mode as string,
    (m) => prettifyId(m.mode as string),
  );
  // popularity = distinct users per career
  const twinCareerPairs = [
    ...new Map(twinMessages.map((m) => [`${m.userId}|${m.careerId}`, m])).values(),
  ];
  const twinTopCareers = topBy(
    twinCareerPairs,
    (m) => m.careerId,
    (m) => prettifyId(m.careerId),
  );

  // ---- Retention (approximated from write activity) ----
  const activeDaysByUser = new Map<string, Set<string>>();
  const addActivity = (userId: string | null | undefined, when: Date | null | undefined) => {
    if (!userId || !when) return;
    const set = activeDaysByUser.get(userId) ?? new Set<string>();
    set.add(dayKey(when));
    activeDaysByUser.set(userId, set);
  };
  for (const e of timelineActivity) addActivity(e.userId, e.createdAt);
  for (const m of twinMessages) addActivity(m.userId, m.createdAt);
  for (const r of interestActivity) addActivity(r.userId, r.updatedAt);
  for (const s of savedActivity) addActivity(s.profile?.userId, s.savedAt);
  for (const p of profileActivity) addActivity(p.userId, p.journeyLastUpdated);
  const retentionUsers = [...activeDaysByUser.entries()].map(([userId, activeDays]) => ({
    userId,
    activeDays,
  }));
  const retention = computeRetention(retentionUsers, {
    cutoff7: dayKey(weekAgo),
    cutoff30: dayKey(monthAgo),
  });
  const repeatRate = totalUsers ? Math.round((retention.returning / totalUsers) * 100) : 0;

  // ---- Saved careers ----
  const savedTotal = savedRows.length;
  const savedByProfile = new Map<string, number>();
  for (const s of savedRows) savedByProfile.set(s.profileId, (savedByProfile.get(s.profileId) ?? 0) + 1);
  const savedAvg = savedByProfile.size
    ? Math.round((savedTotal / savedByProfile.size) * 10) / 10
    : 0;
  const usersWith3Plus = [...savedByProfile.values()].filter((n) => n >= 3).length;
  const mostSaved = topBy(savedRows, (s) => s.careerId, (s) => s.careerTitle);

  // ---- Interest ratings ----
  const rated = interestRows.length;
  const avgInterest = rated
    ? Math.round((interestRows.reduce((sum, r) => sum + r.level, 0) / rated) * 10) / 10
    : 0;
  const distribution = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: interestRows.filter((r) => r.level === level).length,
  }));
  const byCareer = new Map<string, { sum: number; count: number }>();
  for (const r of interestRows) {
    const cur = byCareer.get(r.careerId) ?? { sum: 0, count: 0 };
    cur.sum += r.level;
    cur.count++;
    byCareer.set(r.careerId, cur);
  }
  const careerAverages = [...byCareer.entries()].map(([key, v]) => ({
    key,
    label: prettifyId(key),
    average: Math.round((v.sum / v.count) * 10) / 10,
    count: v.count,
  }));
  const highest = [...careerAverages].sort((a, b) => b.average - a.average).slice(0, 6);
  const lowest = [...careerAverages].sort((a, b) => a.average - b.average).slice(0, 6);

  // ---- Career Twin engagement rate ----
  const twinEngagementRate = totalUsers
    ? Math.round((twinOpeners.size / totalUsers) * 100)
    : 0;
  const journeyCompletionRate = completionRate(journeysCompleted, journeysStarted);

  // ---- Launch health summary ----
  const signals: LaunchSignal[] = [
    { key: "signups", label: "New sign-ups this week", value: newThisWeek, threshold: 10 },
    { key: "completion", label: "Journey completion", value: journeyCompletionRate, threshold: 25 },
    { key: "twin", label: "Career Twin engagement", value: twinEngagementRate, threshold: 20 },
    { key: "returning", label: "Returning users", value: repeatRate, threshold: 20 },
  ];
  const { strongest, weakest } = pickLaunchSignals(signals);

  return {
    generatedAt: new Date().toISOString(),
    userGrowth: { total: totalUsers, today: newToday, thisWeek: newThisWeek, thisMonth: newThisMonth, trend },
    journeys: {
      started: journeysStarted,
      completed: journeysCompleted,
      completionRate: journeyCompletionRate,
      avgCareersPerUser,
      mostExplored: topBy(startedRows, (g) => g.goalTitle, (g) => g.goalTitle),
      mostCompleted: topBy(completedRows, (g) => g.goalTitle, (g) => g.goalTitle),
    },
    funnel: { ...funnel, viewedIsEstimated: true },
    twin: {
      sessions: twinSessions,
      usersOpened: twinOpeners.size,
      avgSessionsPerUser: twinOpeners.size
        ? Math.round((twinSessions / twinOpeners.size) * 10) / 10
        : 0,
      engagementRate: twinEngagementRate,
      topTopics: twinTopics,
      topCareers: twinTopCareers,
      sessionsAreEstimated: true,
    },
    retention: {
      returning: retention.returning,
      repeatRate,
      active7d: retention.active7d,
      active30d: retention.active30d,
      avgSessionsPerUser: Math.round(retention.avgActiveDaysPerUser * 10) / 10,
      estimated: true,
    },
    saved: {
      total: savedTotal,
      avgPerUser: savedAvg,
      usersWith3Plus,
      mostSaved,
      comparedTracked: false,
    },
    interest: { rated, average: avgInterest, distribution, highest, lowest },
    health: {
      signingUp: newThisWeek > 0,
      completingJourneys: journeysCompleted > 0,
      usingTwin: twinOpeners.size > 0,
      returning: retention.returning > 0,
      strongest: strongest ? { key: strongest.key, label: strongest.label } : null,
      weakest: weakest ? { key: weakest.key, label: weakest.label } : null,
    },
  };
}
