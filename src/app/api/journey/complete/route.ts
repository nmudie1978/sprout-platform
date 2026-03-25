export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createOrchestrator,
  validateStepCompletionData,
  sanitizeStepCompletionData,
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

    // Sanitize user input — strip HTML tags to prevent stored XSS
    const sanitizedData = sanitizeStepCompletionData(data);

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

    // Gate: step must be current state or already completed (for updates)
    let currentState = orchestrator.getCurrentState();
    const completedSteps = orchestrator.getCompletedSteps();

    // Auto-advance past ROLE_DEEP_DIVE if user has a goal set — setting a goal
    // counts as completing the deep dive, but the state machine may not know yet.
    // Also handle cases where currentState is any DISCOVER state but user is trying
    // to complete an UNDERSTAND or ACT step with a goal already set.
    const discoverStates = ['REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE'];
    const isStuckInDiscover = discoverStates.includes(currentState);
    const isTargetingLaterStep = !discoverStates.includes(stepId);
    const goalTitle2 = profile.primaryGoal && typeof profile.primaryGoal === 'object'
      ? (profile.primaryGoal as Record<string, unknown>)?.title
      : null;

    if (isStuckInDiscover && isTargetingLaterStep && goalTitle2) {
      // Advance the DB state to match what the user is trying to do
      const updatedSteps = [...(Array.isArray(profile.journeyCompletedSteps) ? profile.journeyCompletedSteps as string[] : [])];
      for (const ds of discoverStates) {
        if (!updatedSteps.includes(ds)) updatedSteps.push(ds);
      }
      await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: {
          journeyState: stepId,
          journeyCompletedSteps: updatedSteps,
        },
      });
      currentState = stepId as unknown as typeof currentState;
    }

    if (stepId !== currentState && !completedSteps.includes(stepId)) {
      return NextResponse.json(
        { error: `Complete step "${currentState}" first before "${stepId}"` },
        { status: 400 }
      );
    }

    // Update summary with sanitized completion data
    const updatedSummary = orchestrator.updateSummary(sanitizedData);

    // Mark step as completed and try to advance
    if (!completedSteps.includes(stepId)) {
      if (stepId === currentState) {
        const nextStep = orchestrator.getNextAllowedStep();
        if (nextStep) {
          orchestrator.transitionTo(nextStep);
        } else {
          orchestrator.markStepCompleted(stepId);
        }
      }
    } else {
      // Re-completing an already completed step — just update summary, don't advance
    }

    // Persist to database - convert summary to JSON-compatible format
    const summaryJson = JSON.parse(JSON.stringify(updatedSummary));
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: orchestrator.getCurrentState(),
        journeyCompletedSteps: orchestrator.getCompletedSteps(),
        journeySummary: summaryJson,
        journeyLastUpdated: new Date(),
      },
    });

    // Also sync to goal-scoped data if a primary goal exists
    const goalTitle = (profile.primaryGoal as Record<string, unknown>)?.title as string | undefined;
    if (goalTitle) {
      const goalId = goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await prisma.journeyGoalData.upsert({
        where: { userId_goalId: { userId: session.user.id, goalId } },
        create: {
          userId: session.user.id,
          goalId,
          goalTitle,
          journeyState: orchestrator.getCurrentState(),
          journeyCompletedSteps: orchestrator.getCompletedSteps(),
          journeySummary: summaryJson,
          isActive: true,
        },
        update: {
          journeyState: orchestrator.getCurrentState(),
          journeyCompletedSteps: orchestrator.getCompletedSteps(),
          journeySummary: summaryJson,
          updatedAt: new Date(),
        },
      }).catch((err) => {
        // Non-blocking — goal data sync failure shouldn't break step completion
        console.error('Failed to sync goal data:', err);
      });
    }

    return NextResponse.json({
      success: true,
      journey: orchestrator.getUIState(),
    });
  } catch (error) {
    console.error('Failed to complete journey step:', error);
    return NextResponse.json({ error: 'Failed to complete journey step' }, { status: 500 });
  }
}
