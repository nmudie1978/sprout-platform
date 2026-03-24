export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/discover/reflections
 * Load discover reflections from journeySummary.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true },
    });

    const summary = profile?.journeySummary as Record<string, unknown> | null;
    const discoverReflections = summary?.discoverReflections || null;

    return NextResponse.json({ discoverReflections });
  } catch (error) {
    console.error('Failed to load discover reflections:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

/**
 * POST /api/discover/reflections
 * Save discover reflections to journeySummary.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { discoverReflections } = body;

    if (!discoverReflections) {
      return NextResponse.json({ error: 'discoverReflections is required' }, { status: 400 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true },
    });

    const currentSummary = (profile?.journeySummary as Record<string, unknown>) || {};

    const updatedSummary = {
      ...currentSummary,
      discoverReflections,
    };

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeySummary: JSON.parse(JSON.stringify(updatedSummary)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save discover reflections:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
