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

    // Get all earnings for this youth
    const earnings = await prisma.earning.findMany({
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
    });

    // Calculate summary stats
    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = earnings
      .filter((e) => e.status === "PENDING")
      .reduce((sum, e) => sum + e.amount, 0);
    const confirmedAmount = earnings
      .filter((e) => e.status === "CONFIRMED")
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate this month's earnings
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = earnings
      .filter((e) => new Date(e.earnedAt) >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate earnings by category
    const byCategory = earnings.reduce((acc, e) => {
      const category = e.job.category;
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const response = NextResponse.json({
      earnings,
      summary: {
        totalEarned,
        pendingAmount,
        confirmedAmount,
        thisMonthEarnings,
        totalJobs: earnings.length,
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
