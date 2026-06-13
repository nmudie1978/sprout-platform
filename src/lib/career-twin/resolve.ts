/**
 * Server-side resolution for Career Twin.
 *
 * Figures out WHICH career a Twin should be grounded in, and gathers the
 * best-effort profile context — from an explicit careerId, the user's
 * active My Journey goal, or their stated career aspiration. Returns a
 * minimal title-only context when a career isn't in the catalog, so the
 * Twin works for any selected career.
 *
 * This module touches Prisma and the career catalog, so it is server-only
 * (import it only from route handlers / server code).
 */
import { prisma } from "@/lib/prisma";
import {
  getAllCareers,
  getCareerById,
  searchCareers,
} from "@/lib/career-pathways";
import { computeAgeYears } from "@/lib/age-policy";
import { daysBetween } from "./memory";
import type {
  CareerTwinCareerContext,
  CareerTwinProfileContext,
  RecentCareerSignal,
  TwinRecentActivity,
} from "./types";

function toContext(career: ReturnType<typeof getCareerById>): CareerTwinCareerContext | null {
  if (!career) return null;
  return {
    id: career.id,
    title: career.title,
    emoji: career.emoji,
    educationPath: career.educationPath,
    avgSalary: career.avgSalary,
    keySkills: career.keySkills,
    dailyTasks: career.dailyTasks,
    growthOutlook: career.growthOutlook,
    workSetting: career.workSetting,
    peopleIntensity: career.peopleIntensity,
  };
}

/** Loose title match against the catalog (case-insensitive contains). */
function findByTitle(raw: string): CareerTwinCareerContext | null {
  const needle = raw.trim().toLowerCase();
  if (!needle) return null;
  const all = getAllCareers();
  const exact = all.find((c) => c.title.toLowerCase() === needle);
  if (exact) return toContext(exact);
  const partial = all.find(
    (c) => c.title.toLowerCase().includes(needle) || needle.includes(c.title.toLowerCase()),
  );
  if (partial) return toContext(partial);
  const searched = searchCareers(raw);
  return searched.length > 0 ? toContext(searched[0]) : null;
}

/** Build a minimal context from a free-text title when nothing matches the catalog. */
function minimalContext(idHint: string, title: string): CareerTwinCareerContext {
  const cleanTitle = title.trim() || "this career";
  return {
    id: (idHint || cleanTitle).trim() || "career",
    title: cleanTitle,
  };
}

/**
 * Resolve the career the Twin should use.
 *
 * Priority: explicit careerId → active journey goal → career aspiration.
 * Returns null only when we have absolutely nothing to go on.
 */
export async function resolveCareerContext(
  userId: string,
  careerIdParam?: string | null,
): Promise<CareerTwinCareerContext | null> {
  // 1) Explicit careerId (catalog id, slug, or title)
  if (careerIdParam && careerIdParam.trim()) {
    const id = careerIdParam.trim();
    const byId = toContext(getCareerById(id));
    if (byId) return byId;
    const byTitle = findByTitle(id.replace(/[-_]/g, " "));
    if (byTitle) return byTitle;
    // Fall through to profile-based resolution; keep the param as a title hint.
  }

  // 2) Active My Journey goal
  const activeGoal = await prisma.journeyGoalData.findFirst({
    where: { userId, isActive: true },
    select: { goalId: true, goalTitle: true },
    orderBy: { updatedAt: "desc" },
  });
  if (activeGoal) {
    const byGoalId = toContext(getCareerById(activeGoal.goalId));
    if (byGoalId) return byGoalId;
    const byGoalTitle = findByTitle(activeGoal.goalTitle);
    if (byGoalTitle) return byGoalTitle;
    if (activeGoal.goalTitle?.trim()) {
      return minimalContext(activeGoal.goalId, activeGoal.goalTitle);
    }
  }

  // 3) Career aspiration / primary goal on the profile
  const profile = await prisma.youthProfile.findUnique({
    where: { userId },
    select: { careerAspiration: true, primaryGoal: true },
  });
  if (profile?.careerAspiration?.trim()) {
    const byAsp = findByTitle(profile.careerAspiration);
    if (byAsp) return byAsp;
  }
  const primary = profile?.primaryGoal as { title?: string } | null;
  if (primary?.title?.trim()) {
    const byPrimary = findByTitle(primary.title);
    if (byPrimary) return byPrimary;
    return minimalContext(primary.title, primary.title);
  }

  // 4) If the caller passed a careerId that didn't match anything, still
  //    honour it as a title so the Twin can run for any career.
  if (careerIdParam && careerIdParam.trim()) {
    const pretty = careerIdParam.trim().replace(/[-_]/g, " ");
    return minimalContext(careerIdParam.trim(), pretty);
  }

  return null;
}

