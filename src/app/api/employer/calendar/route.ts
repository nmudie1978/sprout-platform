import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/employer/calendar - Get jobs for calendar view
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    // Default to current month
    const now = new Date();
    const start = startParam
      ? new Date(startParam)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endParam
      ? new Date(endParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const jobs = await prisma.microJob.findMany({
      where: {
        postedById: session.user.id,
        startDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
          include: {
            youth: {
              select: {
                id: true,
                youthProfile: {
                  select: {
                    displayName: true,
                    avatarId: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    const calendarEvents = jobs.map((job) => {
      const assignedWorker = job.applications[0]?.youth;
      return {
        id: job.id,
        title: job.title,
        category: job.category,
        status: job.status,
        date: job.startDate,
        duration: job.duration,
        location: job.location,
        payAmount: job.payAmount,
        worker: assignedWorker
          ? {
              id: assignedWorker.id,
              displayName: assignedWorker.youthProfile?.displayName || "Unknown",
              avatarId: assignedWorker.youthProfile?.avatarId,
            }
          : null,
      };
    });

    return NextResponse.json(calendarEvents);
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}
