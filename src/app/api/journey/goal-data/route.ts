export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { goalId, goalTitle, roadmapCardData } = body;

    if (!goalId || !goalTitle) {
      return NextResponse.json({ error: 'goalId and goalTitle are required' }, { status: 400 });
    }

    // Wrap deactivation + upsert in a transaction for atomicity. The
    // legacy `journeyState` / `journeyCompletedSteps` / `journeySummary`
    // columns are no longer written by the new roadmap-first model —
    // see CLAUDE.md <journey_logic>.
    const goalData = await prisma.$transaction(async (tx) => {
      // Deactivate all other goals for this user
      await tx.journeyGoalData.updateMany({
        where: { userId: session.user.id, isActive: true },
        data: { isActive: false },
      });

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
          roadmapCardData: roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null,
          isActive: true,
        },
        update: {
          goalTitle,
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
 * Partial update for the active goal. Currently supports two
 * independent fields:
 *   - roadmapCardData: replaces the per-step roadmap annotations blob.
 *   - momentumActions: merged into journeySummary so the Momentum
 *     section's actions persist as part of My Journey rather than
 *     being trapped in localStorage. We read-merge-write the existing
 *     summary blob so other keys (e.g. educationContext) are preserved.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, roadmapCardData, momentumActions } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
    }

    // Build the update object incrementally so we only touch the
    // fields the caller actually sent.
    const data: Record<string, unknown> = { updatedAt: new Date() };

    if (roadmapCardData !== undefined) {
      data.roadmapCardData = roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null;
    }

    if (momentumActions !== undefined) {
      // Sanity-cap the array — momentum is per-user, but we don't
      // want a runaway client to store 100k entries.
      const sanitised = Array.isArray(momentumActions) ? momentumActions.slice(0, 500) : [];
      // Merge into the existing journeySummary so we don't trample
      // other keys (educationContext, exploredRoles, etc.).
      const existing = await prisma.journeyGoalData.findUnique({
        where: {
          userId_goalId: { userId: session.user.id, goalId },
        },
        select: { journeySummary: true },
      });
      const currentSummary = (existing?.journeySummary as Record<string, unknown> | null) || {};
      const mergedSummary = { ...currentSummary, momentumActions: sanitised };
      data.journeySummary = JSON.parse(JSON.stringify(mergedSummary));
    }

    await prisma.journeyGoalData.update({
      where: {
        userId_goalId: {
          userId: session.user.id,
          goalId,
        },
      },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update goal data:', error);
    return NextResponse.json({ error: 'Failed to update goal data' }, { status: 500 });
  }
}
