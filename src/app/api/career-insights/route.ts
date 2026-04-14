export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getRecommendationsFromAspiration,
  getCareersForCategory,
  getCategoryForCareer,
  getAllCareers,
  type CareerCategory,
  type DiscoveryPreferences,
} from "@/lib/career-pathways";

// GET /api/career-insights - Get personalised career recommendations for youth.
// Signals folded in: primary goal (anchor), explored journey goals + optional
// client-supplied saved career IDs (secondary anchors), and Career Radar
// discovery preferences (category boost). Saved IDs come via the `saved`
// query param since they're stored in localStorage.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Client-supplied saved careers (localStorage) — comma-separated IDs.
    const savedParam = request.nextUrl.searchParams.get("saved") ?? "";
    const savedCareerIds = savedParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Get the user's profile with primary goal, discovery preferences, and
    // all JourneyGoalData rows (explored journeys) in parallel.
    const [youthProfile, journeyGoals] = await Promise.all([
      prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          primaryGoal: true,
          completedJobsCount: true,
          discoveryPreferences: true,
        },
      }),
      prisma.journeyGoalData.findMany({
        where: { userId: session.user.id },
        select: { goalId: true, goalTitle: true, isActive: true },
      }),
    ]);

    // Extract title and skills from primary goal JSON (structured goals system)
    const primaryGoal = youthProfile?.primaryGoal as { title?: string; skills?: string[] } | null;
    const careerAspiration = primaryGoal?.title || "";
    const goalSkills = primaryGoal?.skills || [];
    const totalCompletedJobs = youthProfile?.completedJobsCount || 0;

    // Map explored journey goal titles → career IDs. goalId is slugified
    // from goalTitle so it doesn't always match career.id directly — match
    // on title (case-insensitive) against the catalogue.
    const exploredAnchorIds: string[] = [];
    if (journeyGoals.length > 0) {
      const allCareers = getAllCareers();
      const byTitle = new Map<string, string>();
      for (const c of allCareers) byTitle.set(c.title.toLowerCase(), c.id);
      for (const g of journeyGoals) {
        const id = byTitle.get((g.goalTitle ?? "").toLowerCase());
        if (id) exploredAnchorIds.push(id);
      }
    }

    // Combine explored + saved as secondary anchors (dedup).
    const additionalAnchorIds = Array.from(
      new Set([...exploredAnchorIds, ...savedCareerIds]),
    );

    const discoveryPrefs =
      (youthProfile?.discoveryPreferences as DiscoveryPreferences | null) ?? undefined;

    // Get recommended careers with the enriched signal set. Already-saved
    // careers are excluded so recs surface net-new suggestions.
    const recommendations = getRecommendationsFromAspiration(careerAspiration, {
      additionalAnchorIds,
      discoveryPrefs,
      excludeIds: savedCareerIds,
    });

    // Get top categories from recommendations
    const categoryCount: Record<CareerCategory, number> = {} as Record<CareerCategory, number>;
    for (const rec of recommendations.slice(0, 10)) {
      const category = getCategoryForCareer(rec.career.id);
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({
        category,
        count,
        careers: getCareersForCategory(category as CareerCategory).slice(0, 2),
      }));

    // Build insights message. Names the signals actually in play so the
    // user can see why a recommendation is what it is.
    const signalParts: string[] = [];
    if (careerAspiration) signalParts.push(`primary goal "${careerAspiration}"`);
    if (exploredAnchorIds.length > 0) signalParts.push(`${exploredAnchorIds.length} explored career${exploredAnchorIds.length > 1 ? "s" : ""}`);
    if (savedCareerIds.length > 0) signalParts.push(`${savedCareerIds.length} saved career${savedCareerIds.length > 1 ? "s" : ""}`);
    if (discoveryPrefs && (discoveryPrefs.subjects?.length || discoveryPrefs.starredSubjects?.length)) {
      signalParts.push("Career Radar preferences");
    }

    let insightsMessage = "";
    if (!careerAspiration && signalParts.length === 0) {
      insightsMessage = "Set your career goal in My Goals to get personalised recommendations!";
    } else if (recommendations.length === 0) {
      insightsMessage = "Try updating your career goal for better matches.";
    } else if (signalParts.length === 1) {
      insightsMessage = `Based on your ${signalParts[0]}`;
    } else {
      const last = signalParts.pop()!;
      insightsMessage = `Based on your ${signalParts.join(", ")} and ${last}`;
    }

    const response = NextResponse.json({
      totalCompletedJobs,
      careerAspiration,
      topCategories,
      recommendations: recommendations.slice(0, 6),
      signals: {
        primaryGoal: !!careerAspiration,
        exploredCount: exploredAnchorIds.length,
        savedCount: savedCareerIds.length,
        hasDiscoveryPrefs: !!(discoveryPrefs && (discoveryPrefs.subjects?.length || discoveryPrefs.starredSubjects?.length)),
      },
      insightsMessage,
    });
    // User-specific data, cache for 5 min
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error("Failed to get career insights:", error);
    return NextResponse.json(
      { error: "Failed to get career insights" },
      { status: 500 }
    );
  }
}
