import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get all favorite workers for an employer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favoriteWorker.findMany({
      where: { employerId: session.user.id },
      include: {
        youth: {
          select: {
            id: true,
            email: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                bio: true,
                skillTags: true,
                completedJobsCount: true,
                averageRating: true,
              },
            },
            applications: {
              where: {
                job: {
                  postedById: session.user.id,
                  status: "COMPLETED",
                },
                status: "ACCEPTED",
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedFavorites = favorites.map((fav) => ({
      id: fav.id,
      youthId: fav.youthId,
      displayName: fav.youth.youthProfile?.displayName || "Unknown",
      avatarId: fav.youth.youthProfile?.avatarId,
      bio: fav.youth.youthProfile?.bio,
      skillTags: fav.youth.youthProfile?.skillTags || [],
      completedJobsCount: fav.youth.youthProfile?.completedJobsCount || 0,
      averageRating: fav.youth.youthProfile?.averageRating,
      jobsWithYou: fav.youth.applications.length,
      addedAt: fav.createdAt,
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a worker to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { youthId } = body;

    if (!youthId) {
      return NextResponse.json(
        { error: "Youth ID is required" },
        { status: 400 }
      );
    }

    // Check if youth exists
    const youth = await prisma.user.findUnique({
      where: { id: youthId, role: "YOUTH" },
    });

    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    // Check if already favorited
    const existing = await prisma.favoriteWorker.findUnique({
      where: {
        employerId_youthId: {
          employerId: session.user.id,
          youthId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favoriteWorker.create({
      data: {
        employerId: session.user.id,
        youthId,
      },
    });

    return NextResponse.json(
      { id: favorite.id, message: "Added to favorites" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a worker from favorites
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const youthId = searchParams.get("youthId");

    if (!youthId) {
      return NextResponse.json(
        { error: "Youth ID is required" },
        { status: 400 }
      );
    }

    await prisma.favoriteWorker.delete({
      where: {
        employerId_youthId: {
          employerId: session.user.id,
          youthId,
        },
      },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
