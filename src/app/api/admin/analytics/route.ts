import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin emails that can access analytics (add your email here)
// Check both ADMIN_EMAIL and NEXT_PUBLIC_ADMIN_EMAIL for consistency
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "admin@sprout.no",
].filter(Boolean);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin (by role OR by email whitelist)
    const isAdmin = session?.user?.role === "ADMIN" ||
                    ADMIN_EMAILS.includes(session?.user?.email || "");

    if (!session || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      // User Stats
      totalUsers,
      usersByRole,
      usersThisWeek,
      usersThisMonth,
      usersByAccountStatus,

      // Job Stats
      totalJobs,
      jobsByStatus,
      jobsByCategory,
      jobsThisWeek,
      jobsThisMonth,

      // Financial Stats
      totalEarnings,
      topYouthEarners,
      topEmployerSpenders,
      earningsThisMonth,
      averageJobValue,

      // Application Stats
      totalApplications,
      applicationsByStatus,
      applicationsThisWeek,

      // Review Stats
      totalReviews,
      averageRating,
      reviewsThisMonth,

      // Engagement Stats
      totalMessages,
      messagesThisWeek,
      totalConversations,

      // Badge Stats
      badgeDistribution,
      totalBadgesAwarded,

      // Community Stats
      totalCommunities,
      totalReports,
      reportsByStatus,

      // Recent Signups
      recentSignups,

      // User Growth (last 12 weeks)
      userGrowth,

      // Job Completion Rate
      completedJobs,
      cancelledJobs,

      // Active Users (users who logged in / had activity)
      activeUsersThisWeek,

      // Top Rated Youth
      topRatedYouth,

      // Most Active Employers
      mostActiveEmployers,

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

      // Total Jobs
      prisma.microJob.count(),

      // Jobs by Status
      prisma.microJob.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Jobs by Category
      prisma.microJob.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Jobs this week
      prisma.microJob.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Jobs this month
      prisma.microJob.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Total Earnings
      prisma.earning.aggregate({
        _sum: { amount: true },
      }),

      // Top Youth Earners
      prisma.earning.groupBy({
        by: ["youthId"],
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),

      // Top Employer Spenders (from jobs)
      prisma.microJob.groupBy({
        by: ["postedById"],
        where: { status: { in: ["COMPLETED", "REVIEWED"] } },
        _sum: { payAmount: true },
        _count: { id: true },
        orderBy: { _sum: { payAmount: "desc" } },
        take: 10,
      }),

      // Earnings this month
      prisma.earning.aggregate({
        where: { createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),

      // Average job value
      prisma.microJob.aggregate({
        where: { status: { in: ["COMPLETED", "REVIEWED"] } },
        _avg: { payAmount: true },
      }),

      // Total Applications
      prisma.application.count(),

      // Applications by Status
      prisma.application.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Applications this week
      prisma.application.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Total Reviews
      prisma.review.count(),

      // Average Rating
      prisma.review.aggregate({
        _avg: { overall: true },
      }),

      // Reviews this month
      prisma.review.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Total Messages
      prisma.message.count(),

      // Messages this week
      prisma.message.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Total Conversations
      prisma.conversation.count(),

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
          employerProfile: { select: { companyName: true } },
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

      // Completed Jobs
      prisma.microJob.count({
        where: { status: { in: ["COMPLETED", "REVIEWED"] } },
      }),

      // Cancelled Jobs
      prisma.microJob.count({
        where: { status: "CANCELLED" },
      }),

      // Active users (users who sent messages or applied to jobs this week)
      prisma.user.count({
        where: {
          OR: [
            { messagesSent: { some: { createdAt: { gte: weekAgo } } } },
            { applications: { some: { createdAt: { gte: weekAgo } } } },
            { postedJobs: { some: { createdAt: { gte: weekAgo } } } },
          ],
        },
      }),

      // Top Rated Youth Workers
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

      // Most Active Employers
      prisma.user.findMany({
        where: { role: "EMPLOYER" },
        select: {
          id: true,
          email: true,
          employerProfile: { select: { companyName: true } },
          _count: {
            select: {
              postedJobs: true,
            },
          },
        },
        orderBy: {
          postedJobs: { _count: "desc" },
        },
        take: 10,
      }),
    ]);

    // Enrich top youth earners with profile info
    const enrichedTopYouthEarners = await Promise.all(
      topYouthEarners.map(async (earner) => {
        const profile = await prisma.youthProfile.findUnique({
          where: { userId: earner.youthId },
          select: { displayName: true, averageRating: true },
        });
        return {
          ...earner,
          displayName: profile?.displayName || "Unknown",
          averageRating: profile?.averageRating,
        };
      })
    );

    // Enrich top employer spenders with profile info
    const enrichedTopEmployerSpenders = await Promise.all(
      topEmployerSpenders.map(async (spender) => {
        const profile = await prisma.employerProfile.findUnique({
          where: { userId: spender.postedById },
          select: { companyName: true },
        });
        return {
          ...spender,
          companyName: profile?.companyName || "Individual",
        };
      })
    );

    // Calculate completion rate
    const totalFinishedJobs = completedJobs + cancelledJobs;
    const completionRate = totalFinishedJobs > 0
      ? Math.round((completedJobs / totalFinishedJobs) * 100)
      : 0;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),

      // Overview
      overview: {
        totalUsers,
        totalJobs,
        totalEarnings: totalEarnings._sum.amount || 0,
        totalApplications,
        totalReviews,
        totalMessages,
        totalConversations,
        totalBadgesAwarded,
        averageJobValue: averageJobValue._avg.payAmount || 0,
        averageRating: averageRating._avg.overall || 0,
        completionRate,
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
        activeThisWeek: activeUsersThisWeek,
        recentSignups,
        growth: userGrowth,
      },

      // Jobs
      jobs: {
        byStatus: jobsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        byCategory: jobsByCategory.map(item => ({
          category: item.category,
          count: item._count.id,
        })),
        newThisWeek: jobsThisWeek,
        newThisMonth: jobsThisMonth,
        completed: completedJobs,
        cancelled: cancelledJobs,
        completionRate,
      },

      // Applications
      applications: {
        byStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        thisWeek: applicationsThisWeek,
      },

      // Financial
      financial: {
        totalEarnings: totalEarnings._sum.amount || 0,
        earningsThisMonth: earningsThisMonth._sum.amount || 0,
        averageJobValue: averageJobValue._avg.payAmount || 0,
        topYouthEarners: enrichedTopYouthEarners,
        topEmployerSpenders: enrichedTopEmployerSpenders,
      },

      // Engagement
      engagement: {
        totalMessages,
        messagesThisWeek,
        totalConversations,
        reviewsThisMonth,
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
        mostActiveEmployers: mostActiveEmployers.map(e => ({
          id: e.id,
          email: e.email,
          companyName: e.employerProfile?.companyName || "Individual",
          jobsPosted: e._count.postedJobs,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
