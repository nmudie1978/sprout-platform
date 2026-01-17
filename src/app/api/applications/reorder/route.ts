import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/applications/reorder - Move a single application to a specific position
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, direction } = body;

    if (!applicationId || !["up", "down", "top", "bottom"].includes(direction)) {
      return NextResponse.json(
        { error: "applicationId and direction (up/down/top/bottom) are required" },
        { status: 400 }
      );
    }

    // Get all applications for this youth ordered by current display order
    const applications = await prisma.application.findMany({
      where: { youthId: session.user.id },
      orderBy: [
        { displayOrder: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      select: { id: true, displayOrder: true },
    });

    const currentIndex = applications.findIndex((a) => a.id === applicationId);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Application not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    let newIndex: number;
    switch (direction) {
      case "up":
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case "down":
        newIndex = Math.min(applications.length - 1, currentIndex + 1);
        break;
      case "top":
        newIndex = 0;
        break;
      case "bottom":
        newIndex = applications.length - 1;
        break;
      default:
        newIndex = currentIndex;
    }

    if (newIndex === currentIndex) {
      return NextResponse.json({
        message: "Application is already in the requested position",
      });
    }

    // Create new order
    const newOrder = [...applications];
    const [movedApp] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedApp);

    // Update all display orders
    const updates = newOrder.map((app, index) =>
      prisma.application.update({
        where: { id: app.id },
        data: { displayOrder: index + 1 },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      message: "Application moved successfully",
      newPosition: newIndex + 1,
    });
  } catch (error) {
    console.error("Failed to move application:", error);
    return NextResponse.json(
      { error: "Failed to move application" },
      { status: 500 }
    );
  }
}
