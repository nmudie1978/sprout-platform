import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ReadinessCheck } from "@/lib/growth/stage-config";

// GET /api/growth/readiness - Get user's readiness for stage progression
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        desiredRoles: true,
        skillTags: true,
        city: true,
      },
    });

    // Check for vault items that could count as CV/proof
    const vaultItemCount = await prisma.vaultItem.count({
      where: {
        userId: session.user.id,
        type: { in: ["PROOF", "CERTIFICATE", "BADGE"] },
      },
    });

    const readiness: ReadinessCheck = {
      hasTargetCareer: (profile?.desiredRoles?.length ?? 0) > 0,
      hasSkillTags: (profile?.skillTags?.length ?? 0) > 0,
      hasLocationPreference: Boolean(profile?.city),
      hasCV: vaultItemCount > 0,
    };

    return NextResponse.json(readiness);
  } catch (error) {
    console.error("[Readiness API] Error:", error);
    return NextResponse.json(
      { error: "Failed to check readiness" },
      { status: 500 }
    );
  }
}
