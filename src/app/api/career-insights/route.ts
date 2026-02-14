import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecommendationsFromAspiration, getCareersForCategory, getCategoryForCareer, type CareerCategory } from "@/lib/career-pathways";

// GET /api/career-insights - Get personalised career recommendations for youth based on their primary goal
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile with primary goal from structured goals system
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        primaryGoal: true,
        completedJobsCount: true,
      },
    });

    // Extract title and skills from primary goal JSON (structured goals system)
    const primaryGoal = youthProfile?.primaryGoal as { title?: string; skills?: string[] } | null;
    const careerAspiration = primaryGoal?.title || "";
    const goalSkills = primaryGoal?.skills || [];
    const totalCompletedJobs = youthProfile?.completedJobsCount || 0;

    // Get recommended careers based on primary goal title and skills
    const recommendations = getRecommendationsFromAspiration(careerAspiration, goalSkills);

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

    // Build insights message
    let insightsMessage = "";
    if (!careerAspiration) {
      insightsMessage = "Set your career goal in My Goals to get personalised recommendations!";
    } else if (recommendations.length === 0) {
      insightsMessage = "Try updating your career goal for better matches.";
    } else {
      insightsMessage = `Based on your primary goal: "${careerAspiration}"`;
    }

    const response = NextResponse.json({
      totalCompletedJobs,
      careerAspiration,
      topCategories,
      recommendations: recommendations.slice(0, 6),
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
