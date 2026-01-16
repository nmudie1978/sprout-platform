import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/earnings/chart - Get earnings data for charting
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearsParam = searchParams.get("years") || "1";
    const years = Math.min(Math.max(parseInt(yearsParam) || 1, 1), 5); // Clamp between 1-5

    // Calculate the start date based on years
    const now = new Date();
    const startDate = new Date(now.getFullYear() - years, now.getMonth(), 1);

    // Get all earnings within the date range
    const earnings = await prisma.earning.findMany({
      where: {
        youthId: session.user.id,
        earnedAt: { gte: startDate },
      },
      select: {
        amount: true,
        status: true,
        earnedAt: true,
        job: {
          select: {
            category: true,
          },
        },
      },
      orderBy: {
        earnedAt: "asc",
      },
    });

    // Aggregate earnings by month
    const monthlyData: Record<string, { total: number; confirmed: number; pending: number; jobs: number }> = {};

    // Initialize all months in the range
    const current = new Date(startDate);
    while (current <= now) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { total: 0, confirmed: 0, pending: 0, jobs: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    // Fill in earnings data
    for (const earning of earnings) {
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

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        ...data,
      }));

    // Calculate summary stats for the period
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const confirmedEarnings = earnings.filter(e => e.status === "CONFIRMED").reduce((sum, e) => sum + e.amount, 0);
    const totalJobs = earnings.length;
    const avgMonthly = chartData.length > 0 ? totalEarnings / chartData.length : 0;

    // Find best month
    const bestMonth = chartData.reduce(
      (best, current) => (current.total > best.total ? current : best),
      chartData[0] || { month: "", monthLabel: "", total: 0 }
    );

    // Calculate earnings by category for the period
    const byCategory = earnings.reduce((acc, e) => {
      const category = e.job.category;
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate year-over-year growth if we have enough data
    let yearOverYearGrowth = null;
    if (years >= 2 && chartData.length >= 24) {
      const currentYearTotal = chartData.slice(-12).reduce((sum, d) => sum + d.total, 0);
      const previousYearTotal = chartData.slice(-24, -12).reduce((sum, d) => sum + d.total, 0);
      if (previousYearTotal > 0) {
        yearOverYearGrowth = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
      }
    }

    return NextResponse.json({
      chartData,
      summary: {
        totalEarnings,
        confirmedEarnings,
        totalJobs,
        avgMonthly,
        bestMonth: bestMonth?.monthLabel || null,
        bestMonthAmount: bestMonth?.total || 0,
        yearOverYearGrowth,
        byCategory,
        periodYears: years,
      },
    });
  } catch (error) {
    console.error("Failed to fetch earnings chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings data" },
      { status: 500 }
    );
  }
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
