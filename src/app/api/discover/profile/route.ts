export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type DiscoverProfile, DEFAULT_DISCOVER_PROFILE } from '@/lib/discover/types';

/**
 * GET /api/discover/profile
 * Load the user's Discover profile from the journeySummary.
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
    const discoverProfile = (summary?.discoverProfile as DiscoverProfile) || DEFAULT_DISCOVER_PROFILE;

    return NextResponse.json({ discoverProfile });
  } catch (error) {
    console.error('Failed to load discover profile:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

/**
 * POST /api/discover/profile
 * Save/update the user's Discover profile.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { discoverProfile } = body as { discoverProfile: DiscoverProfile };

    if (!discoverProfile) {
      return NextResponse.json({ error: 'discoverProfile is required' }, { status: 400 });
    }

    // Get current summary
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true },
    });

    const currentSummary = (profile?.journeySummary as Record<string, unknown>) || {};

    // Merge discover profile into summary
    const updatedSummary = {
      ...currentSummary,
      discoverProfile: {
        ...discoverProfile,
        lastUpdatedAt: new Date().toISOString(),
      },
    };

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeySummary: JSON.parse(JSON.stringify(updatedSummary)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save discover profile:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
