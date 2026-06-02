"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  getRecommendationsFromAspiration,
  calculateCareerMatch,
  getCategoryForCareer,
  getCareersForCategory,
  type Career,
  type CareerCategory,
} from "@/lib/career-pathways";

// Types for My Path data
export interface PathOverview {
  snapshot: PathSnapshotData | null;
  topSkills: SkillSignalSummary[];
  recentVault: VaultItemSummary[];
  recommendedJobs: SmartJobPick[];
  alertCount: number;
}

export interface PathSnapshotData {
  id: string;
  headline: string;
  direction: string[];
  nextActions: NextAction[];
  confidence: "low" | "medium" | "high";
  rationale: string | null;
  createdAt: Date;
}

interface NextAction {
  type: "earn" | "learn" | "grow";
  action: string;
  link?: string;
}

interface SkillSignalSummary {
  skillId: string;
  skillName: string;
  skillSlug: string;
  totalStrength: number;
  sources: string[];
}

interface VaultItemSummary {
  id: string;
  type: string;
  title: string;
  createdAt: Date;
}

// NOTE: The jobs marketplace has been removed. SmartJobPick and the
// "recommended jobs" surface are retained as inert types/stubs so callers
// (e.g. onboarding) keep compiling; they now resolve to empty lists.
export interface SmartJobPick {
  id: string;
  title: string;
  category: string;
  payAmount: number;
  payType: string;
  location: string;
  distance?: number;
  score: number;
  reasons: string[];
}

export interface SkillsJobsLadder {
  targetRoles: string[];
  buildingSkills: SkillProgress[];
  gapSkills: SkillProgress[];
  recommendedJobs: SmartJobPick[];
}

interface SkillProgress {
  skillId: string;
  skillName: string;
  skillSlug: string;
  currentStrength: number;
  targetStrength: number;
  sources: string[];
}

export interface StrengthsProfile {
  topStrengths: StrengthItem[];
  growingStrengths: StrengthItem[];
  growthEdges: string[];
}

interface StrengthItem {
  name: string;
  evidence: string;
  level: "strong" | "emerging";
}

export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  duration: string;
  cost: string;
  reason: string;
  link?: string;
}

export interface AlertEvent {
  id: string;
  type: string;
  entityId: string;
  title: string;
  reason: string;
  seenAt: Date | null;
  createdAt: Date;
}

// Career Journey types for long-term career planning
export interface CareerJourneyData {
  targetCareer: Career | null;
  careerAspiration: string | null;
  educationPath: string | null;
  skillsNeeded: string[];
  skillsYouHave: string[];
  skillsToGain: string[];
  skillMatchPercent: number;
  relatedCareers: Career[];
  category: CareerCategory | null;
  completedJobsCount: number;
  totalEarnings: number;
}

// Single career journey data for one goal
export interface SingleCareerJourney {
  targetCareer: Career;
  careerAspiration: string;
  educationPath: string | null;
  skillsNeeded: string[];
  skillsYouHave: string[];
  skillsToGain: string[];
  skillMatchPercent: number;
  relatedCareers: Career[];
  category: CareerCategory | null;
}

// Multiple career journeys response
export interface MultipleCareerJourneys {
  journeys: SingleCareerJourney[];
  completedJobsCount: number;
  totalEarnings: number;
  userSkills: string[];
  availabilityLevel: string | null;
}

// Build a single SingleCareerJourney from an aspiration goal + the user's skills.
function buildJourneyForGoal(
  goal: string,
  userSkills: string[]
): SingleCareerJourney | null {
  const recommendations = getRecommendationsFromAspiration(goal);
  if (recommendations.length === 0) return null;

  const targetCareer = recommendations[0].career;
  const category = getCategoryForCareer(targetCareer.id) || null;
  const skillsNeeded = targetCareer.keySkills || [];
  const skillsNeededLower = skillsNeeded.map((s) => s.toLowerCase());

  const skillsYouHave = userSkills.filter((skill) =>
    skillsNeededLower.some(
      (needed) => needed.includes(skill) || skill.includes(needed)
    )
  );

  const skillsToGain = skillsNeeded.filter(
    (skill) =>
      !userSkills.some(
        (userSkill) =>
          userSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill)
      )
  );

  const skillMatchPercent = calculateCareerMatch(userSkills, targetCareer);

  const relatedCareers = category
    ? getCareersForCategory(category)
        .filter((c) => c.id !== targetCareer.id)
        .slice(0, 4)
    : [];

  return {
    targetCareer,
    careerAspiration: goal,
    educationPath: targetCareer.educationPath || null,
    skillsNeeded,
    skillsYouHave,
    skillsToGain,
    skillMatchPercent,
    relatedCareers,
    category,
  };
}

