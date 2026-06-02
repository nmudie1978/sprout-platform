export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateSkillLevels } from "@/lib/skills-mapping";

/**
 * GET /api/profile/skills
 * Returns calculated soft-skill levels for the current youth.
 *
 * NOTE: This previously derived levels from completed marketplace jobs, which
 * no longer exist. Until a replacement experience signal is wired (journey
 * activity, courses, quizzes), this returns baseline (zeroed) levels so the
 * skills surface renders without fabricated data.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // No marketplace job-completion source anymore — baseline levels for now.
    const completedJobs: { category: string }[] = [];
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
