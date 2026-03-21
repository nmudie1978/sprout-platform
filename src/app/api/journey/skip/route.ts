export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createOrchestrator,
  type JourneyStateContext,
  type JourneyStateId,
  type JourneySummary,
  OPTIONAL_JOURNEY_STATES,
} from '@/lib/journey';

/**
 * POST /api/journey/skip
 *
 * Skip an optional journey step with a reason
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stepId, reason } = body as {
      stepId: JourneyStateId;
      reason: string;
    };

    if (!stepId || !reason) {
      return NextResponse.json({ error: 'Missing stepId or reason' }, { status: 400 });
    }

    // Validate step is optional
    if (!OPTIONAL_JOURNEY_STATES.includes(stepId)) {
      return NextResponse.json(
        { error: 'This step cannot be skipped' },
        { status: 400 }
      );
    }

    // Validate reason length
    if (reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Fetch current profile and build context
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Build context
    const [completedJobs, shadowsCompleted, savedCareers] = await Promise.all([
      prisma.jobCompletion.count({
        where: {
          youthId: session.user.id,
          outcome: 'COMPLETED',
        },
      }),
      prisma.shadowRequest.count({
        where: {
          youthId: session.user.id,
          status: 'COMPLETED',
        },
      }),
      prisma.savedIndustry.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          industryId: true,
          createdAt: true,
        },
      }),
    ]);

    const existingSummary = (profile.journeySummary as unknown as JourneySummary) || null;
    const existingSkippedSteps = (profile.journeySkippedSteps as Record<string, unknown>) || {};

    const context: JourneyStateContext = {
      userId: session.user.id,
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        city: profile.city,
        skillTags: profile.skillTags,
        interests: profile.interests,
        careerAspiration: profile.careerAspiration,
      },
      // DISCOVER lens data
      confirmedStrengths: existingSummary?.strengths || [],
      savedCareers: savedCareers.map((c) => ({
        id: c.id,
        title: c.industryId,
        savedAt: c.createdAt.toISOString(),
      })),
      exploredRolesCount: existingSummary?.exploredRoles?.length || 0,
      primaryGoalSelected: Boolean(existingSummary?.primaryGoal?.title),
      // UNDERSTAND lens data
      industryOutlookReviewed: Boolean(existingSummary?.industryInsightsSummary?.lastReviewedAt),
      requirementsReviewed: Boolean(existingSummary?.requirementsReviewed),
      planCreated: Boolean(existingSummary?.planCreated),
      shadowsRequested: existingSummary?.shadowSummary?.total || 0,
      shadowsCompleted,
      shadowsSkipped: Boolean(existingSkippedSteps['CAREER_SHADOW']),
      savedItemsCount: existingSummary?.industryInsightsSummary?.insightsSaved || 0,
      // ACT lens data
      alignedActionsCompleted: existingSummary?.alignedActionsCount || 0,
      actionReflectionsSubmitted: existingSummary?.alignedActionReflections?.length || 0,
      externalFeedbackReceived: false,
      planUpdatedAfterAction: Boolean(existingSummary?.planUpdatedAt),
      // Legacy
      completedJobs: completedJobs || 0,
      reflectionsCount: existingSummary?.reflectionSummary?.total || 0,
      // Summary and skipped steps
      journeySummary: existingSummary,
      skippedSteps: existingSkippedSteps as JourneyStateContext['skippedSteps'],
    };

    // Create orchestrator
    const orchestrator = createOrchestrator(context, {
      journeyState: profile.journeyState,
      journeyCompletedSteps: profile.journeyCompletedSteps,
      journeySkippedSteps: profile.journeySkippedSteps,
      journeySummary: profile.journeySummary,
    });

    // Attempt to skip the step
    const skipResult = orchestrator.skipStep(stepId, reason);

    if (!skipResult.success) {
      return NextResponse.json(
        { error: skipResult.error },
        { status: 400 }
      );
    }

    // Try to advance to next step after skipping
    const nextStep = orchestrator.getNextAllowedStep();
    if (nextStep) {
      orchestrator.transitionTo(nextStep);
    }

    // Persist to database
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: orchestrator.getCurrentState(),
        journeyCompletedSteps: orchestrator.getCompletedSteps(),
        journeySkippedSteps: JSON.parse(JSON.stringify(orchestrator.getSkippedSteps())),
        journeySummary: JSON.parse(JSON.stringify(orchestrator.getSummary())),
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      journey: orchestrator.getUIState(),
    });
  } catch (error) {
    console.error('Failed to skip journey step:', error);
    return NextResponse.json({ error: 'Failed to skip journey step' }, { status: 500 });
  }
}
