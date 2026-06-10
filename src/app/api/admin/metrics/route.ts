export const dynamic = "force-dynamic";
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
    const [totalUsers, newUsers, usersByRole, usersWithDob, newUserDates] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.user.findMany({
        where: { dateOfBirth: { not: null } },
        select: { dateOfBirth: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const ages = usersWithDob
      .map((u) => calculateAge(u.dateOfBirth!))
      .filter((age) => age >= 13 && age <= 30); // Filter reasonable ages

    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : null;
    const ageCoverage = totalUsers > 0 ? Math.round((usersWithDob.length / totalUsers) * 100) : 0;

    const ageDistribution = {
      "13-15": ages.filter((a) => a >= 13 && a <= 15).length,
      "16-17": ages.filter((a) => a >= 16 && a <= 17).length,
      "18-19": ages.filter((a) => a >= 18 && a <= 19).length,
      "20+": ages.filter((a) => a >= 20).length,
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
      prisma.journeyGoalData.findMany({ distinct: ["userId"], select: { userId: true } }),
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

    const exploringUsers = usersWithJourney.length;
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
