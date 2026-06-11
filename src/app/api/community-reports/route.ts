export const dynamic = "force-dynamic";
/**
 * Content / user reports API.
 * POST - File a report (any authenticated user)
 * GET  - List reports (admins only; or `?my=true` for the caller's own)
 *
 * The community-guardian moderation layer was removed with the jobs
 * marketplace. Reports are now reviewed by admins. Reports are still
 * associated with a "Platform" Community row so existing review tooling
 * and the CommunityReport schema keep working unchanged.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRLSContext } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { isAdmin, REPORT_REASONS } from "@/lib/community-guardian";
import { AuditAction, CommunityReportTargetType } from "@prisma/client";
import { checkRateLimitAsync, getRateLimitHeaders } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-error";

// POST /api/community-reports - Create a new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cap reports at 5/hour per user. False-report flooding is a real
    // attack vector — a bad actor can pin an honest user's account or tie
    // up moderation by spamming reports of different targets.
    const rateLimit = await checkRateLimitAsync(
      `community-report:${session.user.id}`,
      { interval: 60 * 60 * 1000, maxRequests: 5 },
    );
    if (!rateLimit.success) {
      return apiError("RATE_LIMITED", "You've submitted several reports recently. Please wait an hour before reporting again.", {
        request: req,
        headers: getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset),
      });
    }

    const body = await req.json();
    const { targetType, reason, details } = body;

    // Validate target type. JOB_POST is retained in the enum for legacy
    // rows; USER targets a specific person; PLATFORM is a general
    // safeguarding concern not tied to a user (the always-reachable
    // "Report a concern" affordance).
    if (!["USER", "JOB_POST", "PLATFORM"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type" },
        { status: 400 }
      );
    }

    // Validate reason
    if (!reason || !Object.keys(REPORT_REASONS).includes(reason)) {
      return NextResponse.json(
        { error: "Invalid reason code" },
        { status: 400 }
      );
    }

    // PLATFORM concerns carry no user target — use a fixed sentinel id so the
    // non-nullable column is satisfied. USER reports must reference a real,
    // non-self account.
    let targetId: string = body.targetId;
    if (targetType === "PLATFORM") {
      targetId = "PLATFORM";
    } else if (targetType === "USER") {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (targetId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot report yourself" },
          { status: 400 }
        );
      }
    }
    if (!targetId) {
      return NextResponse.json({ error: "Missing target" }, { status: 400 });
    }

    // All reports route to the platform-wide review queue. The per-job
    // community routing was part of the removed marketplace.
    let platformCommunity = await prisma.community.findFirst({
      where: { name: "Platform" },
    });
    if (!platformCommunity) {
      platformCommunity = await prisma.community.create({
        data: {
          name: "Platform",
          description: "Platform-wide reports for admin review",
          isActive: true,
        },
      });
    }

    // Prevent duplicate reports of the same target within 24h. PLATFORM
    // concerns are exempt — a young person must always be able to raise a
    // fresh safeguarding worry; the 5/hour rate limit above prevents flooding.
    if (targetType !== "PLATFORM") {
      const existingReport = await prisma.communityReport.findFirst({
        where: {
          reporterUserId: session.user.id,
          targetType: targetType as CommunityReportTargetType,
          targetId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (existingReport) {
        return NextResponse.json(
          { error: "You have already reported this recently" },
          { status: 400 }
        );
      }
    }

    const report = await prisma.communityReport.create({
      data: {
        communityId: platformCommunity.id,
        reporterUserId: session.user.id,
        targetType: targetType as CommunityReportTargetType,
        targetId,
        reason,
        details: details || null,
        status: "OPEN",
      },
    });

    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.COMMUNITY_REPORT_CREATED,
      targetType: targetType.toLowerCase(),
      targetId,
      metadata: { reason, reportId: report.id },
    });

    // Notify admins so the report is actioned.
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: "COMMUNITY_REPORT_RECEIVED",
            title: "New Report",
            message: `A new ${
              targetType === "USER"
                ? "user"
                : targetType === "PLATFORM"
                  ? "safety concern"
                  : "content"
            } report has been submitted.`,
            link: `/admin/reports/${report.id}`,
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Report submitted successfully", reportId: report.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// GET /api/community-reports - List reports (admins only; or ?my=true)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const myReports = searchParams.get("my") === "true";

    // The caller's own reports.
    if (myReports) {
      const reports = await withRLSContext(session.user.id, (tx) =>
        tx.communityReport.findMany({
          where: { reporterUserId: session.user.id },
          include: { community: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      );
      return NextResponse.json(reports);
    }

    // Otherwise admin-only. The community-guardian role was removed.
    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Not authorized to view reports" },
        { status: 403 }
      );
    }

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const reports = await prisma.communityReport.findMany({
      where,
      include: {
        community: { select: { name: true } },
        reporter: {
          select: {
            id: true,
            youthProfile: { select: { displayName: true, avatarId: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
