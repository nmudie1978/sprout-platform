import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch available shadow hosts (verified employers)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Build where clause for search
    const searchFilter = search
      ? {
          OR: [
            {
              employerProfile: {
                companyName: { contains: search, mode: "insensitive" as const },
              },
            },
            { fullName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Fetch verified employers who can host shadows
    const hosts = await prisma.user.findMany({
      where: {
        role: "EMPLOYER",
        isVerifiedAdult: true,
        accountStatus: "ACTIVE",
        employerProfile: {
          verified: true,
        },
        // Exclude blocked users
        blocksReceived: {
          none: {
            blockerId: session.user.id,
          },
        },
        blocksMade: {
          none: {
            blockedId: session.user.id,
          },
        },
        ...searchFilter,
      },
      include: {
        employerProfile: {
          select: {
            companyName: true,
            companyLogo: true,
            bio: true,
            website: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: {
        employerProfile: { averageRating: "desc" },
      },
      take: 50,
    });

    // Transform the data for the frontend
    const transformedHosts = hosts
      .filter((host) => host.employerProfile) // Ensure profile exists
      .map((host) => ({
        id: host.id,
        name: host.employerProfile?.companyName || host.fullName || "Unknown",
        logo: host.employerProfile?.companyLogo,
        bio: host.employerProfile?.bio,
        website: host.employerProfile?.website,
        rating: host.employerProfile?.averageRating,
        reviewCount: host.employerProfile?.totalReviews || 0,
      }));

    return NextResponse.json(transformedHosts);
  } catch (error) {
    console.error("Failed to fetch shadow hosts:", error);
    return NextResponse.json(
      { error: "Failed to fetch hosts" },
      { status: 500 }
    );
  }
}
