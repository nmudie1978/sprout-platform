export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { JourneySummary } from '@/lib/journey/types';

/**
 * POST /api/journey/save-interests
 *
 * Saves career interests to the journey summary without completing the step.
 * This allows the user to select categories first, explore, then confirm.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { careerInterests } = body as { careerInterests: string[] };

    if (!careerInterests || careerInterests.length < 1) {
      return NextResponse.json({ error: 'At least one career interest is required' }, { status: 400 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update only the careerInterests in the journey summary
    const existingSummary = (profile.journeySummary as unknown as JourneySummary) || {};
    const updatedSummary = {
      ...existingSummary,
      careerInterests,
    };

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeySummary: JSON.parse(JSON.stringify(updatedSummary)),
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save career interests:', error);
    return NextResponse.json({ error: 'Failed to save career interests' }, { status: 500 });
  }
}
