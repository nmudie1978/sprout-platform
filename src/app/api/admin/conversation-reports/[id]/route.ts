export const dynamic = "force-dynamic";

/**
 * Admin-facing PATCH for a ConversationReport.
 *
 * Mirrors the guardian flow at /api/guardian/conversation-reports/[id]
 * but gated to ADMIN role. Supports status transitions (claim into
 * IN_REVIEW, resolve, dismiss) and attaching an internal reviewer note
 * plus `actionTaken` summary. Every action writes to AuditLog.
 *
 * Previously there was no admin view for ConversationReport — the
 * audit flagged that reports piled up in the DB with nowhere for
 * admins to action them. Community Guardians had a partial UI; admins
 * had none.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationReportStatus, AuditAction } from "@prisma/client";
import { logAuditAction } from "@/lib/safety";

type ActionBody =
  | { action: "claim" }
  | { action: "addNote"; note: string }
  | { action: "updateStatus"; status: ConversationReportStatus; actionTaken?: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as ActionBody | null;
  if (!body || !("action" in body)) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const report = await prisma.conversationReport.findUnique({
    where: { id },
    select: { id: true, status: true, reportedId: true, conversationId: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const adminId = session.user.id;
  const ip = req.headers.get("x-forwarded-for") || undefined;
  const ua = req.headers.get("user-agent") || undefined;

  try {
    if (body.action === "claim") {
      const updated = await prisma.conversationReport.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
          reviewerId: adminId,
          reviewedAt: new Date(),
        },
      });
      await logAuditAction({
        userId: report.reportedId,
        actorId: adminId,
        action: AuditAction.CONTENT_MODERATED,
        metadata: { reportId: id, reportType: "CONVERSATION", newStatus: "IN_REVIEW" },
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json({ ok: true, report: updated });
    }

    if (body.action === "addNote") {
      const note = String(body.note ?? "").trim();
      if (!note) {
        return NextResponse.json({ error: "Note is empty" }, { status: 400 });
      }
      if (note.length > 2000) {
        return NextResponse.json({ error: "Note must be under 2000 characters" }, { status: 400 });
      }
      const updated = await prisma.conversationReport.update({
        where: { id },
        data: { reviewerNote: note, reviewerId: adminId, reviewedAt: new Date() },
      });
      await logAuditAction({
        userId: report.reportedId,
        actorId: adminId,
        action: AuditAction.CONTENT_MODERATED,
        metadata: { reportId: id, reportType: "CONVERSATION", addedNote: true },
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json({ ok: true, report: updated });
    }

    if (body.action === "updateStatus") {
      const validStatuses: ConversationReportStatus[] = [
        "OPEN",
        "IN_REVIEW",
        "RESOLVED",
        "DISMISSED",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = await prisma.conversationReport.update({
        where: { id },
        data: {
          status: body.status,
          reviewerId: adminId,
          reviewedAt: new Date(),
          actionTaken: body.actionTaken?.slice(0, 500),
        },
      });
      await logAuditAction({
        userId: report.reportedId,
        actorId: adminId,
        action:
          body.status === "RESOLVED" || body.status === "DISMISSED"
            ? AuditAction.REPORT_RESOLVED
            : AuditAction.REPORT_REVIEWED,
        metadata: {
          reportId: id,
          reportType: "CONVERSATION",
          newStatus: body.status,
          actionTaken: body.actionTaken || null,
        },
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json({ ok: true, report: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin/conversation-reports] action failed:", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
