export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Authorize on the ADMIN role only. The previous email whitelist (incl.
    // a hardcoded address and the client-exposed NEXT_PUBLIC_ADMIN_EMAIL)
    // was a bypass — never gate authz on a NEXT_PUBLIC_* value.
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // ============================================
    // JOBS MARKETPLACE REMOVED
    // ============================================
    // The jobs / earnings / applications / reviews / messaging marketplace has
    // been removed. Those sections are now reported as zero. Only user, badge,
    // and community/moderation metrics carry real data.
    //
    // Run the surviving (non-marketplace) queries in parallel.
    const [
      totalUsers,
      usersByRole,
      usersThisWeek,
      usersThisMonth,
      usersByAccountStatus,
      badgeDistribution,
      totalBadgesAwarded,
      totalCommunities,
      totalReports,
      reportsByStatus,
      recentSignups,
      userGrowth,
      topRatedYouth,
    ] = await Promise.all([
      // Total Users
      prisma.user.count(),

      // Users by Role
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),

      // Users this week
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Users this month
      prisma.user.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Users by account status
      prisma.user.groupBy({
        by: ["accountStatus"],
        _count: { id: true },
      }),

      // Badge Distribution
      prisma.badge.groupBy({
        by: ["type"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Total Badges Awarded
      prisma.badge.count(),

      // Total Communities
      prisma.community.count(),

      // Total Community Reports
      prisma.communityReport.count(),

      // Reports by Status
      prisma.communityReport.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Recent Signups (last 10)
      prisma.user.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          accountStatus: true,
          youthProfile: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // User Growth (weekly for last 12 weeks)
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('week', "createdAt") as week,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${threeMonthsAgo}
        GROUP BY DATE_TRUNC('week', "createdAt")
        ORDER BY week ASC
      `,

      // Top Rated Youth (legacy rating fields retained on YouthProfile; no
      // longer written, so this is expected to be empty).
      prisma.youthProfile.findMany({
        where: {
          averageRating: { not: null },
          completedJobsCount: { gte: 3 },
        },
        select: {
          userId: true,
          displayName: true,
          averageRating: true,
          completedJobsCount: true,
          reliabilityScore: true,
        },
        orderBy: { averageRating: "desc" },
        take: 10,
      }),
    ]);

    // Postgres COUNT(*) comes back as BigInt — JSON.stringify throws
    // on BigInt, which surfaces as "Failed to fetch analytics" on the
    // client. Coerce to Number for the JSON response.
    const userGrowthSafe = (userGrowth as Array<{ week: Date; count: bigint | number }>).map(
      (row) => ({
        week: row.week,
        count: typeof row.count === "bigint" ? Number(row.count) : row.count,
      }),
    );

    const response = NextResponse.json({
      generatedAt: new Date().toISOString(),

      // Overview
      overview: {
        totalUsers,
        totalJobs: 0,
        totalEarnings: 0,
        totalApplications: 0,
        totalReviews: 0,
        totalMessages: 0,
        totalConversations: 0,
        totalBadgesAwarded,
        averageJobValue: 0,
        averageRating: 0,
        completionRate: 0,
      },

      // Users
      users: {
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        byStatus: usersByAccountStatus.reduce((acc, item) => {
          acc[item.accountStatus] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        newThisWeek: usersThisWeek,
        newThisMonth: usersThisMonth,
        activeThisWeek: 0,
        recentSignups,
        growth: userGrowthSafe,
      },

      // Jobs (marketplace removed — zeroed)
      jobs: {
        byStatus: {} as Record<string, number>,
        byCategory: [] as { category: string; count: number }[],
        newThisWeek: 0,
        newThisMonth: 0,
        completed: 0,
        cancelled: 0,
        completionRate: 0,
      },

      // Applications (marketplace removed — zeroed)
      applications: {
        byStatus: {} as Record<string, number>,
        thisWeek: 0,
      },

      // Financial (marketplace removed — zeroed)
      financial: {
        totalEarnings: 0,
        earningsThisMonth: 0,
        averageJobValue: 0,
        topYouthEarners: [] as unknown[],
        topEmployerSpenders: [] as unknown[],
      },

      // Engagement (marketplace messaging removed — zeroed)
      engagement: {
        totalMessages: 0,
        messagesThisWeek: 0,
        totalConversations: 0,
        reviewsThisMonth: 0,
      },

      // Achievements
      achievements: {
        totalBadges: totalBadgesAwarded,
        distribution: badgeDistribution.map(item => ({
          type: item.type,
          count: item._count.id,
        })),
      },

      // Community
      community: {
        totalCommunities,
        totalReports,
        reportsByStatus: reportsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },

      // Top Performers
      topPerformers: {
        topRatedYouth,
      },
    });
    // Admin analytics are expensive; cache for 5 min
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