// Get Multiple Career Journeys - for users with multiple career goals
export async function getMultipleCareerJourneys(): Promise<MultipleCareerJourneys | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  const [youthProfile, skillSignals] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        careerAspiration: true,
        desiredRoles: true,
        availabilityLevel: true,
      },
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
    }),
  ]);

  // Extract user's skills
  const userSkills = [...new Set(skillSignals.map((s) => s.skill.name.toLowerCase()))];

  const availabilityLevel = youthProfile?.availabilityLevel || null;

  // Collect all career goals (from careerAspiration and desiredRoles)
  const careerGoals: string[] = [];

  if (youthProfile?.careerAspiration) {
    const aspirations = youthProfile.careerAspiration
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const aspiration of aspirations) {
      if (!careerGoals.includes(aspiration)) {
        careerGoals.push(aspiration);
      }
    }
  }

  if (youthProfile?.desiredRoles?.length) {
    for (const role of youthProfile.desiredRoles) {
      if (!careerGoals.includes(role)) {
        careerGoals.push(role);
      }
    }
  }

  // Build journey data for each career goal
  const journeys: SingleCareerJourney[] = [];
  const seenCareerIds = new Set<string>();

  for (const goal of careerGoals) {
    const journey = buildJourneyForGoal(goal, userSkills);
    if (journey && !seenCareerIds.has(journey.targetCareer.id)) {
      seenCareerIds.add(journey.targetCareer.id);
      journeys.push(journey);
    }
  }

  return {
    journeys,
    // Jobs marketplace removed — no completions/earnings.
    completedJobsCount: 0,
    totalEarnings: 0,
    userSkills,
    availabilityLevel,
  };
}

// Get Career Journey by specific goal - for goal-scoped sub-pages
export async function getCareerJourneyForGoal(goal: string): Promise<CareerJourneyData | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  const skillSignals = await prisma.userSkillSignal.findMany({
    where: { userId },
    include: { skill: true },
  });

  const userSkills = [...new Set(skillSignals.map((s) => s.skill.name.toLowerCase()))];

  const journey = buildJourneyForGoal(goal, userSkills);
  if (!journey) return null;

  return {
    ...journey,
    // Jobs marketplace removed — no completions/earnings.
    completedJobsCount: 0,
    totalEarnings: 0,
  };
}

// Get Career Journey - the user's long-term career path (single career - legacy)
export async function getCareerJourney(): Promise<CareerJourneyData | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  const [youthProfile, skillSignals] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        careerAspiration: true,
        desiredRoles: true,
      },
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
    }),
  ]);

  const userSkills = [...new Set(skillSignals.map((s) => s.skill.name.toLowerCase()))];

  // Find target career from aspiration, falling back to desiredRoles.
  let journey: SingleCareerJourney | null = null;
  if (youthProfile?.careerAspiration) {
    journey = buildJourneyForGoal(youthProfile.careerAspiration, userSkills);
  }
  if (!journey && youthProfile?.desiredRoles?.length) {
    journey = buildJourneyForGoal(youthProfile.desiredRoles.join(" "), userSkills);
  }

  return {
    targetCareer: journey?.targetCareer ?? null,
    careerAspiration: youthProfile?.careerAspiration || null,
    educationPath: journey?.educationPath ?? null,
    skillsNeeded: journey?.skillsNeeded ?? [],
    skillsYouHave: journey?.skillsYouHave ?? [],
    skillsToGain: journey?.skillsToGain ?? [],
    skillMatchPercent: journey?.skillMatchPercent ?? 0,
    relatedCareers: journey?.relatedCareers ?? [],
    category: journey?.category ?? null,
    // Jobs marketplace removed — no completions/earnings.
    completedJobsCount: 0,
    totalEarnings: 0,
  };
}

