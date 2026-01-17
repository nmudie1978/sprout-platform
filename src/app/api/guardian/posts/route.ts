/**
 * Guardian Posts API
 * GET - Get job posts in guardian's community (read-only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyGuardianAssignment, isAdmin } from "@/lib/community-guardian";

// GET /api/guardian/posts - Get job posts in guardian's community
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    const assignment = await getMyGuardianAssignment(session.user.id);

    if (!isAdminUser && !assignment.isGuardian) {
      return NextResponse.json(
        { error: "Not authorized - not a guardian" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const showPausedOnly = searchParams.get("paused") === "true";

    const where: any = {};

    // Guardians can only see their community's posts
    if (!isAdminUser && assignment.communityId) {
      where.communityId = assignment.communityId;
    }

    if (showPausedOnly) {
      where.isPaused = true;
    }

    const jobs = await prisma.microJob.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        location: true,
        payAmount: true,
        payType: true,
        status: true,
        isPaused: true,
        pausedAt: true,
        pausedReason: true,
        createdAt: true,
        postedBy: {
          select: {
            id: true,
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [
        { isPaused: "desc" }, // Paused jobs first
        { createdAt: "desc" },
      ],
      take: 100,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching guardian posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
