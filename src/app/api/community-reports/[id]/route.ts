export const dynamic = "force-dynamic";
/**
 * Report detail API.
 * GET   - Fetch a report (admin or the original reporter)
 * PATCH - Action a report (admins only): claim / updateStatus / escalate
 *
 * The community-guardian moderation role was removed with the jobs
 * marketplace, so report handling is admin-only. The schema field
 * `assignedGuardianUserId` is retained and now records the admin who
 * claimed the report (no migration needed).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/community-guardian";
import { logAuditAction } from "@/lib/safety";
import { AuditAction, CommunityReportStatus } from "@prisma/client";

/**
 * Normalised admin identity from EITHER admin system:
 *  - the env-var Admin Portal (cookie session) — the production admin, which
 *    has NO User row, so `userId` is null;
 *  - a NextAuth DB-role ADMIN — has a real `userId`.
 * `label` is always a human/audit-friendly string. Returns null if the caller
 * is not an admin under either system. Used so a Portal admin can action
 * safeguarding reports (the queue lives under the Portal layout).
 */
async function resolveAdminActor(): Promise<{ userId: string | null; label: string } | null> {
  const portal = await getAdminSession();
  if (portal) return { userId: null, label: `portal:${portal.username}` };
  const session = await getServerSession(authOptions);
  if (session?.user?.id && (await isAdmin(session.user.id))) {
    return { userId: session.user.id, label: session.user.email ?? session.user.id };
  }
  return null;
}

// GET /api/community-reports/[id]
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Admin (either system) sees any report; a youth sees only their own.
    const admin = await resolveAdminActor();
    const session = admin ? null : await getServerSession(authOptions);
    if (!admin && !session?.user?.id) {
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
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const isAdminUser = !!admin;
    const isReporter = !!session?.user?.id && report.reporterUserId === session.user.id;
    if (!isAdminUser && !isReporter) {
      return NextResponse.json(
        { error: "Not authorized to view this report" },
        { status: 403 }
      );
    }

    // Resolve the reported target for context (user reports only).
    let targetDetails: unknown = null;
    if (report.targetType === "USER") {
      targetDetails = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          role: true,
          isPaused: true,
          youthProfile: { select: { displayName: true, avatarId: true } },
        },
      });
    }

    return NextResponse.json({ ...report, targetDetails, canEdit: isAdminUser });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH /api/community-reports/[id] - admins only
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Accept either admin system (Portal cookie OR NextAuth ADMIN).
    const actor = await resolveAdminActor();
    if (!actor) {
      return NextResponse.json(
        { error: "Not authorized to update this report" },
        { status: 403 }
      );
    }

    const report = await prisma.communityReport.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, assignedGuardianUserId: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const fullReport = await prisma.communityReport.findUnique({
      where: { id: params.id },
      select: { targetType: true, targetId: true },
    });

    const body = await req.json();
    const { action, note, status } = body;

    switch (action) {
      case "pauseUser": {
        // Suspend the reported user. A generic safeguarding action that
        // stays available to admins after the jobs marketplace removal.
        if (!fullReport || fullReport.targetType !== "USER") {
          return NextResponse.json(
            { error: "This report does not target a user" },
            { status: 400 }
          );
        }
        const reason = body.reason || "Suspended following a report";
        const target = await prisma.user.findUnique({
          where: { id: fullReport.targetId },
          select: { isPaused: true },
        });
        if (target && !target.isPaused) {
          await prisma.user.update({
            where: { id: fullReport.targetId },
            data: {
              isPaused: true,
              pausedAt: new Date(),
              pausedReason: reason,
              pausedById: actor.userId,
            },
          });
          await logAuditAction({
            userId: fullReport.targetId,
            actorId: actor.userId ?? undefined,
            action: AuditAction.USER_PAUSED,
            targetType: "user",
            targetId: fullReport.targetId,
            metadata: { reason, reportId: params.id, actor: actor.label },
          });
          await prisma.notification.create({
            data: {
              userId: fullReport.targetId,
              type: "COMMUNITY_ACTION_TAKEN",
              title: "Account Temporarily Paused",
              message: `Your account has been temporarily paused. Reason: ${reason}. Please contact support if you believe this is an error.`,
            },
          });
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

      case "claim": {
        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            // FK to User — only a NextAuth admin has one; a Portal admin
            // records the claim via the audit log + UNDER_REVIEW status.
            assignedGuardianUserId: actor.userId,
            status: "UNDER_REVIEW",
          },
        });
        await logAuditAction({
          actorId: actor.userId ?? undefined,
          action: AuditAction.COMMUNITY_REPORT_CLAIMED,
          targetType: "report",
          targetId: params.id,
          metadata: { actor: actor.label },
        });
        return NextResponse.json({ message: "Report claimed successfully" });
      }

      case "redactContent": {
        // Remove unsafe content from the reported user's public profile
        // (free-text bio + interest/skill tags) without deleting the account.
        // The <safeguarding_rules> "remove unsafe content" capability — distinct
        // from pauseUser, which suspends the whole account.
        if (!fullReport || fullReport.targetType !== "USER") {
          return NextResponse.json(
            { error: "Only user-profile content can be redacted" },
            { status: 400 }
          );
        }
        await prisma.youthProfile.updateMany({
          where: { userId: fullReport.targetId },
          data: { bio: null, interests: [], skillTags: [] },
        });
        await logAuditAction({
          userId: fullReport.targetId,
          actorId: actor.userId ?? undefined,
          action: AuditAction.CONTENT_MODERATED,
          targetType: "user",
          targetId: fullReport.targetId,
          metadata: { reportId: params.id, actor: actor.label, redacted: "bio,interests,skillTags" },
        });
        await prisma.notification.create({
          data: {
            userId: fullReport.targetId,
            type: "COMMUNITY_ACTION_TAKEN",
            title: "Profile content removed",
            message:
              "Some content on your profile was removed by our team because it may have breached our community guidelines. You can update your profile at any time.",
          },
        });
        await prisma.communityReport.update({
          where: { id: params.id },
          data: { status: "ACTION_TAKEN", actionTaken: "redacted_content", actionTakenAt: new Date() },
        });
        return NextResponse.json({ message: "Content redacted successfully" });
      }

      case "addNote": {
        if (!note) {
          return NextResponse.json({ error: "Note is required" }, { status: 400 });
        }
        await prisma.communityReport.update({
          where: { id: params.id },
          data: { guardianNote: note },
        });
        return NextResponse.json({ message: "Note added successfully" });
      }

      case "escalate": {
        await prisma.communityReport.update({
          where: { id: params.id },
          data: {
            escalatedToAdmin: true,
            status: "ESCALATED",
            ...(note ? { guardianNote: note } : {}),
          },
        });
        await logAuditAction({
          actorId: actor.userId ?? undefined,
          action: AuditAction.COMMUNITY_REPORT_ESCALATED,
          targetType: "report",
          targetId: params.id,
          metadata: { actor: actor.label },
        });
        return NextResponse.json({ message: "Report escalated successfully" });
      }

      case "updateStatus": {
        if (!status || !Object.values(CommunityReportStatus).includes(status)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
            actorId: actor.userId ?? undefined,
            action: AuditAction.COMMUNITY_REPORT_RESOLVED,
            targetType: "report",
            targetId: params.id,
            metadata: { actor: actor.label },
          });
        }
        return NextResponse.json({ message: "Status updated successfully" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
