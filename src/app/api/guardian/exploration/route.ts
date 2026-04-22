export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guardian/exploration
 *
 * Returns a read-only summary of linked youth's career exploration
 * for the parent/guardian companion view. Only returns data if:
 *   1. The caller is a guardian/parent (COMMUNITY_GUARDIAN role or
 *      has a WorkerGuardianLink)
 *   2. The linked youth has opted in to sharing (guardianConsent)
 *
 * Returns: career goal, roadmap progress, momentum actions count,
 * foundation stage — enough for a parent to understand what their
 * teen is exploring without seeing private notes or reflections.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find linked youth profiles
    const links = await prisma.workerGuardianLink.findMany({
      where: {
        guardianId: session.user.id,
        // Enum has PENDING | ACTIVE | REVOKED — ACTIVE is the
        // equivalent of the old "VERIFIED" state.
        status: "ACTIVE",
      },
      select: {
        workerId: true,
      },
    });

    if (links.length === 0) {
      return NextResponse.json({ youths: [] });
    }

    const youthIds = links.map((l) => l.workerId);

    // Fetch exploration data for each linked youth
    const profiles = await prisma.youthProfile.findMany({
      where: {
        userId: { in: youthIds },
        guardianConsent: true, // Only share if consent granted
      },
      select: {
        userId: true,
        displayName: true,
        avatarId: true,
        careerAspiration: true,
        // Journey goal data — what career they're exploring
        user: {
          select: {
            journeyGoalData: {
              where: { isActive: true },
              select: {
                goalTitle: true,
                journeySummary: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const youths = profiles.map((p) => {
      const goalData = p.user?.journeyGoalData?.[0];
      const summary = goalData?.journeySummary as Record<string, unknown> | null;
      const momentumActions = (summary?.momentumActions as unknown[]) ?? [];
      const educationContext = summary?.educationContext as { stage?: string } | null;

      return {
        id: p.userId,
        displayName: p.displayName,
        avatarId: p.avatarId,
        careerGoal: goalData?.goalTitle ?? p.careerAspiration ?? null,
        educationStage: educationContext?.stage ?? null,
        momentumActionsCount: momentumActions.length,
        hasFoundation: !!educationContext?.stage,
      };
    });

    return NextResponse.json({ youths });
  } catch (error) {
    console.error("Guardian exploration error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
