export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createOrchestrator,
  validateStepCompletionData,
  type JourneyStateContext,
  type JourneyStateId,
  type JourneySummary,
  type StepCompletionData,
} from '@/lib/journey';

/**
 * POST /api/journey/complete
 *
 * Complete a journey step with required data
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stepId, data } = body as {
      stepId: JourneyStateId;
      data: StepCompletionData;
    };

    if (!stepId || !data) {
      return NextResponse.json({ error: 'Missing stepId or data' }, { status: 400 });
    }

    // Validate step completion data
    const validation = validateStepCompletionData(stepId, data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
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
      savedCareers: savedCareers.length > 0
        ? savedCareers.map((c) => ({
            id: c.id,
            title: c.industryId,
            savedAt: c.createdAt.toISOString(),
          }))
        : (existingSummary?.careerInterests || []).map((title: string) => ({
            id: title,
            title,
            savedAt: new Date().toISOString(),
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
      pathDataSaved: Boolean(
        (existingSummary?.pathQualifications?.length) ||
        (existingSummary?.pathSkills?.length) ||
        (existingSummary?.pathCourses?.length) ||
        (existingSummary?.pathRequirements?.length)
      ),
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

    // Allow completing the current step or re-completing a previously completed step
    // The orchestrator handles state advancement via reconciliation

    // Update summary with completion data
    const updatedSummary = orchestrator.updateSummary(data);

    // Mark step as completed and try to advance
    const currentState = orchestrator.getCurrentState();
    if (!orchestrator.getCompletedSteps().includes(stepId)) {
      // If stepId is the current state, transition is same-state (no-op for completedSteps)
      // So we need to explicitly add it and advance
      if (stepId === currentState) {
        // The step is current — try to advance past it
        const nextStep = orchestrator.getNextAllowedStep();
        if (nextStep) {
          orchestrator.transitionTo(nextStep);
        }
      } else {
        orchestrator.transitionTo(stepId);
      }
    } else {
      // Step already completed — just try to advance if possible
      const nextStep = orchestrator.getNextAllowedStep();
      if (nextStep) {
        orchestrator.transitionTo(nextStep);
      }
    }

    // Persist to database - convert summary to JSON-compatible format
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: orchestrator.getCurrentState(),
        journeyCompletedSteps: orchestrator.getCompletedSteps(),
        journeySummary: JSON.parse(JSON.stringify(updatedSummary)),
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      journey: orchestrator.getUIState(),
    });
  } catch (error) {
    console.error('Failed to complete journey step:', error);
    return NextResponse.json({ error: 'Failed to complete journey step' }, { status: 500 });
  }
}
