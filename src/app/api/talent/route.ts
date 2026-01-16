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

    const youthProfiles = await prisma.youthProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
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

    return NextResponse.json(youthProfiles);
  } catch (error) {
    console.error("Failed to fetch talent:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent" },
      { status: 500 }
    );
  }
}
