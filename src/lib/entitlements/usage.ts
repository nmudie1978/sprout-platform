import { prisma } from "@/lib/prisma";
import { AI_FEATURES } from "@/lib/ai-usage/types";
import { getUserEntitlements } from "./service";
import { allowsAnother, remaining, type EntitlementLimits } from "./limits";

/**
 * Server-side usage counting for the metered Free allowances.
 *
 * Everything here reads from the database. There is deliberately no cache and
 * no client-supplied count: the frontend is not the security boundary, and a
 * counter a browser can influence is not a limit. See brief §17-§18.
 *
 * The two counters are kept separate and are never combined — spending Career
 * Twin questions must not consume career explorations.
 */

export interface UsageCounts {
  careerExplorations: number;
  careerTwinQuestions: number;
  savedCareers: number;
}

/** Zero usage, for a user with no profile yet. */
const NO_USAGE: UsageCounts = {
  careerExplorations: 0,
  careerTwinQuestions: 0,
  savedCareers: 0,
};

/**
 * Count a user's consumption of every metered allowance.
 *
 * Allowances are LIFETIME (brief §19), so nothing here filters by date. If a
 * monthly reset is ever wanted, this is the only place that changes.
 */
export async function getUsage(userId: string): Promise<UsageCounts> {
  const profile = await prisma.youthProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [twinQuestions, explorations, saved] = await Promise.all([
    // Only genuine, answered user questions count. "successful" excludes
    // failures, rate-limits and refusals; the `career_twin` feature key
    // excludes `career_twin_summary`, which is background summarisation the
    // user never asked for, and `career_twin_experience`, a different surface.
    prisma.aiUsageEvent.count({
      where: { userId, feature: AI_FEATURES.CAREER_TWIN, status: "successful" },
    }),
    profile
      ? prisma.careerExploration.count({ where: { profileId: profile.id } })
      : Promise.resolve(0),
    profile
      ? prisma.savedCareer.count({ where: { profileId: profile.id } })
      : Promise.resolve(0),
  ]);

  if (!profile) return { ...NO_USAGE, careerTwinQuestions: twinQuestions };

  return {
    careerExplorations: explorations,
    careerTwinQuestions: twinQuestions,
    savedCareers: saved,
  };
}

export interface AllowanceView {
  used: number;
  /** null = unlimited. */
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
}

/** Usage and limits together — what the profile page and indicators render. */
export async function getAllowances(userId: string): Promise<{
  limits: EntitlementLimits;
  usage: UsageCounts;
  careerExplorations: AllowanceView;
  careerTwinQuestions: AllowanceView;
  savedCareers: AllowanceView;
}> {
  const [{ limits }, usage] = await Promise.all([
    getUserEntitlements(userId),
    getUsage(userId),
  ]);

  const view = (used: number, limit: number | null): AllowanceView => ({
    used,
    limit,
    remaining: remaining(used, limit),
    allowed: allowsAnother(used, limit),
  });

  return {
    limits,
    usage,
    careerExplorations: view(usage.careerExplorations, limits.careerExplorations),
    careerTwinQuestions: view(usage.careerTwinQuestions, limits.careerTwinQuestions),
    savedCareers: view(usage.savedCareers, limits.savedCareers),
  };
}

export type ExplorationDecision =
  | { allowed: true; alreadyExplored: boolean; used: number; limit: number | null }
  | { allowed: false; reason: "limit_reached"; used: number; limit: number };

/**
 * May this user take this career into My Journey, and record it if so.
 *
 * Revisiting a career the user has already explored is always free — the
 * allowance buys access to a career, not to a page view (brief §5). That is
 * checked FIRST, so someone at their limit can still return to all ten.
 *
 * Concurrency-safe by construction. Two simultaneous requests for the same
 * new career both pass the limit check, then both attempt the insert; the
 * unique index on (profileId, careerId) means the loser is absorbed as a
 * revisit rather than consuming a second allowance. A caller cannot get to
 * eleven by clicking twice.
 */
export async function recordCareerExploration(
  userId: string,
  careerId: string,
): Promise<ExplorationDecision> {
  const profile = await prisma.youthProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  // No profile means nothing to attribute an exploration to. Allow rather
  // than block: refusing here would gate a brand-new account out of the
  // product on a technicality.
  if (!profile) return { allowed: true, alreadyExplored: false, used: 0, limit: null };

  const existing = await prisma.careerExploration.findUnique({
    where: { profileId_careerId: { profileId: profile.id, careerId } },
    select: { id: true },
  });

  const [{ limits }, used] = await Promise.all([
    getUserEntitlements(userId),
    prisma.careerExploration.count({ where: { profileId: profile.id } }),
  ]);

  if (existing) {
    return { allowed: true, alreadyExplored: true, used, limit: limits.careerExplorations };
  }

  if (!allowsAnother(used, limits.careerExplorations)) {
    // Unreachable unless the limit is a number — allowsAnother is always true
    // when the limit is null — but narrow it for the caller regardless.
    return {
      allowed: false,
      reason: "limit_reached",
      used,
      limit: limits.careerExplorations ?? used,
    };
  }

  try {
    await prisma.careerExploration.create({
      data: { profileId: profile.id, careerId },
    });
  } catch {
    // Lost the race with a concurrent request for the same career. The row
    // exists, which is the outcome we wanted, so this is a revisit.
    return { allowed: true, alreadyExplored: true, used, limit: limits.careerExplorations };
  }

  return {
    allowed: true,
    alreadyExplored: false,
    used: used + 1,
    limit: limits.careerExplorations,
  };
}

export type TwinDecision =
  | { allowed: true; used: number; limit: number | null }
  | { allowed: false; reason: "limit_reached"; used: number; limit: number };

/**
 * May this user submit another Career Twin question?
 *
 * Checked BEFORE the model is called. Usage is not recorded here — the
 * existing `recordAiUsage` writes the row once the provider has actually
 * answered, which is what makes a failed request cost the user nothing
 * (brief §7).
 */
export async function checkCareerTwinQuestion(userId: string): Promise<TwinDecision> {
  const [{ limits }, used] = await Promise.all([
    getUserEntitlements(userId),
    prisma.aiUsageEvent.count({
      where: { userId, feature: AI_FEATURES.CAREER_TWIN, status: "successful" },
    }),
  ]);

  if (!allowsAnother(used, limits.careerTwinQuestions)) {
    return {
      allowed: false,
      reason: "limit_reached",
      used,
      limit: limits.careerTwinQuestions ?? used,
    };
  }
  return { allowed: true, used, limit: limits.careerTwinQuestions };
}
