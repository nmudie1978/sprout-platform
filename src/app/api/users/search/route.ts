import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/search - Search for users to message
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search for users by displayName (youth) or companyName (employer)
    // Exclude users with doNotDisturb: true and the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          { doNotDisturb: false },
          {
            OR: [
              {
                youthProfile: {
                  displayName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
              {
                employerProfile: {
                  companyName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        role: true,
        youthProfile: {
          select: {
            displayName: true,
            avatarId: true,
            availabilityStatus: true,
          },
        },
        employerProfile: {
          select: {
            companyName: true,
            companyLogo: true,
            verified: true,
          },
        },
      },
      take: limit,
    });

    // Format results
    const formattedUsers = users.map((user) => {
      if (user.role === "EMPLOYER" && user.employerProfile) {
        return {
          id: user.id,
          role: "EMPLOYER" as const,
          name: user.employerProfile.companyName,
          logo: user.employerProfile.companyLogo,
          verified: user.employerProfile.verified,
        };
      } else if (user.youthProfile) {
        return {
          id: user.id,
          role: "YOUTH" as const,
          name: user.youthProfile.displayName,
          avatar: user.youthProfile.avatarId,
          availabilityStatus: user.youthProfile.availabilityStatus,
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Failed to search users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
