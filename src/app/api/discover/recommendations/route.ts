export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type DiscoverProfile, DEFAULT_DISCOVER_PROFILE } from '@/lib/discover/types';
import { getRecommendedCareers, extractSignals, isDiscoverComplete } from '@/lib/discover/recommendation-engine';

/**
 * GET /api/discover/recommendations
 * Get personalised career recommendations based on Discover profile.
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

    if (!isDiscoverComplete(discoverProfile)) {
      return NextResponse.json({
        hasProfile: false,
        recommendations: [],
        signals: null,
        summary: null,
      });
    }

    const signals = extractSignals(discoverProfile);
    const recommendations = getRecommendedCareers(discoverProfile, 8);

    return NextResponse.json({
      hasProfile: true,
      recommendations: recommendations.map((r) => ({
        careerId: r.career.id,
        title: r.career.title,
        emoji: r.career.emoji,
        description: r.career.description,
        score: r.score,
        reasons: r.reasons,
        growthOutlook: r.career.growthOutlook,
        avgSalary: r.career.avgSalary,
      })),
      signals: {
        topTags: signals.topTags,
        summaryText: signals.summaryText,
      },
      summary: signals.summaryText,
    });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
