"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skillsPerJobCategory } from "../../../prisma/seed";
import type { JobCategory, Prisma } from "@prisma/client";
import {
  getRecommendationsFromAspiration,
  calculateCareerMatch,
  getCareerById,
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

// Get Career Journey - the user's long-term career path
export async function getCareerJourney(): Promise<CareerJourneyData | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Fetch user profile and skill data
  const [youthProfile, skillSignals, completedJobs] = await Promise.all([
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
    prisma.jobCompletion.findMany({
      where: {
        youthId: userId,
        outcome: "COMPLETED",
      },
      include: {
        job: {
          select: { payAmount: true },
        },
      },
    }),
  ]);

  // Extract user's skills
  const userSkills = [...new Set(skillSignals.map((s) => s.skill.name.toLowerCase()))];

  // Find target career from aspiration
  let targetCareer: Career | null = null;
  let category: CareerCategory | null = null;

  if (youthProfile?.careerAspiration) {
    const recommendations = getRecommendationsFromAspiration(youthProfile.careerAspiration);
    if (recommendations.length > 0) {
      targetCareer = recommendations[0].career;
      category = getCategoryForCareer(targetCareer.id) || null;
    }
  }

  // If no aspiration, try to match from desiredRoles
  if (!targetCareer && youthProfile?.desiredRoles?.length) {
    const roleAspiration = youthProfile.desiredRoles.join(" ");
    const recommendations = getRecommendationsFromAspiration(roleAspiration);
    if (recommendations.length > 0) {
      targetCareer = recommendations[0].career;
      category = getCategoryForCareer(targetCareer.id) || null;
    }
  }

  // Calculate skills analysis
  const skillsNeeded = targetCareer?.keySkills || [];
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

  const skillMatchPercent = targetCareer
    ? calculateCareerMatch(userSkills, targetCareer)
    : 0;

  // Get related careers in same category
  const relatedCareers = category
    ? getCareersForCategory(category)
        .filter((c) => c.id !== targetCareer?.id)
        .slice(0, 4)
    : [];

  // Calculate total earnings
  const totalEarnings = completedJobs.reduce(
    (sum, app) => sum + (app.job.payAmount || 0),
    0
  );

  return {
    targetCareer,
    careerAspiration: youthProfile?.careerAspiration || null,
    educationPath: targetCareer?.educationPath || null,
    skillsNeeded,
    skillsYouHave,
    skillsToGain,
    skillMatchPercent,
    relatedCareers,
    category,
    completedJobsCount: completedJobs.length,
    totalEarnings,
  };
}

// Get My Path Overview
export async function getMyPathOverview(): Promise<PathOverview | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Fetch data in parallel
  const [snapshot, skillSignals, vaultItems, alerts, youthProfile] =
    await Promise.all([
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
      prisma.youthProfile.findUnique({
        where: { userId },
        select: { desiredRoles: true, locationBase: true },
      }),
    ]);

  // Get smart job picks
  const recommendedJobs = await getSmartJobPicksInternal(userId, 3);

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
    recommendedJobs,
    alertCount: alerts,
  };
}

