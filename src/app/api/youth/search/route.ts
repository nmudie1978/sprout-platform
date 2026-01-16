import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/youth/search - Search for youth workers to recommend
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only youth can search for friends to recommend
    if (session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Only youth workers can search for friends" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    // Search for youth workers with visible profiles
    const youthProfiles = await prisma.youthProfile.findMany({
      where: {
        AND: [
          // Must have profile visibility on
          { profileVisibility: true },
          // Exclude current user
          { userId: { not: session.user.id } },
          // Search by display name (case-insensitive)
          {
            displayName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        userId: true,
        displayName: true,
        avatarId: true,
        completedJobsCount: true,
        averageRating: true,
        skillTags: true,
      },
      take: limit,
      orderBy: [
        { completedJobsCount: "desc" },
        { averageRating: "desc" },
      ],
    });

    // Transform to match expected format
    const results = youthProfiles.map((profile) => ({
      id: profile.userId,
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      completedJobsCount: profile.completedJobsCount,
      averageRating: profile.averageRating,
      skillTags: profile.skillTags.slice(0, 3), // Limit skills shown
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching youth:", error);
    return NextResponse.json(
      { error: "Failed to search youth workers" },
      { status: 500 }
    );
  }
}
