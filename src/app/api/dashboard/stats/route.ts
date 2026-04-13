export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/stats
 *
 * Returns real-time dashboard data: applications, saved content,
 * explored careers, and recent activity.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'YOUTH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get profileId
    const profile = await prisma.youthProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    const profileId = profile?.id;

    // Applications stats (uses youthId)
    const applications = await prisma.application.findMany({
      where: { youthId: userId },
      select: { status: true, createdAt: true, job: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const appStats = {
      applied: applications.length,
      waiting: applications.filter((a) => a.status === 'PENDING').length,
      accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
      done: applications.filter((a) => ['WITHDRAWN', 'REJECTED'].includes(a.status)).length,
    };

    // Last completed job
    const lastCompletion = await prisma.jobCompletion.findFirst({
      where: { youthId: userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true, job: { select: { title: true } } },
    });
    const lastCompletedJob = lastCompletion
      ? { title: lastCompletion.job.title, completedAt: lastCompletion.completedAt.toISOString() }
      : null;

    // Saved content (uses profileId)
    let savedSummary = { total: 0, byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 } };
    if (profileId) {
      const savedItems = await prisma.savedItem.groupBy({
        by: ['type'],
        where: { profileId, deletedAt: null },
        _count: { _all: true },
      });

      savedSummary = {
        total: savedItems.reduce((sum, item) => sum + item._count._all, 0),
        byType: {
          articles: savedItems.find((i) => i.type === 'ARTICLE')?._count._all || 0,
          videos: savedItems.find((i) => i.type === 'VIDEO')?._count._all || 0,
          podcasts: savedItems.find((i) => i.type === 'PODCAST')?._count._all || 0,
          shorts: savedItems.find((i) => i.type === 'SHORT')?._count._all || 0,
        },
      };
    }

    // Actual saved items (for display)
    let savedItemsList: { id: string; title: string; type: string; url: string; thumbnail: string | null; source: string | null }[] = [];
    if (profileId) {
      const items = await prisma.savedItem.findMany({
        where: { profileId, deletedAt: null },
        select: { id: true, title: true, type: true, url: true, thumbnail: true, source: true },
        orderBy: { savedAt: 'desc' },
        take: 30, // Enough for pagination (5-6 per page)
      });
      savedItemsList = items;
    }

    // Explored careers (from SavedIndustry table)
    const savedIndustries = await prisma.savedIndustry.findMany({
      where: { userId },
      select: { industryId: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recent activity (combine various actions)
    const recentActivity: { type: string; title: string; time: string }[] = [];

    // Recent applications
    for (const app of applications.slice(0, 3)) {
      recentActivity.push({
        type: 'application',
        title: `Applied to ${app.job.title}`,
        time: app.createdAt.toISOString(),
      });
    }

    // Recent saved items
    if (profileId) {
      const recentSaves = await prisma.savedItem.findMany({
        where: { profileId, deletedAt: null },
        select: { title: true, type: true, savedAt: true },
        orderBy: { savedAt: 'desc' },
        take: 3,
      });
      for (const item of recentSaves) {
        recentActivity.push({
          type: 'saved',
          title: `Saved ${item.title || item.type.toLowerCase()}`,
          time: item.savedAt.toISOString(),
        });
      }

      // Recent journey notes
      const recentNotes = await prisma.journeyNote.findMany({
        where: { profileId, deletedAt: null },
        select: { title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 2,
      });
      for (const note of recentNotes) {
        recentActivity.push({
          type: 'note',
          title: `Added note: ${note.title || 'Untitled'}`,
          time: note.createdAt.toISOString(),
        });
      }
    }

    // Sort by time, most recent first
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Get career interests from journey summary
    const fullProfile = await prisma.youthProfile.findUnique({
      where: { userId },
      select: { journeySummary: true },
    });
    const journeySummary = fullProfile?.journeySummary as Record<string, unknown> | null;
    const careerInterests = (journeySummary?.careerInterests as string[]) || [];

    return NextResponse.json({
      appStats,
      savedSummary,
      savedItemsList,
      lastCompletedJob,
      exploredCareers: savedIndustries.map((i) => i.industryId),
      careerInterests,
      recentActivity: recentActivity.slice(0, 5),
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({
      appStats: { applied: 0, waiting: 0, accepted: 0, done: 0 },
      savedSummary: { total: 0, byType: { articles: 0, videos: 0, podcasts: 0, shorts: 0 } },
      savedItemsList: [],
      exploredCareers: [],
      careerInterests: [],
      recentActivity: [],
    });
  }
}
