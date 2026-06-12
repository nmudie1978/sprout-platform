export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";

/**
 * PATCH /api/admin/users/[id]
 *
 * Direct admin moderation of a single user, independent of any report.
 * Lets an admin suspend (pause) or reinstate (unpause) an account from the
 * users dashboard — the same User.isPaused mechanism the moderation queue
 * uses, so the two stay in sync. Admin Portal (cookie) auth only.
 *
 * Body: { action: "suspend" | "unsuspend", reason?: string }
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const actorLabel = `portal:${session.username}`;

    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string; reason?: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, isPaused: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "suspend") {
      const reason = (body.reason as string) || "Suspended by an admin";
      if (!user.isPaused) {
        await prisma.user.update({
          where: { id },
          data: {
            isPaused: true,
            pausedAt: new Date(),
            pausedReason: reason,
            // pausedById is a User FK; a Portal admin has no User row, so the
            // actor is recorded in the audit log instead.
            pausedById: null,
          },
        });
        await logAuditAction({
          userId: id,
          action: AuditAction.USER_PAUSED,
          targetType: "user",
          targetId: id,
          metadata: { reason, actor: actorLabel, source: "admin_users_page" },
        });
        await prisma.notification.create({
          data: {
            userId: id,
            type: "COMMUNITY_ACTION_TAKEN",
            title: "Account Temporarily Paused",
            message: `Your account has been temporarily paused. Reason: ${reason}. Please contact support if you believe this is an error.`,
          },
        });
      }
      return NextResponse.json({ message: "User suspended", isPaused: true });
    }

    if (action === "unsuspend") {
      if (user.isPaused) {
        await prisma.user.update({
          where: { id },
          data: {
            isPaused: false,
            pausedAt: null,
            pausedReason: null,
            pausedById: null,
          },
        });
        await logAuditAction({
          userId: id,
          action: AuditAction.USER_UNPAUSED,
          targetType: "user",
          targetId: id,
          metadata: { actor: actorLabel, source: "admin_users_page" },
        });
        await prisma.notification.create({
          data: {
            userId: id,
            type: "COMMUNITY_ACTION_TAKEN",
            title: "Account reinstated",
            message:
              "Your account has been reinstated after review. You can use Endeavrly as normal again. Thank you for your patience.",
          },
        });
      }
      return NextResponse.json({ message: "User reinstated", isPaused: false });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
