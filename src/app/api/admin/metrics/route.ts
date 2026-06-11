export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

// Get date X days ago (start of that day)
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

// Bucket a list of timestamps into a day-by-day count series spanning the
// last `days` days (inclusive of today). Always returns a fully-populated
// series so charts render a continuous line even on quiet days.
function bucketPerDay(dates: Date[], days: number): { date: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(formatDate(getDaysAgo(i)), 0);
  }
  for (const d of dates) {
    const key = formatDate(d);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets, ([date, count]) => ({ date, count }));
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
    const [totalUsers, newUsers, usersByRole, dobAggRows, newUserDates] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      // Age distribution computed in SQL (one aggregate row) instead of
      // loading every user's DOB into JS. `extract(year from age(dob))` ==
      // calculateAge (completed years). Buckets/avg mirror the old 13–30 filter.
      prisma.$queryRaw<
        { with_dob: number; valid_count: number; avg_age: number | null; b1315: number; b1617: number; b1819: number; b20: number }[]
      >`
        SELECT
          count(*)::int AS with_dob,
          count(*) FILTER (WHERE yrs BETWEEN 13 AND 30)::int AS valid_count,
          avg(yrs) FILTER (WHERE yrs BETWEEN 13 AND 30)::float AS avg_age,
          count(*) FILTER (WHERE yrs BETWEEN 13 AND 15)::int AS b1315,
          count(*) FILTER (WHERE yrs BETWEEN 16 AND 17)::int AS b1617,
          count(*) FILTER (WHERE yrs BETWEEN 18 AND 19)::int AS b1819,
          count(*) FILTER (WHERE yrs BETWEEN 20 AND 30)::int AS b20
        FROM (
          SELECT extract(year from age("dateOfBirth"))::int AS yrs
          FROM "User" WHERE "dateOfBirth" IS NOT NULL
        ) s
      `,
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const dobAgg = dobAggRows[0] ?? { with_dob: 0, valid_count: 0, avg_age: null, b1315: 0, b1617: 0, b1819: 0, b20: 0 };
    const averageAge = dobAgg.valid_count > 0 ? dobAgg.avg_age : null;
    const ageCoverage = totalUsers > 0 ? Math.round((dobAgg.with_dob / totalUsers) * 100) : 0;

    const ageDistribution = {
      "13-15": dobAgg.b1315,
      "16-17": dobAgg.b1617,
      "18-19": dobAgg.b1819,
      "20+": dobAgg.b20,
    };

    // ============================================
    // CAREER-EXPLORATION ACTIVITY (real engagement)
    // ============================================
    // The jobs/applications marketplace was discontinued — these metrics
    // reflect what the platform actually does now: exploring careers,
    // setting journey goals, saving careers, reflecting, and chatting with
    // the Career Twin. All counts are aggregate-only (no personal data).
    const [
      journeysTotal,
      journeysNew,
      journeysCompleted,
      usersWithJourney,
      journeyDates,
      savedCareersTotal,
      savedCareersNew,
      savedInsightsTotal,
      savedInsightsNew,
      careerInterestsTotal,
      careerInterestsNew,
      reflectionsTotal,
      reflectionsNew,
      twinChatsTotal,
      twinChatsNew,
      themeRows,
      returningRows,
    ] = await Promise.all([
      prisma.journeyGoalData.count(),
      prisma.journeyGoalData.count({ where: { createdAt: { gte: startDate } } }),
      // A journey is "completed" once it reaches Clarity — the final lens
      // checkpoint stored in journeyCompletedSteps (values: discover|understand|
      // clarity). See /api/journey/completion/sync.
      prisma.journeyGoalData.count({ where: { journeyCompletedSteps: { has: "clarity" } } }),
      // Distinct users who have started at least one journey (for the average).
      // COUNT(DISTINCT) in SQL instead of materialising every userId in JS.
      prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(DISTINCT "userId")::int AS count FROM "JourneyGoalData"`,
      prisma.journeyGoalData.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.savedCareer.count(),
      prisma.savedCareer.count({ where: { savedAt: { gte: startDate } } }),
      // Saved Industry Insights = SavedItem tagged "skills-that-matter".
      prisma.savedItem.count({ where: { deletedAt: null, tags: { has: "skills-that-matter" } } }),
      prisma.savedItem.count({
        where: { deletedAt: null, tags: { has: "skills-that-matter" }, savedAt: { gte: startDate } },
      }),
      prisma.careerInterest.count(),
      prisma.careerInterest.count({ where: { createdAt: { gte: startDate } } }),
      prisma.journeyReflection.count({ where: { skipped: false } }),
      prisma.journeyReflection.count({ where: { skipped: false, createdAt: { gte: startDate } } }),
      prisma.careerTwinMessage.count(),
      prisma.careerTwinMessage.count({ where: { createdAt: { gte: startDate } } }),
      // Anonymous dark/light tally (two rows max).
      prisma.themeTally.findMany({ select: { theme: true, count: true } }),
      // Returning users — signed up, then came back and did something on a
      // LATER day. Approximated as: an activity row (journey / interest / twin
      // chat) created more than 24h after the account. No login tracking exists.
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM "User" u
        WHERE EXISTS (SELECT 1 FROM "JourneyGoalData" j
                      WHERE j."userId" = u.id AND j."createdAt" > u."createdAt" + INTERVAL '1 day')
           OR EXISTS (SELECT 1 FROM "CareerInterest" c
                      WHERE c."userId" = u.id AND c."createdAt" > u."createdAt" + INTERVAL '1 day')
           OR EXISTS (SELECT 1 FROM "CareerTwinMessage" m
                      WHERE m."userId" = u.id AND m."createdAt" > u."createdAt" + INTERVAL '1 day')
      `,
    ]);

    const exploringUsers = usersWithJourney[0]?.count ?? 0;
    const avgJourneysPerUser = exploringUsers > 0 ? journeysTotal / exploringUsers : 0;
    const themeDark = themeRows.find((t) => t.theme === "dark")?.count ?? 0;
    const themeLight = themeRows.find((t) => t.theme === "light")?.count ?? 0;
    const returningUsers = returningRows[0]?.count ?? 0;

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
        returning: returningUsers,
        averageAge: averageAge ? Math.round(averageAge * 10) / 10 : null,
        ageCoverage,
        ageDistribution,
        byRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id })),
        perDay: bucketPerDay(newUserDates.map((u) => u.createdAt), validDays),
      },
      activity: {
        journeys: {
          total: journeysTotal,
          new: journeysNew,
          completed: journeysCompleted,
          avgPerUser: Math.round(avgJourneysPerUser * 10) / 10,
          exploringUsers,
          perDay: bucketPerDay(journeyDates.map((j) => j.createdAt), validDays),
        },
        savedCareers: { total: savedCareersTotal, new: savedCareersNew },
        savedInsights: { total: savedInsightsTotal, new: savedInsightsNew },
        careerInterests: { total: careerInterestsTotal, new: careerInterestsNew },
        reflections: { total: reflectionsTotal, new: reflectionsNew },
        twinChats: { total: twinChatsTotal, new: twinChatsNew },
      },
      theme: { dark: themeDark, light: themeLight },
    });
    // Admin metrics are expensive; cache for 5 min
    response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
