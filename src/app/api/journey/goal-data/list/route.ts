export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/journey/goal-data/list
 *
 * List all journey goals for the current user with progress summary.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.journeyGoalData.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        goalId: true,
        goalTitle: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Failed to list goals:', error);
    return NextResponse.json({ error: 'Failed to list goals' }, { status: 500 });
  }
}
