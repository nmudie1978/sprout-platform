import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSkillLevels } from "@/lib/skills-mapping";

/**
 * GET /api/profile/skills
 * Returns calculated skill levels based on user's completed jobs
 * Optimized to only fetch completed jobs for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch only completed jobs for this user directly
    // Much more efficient than fetching all jobs and filtering
    const completedApplications = await prisma.application.findMany({
      where: {
        youthId: session.user.id,
        status: "ACCEPTED",
        job: {
          status: "COMPLETED",
        },
      },
      select: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            requiredTraits: true,
          },
        },
      },
    });

    const completedJobs = completedApplications.map((app) => app.job);
    const skillLevels = calculateSkillLevels(completedJobs);

    const response = NextResponse.json(skillLevels);
    // Cache for 5 minutes - skills don't change frequently
    response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("Failed to calculate skill levels:", error);
    return NextResponse.json(
      { error: "Failed to calculate skill levels" },
      { status: 500 }
    );
  }
}
