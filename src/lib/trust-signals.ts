import { prisma } from '@/lib/prisma';
import { TrustSignalType, TrustSignalSource, StructuredFeedback, JobCompletion } from '@prisma/client';

// ============================================
// TRUST SIGNALS (Feature 5)
// Private indicators of reliability and growth
// NEVER exposed publicly - internal matching only
// ============================================

interface TrustSignalCreateParams {
  userId: string;
  type: TrustSignalType;
  sourceType: TrustSignalSource;
  sourceId?: string;
  weight?: number;
}

/**
 * Create a trust signal (idempotent for same source)
 */
async function createTrustSignal(params: TrustSignalCreateParams): Promise<boolean> {
  try {
    // Check if signal already exists for this source
    if (params.sourceId) {
      const existing = await prisma.trustSignal.findFirst({
        where: {
          userId: params.userId,
          type: params.type,
          sourceId: params.sourceId,
        },
      });
      if (existing) return false;
    }

    await prisma.trustSignal.create({
      data: {
        userId: params.userId,
        type: params.type,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        weight: params.weight ?? 1,
      },
    });
    return true;
  } catch {
    console.error('Failed to create trust signal:', params);
    return false;
  }
}

/**
 * Generate trust signals from structured feedback
 * Called when feedback is submitted
 */
export async function generateTrustSignalsFromFeedback(
  feedback: StructuredFeedback,
  completion: JobCompletion
): Promise<{ signalsCreated: TrustSignalType[] }> {
  const signalsCreated: TrustSignalType[] = [];
  const youthId = completion.youthId;
  const sourceId = feedback.id;

  // ON_TIME: punctuality >= 4
  if (feedback.punctuality >= 4) {
    const created = await createTrustSignal({
      userId: youthId,
      type: 'ON_TIME',
      sourceType: 'FEEDBACK',
      sourceId,
    });
    if (created) signalsCreated.push('ON_TIME');
  }

  // GOOD_COMMS: communication >= 4
  if (feedback.communication >= 4) {
    const created = await createTrustSignal({
      userId: youthId,
      type: 'GOOD_COMMS',
      sourceType: 'FEEDBACK',
      sourceId,
    });
    if (created) signalsCreated.push('GOOD_COMMS');
  }

  // Check for REPEAT_HIRE: same employer has hired this youth >= 2 times
  const previousHires = await prisma.jobCompletion.count({
    where: {
      youthId,
      employerId: completion.employerId,
      outcome: 'COMPLETED',
    },
  });

  if (previousHires >= 2) {
    const created = await createTrustSignal({
      userId: youthId,
      type: 'REPEAT_HIRE',
      sourceType: 'FEEDBACK',
      sourceId,
      weight: previousHires, // Higher weight for more rehires
    });
    if (created) signalsCreated.push('REPEAT_HIRE');
  }

  // Check for CONSISTENCY_STREAK: last 3+ completions are COMPLETED
  const recentCompletions = await prisma.jobCompletion.findMany({
    where: { youthId },
    orderBy: { completedAt: 'desc' },
    take: 3,
    select: { outcome: true },
  });

  if (recentCompletions.length >= 3 && recentCompletions.every(c => c.outcome === 'COMPLETED')) {
    const created = await createTrustSignal({
      userId: youthId,
      type: 'CONSISTENCY_STREAK',
      sourceType: 'SYSTEM',
      sourceId: `streak-${new Date().toISOString().slice(0, 7)}`, // Monthly dedup
    });
    if (created) signalsCreated.push('CONSISTENCY_STREAK');
  }

  // Check for POSITIVE_TREND: last 3 feedbacks show increasing avg scores
  const recentFeedbacks = await prisma.structuredFeedback.findMany({
    where: {
      jobCompletion: { youthId },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      punctuality: true,
      communication: true,
      quality: true,
      respectfulness: true,
      followedInstructions: true,
    },
  });

  if (recentFeedbacks.length >= 3) {
    const avgScores = recentFeedbacks.map(f =>
      (f.punctuality + f.communication + f.quality + f.respectfulness + f.followedInstructions) / 5
    );

    // Check if scores are increasing (oldest to newest)
    const reversed = [...avgScores].reverse();
    const isIncreasing = reversed.every((score, i) => i === 0 || score >= reversed[i - 1]);

    if (isIncreasing) {
      const created = await createTrustSignal({
        userId: youthId,
        type: 'POSITIVE_TREND',
        sourceType: 'SYSTEM',
        sourceId: `trend-${new Date().toISOString().slice(0, 7)}`,
      });
      if (created) signalsCreated.push('POSITIVE_TREND');
    }
  }

  return { signalsCreated };
}

/**
 * Grant a trust signal for helping another youth
 * Called when a youth recommends another youth who gets hired
 */
export async function grantHelpedOtherSignal(
  helperId: string,
  recommendationId: string
): Promise<boolean> {
  return createTrustSignal({
    userId: helperId,
    type: 'HELPED_OTHER',
    sourceType: 'COMMUNITY',
    sourceId: recommendationId,
  });
}

/**
 * Grant a trust signal for resolving a community report positively
 * Called when a reported issue is resolved with positive outcome
 */
export async function grantCommunityReportResolvedSignal(
  userId: string,
  reportId: string
): Promise<boolean> {
  return createTrustSignal({
    userId,
    type: 'COMMUNITY_REPORT_RESOLVED',
    sourceType: 'COMMUNITY',
    sourceId: reportId,
  });
}

/**
 * Get trust signal summary for internal use only
 * This should NEVER be exposed to other users
 */
export async function getTrustSummary(userId: string) {
  const signals = await prisma.trustSignal.groupBy({
    by: ['type'],
    where: { userId },
    _count: { type: true },
    _sum: { weight: true },
  });

  const totalWeight = signals.reduce((sum, s) => sum + (s._sum.weight || 0), 0);

  return {
    signals: signals.map(s => ({
      type: s.type,
      count: s._count.type,
      totalWeight: s._sum.weight || 0,
    })),
    totalSignals: signals.reduce((sum, s) => sum + s._count.type, 0),
    totalWeight,
  };
}

/**
 * Get human-readable label for trust signal type
 */
export function getTrustSignalLabel(type: TrustSignalType): string {
  const labels: Record<TrustSignalType, string> = {
    ON_TIME: 'Punctual',
    GOOD_COMMS: 'Great Communicator',
    REPEAT_HIRE: 'Trusted by Employers',
    HELPED_OTHER: 'Community Helper',
    COMMUNITY_REPORT_RESOLVED: 'Issue Resolver',
    POSITIVE_TREND: 'Growing Stronger',
    CONSISTENCY_STREAK: 'Consistent Performer',
  };
  return labels[type] || type;
}

/**
 * Get human-readable description for trust signal type
 */
export function getTrustSignalDescription(type: TrustSignalType): string {
  const descriptions: Record<TrustSignalType, string> = {
    ON_TIME: 'Arrives on time to jobs',
    GOOD_COMMS: 'Communicates clearly and professionally',
    REPEAT_HIRE: 'Re-hired by the same employer',
    HELPED_OTHER: 'Helped connect another youth with work',
    COMMUNITY_REPORT_RESOLVED: 'Resolved a community concern positively',
    POSITIVE_TREND: 'Feedback scores are improving over time',
    CONSISTENCY_STREAK: 'Consistently completes jobs successfully',
  };
  return descriptions[type] || '';
}
