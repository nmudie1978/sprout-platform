import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/applications/reorder - Move a single application to a specific position
// Optimized to only update affected rows instead of all applications
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

    // Get only the IDs and display orders (minimal data fetch)
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

    // OPTIMIZED: Only update affected rows instead of all applications
    const updates: any[] = [];

    if (direction === "up" || direction === "down") {
      // For up/down, only 2 rows need to swap
      const targetApp = applications[newIndex];
      const currentApp = applications[currentIndex];

      // Swap display orders between the two items
      updates.push(
        prisma.application.update({
          where: { id: applicationId },
          data: { displayOrder: newIndex + 1 },
        }),
        prisma.application.update({
          where: { id: targetApp.id },
          data: { displayOrder: currentIndex + 1 },
        })
      );
    } else {
      // For top/bottom, update the moved item and shift affected items
      const startIdx = Math.min(currentIndex, newIndex);
      const endIdx = Math.max(currentIndex, newIndex);

      // Create new order for affected range only
      const affectedApps = applications.slice(startIdx, endIdx + 1);
      const movedApp = applications[currentIndex];

      // Remove the moved app from affected range
      const filteredApps = affectedApps.filter((a) => a.id !== applicationId);

      // Insert at correct position in range
      if (direction === "top") {
        filteredApps.unshift(movedApp);
      } else {
        filteredApps.push(movedApp);
      }

      // Update only the affected range
      filteredApps.forEach((app, idx) => {
        updates.push(
          prisma.application.update({
            where: { id: app.id },
            data: { displayOrder: startIdx + idx + 1 },
          })
        );
      });
    }

    await prisma.$transaction(updates);

    return NextResponse.json({
      message: "Application moved successfully",
      newPosition: newIndex + 1,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("Failed to move application:", error);
    return NextResponse.json(
      { error: "Failed to move application" },
      { status: 500 }
    );
  }
}
