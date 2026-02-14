import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

// Calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

// Get date X days ago
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range from query params (default 14 days)
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 14;
    const validDays = [7, 14, 30].includes(days) ? days : 14;

    const startDate = getDaysAgo(validDays);
    const now = new Date();

    // ============================================
    // USER METRICS (AGGREGATED ONLY)
    // ============================================

    // Total users
    const totalUsers = await prisma.user.count();

    // New users in date range
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    });

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Age data - only for users with dateOfBirth
    const usersWithDob = await prisma.user.findMany({
      where: { dateOfBirth: { not: null } },
      select: { dateOfBirth: true },
    });

    const ages = usersWithDob
      .map((u) => calculateAge(u.dateOfBirth!))
      .filter((age) => age >= 13 && age <= 30); // Filter reasonable ages

    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : null;
    const ageCoverage = totalUsers > 0 ? Math.round((usersWithDob.length / totalUsers) * 100) : 0;

    // Age distribution buckets
    const ageDistribution = {
      "13-15": ages.filter((a) => a >= 13 && a <= 15).length,
      "16-17": ages.filter((a) => a >= 16 && a <= 17).length,
      "18-19": ages.filter((a) => a >= 18 && a <= 19).length,
      "20+": ages.filter((a) => a >= 20).length,
    };

    // ============================================
    // JOB METRICS (AGGREGATED ONLY)
    // ============================================

    // Total jobs
    const totalJobs = await prisma.microJob.count();

    // Jobs in date range
    const newJobs = await prisma.microJob.count({
      where: { createdAt: { gte: startDate } },
    });

    // Jobs by status
    const jobsByStatus = await prisma.microJob.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Run all time-series and remaining queries in parallel
    const [
      jobsPerDayRaw,
      topCategories,
      topLocationsRaw,
      totalApplications,
      newApplications,
      applicationsByStatus,
      applicationsPerDayRaw,
      totalMessages,
      newMessages,
      messagesPerDayRaw,
      activeMessageSenders,
      activeApplicants,
    ] = await Promise.all([
      // Jobs per day - single query with DATE_TRUNC instead of N sequential queries
      prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
        FROM "MicroJob"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,

      // Top 5 categories
      prisma.microJob.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      // Top 5 locations - use groupBy instead of fetching all records
      prisma.microJob.groupBy({
        by: ["location"],
        where: { location: { not: "" } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20, // fetch extra to handle city extraction deduplication
      }),

      // Total applications
      prisma.application.count(),

      // Applications in date range
      prisma.application.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Applications by status
      prisma.application.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Applications per day - single query
      prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
        FROM "Application"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,

      // Total messages
      prisma.message.count(),

      // Messages in date range
      prisma.message.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Messages per day - single query
      prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::bigint as count
        FROM "Message"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,

      // Active message senders
      prisma.message.findMany({
        where: { createdAt: { gte: startDate } },
        select: { senderId: true },
        distinct: ["senderId"],
      }),

      // Active applicants
      prisma.application.findMany({
        where: { createdAt: { gte: startDate } },
        select: { youthId: true },
        distinct: ["youthId"],
      }),
    ]);

    // Build day-indexed maps from raw query results for O(1) lookup
    const buildDayMap = (rows: Array<{ day: Date; count: bigint }>) => {
      const map = new Map<string, number>();
      for (const row of rows) {
        map.set(formatDate(new Date(row.day)), Number(row.count));
      }
      return map;
    };

    const jobsDayMap = buildDayMap(jobsPerDayRaw);
    const appsDayMap = buildDayMap(applicationsPerDayRaw);
    const msgsDayMap = buildDayMap(messagesPerDayRaw);

    // Fill in all days (including zeros) for the time series
    const jobsPerDay: { date: string; count: number }[] = [];
    const applicationsPerDay: { date: string; count: number }[] = [];
    const messagesPerDay: { date: string; count: number }[] = [];

    for (let i = validDays - 1; i >= 0; i--) {
      const d = formatDate(getDaysAgo(i));
      jobsPerDay.push({ date: d, count: jobsDayMap.get(d) || 0 });
      applicationsPerDay.push({ date: d, count: appsDayMap.get(d) || 0 });
      messagesPerDay.push({ date: d, count: msgsDayMap.get(d) || 0 });
    }

    // Extract city from location and aggregate
    const locationCounts: Record<string, number> = {};
    topLocationsRaw.forEach((row) => {
      if (row.location) {
        const city = (row.location as string).split(",")[0].trim();
        const count = typeof row._count === 'number' ? row._count : (row._count as { id: number }).id;
        if (city) {
          locationCounts[city] = (locationCounts[city] || 0) + count;
        }
      }
    });
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    const uniqueActiveUsers = new Set([
      ...activeMessageSenders.map((m) => m.senderId),
      ...activeApplicants.map((a) => a.youthId),
    ]);

    const activeUsers = uniqueActiveUsers.size;

    // ============================================
    // RESPONSE
    // ============================================

    const response = NextResponse.json({
      dateRange: {
        days: validDays,
        startDate: formatDate(startDate),
        endDate: formatDate(now),
      },
      users: {
        total: totalUsers,
        new: newUsers,
        averageAge: averageAge ? Math.round(averageAge * 10) / 10 : null,
        ageCoverage,
        ageDistribution,
        byRole: usersByRole.map((r) => ({
          role: r.role,
          count: r._count.id,
        })),
      },
      jobs: {
        total: totalJobs,
        new: newJobs,
        byStatus: jobsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        perDay: jobsPerDay,
        topCategories: topCategories.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        topLocations,
      },
      applications: {
        total: totalApplications,
        new: newApplications,
        byStatus: applicationsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        perDay: applicationsPerDay,
      },
      engagement: {
        totalMessages,
        newMessages,
        messagesPerDay,
        activeUsers,
      },
    });
    // Admin metrics are expensive; cache for 5 min
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
