export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type DiscoverProfile, DEFAULT_DISCOVER_PROFILE } from '@/lib/discover/types';
import { getRecommendedCareers, extractSignals, isDiscoverComplete } from '@/lib/discover/recommendation-engine';
import {
  buildRadarPortrait,
  hasEnoughForPortrait,
} from '@/lib/discover/portrait-from-radar';
import {
  getCareersFromDiscovery,
  type DiscoveryPreferences,
} from '@/lib/career-pathways';

/**
 * GET /api/discover/recommendations
 *
 * Returns the dashboard's "Who Am I" payload. Per product decision
 * (April 2026), the self-portrait is built from the Career Radar's
 * "What I Like" preferences (`discoveryPreferences`) rather than the
 * legacy `DiscoverProfile` (interests/strengths/motivations/clarity)
 * — most 15–18 year olds don't yet have the self-knowledge to rate
 * their strengths or motivations honestly, so we read the lighter
 * signal that the radar already collects.
 *
 * Fallback: if a user happened to fill out the legacy DiscoverProfile
 * before this change, we still honour it. New writes only go to the
 * radar prefs path.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true, discoveryPreferences: true },
    });

    const radarPrefs = (profile?.discoveryPreferences ?? null) as
      | DiscoveryPreferences
      | null;

    // Primary path — Career Radar prefs.
    if (hasEnoughForPortrait(radarPrefs)) {
      const portrait = buildRadarPortrait(radarPrefs)!;
      const recommendedCareers = getCareersFromDiscovery(radarPrefs!, 8);
      return NextResponse.json({
        hasProfile: true,
        source: 'radar',
        recommendations: recommendedCareers.map((c) => ({
          careerId: c.id,
          title: c.title,
          emoji: c.emoji,
          description: c.description,
          // No score from this path — the radar's match math runs in
          // the radar component itself; the dashboard surface just
          // wants a list.
          score: undefined,
          reasons: [],
          growthOutlook: c.growthOutlook,
          avgSalary: c.avgSalary,
        })),
        signals: {
          topTags: portrait.topTags,
          summaryText: portrait.summary,
        },
        summary: portrait.summary,
      });
    }

    // Fallback — legacy DiscoverProfile written by /my-journey/discover
    // before the consolidation. Anyone who already filled it should
    // still see their portrait until they top up the radar prefs.
    const summaryJson = profile?.journeySummary as Record<string, unknown> | null;
    const discoverProfile = (summaryJson?.discoverProfile as DiscoverProfile) || DEFAULT_DISCOVER_PROFILE;
    if (isDiscoverComplete(discoverProfile)) {
      const signals = extractSignals(discoverProfile);
      const recommendations = getRecommendedCareers(discoverProfile, 8);
      return NextResponse.json({
        hasProfile: true,
        source: 'legacy-discover-profile',
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
    }

    return NextResponse.json({
      hasProfile: false,
      source: null,
      recommendations: [],
      signals: null,
      summary: null,
    });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
