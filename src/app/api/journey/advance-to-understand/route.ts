export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/journey/advance-to-understand
 *
 * Force-advances the journey state from any Discover step to
 * REVIEW_INDUSTRY_OUTLOOK (first Understand step). Also ensures
 * ROLE_DEEP_DIVE is in completedSteps so the orchestrator sees
 * all Discover steps as done.
 *
 * Called client-side when discoverComplete is true but the state
 * machine is stuck in Discover.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        journeyState: true,
        journeyCompletedSteps: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const discoverStates = [
      "REFLECT_ON_STRENGTHS",
      "EXPLORE_CAREERS",
      "ROLE_DEEP_DIVE",
      "BASELINE_PROFILE",
      "CAPABILITY_REFLECTION",
      "CAREER_DISCOVERY",
    ];

    // Only advance if currently in a Discover state
    if (!discoverStates.includes(profile.journeyState)) {
      return NextResponse.json({ success: true, message: "Already past Discover" });
    }

    // Ensure all Discover steps are in completedSteps
    const completed = new Set(profile.journeyCompletedSteps);
    completed.add("REFLECT_ON_STRENGTHS");
    completed.add("EXPLORE_CAREERS");
    completed.add("ROLE_DEEP_DIVE");

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: "REVIEW_INDUSTRY_OUTLOOK",
        journeyCompletedSteps: Array.from(completed),
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to advance to understand:", error);
    return NextResponse.json(
      { error: "Failed to advance" },
      { status: 500 }
    );
  }
}
