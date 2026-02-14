import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/earnings - Get earnings for the current youth user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period"); // "all", "month", "year"

    // Build date filter
    let dateFilter = {};
    const now = new Date();

    if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { earnedAt: { gte: startOfMonth } };
    } else if (period === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { earnedAt: { gte: startOfYear } };
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run list query and aggregate queries in parallel
    const [earnings, summaryAgg, pendingAgg, confirmedAgg, thisMonthAgg, categoryAgg] = await Promise.all([
      // Paginated earnings list
      prisma.earning.findMany({
        where: {
          youthId: session.user.id,
          ...dateFilter,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              payType: true,
              postedBy: {
                select: {
                  employerProfile: {
                    select: {
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          earnedAt: "desc",
        },
      }),
      // Total earned - database-side aggregation
      prisma.earning.aggregate({
        where: { youthId: session.user.id, ...dateFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Pending amount - database-side
      prisma.earning.aggregate({
        where: { youthId: session.user.id, ...dateFilter, status: "PENDING" },
        _sum: { amount: true },
      }),
      // Confirmed amount - database-side
      prisma.earning.aggregate({
        where: { youthId: session.user.id, ...dateFilter, status: "CONFIRMED" },
        _sum: { amount: true },
      }),
      // This month's earnings - database-side
      prisma.earning.aggregate({
        where: { youthId: session.user.id, earnedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      // Earnings by category - database-side groupBy
      prisma.earning.groupBy({
        by: ["jobId"],
        where: { youthId: session.user.id, ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    // Build category map from earnings list (already fetched, just index)
    const jobCategoryMap = new Map(earnings.map((e) => [e.jobId, e.job.category]));
    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) {
      const category = jobCategoryMap.get(row.jobId) || "Unknown";
      byCategory[category] = (byCategory[category] || 0) + (row._sum.amount || 0);
    }

    const response = NextResponse.json({
      earnings,
      summary: {
        totalEarned: summaryAgg._sum.amount || 0,
        pendingAmount: pendingAgg._sum.amount || 0,
        confirmedAmount: confirmedAgg._sum.amount || 0,
        thisMonthEarnings: thisMonthAgg._sum.amount || 0,
        totalJobs: summaryAgg._count.id,
        byCategory,
      },
    });
    // Add cache headers - earnings data is user-specific
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error("Failed to fetch earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
