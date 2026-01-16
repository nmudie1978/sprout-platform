import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecommendedCareers, getCareersForCategory } from "@/lib/career-pathways";
import { JobCategory } from "@prisma/client";

// GET /api/career-insights - Get personalized career recommendations for youth
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's completed jobs grouped by category
    const completedJobs = await prisma.microJob.findMany({
      where: {
        applications: {
          some: {
            youthId: session.user.id,
            status: "ACCEPTED",
          },
        },
        status: {
          in: ["COMPLETED", "REVIEWED"],
        },
      },
      select: {
        category: true,
      },
    });

    // Count jobs by category
    const jobsByCategory: Record<string, number> = {};
    for (const job of completedJobs) {
      jobsByCategory[job.category] = (jobsByCategory[job.category] || 0) + 1;
    }

    // Get total completed jobs
    const totalCompletedJobs = completedJobs.length;

    // Get recommended careers based on experience
    const recommendations = getRecommendedCareers(jobsByCategory);

    // Get the user's top categories
    const topCategories = Object.entries(jobsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({
        category: category as JobCategory,
        count,
        careers: getCareersForCategory(category as JobCategory).slice(0, 2),
      }));

    // Build insights message
    let insightsMessage = "";
    if (totalCompletedJobs === 0) {
      insightsMessage = "Complete jobs to get personalized career recommendations!";
    } else if (totalCompletedJobs < 3) {
      insightsMessage = "Great start! Complete more jobs to refine your career matches.";
    } else if (topCategories.length === 1) {
      insightsMessage = `You're building strong experience in ${topCategories[0].category.toLowerCase().replace("_", " ")}!`;
    } else {
      insightsMessage = `Your diverse experience opens doors to many career paths!`;
    }

    return NextResponse.json({
      totalCompletedJobs,
      jobsByCategory,
      topCategories,
      recommendations: recommendations.slice(0, 6),
      insightsMessage,
    });
  } catch (error) {
    console.error("Failed to get career insights:", error);
    return NextResponse.json(
      { error: "Failed to get career insights" },
      { status: 500 }
    );
  }
}
