export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/journey/goal-data/migrate
 *
 * One-time migration: copies existing journey data from YouthProfile
 * into a JourneyGoalData record for the current primary goal.
 * Safe to call multiple times — skips if data already exists.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get primary goal title
    const goalTitle = (profile.primaryGoal as Record<string, unknown>)?.title as string | undefined;
    if (!goalTitle) {
      return NextResponse.json({ migrated: false, reason: 'No primary goal set' });
    }

    const goalId = goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if already migrated
    const existing = await prisma.journeyGoalData.findUnique({
      where: { userId_goalId: { userId: session.user.id, goalId } },
    });

    if (existing) {
      return NextResponse.json({ migrated: false, reason: 'Already exists' });
    }

    // Migrate existing data
    await prisma.journeyGoalData.create({
      data: {
        userId: session.user.id,
        goalId,
        goalTitle,
        journeyState: profile.journeyState,
        journeyCompletedSteps: profile.journeyCompletedSteps,
        journeySkippedSteps: profile.journeySkippedSteps ? JSON.parse(JSON.stringify(profile.journeySkippedSteps)) : undefined,
        journeySummary: profile.journeySummary ? JSON.parse(JSON.stringify(profile.journeySummary)) : undefined,
        isActive: true,
      },
    });

    return NextResponse.json({ migrated: true, goalId, goalTitle });
  } catch (error) {
    console.error('Failed to migrate goal data:', error);
    return NextResponse.json({ error: 'Failed to migrate' }, { status: 500 });
  }
}
