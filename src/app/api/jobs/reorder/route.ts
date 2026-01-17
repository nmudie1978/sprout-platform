import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/jobs/reorder - Reorder jobs for an employer
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobIds } = body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: "jobIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Verify all jobs belong to this employer
    const jobs = await prisma.microJob.findMany({
      where: {
        id: { in: jobIds },
        postedById: session.user.id,
      },
      select: { id: true },
    });

    const foundIds = new Set(jobs.map((j) => j.id));
    const invalidIds = jobIds.filter((id: string) => !foundIds.has(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Some job IDs are invalid or don't belong to you" },
        { status: 400 }
      );
    }

    // Update displayOrder for each job
    const updates = jobIds.map((jobId: string, index: number) =>
      prisma.microJob.update({
        where: { id: jobId },
        data: { displayOrder: index + 1 },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      message: "Jobs reordered successfully",
      order: jobIds,
    });
  } catch (error) {
    console.error("Failed to reorder jobs:", error);
    return NextResponse.json(
      { error: "Failed to reorder jobs" },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/reorder - Move a single job to a specific position
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, direction } = body;

    if (!jobId || !["up", "down", "top", "bottom"].includes(direction)) {
      return NextResponse.json(
        { error: "jobId and direction (up/down/top/bottom) are required" },
        { status: 400 }
      );
    }

    // Get all jobs for this employer ordered by current display order
    const jobs = await prisma.microJob.findMany({
      where: { postedById: session.user.id },
      orderBy: [
        { displayOrder: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      select: { id: true, displayOrder: true },
    });

    const currentIndex = jobs.findIndex((j) => j.id === jobId);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Job not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    let newIndex: number;
    switch (direction) {
      case "up":
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case "down":
        newIndex = Math.min(jobs.length - 1, currentIndex + 1);
        break;
      case "top":
        newIndex = 0;
        break;
      case "bottom":
        newIndex = jobs.length - 1;
        break;
      default:
        newIndex = currentIndex;
    }

    if (newIndex === currentIndex) {
      return NextResponse.json({
        message: "Job is already in the requested position",
      });
    }

    // Create new order
    const newOrder = [...jobs];
    const [movedJob] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedJob);

    // Update all display orders
    const updates = newOrder.map((job, index) =>
      prisma.microJob.update({
        where: { id: job.id },
        data: { displayOrder: index + 1 },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      message: "Job moved successfully",
      newPosition: newIndex + 1,
    });
  } catch (error) {
    console.error("Failed to move job:", error);
    return NextResponse.json(
      { error: "Failed to move job" },
      { status: 500 }
    );
  }
}
