import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const availabilityStatus = searchParams.get("availabilityStatus");
    const skillTags = searchParams.get("skillTags");
    const interests = searchParams.get("interests");
    const location = searchParams.get("location");
    const ageBracket = searchParams.get("ageBracket");

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {
      profileVisibility: true, // Only show public profiles
    };

    if (availabilityStatus) {
      where.availabilityStatus = availabilityStatus;
    }

    if (skillTags) {
      where.skillTags = {
        hasSome: skillTags.split(","),
      };
    }

    if (interests) {
      where.interests = {
        hasSome: interests.split(","),
      };
    }

    // Filter by user properties (location, ageBracket)
    const userWhere: any = {};

    if (location) {
      userWhere.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (ageBracket) {
      userWhere.ageBracket = ageBracket;
    }

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }

    // Get total count for pagination metadata
    const totalCount = await prisma.youthProfile.count({ where });

    const youthProfiles = await prisma.youthProfile.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        displayName: true,
        avatarId: true,
        bio: true,
        skillTags: true,
        interests: true,
        availabilityStatus: true,
        completedJobsCount: true,
        averageRating: true,
        profileVisibility: true,
        user: {
          select: {
            id: true,
            location: true,
            ageBracket: true,
          },
        },
      },
      orderBy: [
        { availabilityStatus: "asc" }, // AVAILABLE first
        { averageRating: "desc" },
        { completedJobsCount: "desc" },
      ],
    });

    // Return with pagination metadata
    const response = NextResponse.json({
      talent: youthProfiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });

    // Add cache headers for talent listings
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120');

    return response;
  } catch (error) {
    console.error("Failed to fetch talent:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent" },
      { status: 500 }
    );
  }
}
