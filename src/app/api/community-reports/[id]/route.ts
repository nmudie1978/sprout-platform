/**
 * Community Report Detail API
 * GET - Get a specific report
 * PATCH - Update a report (guardian/admin actions)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import {
  isAdmin,
  isGuardianForCommunity,
  pauseJobPost,
  pauseUser,
} from "@/lib/community-guardian";
import { AuditAction, CommunityReportStatus } from "@prisma/client";

// GET /api/community-reports/[id] - Get a specific report
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.communityReport.findUnique({
      where: { id: params.id },
      include: {
        community: { select: { id: true, name: true } },
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
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check permission
    const isAdminUser = await isAdmin(session.user.id);
    const isReporter = report.reporterUserId === session.user.id;
    const isGuardian = await isGuardianForCommunity(
      session.user.id,
      report.communityId
    );

    if (!isAdminUser && !isReporter && !isGuardian) {
      return NextResponse.json(
        { error: "Not authorized to view this report" },
        { status: 403 }
      );
    }

    // Fetch target details based on targetType
    let targetDetails: any = null;

    if (report.targetType === "JOB_POST") {
      const job = await prisma.microJob.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          status: true,
          isPaused: true,
          postedBy: {
            select: {
              id: true,
              employerProfile: { select: { companyName: true } },
            },
          },
        },
      });
      targetDetails = job;
    } else if (report.targetType === "USER") {
      const user = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          role: true,
          isPaused: true,
          youthProfile: { select: { displayName: true, avatarId: true } },
          employerProfile: { select: { companyName: true } },
        },
      });
      targetDetails = user;
    }

    return NextResponse.json({
      ...report,
      targetDetails,
      canEdit: isAdminUser || isGuardian,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH /api/community-reports/[id] - Update a report
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.communityReport.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        communityId: true,
        targetType: true,
        targetId: true,
        status: true,
        assignedGuardianUserId: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check permission
    const isAdminUser = await isAdmin(session.user.id);
    const isGuardian = await isGuardianForCommunity(
      session.user.id,
      report.communityId
    );

    if (!isAdminUser && !isGuardian) {
      return NextResponse.json(
        { error: "Not authorized to update this report" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, note, status } = body;

    // Handle different actions
    switch (action) {
      case "claim": {
        // Guardian claims this report
        if (report.assignedGuardianUserId && !isAdminUser) {
          return NextResponse.json(
            { error: "Report is already claimed" },
            { status: 400 }
          );
        }

        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            assignedGuardianUserId: session.user.id,
            status: "UNDER_REVIEW",
          },
        });

        await logAuditAction({
          actorId: session.user.id,
          action: AuditAction.COMMUNITY_REPORT_CLAIMED,
          targetType: "report",
          targetId: params.id,
        });

        return NextResponse.json({ message: "Report claimed successfully" });
      }

      case "addNote": {
        if (!note) {
          return NextResponse.json(
            { error: "Note is required" },
            { status: 400 }
          );
        }

        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            guardianNote: note,
          },
        });

        return NextResponse.json({ message: "Note added successfully" });
      }

      case "pauseTarget": {
        const reason = body.reason || "Paused due to community report";

        if (report.targetType === "JOB_POST") {
          const result = await pauseJobPost(
            report.targetId,
            session.user.id,
            reason
          );

          if (!result.success) {
            return NextResponse.json(
              { error: result.error },
              { status: 400 }
            );
          }

          await prisma.communityReport.update({
            where: { id: params.id },
            data: {
              status: "ACTION_TAKEN",
              actionTaken: "paused_post",
              actionTakenAt: new Date(),
            },
          });

          return NextResponse.json({ message: "Job post paused successfully" });
        } else if (report.targetType === "USER") {
          // For MVP, user pausing requires admin
          if (!isAdminUser) {
            return NextResponse.json(
              {
                error:
                  "User pausing requires admin. Please escalate this report.",
              },
              { status: 403 }
            );
          }

          const result = await pauseUser(
            report.targetId,
            session.user.id,
            reason
          );

          if (!result.success) {
            return NextResponse.json(
              { error: result.error },
              { status: 400 }
            );
          }

          await prisma.communityReport.update({
            where: { id: params.id },
            data: {
              status: "ACTION_TAKEN",
              actionTaken: "paused_user",
              actionTakenAt: new Date(),
            },
          });

          return NextResponse.json({ message: "User paused successfully" });
        }

        return NextResponse.json(
          { error: "Invalid target type" },
          { status: 400 }
        );
      }

      case "escalate": {
        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            escalatedToAdmin: true,
            status: "ESCALATED",
            guardianNote: note || report.assignedGuardianUserId
              ? `Escalated by guardian. ${note || ""}`
              : note,
          },
        });

        await logAuditAction({
          actorId: session.user.id,
          action: AuditAction.COMMUNITY_REPORT_ESCALATED,
          targetType: "report",
          targetId: params.id,
        });

        // Notify admins (find all admins)
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        });

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: "REPORT_ESCALATED",
              title: "Report Escalated",
              message: `A community report has been escalated and requires admin review.`,
              link: `/admin/reports/${params.id}`,
            },
          });
        }

        return NextResponse.json({
          message: "Report escalated to admin successfully",
        });
      }

      case "updateStatus": {
        if (!status || !Object.values(CommunityReportStatus).includes(status)) {
          return NextResponse.json(
            { error: "Invalid status" },
            { status: 400 }
          );
        }

        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            status,
            ...(status === "RESOLVED" || status === "DISMISSED"
              ? { actionTakenAt: new Date() }
              : {}),
          },
        });

        if (status === "RESOLVED") {
          await logAuditAction({
            actorId: session.user.id,
            action: AuditAction.COMMUNITY_REPORT_RESOLVED,
            targetType: "report",
            targetId: params.id,
          });
        }

        return NextResponse.json({ message: "Status updated successfully" });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