/** Gather whatever profile context we can for persona + prompt personalisation. */
export async function loadProfileContext(
  userId: string,
): Promise<CareerTwinProfileContext> {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { dateOfBirth: true },
    }),
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        country: true,
        interests: true,
        discoveryPreferences: true,
        journeySummary: true,
      },
    }),
  ]);

  const age = user?.dateOfBirth ? computeAgeYears(user.dateOfBirth) : null;

  const prefs = (profile?.discoveryPreferences ?? null) as Record<string, unknown> | null;
  const subjects = Array.isArray(prefs?.subjects) ? (prefs!.subjects as string[]) : [];
  const prefInterests = Array.isArray(prefs?.interests) ? (prefs!.interests as string[]) : [];
  const interests = [
    ...(Array.isArray(profile?.interests) ? (profile!.interests as string[]) : []),
    ...prefInterests,
  ].slice(0, 6);

  const summary = (profile?.journeySummary ?? null) as Record<string, unknown> | null;
  const journeyStage =
    typeof summary?.stage === "string"
      ? (summary.stage as string)
      : typeof summary?.journeyState === "string"
        ? (summary.journeyState as string)
        : null;

  return {
    age,
    country: profile?.country ?? null,
    interests,
    subjects,
    journeyStage,
  };
}

/**
 * Gather REAL recent-activity signals so the Twin can open with a proactive,
 * personalised line ("I noticed you've been exploring X and Y lately…").
 *
 * All data here is already persisted server-side — saved careers, rated
 * ("interest") careers, the active goal, the journey stage, and the last time
 * the user spoke to THIS career's Twin. No AI call, no new heavy work: a few
 * indexed reads. The active career is excluded from `recentCareers` so we
 * never echo it back as "recent".
 */
export async function loadRecentActivity(
  userId: string,
  activeCareer: CareerTwinCareerContext,
  profileContext?: CareerTwinProfileContext,
): Promise<TwinRecentActivity> {
  const profile = await prisma.youthProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [savedRows, interestRows, activeGoal, lastTurn, profileCtx] =
    await Promise.all([
      // Recently SAVED careers (titles are stored on the row).
      profile
        ? prisma.savedCareer.findMany({
            where: { profileId: profile.id },
            orderBy: { savedAt: "desc" },
            take: 6,
            select: { careerId: true, careerTitle: true, careerEmoji: true, savedAt: true },
          })
        : Promise.resolve([]),
      // Recently RATED ("explored") careers — titles resolved from the catalog.
      prisma.careerInterest.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { careerId: true, updatedAt: true },
      }),
      prisma.journeyGoalData.findFirst({
        where: { userId, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: { goalTitle: true },
      }),
      prisma.careerTwinMessage.findFirst({
        where: { userId, careerId: activeCareer.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      profileContext
        ? Promise.resolve(profileContext)
        : loadProfileContext(userId),
    ]);

  // Merge saved + rated into one most-recent-first list, de-duped by careerId,
  // excluding the career this Twin is already grounded in.
  type Dated = RecentCareerSignal & { at: number };
  const merged: Dated[] = [];
  const seen = new Set<string>([activeCareer.id]);

  for (const r of savedRows) {
    if (seen.has(r.careerId)) continue;
    seen.add(r.careerId);
    merged.push({
      careerId: r.careerId,
      title: r.careerTitle,
      emoji: r.careerEmoji,
      at: r.savedAt.getTime(),
    });
  }
  for (const r of interestRows) {
    if (seen.has(r.careerId)) continue;
    const cat = getCareerById(r.careerId);
    if (!cat) continue; // skip careers we can't name
    seen.add(r.careerId);
    merged.push({
      careerId: r.careerId,
      title: cat.title,
      emoji: cat.emoji ?? null,
      at: r.updatedAt.getTime(),
    });
  }

  merged.sort((a, b) => b.at - a.at);
  const recentCareers: RecentCareerSignal[] = merged
    .slice(0, 3)
    .map(({ careerId, title, emoji }) => ({ careerId, title, emoji }));

  return {
    activeCareerId: activeCareer.id,
    activeGoalTitle: activeGoal?.goalTitle?.trim() || null,
    recentCareers,
    journeyStage: profileCtx.journeyStage ?? null,
    daysSinceLastVisit: daysBetween(lastTurn?.createdAt?.toISOString() ?? null, Date.now()),
  };
}
