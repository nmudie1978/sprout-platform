export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JOURNEY_STATES } from '@/lib/journey/types';

/**
 * GET /api/journey/goal-data?goalId=xxx
 *
 * Load goal-specific journey data. If no data exists for this goal,
 * returns null (frontend creates fresh state).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = req.nextUrl.searchParams.get('goalId');
    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
    }

    const goalData = await prisma.journeyGoalData.findUnique({
      where: {
        userId_goalId: {
          userId: session.user.id,
          goalId,
        },
      },
    });

    return NextResponse.json({ goalData });
  } catch (error) {
    console.error('Failed to load goal data:', error);
    return NextResponse.json({ error: 'Failed to load goal data' }, { status: 500 });
  }
}

/**
 * POST /api/journey/goal-data
 *
 * Save/update goal-specific journey data. Creates if doesn't exist.
 * Also handles goal switching: deactivates old goal, activates new.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, goalTitle, journeyState, journeyCompletedSteps, journeySummary, roadmapCardData } = body;

    if (!goalId || !goalTitle) {
      return NextResponse.json({ error: 'goalId and goalTitle are required' }, { status: 400 });
    }

    // Validate journeyState if provided
    const validatedState = journeyState && JOURNEY_STATES.includes(journeyState)
      ? journeyState
      : 'REFLECT_ON_STRENGTHS';

    // Validate journeyCompletedSteps — only allow known state IDs
    const validatedSteps = Array.isArray(journeyCompletedSteps)
      ? journeyCompletedSteps.filter((s: string) => (JOURNEY_STATES as readonly string[]).includes(s))
      : [];

    // Wrap deactivation + upsert in a transaction for atomicity
    const goalData = await prisma.$transaction(async (tx) => {
      // Deactivate all other goals for this user
      await tx.journeyGoalData.updateMany({
        where: { userId: session.user.id, isActive: true },
        data: { isActive: false },
      });

      // Upsert the goal data
      return tx.journeyGoalData.upsert({
        where: {
          userId_goalId: {
            userId: session.user.id,
            goalId,
          },
        },
        create: {
          userId: session.user.id,
          goalId,
          goalTitle,
          journeyState: validatedState,
          journeyCompletedSteps: validatedSteps,
          journeySummary: journeySummary ? JSON.parse(JSON.stringify(journeySummary)) : null,
          roadmapCardData: roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null,
          isActive: true,
        },
        update: {
          goalTitle,
          ...(journeyState && { journeyState: validatedState }),
          ...(journeyCompletedSteps && { journeyCompletedSteps: validatedSteps }),
          ...(journeySummary !== undefined && { journeySummary: journeySummary ? JSON.parse(JSON.stringify(journeySummary)) : null }),
          ...(roadmapCardData !== undefined && { roadmapCardData: roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null }),
          isActive: true,
          updatedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true, goalData });
  } catch (error) {
    console.error('Failed to save goal data:', error);
    return NextResponse.json({ error: 'Failed to save goal data' }, { status: 500 });
  }
}

/**
 * PATCH /api/journey/goal-data
 *
 * Update just the roadmap card data for the active goal.
 * Used by the roadmap card dialog to persist card annotations.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, roadmapCardData } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
    }

    await prisma.journeyGoalData.update({
      where: {
        userId_goalId: {
          userId: session.user.id,
          goalId,
        },
      },
      data: {
        roadmapCardData: roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update roadmap card data:', error);
    return NextResponse.json({ error: 'Failed to update roadmap card data' }, { status: 500 });
  }
}