// Get My Path Overview
export async function getMyPathOverview(): Promise<PathOverview | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Fetch data in parallel
  const [snapshot, skillSignals, vaultItems, alerts] = await Promise.all([
    prisma.pathSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { strength: "desc" },
      take: 10,
    }),
    prisma.vaultItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.opportunityAlertEvent.count({
      where: { userId, seenAt: null },
    }),
  ]);

  // Aggregate skill signals
  const skillMap = new Map<
    string,
    { name: string; slug: string; strength: number; sources: Set<string> }
  >();
  for (const signal of skillSignals) {
    const existing = skillMap.get(signal.skillId);
    if (existing) {
      existing.strength += signal.strength;
      existing.sources.add(signal.source);
    } else {
      skillMap.set(signal.skillId, {
        name: signal.skill.name,
        slug: signal.skill.slug,
        strength: signal.strength,
        sources: new Set([signal.source]),
      });
    }
  }

  const topSkills: SkillSignalSummary[] = Array.from(skillMap.entries())
    .map(([skillId, data]) => ({
      skillId,
      skillName: data.name,
      skillSlug: data.slug,
      totalStrength: Math.min(data.strength, 100),
      sources: Array.from(data.sources),
    }))
    .sort((a, b) => b.totalStrength - a.totalStrength)
    .slice(0, 5);

  const recentVault: VaultItemSummary[] = vaultItems.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    createdAt: item.createdAt,
  }));

  return {
    snapshot: snapshot
      ? {
          id: snapshot.id,
          headline: snapshot.headline,
          direction: snapshot.direction,
          nextActions: (snapshot.nextActions as unknown as NextAction[]) || [],
          confidence: snapshot.confidence as "low" | "medium" | "high",
          rationale: snapshot.rationale,
          createdAt: snapshot.createdAt,
        }
      : null,
    topSkills,
    recentVault,
    // Jobs marketplace removed — no job recommendations.
    recommendedJobs: [],
    alertCount: alerts,
  };
}

// Get Smart Job Picks — jobs marketplace removed, always empty.
export async function getSmartJobPicks(
  _limit: number = 10
): Promise<SmartJobPick[]> {
  return [];
}

// Get Skills → Jobs Ladder
export async function getSkillsJobsLadder(): Promise<SkillsJobsLadder | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  const [youthProfile, skillSignals, allSkills] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: { desiredRoles: true, skillTags: true },
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
    }),
    prisma.skill.findMany({
      where: { isActive: true },
    }),
  ]);

  // Build current skill strength map
  const skillStrengthMap = new Map<string, number>();
  const skillSourcesMap = new Map<string, Set<string>>();

  for (const signal of skillSignals) {
    const current = skillStrengthMap.get(signal.skillId) || 0;
    skillStrengthMap.set(signal.skillId, current + signal.strength);

    const sources = skillSourcesMap.get(signal.skillId) || new Set();
    sources.add(signal.source);
    skillSourcesMap.set(signal.skillId, sources);
  }

  // Categorize skills
  const buildingSkills: SkillProgress[] = [];
  const gapSkills: SkillProgress[] = [];

  for (const skill of allSkills) {
    const strength = Math.min(skillStrengthMap.get(skill.id) || 0, 100);
    const sources = skillSourcesMap.get(skill.id) || new Set();

    if (strength > 0 && strength < 80) {
      buildingSkills.push({
        skillId: skill.id,
        skillName: skill.name,
        skillSlug: skill.slug,
        currentStrength: strength,
        targetStrength: 80,
        sources: Array.from(sources),
      });
    } else if (strength === 0) {
      // Only show gap skills that are commonly needed
      const commonSkills = [
        "communication",
        "punctuality",
        "reliability",
        "time-management",
        "problem-solving",
      ];
      if (commonSkills.includes(skill.slug)) {
        gapSkills.push({
          skillId: skill.id,
          skillName: skill.name,
          skillSlug: skill.slug,
          currentStrength: 0,
          targetStrength: 50,
          sources: [],
        });
      }
    }
  }

  // Sort by current strength descending for building, keep gap skills limited
  buildingSkills.sort((a, b) => b.currentStrength - a.currentStrength);
  const topBuildingSkills = buildingSkills.slice(0, 5);
  const topGapSkills = gapSkills.slice(0, 5);

  return {
    targetRoles: youthProfile?.desiredRoles || [],
    buildingSkills: topBuildingSkills,
    gapSkills: topGapSkills,
    // Jobs marketplace removed — no job recommendations.
    recommendedJobs: [],
  };
}

