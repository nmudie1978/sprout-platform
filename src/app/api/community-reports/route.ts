/**
 * Community Reports API
 * POST - Create a new report
 * GET - Get reports (for admins or guardians)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import {
  deriveCommunityFromJob,
  isAdmin,
  isGuardianForCommunity,
  getMyGuardianAssignment,
  REPORT_REASONS,
} from "@/lib/community-guardian";
import { AuditAction, CommunityReportTargetType } from "@prisma/client";

// POST /api/community-reports - Create a new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetType, targetId, reason, details } = body;

    // Validate target type
    if (!["JOB_POST", "USER"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type. Must be JOB_POST or USER" },
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

    // Derive community from target (server-side, don't trust client)
    let communityId: string | null = null;

    if (targetType === "JOB_POST") {
      // Check job exists
      const job = await prisma.microJob.findUnique({
        where: { id: targetId },
        select: { id: true, communityId: true, location: true },
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      communityId = await deriveCommunityFromJob(targetId);
    } else if (targetType === "USER") {
      // Check user exists
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // For user reports, try to find a community through their jobs
      const userJob = await prisma.microJob.findFirst({
        where: { postedById: targetId },
        select: { communityId: true },
      });
      communityId = userJob?.communityId || null;

      // Or through their applications
      if (!communityId) {
        const userApplication = await prisma.application.findFirst({
          where: { youthId: targetId },
          include: { job: { select: { communityId: true } } },
        });
        communityId = userApplication?.job.communityId || null;
      }
    }

    // If no community found, create a "platform-wide" report
    // These go directly to admins
    if (!communityId) {
      // Find or create a default "Platform" community for uncategorized reports
      let defaultCommunity = await prisma.community.findFirst({
        where: { name: "Platform" },
      });

      if (!defaultCommunity) {
        defaultCommunity = await prisma.community.create({
          data: {
            name: "Platform",
            description: "Platform-wide reports (no specific community)",
            isActive: true,
          },
        });
      }

      communityId = defaultCommunity.id;
    }

    // Prevent self-reporting
    if (targetType === "USER" && targetId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report yourself" },
        { status: 400 }
      );
    }

    // Check for duplicate reports (same reporter, same target, within 24h)
    const existingReport = await prisma.communityReport.findFirst({
      where: {
        reporterUserId: session.user.id,
        targetType: targetType as CommunityReportTargetType,
        targetId: targetId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this recently" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.communityReport.create({
      data: {
        communityId,
        reporterUserId: session.user.id,
        targetType: targetType as CommunityReportTargetType,
        targetId,
        reason,
        details: details || null,
        status: "OPEN",
      },
    });

    // Log the action
    await logAuditAction({
      userId: session.user.id,
      action: AuditAction.COMMUNITY_REPORT_CREATED,
      targetType: targetType.toLowerCase(),
      targetId,
      metadata: { reason, reportId: report.id },
    });

    // Notify the guardian (if one exists for this community)
    const guardianAssignment = await prisma.communityGuardian.findFirst({
      where: {
        communityId,
        isActive: true,
      },
    });

    if (guardianAssignment) {
      await prisma.notification.create({
        data: {
          userId: guardianAssignment.guardianUserId,
          type: "COMMUNITY_REPORT_RECEIVED",
          title: "New Community Report",
          message: `A new ${targetType === "JOB_POST" ? "job post" : "user"} report has been submitted.`,
          link: "/guardian",
        },
      });
    }

    return NextResponse.json(
      {
        message: "Report submitted successfully",
        reportId: report.id,
        hasGuardian: !!guardianAssignment,
      },
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

// GET /api/community-reports - Get reports (for admins or guardians)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const myReports = searchParams.get("my") === "true";

    // If requesting own reports
    if (myReports) {
      const reports = await prisma.communityReport.findMany({
        where: { reporterUserId: session.user.id },
        include: {
          community: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json(reports);
    }

    // Check if user is admin or guardian
    const isAdminUser = await isAdmin(session.user.id);
    const guardianAssignment = await getMyGuardianAssignment(session.user.id);

    if (!isAdminUser && !guardianAssignment.isGuardian) {
      return NextResponse.json(
        { error: "Not authorized to view reports" },
        { status: 403 }
      );
    }

    const where: any = {};

    // Guardians can only see reports for their community
    if (!isAdminUser && guardianAssignment.communityId) {
      where.communityId = guardianAssignment.communityId;
    }

    // Filter by status if provided
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
            employerProfile: { select: { companyName: true } },
          },
        },
        assignedGuardian: {
          select: {
            id: true,
            youthProfile: { select: { displayName: true } },
          },
        },
      },
      orderBy: [
        { status: "asc" }, // OPEN first
        { createdAt: "desc" },
      ],
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
