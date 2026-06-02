import { prisma } from '@/lib/prisma';
import { TrustSignalType } from '@prisma/client';

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

  // Jobs marketplace removed: there are no job completions or structured
  // feedback to aggregate. Growth now reflects trust signals only (still kept),
  // until a replacement experience signal is wired. Job-derived metrics are 0.
  const monthlyProgress: GrowthMonthData[] = [];
  const totalWouldRehire = 0;
  const skillsDemonstrated: SkillDemonstrated[] = [];
  const supervisionSplit = { supervised: 0, unsupervised: 0, unknown: 0 };

  // Get trust signals aggregated by type
  const trustSignals = await prisma.trustSignal.groupBy({
    by: ['type'],
    where: { userId },
    _count: { type: true },
    _max: { createdAt: true },
  });

  return {
    monthlyProgress,
    totalJobsCompleted: 0,
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
