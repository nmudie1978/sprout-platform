export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema, APPLICATION_INTENTS } from "@/lib/validations/job";
import { canYouthApplyToJobs } from "@/lib/safety";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { canApplyToJob, logAgeEligibilityEvent } from "@/lib/age-policy/utils";
import { validateIntentVariables, renderIntentMessage } from "@/lib/message-intents";
import { apiError } from "@/lib/api-error";

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

    // Intent + variable validation. The applicationSchema zod check
    // already enforces `messageIntent` is one of APPLICATION_INTENTS
    // (not FREE_TEXT_LEGACY, not post-hire intents), but we still
    // need to run validateIntentVariables to enforce required fields,
    // max length, and the dangerous-content (phone/email/URL) guard
    // that message-intents.ts exports. Age bracket is pulled from
    // session for the per-age error messaging.
    let renderedMessage: string | null = null;
    if (validatedData.messageIntent) {
      const vars = validatedData.messageVariables ?? {};
      const check = validateIntentVariables(
        validatedData.messageIntent,
        vars,
        session.user.ageBracket ?? null,
      );
      if (!check.valid) {
        return apiError("VALIDATION_FAILED", check.errors[0] ?? "Invalid message", {
          request: req,
          details: { errors: check.errors, field: "messageVariables" },
        });
      }
      renderedMessage = check.renderedMessage ?? renderIntentMessage(validatedData.messageIntent, vars);
    }

    // Age eligibility check - server-side enforcement
    const ageCheck = await canApplyToJob(session.user.id, validatedData.jobId);
    if (!ageCheck.allowed) {
      // Log the blocked application attempt
      await logAgeEligibilityEvent({
        workerId: session.user.id,
        jobId: validatedData.jobId,
        action: "APPLY_BLOCKED",
        reason: ageCheck.reason,
        requiredMinAge: ageCheck.requiredAge ?? 0,
        userAgeYears: ageCheck.userAge,
      });

      return NextResponse.json(
        {
          error: ageCheck.reason,
          code: "AGE_INELIGIBLE",
          userAge: ageCheck.userAge,
          requiredAge: ageCheck.requiredAge,
        },
        { status: 403 }
      );
    }

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
        jobId: validatedData.jobId,
        youthId: session.user.id,
        status: "PENDING",
        messageIntent: validatedData.messageIntent ?? null,
        // Prisma Json input — cast via JSON round-trip to erase
        // any prototype pollution from the client body before storage.
        messageVariables: validatedData.messageVariables
          ? JSON.parse(JSON.stringify(validatedData.messageVariables))
          : null,
        // `message` stores the pre-rendered text for display
        // convenience. messageIntent + messageVariables are the
        // structured source of truth; message is derived.
        message: renderedMessage,
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

    // Log successful application for audit
    await logAgeEligibilityEvent({
      workerId: session.user.id,
      jobId: validatedData.jobId,
      action: "APPLY_ALLOWED",
      reason: "Age eligibility check passed",
      requiredMinAge: ageCheck.requiredAge ?? 0,
      userAgeYears: ageCheck.userAge,
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Optional status filter
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Default 50, max 100
    const cursor = searchParams.get("cursor"); // Cursor-based pagination

    // Build where clause
    const whereClause: any = {
      youthId: session.user.id,
    };

    // Optional server-side status filtering
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    // Run count and data queries in parallel for efficiency
    const [applications, totalCount, statusCounts] = await Promise.all([
      // Main data query - optimized field selection
      prisma.application.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          displayOrder: true,
          createdAt: true,
          // Only include needed job fields
          job: {
            select: {
              id: true,
              title: true,
              payAmount: true,
              payType: true,
              location: true,
              startDate: true,
              dateTime: true,
              status: true,
              category: true,
              postedBy: {
                select: {
                  employerProfile: {
                    select: {
                      companyName: true,
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
        take: limit,
        ...(cursor && {
          skip: 1, // Skip the cursor
          cursor: { id: cursor },
        }),
      }),
      // Total count query
      prisma.application.count({
        where: { youthId: session.user.id },
      }),
      // Status counts in a single aggregated query
      prisma.application.groupBy({
        by: ["status"],
        where: { youthId: session.user.id },
        _count: { status: true },
      }),
    ]);

    // Build status counts map
    const counts = statusCounts.reduce(
      (acc, { status, _count }) => {
        acc[status.toLowerCase()] = _count.status;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 } as Record<string, number>
    );

    // Determine next cursor for pagination
    const nextCursor = applications.length === limit ? applications[applications.length - 1]?.id : null;

    const response = NextResponse.json({
      applications,
      pagination: {
        total: totalCount,
        nextCursor,
        hasMore: nextCursor !== null,
      },
      counts,
    });

    // Increased cache time with stale-while-revalidate for better performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
