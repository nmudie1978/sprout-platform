import { prisma } from '@/lib/prisma';
import { TrustSignalType, TrustSignalSource, ResponsibilityLevel } from '@prisma/client';

// ============================================
// GROWTH TRACKING (Feature 4)
// Aggregates job completion data for private "Grow" view
// ============================================

export interface GrowthMonthData {
  month: string; // YYYY-MM format
  jobsCompleted: number;
  avgPunctuality: number;
  avgCommunication: number;
  avgQuality: number;
  responsibilityDistribution: {
    BASIC: number;
    INTERMEDIATE: number;
    ADVANCED: number;
  };
  wouldRehireCount: number;
}

export interface SkillDemonstrated {
  slug: string;
  name: string;
  category: string;
  count: number;
}

export interface GrowthGraph {
  monthlyProgress: GrowthMonthData[];
  totalJobsCompleted: number;
  totalWouldRehire: number;
  skillsDemonstrated: SkillDemonstrated[];
  supervisionSplit: {
    supervised: number;
    unsupervised: number;
    unknown: number;
  };
  trustSignals: {
    type: TrustSignalType;
    count: number;
    latestAt: Date;
  }[];
}

/**
 * Get aggregated growth data for a youth user
 * This is PRIVATE data - never exposed publicly
 */
export async function getUserGrowthGraph(userId: string): Promise<GrowthGraph | null> {
  // Verify user is a youth
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== 'YOUTH') {
    return null;
  }

  // Get all job completions with feedback
  const completions = await prisma.jobCompletion.findMany({
    where: { youthId: userId },
    include: {
      feedback: true,
      job: { select: { title: true, category: true } },
    },
    orderBy: { completedAt: 'desc' },
  });

  // Calculate monthly aggregations
  const monthlyMap = new Map<string, {
    jobs: number;
    punctuality: number[];
    communication: number[];
    quality: number[];
    responsibility: Record<ResponsibilityLevel, number>;
    wouldRehire: number;
  }>();

  let totalWouldRehire = 0;
  const skillCounts = new Map<string, number>();

  for (const completion of completions) {
    const monthKey = completion.completedAt.toISOString().slice(0, 7);

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        jobs: 0,
        punctuality: [],
        communication: [],
        quality: [],
        responsibility: { BASIC: 0, INTERMEDIATE: 0, ADVANCED: 0 },
        wouldRehire: 0,
      });
    }

    const monthData = monthlyMap.get(monthKey)!;
    monthData.jobs++;

    if (completion.feedback) {
      monthData.punctuality.push(completion.feedback.punctuality);
      monthData.communication.push(completion.feedback.communication);
      monthData.quality.push(completion.feedback.quality);
      monthData.responsibility[completion.feedback.responsibilityLevel]++;

      if (completion.feedback.wouldRehire) {
        monthData.wouldRehire++;
        totalWouldRehire++;
      }

      // Count skills demonstrated
      for (const skillSlug of completion.feedback.skillsDemonstrated) {
        skillCounts.set(skillSlug, (skillCounts.get(skillSlug) || 0) + 1);
      }
    }
  }

  // Convert monthly map to sorted array
  const monthlyProgress: GrowthMonthData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      jobsCompleted: data.jobs,
      avgPunctuality: data.punctuality.length > 0
        ? data.punctuality.reduce((a, b) => a + b, 0) / data.punctuality.length
        : 0,
      avgCommunication: data.communication.length > 0
        ? data.communication.reduce((a, b) => a + b, 0) / data.communication.length
        : 0,
      avgQuality: data.quality.length > 0
        ? data.quality.reduce((a, b) => a + b, 0) / data.quality.length
        : 0,
      responsibilityDistribution: data.responsibility,
      wouldRehireCount: data.wouldRehire,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Get skills with names
  const skillSlugs = Array.from(skillCounts.keys());
  const skills = await prisma.skill.findMany({
    where: { slug: { in: skillSlugs } },
    select: { slug: true, name: true, category: true },
  });

  const skillsDemonstrated: SkillDemonstrated[] = skills.map(skill => ({
    slug: skill.slug,
    name: skill.name,
    category: skill.category,
    count: skillCounts.get(skill.slug) || 0,
  })).sort((a, b) => b.count - a.count);

  // Calculate supervision split
  const supervisionSplit = {
    supervised: completions.filter(c => c.supervision === 'SUPERVISED').length,
    unsupervised: completions.filter(c => c.supervision === 'UNSUPERVISED').length,
    unknown: completions.filter(c => c.supervision === 'UNKNOWN').length,
  };

  // Get trust signals aggregated by type
  const trustSignals = await prisma.trustSignal.groupBy({
    by: ['type'],
    where: { userId },
    _count: { type: true },
    _max: { createdAt: true },
  });

  return {
    monthlyProgress,
    totalJobsCompleted: completions.length,
    totalWouldRehire,
    skillsDemonstrated,
    supervisionSplit,
    trustSignals: trustSignals.map(ts => ({
      type: ts.type,
      count: ts._count.type,
      latestAt: ts._max.createdAt!,
    })),
  };
}

/**
 * Get recent trust signals for a user (for display)
 */
export async function getRecentTrustSignals(userId: string, limit = 10) {
  return prisma.trustSignal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get all available skills (for feedback form)
 */
export async function getAllSkills() {
  return prisma.skill.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}
