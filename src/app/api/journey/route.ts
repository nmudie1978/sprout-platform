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
} from '@/lib/journey';

/**
 * GET /api/journey
 *
 * Fetches the user's current journey state and UI data
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all necessary data to build context
    const [profile, completedJobs, shadowsCompleted, savedCareers] = await Promise.all([
      prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
      }),
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

    // Extract skipped steps from profile
    const skippedSteps = (profile?.journeySkippedSteps as Record<string, unknown>) || {};

    // Extract summary for context building
    const journeySummary = (profile?.journeySummary as unknown as JourneySummary) || null;

    // Build context for orchestrator
    const context: JourneyStateContext = {
      userId: session.user.id,
      profile: profile
        ? {
            displayName: profile.displayName,
            bio: profile.bio,
            city: profile.city,
            skillTags: profile.skillTags,
            interests: profile.interests,
            careerAspiration: profile.careerAspiration,
          }
        : null,
      // DISCOVER lens data
      confirmedStrengths: journeySummary?.strengths || [],
      savedCareers: savedCareers.length > 0
        ? savedCareers.map((c) => ({
            id: c.id,
            title: c.industryId,
            savedAt: c.createdAt.toISOString(),
          }))
        : (journeySummary?.careerInterests || []).map((title: string) => ({
            id: title,
            title,
            savedAt: new Date().toISOString(),
          })),
      exploredRolesCount: journeySummary?.exploredRoles?.length || 0,
      primaryGoalSelected: Boolean(journeySummary?.primaryGoal?.title || (profile?.primaryGoal as Record<string, unknown>)?.title),
      // UNDERSTAND lens data
      industryOutlookReviewed: Boolean(journeySummary?.industryInsightsSummary?.lastReviewedAt),
      requirementsReviewed: Boolean(journeySummary?.requirementsReviewed),
      planCreated: Boolean(journeySummary?.planCreated),
      shadowsRequested: journeySummary?.shadowSummary?.total || 0,
      shadowsCompleted,
      shadowsSkipped: Boolean(skippedSteps['CAREER_SHADOW']),
      pathDataSaved: Boolean(
        (journeySummary?.pathQualifications?.length) ||
        (journeySummary?.pathSkills?.length) ||
        (journeySummary?.pathCourses?.length) ||
        (journeySummary?.pathRequirements?.length)
      ),
      savedItemsCount: journeySummary?.industryInsightsSummary?.insightsSaved || 0,
      // ACT lens data
      alignedActionsCompleted: journeySummary?.alignedActionsCount || 0,
      actionReflectionsSubmitted: journeySummary?.alignedActionReflections?.length || 0,
      externalFeedbackReceived: false, // TODO: Track this in summary
      planUpdatedAfterAction: Boolean(journeySummary?.planUpdatedAt),
      // Legacy
      completedJobs: completedJobs || 0,
      reflectionsCount: journeySummary?.reflectionSummary?.total || 0,
      // Summary and skipped steps
      journeySummary,
      skippedSteps: skippedSteps as JourneyStateContext['skippedSteps'],
    };

    // Create orchestrator with current state
    const orchestrator = createOrchestrator(
      context,
      profile
        ? {
            journeyState: profile.journeyState,
            journeyCompletedSteps: profile.journeyCompletedSteps,
            journeySkippedSteps: profile.journeySkippedSteps,
            journeySummary: profile.journeySummary,
          }
        : null
    );

    // Get UI state
    const uiState = orchestrator.getUIState();

    return NextResponse.json({
      success: true,
      journey: uiState,
    });
  } catch (error) {
    console.error('Failed to fetch journey state:', error);
    return NextResponse.json({ error: 'Failed to fetch journey state' }, { status: 500 });
  }
}

/**
 * PATCH /api/journey
 *
 * Update journey state (transition to new state)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, targetState, stepId } = body;

    // Fetch current state
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

    // Extract skipped steps and summary
    const patchSkippedSteps = (profile.journeySkippedSteps as Record<string, unknown>) || {};
    const patchSummary = (profile.journeySummary as unknown as JourneySummary) || null;

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
      confirmedStrengths: patchSummary?.strengths || [],
      savedCareers: savedCareers.length > 0
        ? savedCareers.map((c) => ({
            id: c.id,
            title: c.industryId,
            savedAt: c.createdAt.toISOString(),
          }))
        : (patchSummary?.careerInterests || []).map((title: string) => ({
            id: title,
            title,
            savedAt: new Date().toISOString(),
          })),
      exploredRolesCount: patchSummary?.exploredRoles?.length || 0,
      primaryGoalSelected: Boolean(patchSummary?.primaryGoal?.title || (profile?.primaryGoal as Record<string, unknown>)?.title),
      // UNDERSTAND lens data
      industryOutlookReviewed: Boolean(patchSummary?.industryInsightsSummary?.lastReviewedAt),
      requirementsReviewed: Boolean(patchSummary?.requirementsReviewed),
      planCreated: Boolean(patchSummary?.planCreated),
      shadowsRequested: patchSummary?.shadowSummary?.total || 0,
      shadowsCompleted,
      shadowsSkipped: Boolean(patchSkippedSteps['CAREER_SHADOW']),
      pathDataSaved: Boolean(
        (patchSummary?.pathQualifications?.length) ||
        (patchSummary?.pathSkills?.length) ||
        (patchSummary?.pathCourses?.length) ||
        (patchSummary?.pathRequirements?.length)
      ),
      savedItemsCount: patchSummary?.industryInsightsSummary?.insightsSaved || 0,
      // ACT lens data
      alignedActionsCompleted: patchSummary?.alignedActionsCount || 0,
      actionReflectionsSubmitted: patchSummary?.alignedActionReflections?.length || 0,
      externalFeedbackReceived: false,
      planUpdatedAfterAction: Boolean(patchSummary?.planUpdatedAt),
      // Legacy
      completedJobs: completedJobs || 0,
      reflectionsCount: patchSummary?.reflectionSummary?.total || 0,
      // Summary and skipped steps
      journeySummary: patchSummary,
      skippedSteps: patchSkippedSteps as JourneyStateContext['skippedSteps'],
    };

    const orchestrator = createOrchestrator(context, {
      journeyState: profile.journeyState,
      journeyCompletedSteps: profile.journeyCompletedSteps,
      journeySkippedSteps: profile.journeySkippedSteps,
      journeySummary: profile.journeySummary,
    });

    let result;

    if (action === 'transition' && targetState) {
      // Forward transition
      result = orchestrator.transitionTo(targetState as JourneyStateId);
    } else if (action === 'revisit' && stepId) {
      // Backward navigation
      result = orchestrator.revisitStep(stepId as JourneyStateId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update database
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: orchestrator.getCurrentState(),
        journeyCompletedSteps: orchestrator.getCompletedSteps(),
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      journey: orchestrator.getUIState(),
    });
  } catch (error) {
    console.error('Failed to update journey state:', error);
    return NextResponse.json({ error: 'Failed to update journey state' }, { status: 500 });
  }
}

