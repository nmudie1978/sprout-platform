import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/employer/spending - Get spending data for charting
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearsParam = searchParams.get("years") || "1";
    const years = Math.min(Math.max(parseInt(yearsParam) || 1, 1), 5);

    const now = new Date();
    const startDate = new Date(now.getFullYear() - years, now.getMonth(), 1);

    // Get all completed jobs with confirmed earnings
    const completedJobs = await prisma.microJob.findMany({
      where: {
        postedById: session.user.id,
        status: "COMPLETED",
        updatedAt: { gte: startDate },
      },
      select: {
        id: true,
        title: true,
        category: true,
        payAmount: true,
        payType: true,
        updatedAt: true,
        earnings: {
          select: {
            amount: true,
            status: true,
            earnedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    // Aggregate spending by month
    const monthlyData: Record<string, { total: number; confirmed: number; pending: number; jobs: number }> = {};

    // Initialize all months in the range
    const current = new Date(startDate);
    while (current <= now) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { total: 0, confirmed: 0, pending: 0, jobs: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    // Fill in spending data
    for (const job of completedJobs) {
      const earning = job.earnings[0]; // Get the earning record
      if (earning) {
        const date = new Date(earning.earnedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (monthlyData[key]) {
          monthlyData[key].total += earning.amount;
          monthlyData[key].jobs += 1;
          if (earning.status === "CONFIRMED") {
            monthlyData[key].confirmed += earning.amount;
          } else {
            monthlyData[key].pending += earning.amount;
          }
        }
      }
    }

    // Convert to array format
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        ...data,
      }));

    // Calculate summary stats
    const totalSpent = completedJobs.reduce((sum, job) => {
      const earning = job.earnings[0];
      return sum + (earning?.amount || 0);
    }, 0);

    const confirmedSpent = completedJobs.reduce((sum, job) => {
      const earning = job.earnings[0];
      return sum + (earning?.status === "CONFIRMED" ? earning.amount : 0);
    }, 0);

    const totalJobs = completedJobs.length;
    const avgPerJob = totalJobs > 0 ? totalSpent / totalJobs : 0;
    const avgMonthly = chartData.length > 0 ? totalSpent / chartData.length : 0;

    // Best month
    const bestMonth = chartData.reduce(
      (best, current) => (current.total > best.total ? current : best),
      chartData[0] || { month: "", monthLabel: "", total: 0 }
    );

    // Spending by category
    const byCategory = completedJobs.reduce((acc, job) => {
      const earning = job.earnings[0];
      if (earning) {
        acc[job.category] = (acc[job.category] || 0) + earning.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Year-over-year comparison
    let yearOverYearChange = null;
    if (years >= 2 && chartData.length >= 24) {
      const currentYearTotal = chartData.slice(-12).reduce((sum, d) => sum + d.total, 0);
      const previousYearTotal = chartData.slice(-24, -12).reduce((sum, d) => sum + d.total, 0);
      if (previousYearTotal > 0) {
        yearOverYearChange = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
      }
    }

    // Top workers hired
    const workerHires = await prisma.application.findMany({
      where: {
        job: {
          postedById: session.user.id,
          status: "COMPLETED",
        },
        status: "ACCEPTED",
      },
      select: {
        youthId: true,
        youth: {
          select: {
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                averageRating: true,
              },
            },
          },
        },
        job: {
          select: {
            payAmount: true,
          },
        },
      },
    });

    // Aggregate top workers
    const workerStats = workerHires.reduce((acc, app) => {
      const youthId = app.youthId;
      if (!acc[youthId]) {
        acc[youthId] = {
          id: youthId,
          displayName: app.youth.youthProfile?.displayName || "Unknown",
          avatarId: app.youth.youthProfile?.avatarId || null,
          averageRating: app.youth.youthProfile?.averageRating || null,
          jobsCount: 0,
          totalPaid: 0,
        };
      }
      acc[youthId].jobsCount += 1;
      acc[youthId].totalPaid += app.job.payAmount;
      return acc;
    }, {} as Record<string, any>);

    const topWorkers = Object.values(workerStats)
      .sort((a: any, b: any) => b.jobsCount - a.jobsCount)
      .slice(0, 5);

    return NextResponse.json({
      chartData,
      summary: {
        totalSpent,
        confirmedSpent,
        pendingSpent: totalSpent - confirmedSpent,
        totalJobs,
        avgPerJob,
        avgMonthly,
        bestMonth: bestMonth?.monthLabel || null,
        bestMonthAmount: bestMonth?.total || 0,
        yearOverYearChange,
        byCategory,
        periodYears: years,
      },
      topWorkers,
    });
  } catch (error) {
    console.error("Failed to fetch spending data:", error);
    return NextResponse.json(
      { error: "Failed to fetch spending data" },
      { status: 500 }
    );
  }
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
