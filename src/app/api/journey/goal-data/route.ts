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
    if (!session?.user?.id || session.user.role !== 'YOUTH') {
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
    if (!session?.user?.id || session.user.role !== 'YOUTH') {
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
    if (!session?.user?.id || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, goalTitle, roadmapCardData, momentumActions } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
    }

    // Build the update object incrementally so we only touch the
    // fields the caller actually sent.
    const data: Record<string, unknown> = { updatedAt: new Date() };

    if (roadmapCardData !== undefined) {
      data.roadmapCardData = roadmapCardData ? JSON.parse(JSON.stringify(roadmapCardData)) : null;
    }

    // The momentum read-merge-write and the final persist run inside one
    // transaction so two concurrent PATCHes (e.g. the debounced momentum
    // save racing the roadmap autosave) can't lose-update journeySummary.
    // We upsert rather than update so a momentum save that arrives before
    // the goal row exists (POST/PATCH race) creates the row instead of
    // throwing P2025 → 500 and dropping the user's action.
    await prisma.$transaction(async (tx) => {
      if (momentumActions !== undefined) {
        // Sanity-cap the array — momentum is per-user, but we don't
        // want a runaway client to store 100k entries.
        const sanitised = Array.isArray(momentumActions) ? momentumActions.slice(0, 500) : [];
        // Merge into the existing journeySummary so we don't trample
        // other keys (educationContext, exploredRoles, etc.).
        const existing = await tx.journeyGoalData.findUnique({
          where: { userId_goalId: { userId: session.user.id, goalId } },
          select: { journeySummary: true },
        });
        const currentSummary = (existing?.journeySummary as Record<string, unknown> | null) || {};
        const mergedSummary = { ...currentSummary, momentumActions: sanitised };
        data.journeySummary = JSON.parse(JSON.stringify(mergedSummary));
      }

      await tx.journeyGoalData.upsert({
        where: { userId_goalId: { userId: session.user.id, goalId } },
        create: {
          userId: session.user.id,
          goalId,
          // A partial PATCH may not carry the human-readable title; fall
          // back to the slug so the NOT NULL goalTitle column is satisfied.
          goalTitle: typeof goalTitle === 'string' && goalTitle.trim() ? goalTitle : goalId,
          ...data,
        },
        update: data,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update goal data:', error);
    return NextResponse.json({ error: 'Failed to update goal data' }, { status: 500 });
  }
}

/**
 * DELETE /api/journey/goal-data?goalId=xxx
 *
 * Remove an explored journey from the user's history. Used by the
 * "My Explored Journeys" card so users can curate the list and
 * drop careers they no longer care about. The active goal cannot
 * be removed via this endpoint — clear the primary goal first.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = req.nextUrl.searchParams.get('goalId');
    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 });
    }

    // Refuse to delete the active row — the user should clear the
    // primary goal first if they want to remove their current journey.
    const existing = await prisma.journeyGoalData.findUnique({
      where: { userId_goalId: { userId: session.user.id, goalId } },
      select: { isActive: true },
    });
    if (!existing) {
      return NextResponse.json({ success: true });
    }
    if (existing.isActive) {
      return NextResponse.json(
        { error: 'Cannot remove an active journey. Switch goals first.' },
        { status: 409 },
      );
    }

    await prisma.journeyGoalData.delete({
      where: { userId_goalId: { userId: session.user.id, goalId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete goal data:', error);
    return NextResponse.json({ error: 'Failed to delete goal data' }, { status: 500 });
  }
}