// Internal helper for smart job picks
async function getSmartJobPicksInternal(
  userId: string,
  limit: number = 10
): Promise<SmartJobPick[]> {
  // Get user's profile and history
  const [youthProfile, completedJobs, skillSignals] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        desiredRoles: true,
        locationBase: true,
        skillTags: true,
      },
    }),
    prisma.jobCompletion.findMany({
      where: { youthId: userId, outcome: "COMPLETED" },
      include: { job: { select: { category: true } } },
      take: 20,
    }),
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
    }),
  ]);

  // Get available jobs
  const jobs = await prisma.microJob.findMany({
    where: {
      status: "POSTED",
      isPaused: false,
    },
    include: {
      postedBy: {
        include: {
          employerProfile: {
            select: { companyName: true, verified: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Build skill gaps map
  const userSkillSlugs = new Set(skillSignals.map((s) => s.skill.slug));
  const completedCategories = new Set(completedJobs.map((j) => j.job.category));

  // Score and rank jobs
  const scoredJobs = jobs.map((job) => {
    let score = 0;
    const reasons: string[] = [];

    // Skill growth score (higher if job builds skills user lacks)
    const jobSkills =
      skillsPerJobCategory[job.category as keyof typeof skillsPerJobCategory] ||
      [];
    const newSkillsCount = jobSkills.filter(
      (s: string) => !userSkillSlugs.has(s)
    ).length;
    if (newSkillsCount > 0) {
      score += newSkillsCount * 10;
      reasons.push(`Builds ${newSkillsCount} new skills`);
    }

    // Earnings score (higher pay = higher score)
    if (job.payAmount >= 200) {
      score += 20;
      reasons.push("Good pay");
    } else if (job.payAmount >= 150) {
      score += 10;
    }

    // Safety score (verified employer)
    if (job.postedBy?.employerProfile?.verified) {
      score += 15;
      reasons.push("Verified employer");
    }

    // Category match (if user has done similar before, slight boost)
    if (completedCategories.has(job.category)) {
      score += 5;
      reasons.push("Similar to past jobs");
    }

    // Recency bonus
    const daysOld = Math.floor(
      (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld < 3) {
      score += 10;
      reasons.push("Recently posted");
    }

    return {
      id: job.id,
      title: job.title,
      category: job.category,
      payAmount: job.payAmount,
      payType: job.payType,
      location: job.location,
      score,
      reasons: reasons.slice(0, 3),
    };
  });

  return scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get Smart Job Picks
export async function getSmartJobPicks(
  limit: number = 10
): Promise<SmartJobPick[]> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return [];

  return getSmartJobPicksInternal(session.user.id, limit);
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

  // Get recommended jobs for skill building
  const recommendedJobs = await getSmartJobPicksInternal(userId, 5);

  return {
    targetRoles: youthProfile?.desiredRoles || [],
    buildingSkills: topBuildingSkills,
    gapSkills: topGapSkills,
    recommendedJobs,
  };
}

// Get Strengths Profile
export async function getStrengthsProfile(): Promise<StrengthsProfile | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const userId = session.user.id;

  // Get skill signals with evidence
  const [skillSignals, feedbacks, reviews] = await Promise.all([
    prisma.userSkillSignal.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { strength: "desc" },
    }),
    prisma.structuredFeedback.findMany({
      where: {
        jobCompletion: { youthId: userId },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.findMany({
      where: { reviewedId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

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

  const topStrengths: StrengthItem[] = sortedSkills.slice(0, 3).map((skill) => {
    // Build evidence from reviews and feedback
    let evidence = "";
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.overall, 0) / reviews.length
          ).toFixed(1)
        : null;

    if (skill.sources.length > 0) {
      evidence = skill.sources[0];
    } else if (avgRating) {
      evidence = `Based on ${reviews.length} reviews (${avgRating} avg)`;
    } else {
      evidence = "From your completed jobs";
    }

    return {
      name: skill.name,
      evidence,
      level: "strong" as const,
    };
  });

  const growingStrengths: StrengthItem[] = sortedSkills
    .slice(3, 6)
    .map((skill) => ({
      name: skill.name,
      evidence: "Building through recent work",
      level: "emerging" as const,
    }));

  // Growth edges based on feedback patterns
  const growthEdges: string[] = [];

  // Analyze feedback for areas to improve
  if (feedbacks.length > 0) {
    const avgPunctuality =
      feedbacks.reduce((sum, f) => sum + f.punctuality, 0) / feedbacks.length;
    const avgCommunication =
      feedbacks.reduce((sum, f) => sum + f.communication, 0) / feedbacks.length;

    if (avgPunctuality < 4) {
      growthEdges.push("Try arriving 10 minutes early to boost punctuality");
    }
    if (avgCommunication < 4) {
      growthEdges.push("Keep employers updated throughout the job");
    }
  }

  if (growthEdges.length === 0) {
    growthEdges.push("Try a new job category to expand your skills");
    growthEdges.push("Complete more jobs to build stronger evidence");
  }

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
  // In production, this would be dynamic based on user's skill gaps
  const courses: CourseRecommendation[] = [
    {
      id: "course-first-aid",
      title: "Basic First Aid for Babysitters",
      provider: "Norwegian Red Cross",
      duration: "4 hours",
      cost: "Free",
      reason: "Essential for childcare jobs",
      link: "https://www.rodekors.no/",
    },
    {
      id: "course-food-safety",
      title: "Food Safety Basics",
      provider: "Mattilsynet",
      duration: "2 hours",
      cost: "Free",
      reason: "Required for cooking/catering jobs",
    },
    {
      id: "course-digital-skills",
      title: "Digital Skills for Youth",
      provider: "Karriereveiledning.no",
      duration: "Self-paced",
      cost: "Free",
      reason: "Improves tech help opportunities",
    },
    {
      id: "course-communication",
      title: "Effective Communication",
      provider: "ung.no",
      duration: "1 hour",
      cost: "Free",
      reason: "Helps in all job types",
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
    include: {
      job: {
        select: {
          title: true,
          category: true,
        },
      },
    },
  });

  return items;
}

// Create Vault Item
export async function createVaultItem(data: {
  type: string;
  title: string;
  description?: string;
  jobId?: string;
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
        jobId: data.jobId,
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

  // Gather user data for snapshot generation
  const [youthProfile, completedJobs, skillSignals, reviews] =
    await Promise.all([
      prisma.youthProfile.findUnique({
        where: { userId },
        select: {
          desiredRoles: true,
          careerAspiration: true,
          completedJobsCount: true,
          averageRating: true,
        },
      }),
      prisma.jobCompletion.findMany({
        where: { youthId: userId, outcome: "COMPLETED" },
        include: { job: { select: { category: true, title: true } } },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
      prisma.userSkillSignal.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.review.findMany({
        where: { reviewedId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // Determine confidence level
  let confidence: "low" | "medium" | "high" = "low";
  if (completedJobs.length >= 5 && reviews.length >= 3) {
    confidence = "high";
  } else if (completedJobs.length >= 2 || reviews.length >= 1) {
    confidence = "medium";
  }

  // Generate headline
  let headline = "Starting your journey";
  if (completedJobs.length >= 5) {
    headline = "Building momentum";
  } else if (completedJobs.length >= 2) {
    headline = "Growing your experience";
  } else if (completedJobs.length >= 1) {
    headline = "Your first steps";
  }

  // Generate direction (1-3 roles)
  const direction: string[] = [];
  if (youthProfile?.desiredRoles && youthProfile.desiredRoles.length > 0) {
    direction.push(...youthProfile.desiredRoles.slice(0, 3));
  } else {
    // Infer from completed job categories
    const categoryCount = new Map<string, number>();
    for (const job of completedJobs) {
      const count = categoryCount.get(job.job.category) || 0;
      categoryCount.set(job.job.category, count + 1);
    }
    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    if (topCategories.length > 0) {
      direction.push(...topCategories);
    } else {
      direction.push("Explore different opportunities");
    }
  }

  // Generate next actions (3-7)
  const nextActions: NextAction[] = [];

  // Always suggest completing more jobs if low count
  if (completedJobs.length < 3) {
    nextActions.push({
      type: "earn",
      action: "Complete your first few jobs to build your profile",
      link: "/jobs",
    });
  }

  // Suggest skill building based on gaps
  const skillSlugs = new Set(skillSignals.map((s) => s.skill.slug));
  if (!skillSlugs.has("communication")) {
    nextActions.push({
      type: "learn",
      action: "Take on a job that requires clear communication",
    });
  }

  // Suggest building vault
  const vaultCount = await prisma.vaultItem.count({ where: { userId } });
  if (vaultCount < 3) {
    nextActions.push({
      type: "grow",
      action: "Add completed jobs to your Vault as proof",
      link: "/my-path/vault",
    });
  }

  // Always add a learn action
  nextActions.push({
    type: "learn",
    action: "Check out recommended courses",
    link: "/my-path/courses",
  });

  // Add explore action if no desired roles set
  if (!youthProfile?.desiredRoles?.length) {
    nextActions.push({
      type: "grow",
      action: "Set your career interests in your profile",
      link: "/profile",
    });
  }

  // Add a job action
  nextActions.push({
    type: "earn",
    action: "Apply to a recommended job match",
    link: "/my-path/job-picks",
  });

  // Cap at 7 actions
  const finalActions = nextActions.slice(0, 7);

  // Generate rationale
  let rationale = "";
  if (completedJobs.length > 0) {
    rationale = `Based on ${completedJobs.length} completed job${completedJobs.length > 1 ? "s" : ""}`;
    if (reviews.length > 0 && youthProfile?.averageRating) {
      rationale += ` with ${youthProfile.averageRating.toFixed(1)} average rating`;
    }
    rationale += ".";
  } else {
    rationale = "Get started by completing your first job.";
  }

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
