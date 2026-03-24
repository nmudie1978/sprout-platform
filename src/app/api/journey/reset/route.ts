export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/journey/reset
 *
 * Resets journey progress back to the beginning (REFLECT_ON_STRENGTHS).
 * Used when a user changes their primary career goal — all Discover,
 * Understand, and Grow progress is cleared so they start fresh.
 *
 * Strengths and career interests from the summary are preserved since
 * those are personal to the user, not goal-specific.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true },
    });

    // Preserve user-level data (strengths, interests) but clear everything else
    const existingSummary = (profile?.journeySummary as Record<string, unknown>) || {};
    const preservedSummary = {
      strengths: existingSummary.strengths || [],
      careerInterests: existingSummary.careerInterests || [],
    };

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        journeyState: "REFLECT_ON_STRENGTHS",
        journeyCompletedSteps: [],
        journeySkippedSteps: null,
        journeySummary: preservedSummary,
        journeyLastUpdated: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset journey:", error);
    return NextResponse.json(
      { error: "Failed to reset journey" },
      { status: 500 }
    );
  }
}