// Get Strengths Profile
export async function getStrengthsProfile(): Promise<StrengthsProfile | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Strengths are now derived from skill signals only (job feedback/reviews
  // were removed with the marketplace).
  const skillSignals = await prisma.userSkillSignal.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: { strength: "desc" },
  });

  // Aggregate skill strengths
  const skillMap = new Map<
    string,
    { name: string; totalStrength: number; sources: string[] }
  >();
  for (const signal of skillSignals) {
    const existing = skillMap.get(signal.skillId);
    if (existing) {
      existing.totalStrength += signal.strength;
      if (signal.evidence) existing.sources.push(signal.evidence);
    } else {
      skillMap.set(signal.skillId, {
        name: signal.skill.name,
        totalStrength: signal.strength,
        sources: signal.evidence ? [signal.evidence] : [],
      });
    }
  }

  // Build strengths from aggregated skills
  const sortedSkills = Array.from(skillMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalStrength - a.totalStrength);

  const topStrengths: StrengthItem[] = sortedSkills.slice(0, 3).map((skill) => ({
    name: skill.name,
    evidence: skill.sources.length > 0 ? skill.sources[0] : "From your activity so far",
    level: "strong" as const,
  }));

  const growingStrengths: StrengthItem[] = sortedSkills
    .slice(3, 6)
    .map((skill) => ({
      name: skill.name,
      evidence: "Building through recent activity",
      level: "emerging" as const,
    }));

  // Growth edges — generic guidance now that job feedback is gone.
  const growthEdges: string[] = [
    "Explore a new career to widen your options",
    "Add evidence of your skills to your Vault",
  ];

  return {
    topStrengths,
    growingStrengths,
    growthEdges: growthEdges.slice(0, 3),
  };
}

// Get Courses For Me (MVP: curated/mocked list)
export async function getCoursesForMe(): Promise<CourseRecommendation[]> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return [];

  // MVP: Return curated courses based on common needs
  const courses: CourseRecommendation[] = [
    {
      id: "course-first-aid",
      title: "Basic First Aid",
      provider: "Norwegian Red Cross",
      duration: "4 hours",
      cost: "Free",
      reason: "A valued, widely-recognised skill",
      link: "https://www.rodekors.no/",
    },
    {
      id: "course-food-safety",
      title: "Food Safety Basics",
      provider: "Mattilsynet",
      duration: "2 hours",
      cost: "Free",
      reason: "Useful across many career paths",
    },
    {
      id: "course-digital-skills",
      title: "Digital Skills for Youth",
      provider: "Karriereveiledning.no",
      duration: "Self-paced",
      cost: "Free",
      reason: "Builds in-demand tech confidence",
    },
    {
      id: "course-communication",
      title: "Effective Communication",
      provider: "ung.no",
      duration: "1 hour",
      cost: "Free",
      reason: "Helps in every career",
    },
  ];

  return courses;
}

// Get Opportunity Alerts
export async function getOpportunityAlerts(): Promise<AlertEvent[]> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return [];

  const alerts = await prisma.opportunityAlertEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return alerts.map((a) => ({
    id: a.id,
    type: a.type,
    entityId: a.entityId,
    title: a.title,
    reason: a.reason,
    seenAt: a.seenAt,
    createdAt: a.createdAt,
  }));
}

