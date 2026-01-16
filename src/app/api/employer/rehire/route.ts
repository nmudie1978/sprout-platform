import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/employer/rehire - Get workers eligible for rehiring
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all workers who have completed jobs for this employer
    const completedApplications = await prisma.application.findMany({
      where: {
        job: {
          postedById: session.user.id,
          status: "COMPLETED",
        },
        status: "ACCEPTED",
      },
      include: {
        youth: {
          select: {
            id: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                completedJobsCount: true,
                averageRating: true,
                skillTags: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            payAmount: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        job: {
          updatedAt: "desc",
        },
      },
    });

    // Group by worker
    const workerMap = new Map<string, any>();

    for (const app of completedApplications) {
      const youthId = app.youthId;
      if (!workerMap.has(youthId)) {
        workerMap.set(youthId, {
          youthId,
          displayName: app.youth.youthProfile?.displayName || "Unknown",
          avatarId: app.youth.youthProfile?.avatarId,
          completedJobsCount: app.youth.youthProfile?.completedJobsCount || 0,
          averageRating: app.youth.youthProfile?.averageRating,
          skillTags: app.youth.youthProfile?.skillTags || [],
          jobsWithYou: 0,
          lastJob: null,
          recentJobs: [],
        });
      }

      const worker = workerMap.get(youthId)!;
      worker.jobsWithYou += 1;

      if (!worker.lastJob) {
        worker.lastJob = {
          id: app.job.id,
          title: app.job.title,
          category: app.job.category,
          payAmount: app.job.payAmount,
          completedAt: app.job.updatedAt,
        };
      }

      if (worker.recentJobs.length < 3) {
        worker.recentJobs.push({
          id: app.job.id,
          title: app.job.title,
          category: app.job.category,
        });
      }
    }

    // Sort by jobs completed with this employer
    const workers = Array.from(workerMap.values()).sort(
      (a, b) => b.jobsWithYou - a.jobsWithYou
    );

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Failed to fetch rehire workers:", error);
    return NextResponse.json(
      { error: "Failed to fetch workers" },
      { status: 500 }
    );
  }
}

// POST /api/employer/rehire - Create a job and directly assign to a worker
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      youthId,
      title,
      description,
      category,
      location,
      startDate,
      duration,
      payAmount,
      payType,
    } = body;

    // Validate required fields
    if (!youthId || !title || !description || !category || !payAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the youth exists
    const youth = await prisma.user.findUnique({
      where: { id: youthId, role: "YOUTH" },
      select: { id: true, email: true, youthProfile: { select: { displayName: true } } },
    });

    if (!youth) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Create the job
    const job = await prisma.microJob.create({
      data: {
        title,
        description,
        category,
        location: location || "",
        startDate: startDate ? new Date(startDate) : null,
        duration: duration || null,
        payAmount: parseFloat(payAmount),
        payType: payType || "FIXED",
        status: "ASSIGNED", // Directly assigned
        postedById: session.user.id,
        // Create application automatically
        applications: {
          create: {
            youthId,
            status: "ACCEPTED",
            message: "Direct hire by employer",
          },
        },
      },
    });

    // Create notification for the youth
    await prisma.notification.create({
      data: {
        userId: youthId,
        type: "APPLICATION_ACCEPTED",
        title: "New Job Assigned",
        message: `You've been directly hired for "${title}"`,
        link: `/jobs/${job.id}`,
      },
    });

    return NextResponse.json(
      { jobId: job.id, message: "Job created and assigned" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create rehire job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
