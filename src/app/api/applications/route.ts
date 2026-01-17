import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/job";
import { canYouthApplyToJobs } from "@/lib/safety";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 20 applications per hour to prevent spam
    const rateLimit = checkRateLimit(
      `application:${session.user.id}`,
      { interval: 3600000, maxRequests: 20 }
    );

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many applications. Please try again later." },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    // Safety gate: Check if youth can apply to jobs (guardian consent if under 18)
    const safetyCheck = await canYouthApplyToJobs(session.user.id);
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        {
          error: safetyCheck.reason || "Not authorized to apply",
          code: safetyCheck.code,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_youthId: {
          jobId: validatedData.jobId,
          youthId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Get job details for notification
    const job = await prisma.microJob.findUnique({
      where: { id: validatedData.jobId },
      select: {
        title: true,
        postedById: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get youth profile for notification
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true },
    });

    const application = await prisma.application.create({
      data: {
        ...validatedData,
        youthId: session.user.id,
        status: "PENDING",
      },
    });

    // Create notification for employer
    await prisma.notification.create({
      data: {
        userId: job.postedById,
        type: "NEW_APPLICATION",
        title: "New Application!",
        message: `${youthProfile?.displayName || "A youth worker"} applied for "${job.title}"`,
        link: `/employer/dashboard`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create application" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        youthId: session.user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            payAmount: true,
            payType: true,
            location: true,
            dateTime: true,
            status: true,
            statusReason: true,
            category: true,
            postedBy: {
              select: {
                employerProfile: {
                  select: {
                    companyName: true,
                    companyLogo: true,
                    verified: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { displayOrder: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    });

    const response = NextResponse.json(applications);
    // Add short cache for applications - user-specific, needs to stay fresh
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    return response;
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