// Mark Alert as Seen
export async function markAlertSeen(alertId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return false;

  try {
    await prisma.opportunityAlertEvent.update({
      where: { id: alertId, userId: session.user.id },
      data: { seenAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

// Get Alert Preferences
export async function getAlertPreferences() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const prefs = await prisma.opportunityAlertPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    prefs || {
      enabled: true,
      radiusKm: 10,
      categories: [],
      roles: [],
      notifyEmail: false,
      notifyPush: true,
    }
  );
}

// Update Alert Preferences
export async function updateAlertPreferences(data: {
  enabled?: boolean;
  radiusKm?: number;
  categories?: string[];
  roles?: string[];
  notifyEmail?: boolean;
  notifyPush?: boolean;
}): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return false;

  try {
    await prisma.opportunityAlertPreference.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Get Vault Items
export async function getVaultItems() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return [];

  const items = await prisma.vaultItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return items;
}

// Create Vault Item
export async function createVaultItem(data: {
  type: string;
  title: string;
  description?: string;
  url?: string;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const item = await prisma.vaultItem.create({
      data: {
        userId: session.user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        url: data.url,
        metadata: data.metadata ?? undefined,
        isPrivate: true,
      },
    });
    return { success: true, id: item.id };
  } catch (error) {
    console.error("Failed to create vault item:", error);
    return { success: false, error: "Failed to create vault item" };
  }
}

// Generate Path Snapshot
export async function generatePathSnapshot(): Promise<PathSnapshotData | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Snapshot is now built from profile direction + skill signals + vault
  // (job completions and reviews were removed with the marketplace).
  const [youthProfile, skillSignals] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        desiredRoles: true,
        careerAspiration: true,
      },
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
    }),
  ]);

  const skillCount = skillSignals.length;

  // Determine confidence level from how much the user has built so far.
  let confidence: "low" | "medium" | "high" = "low";
  if (skillCount >= 6) {
    confidence = "high";
  } else if (skillCount >= 2) {
    confidence = "medium";
  }

  // Generate headline
  let headline = "Starting your journey";
  if (skillCount >= 6) {
    headline = "Building momentum";
  } else if (skillCount >= 2) {
    headline = "Growing your direction";
  }

  // Generate direction (1-3 roles)
  const direction: string[] = [];
  if (youthProfile?.desiredRoles && youthProfile.desiredRoles.length > 0) {
    direction.push(...youthProfile.desiredRoles.slice(0, 3));
  } else if (youthProfile?.careerAspiration) {
    direction.push(youthProfile.careerAspiration);
  } else {
    direction.push("Explore different careers");
  }

  // Generate next actions (career-exploration focused)
  const nextActions: NextAction[] = [];

  const skillSlugs = new Set(skillSignals.map((s) => s.skill.slug));
  if (!skillSlugs.has("communication")) {
    nextActions.push({
      type: "learn",
      action: "Build a clear-communication skill with a short course",
      link: "/my-path/courses",
    });
  }

  const vaultCount = await prisma.vaultItem.count({ where: { userId } });
  if (vaultCount < 3) {
    nextActions.push({
      type: "grow",
      action: "Add proof of your skills to your Vault",
      link: "/my-path/vault",
    });
  }

  nextActions.push({
    type: "learn",
    action: "Check out recommended courses",
    link: "/my-path/courses",
  });

  if (!youthProfile?.desiredRoles?.length) {
    nextActions.push({
      type: "grow",
      action: "Set your career interests in your profile",
      link: "/profile",
    });
  }

  nextActions.push({
    type: "grow",
    action: "Explore careers that match your interests",
    link: "/careers",
  });

  // Cap at 7 actions
  const finalActions = nextActions.slice(0, 7);

  // Generate rationale
  const rationale =
    skillCount > 0
      ? `Based on ${skillCount} skill signal${skillCount > 1 ? "s" : ""} you've built.`
      : "Get started by exploring careers and building your profile.";

  // Save snapshot
  const snapshot = await prisma.pathSnapshot.create({
    data: {
      userId,
      headline,
      direction,
      nextActions: finalActions as unknown as Prisma.InputJsonValue,
      confidence,
      rationale,
    },
  });

  return {
    id: snapshot.id,
    headline: snapshot.headline,
    direction: snapshot.direction,
    nextActions: finalActions,
    confidence: confidence,
    rationale: snapshot.rationale,
    createdAt: snapshot.createdAt,
  };
}

// Update Path Preferences
export async function updatePathPreferences(data: {
  desiredRoles?: string[];
  desiredSectors?: string[];
  learningPreferences?: string[];
  availabilityTags?: string[];
  locationBase?: string;
}): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return false;

  try {
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        ...data,
        pathUpdatedAt: new Date(),
      },
    });
    return true;
  } catch {
    return false;
  }
}
