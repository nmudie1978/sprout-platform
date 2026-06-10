export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Log the deletion request
    await logAuditAction({
      userId,
      action: AuditAction.DATA_DELETION_REQUESTED,
      metadata: { email: userEmail || null },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // GDPR Art. 17 with a 30-day grace period: soft-delete now, then the
    // purge cron (/api/cron/purge-deleted-data) hard-deletes the account
    // — cascading all related rows — once the window elapses. Signing back
    // in within 30 days clears `deletedAt` and restores the account, which
    // protects against accidental or hijacked-account deletions.
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message:
        "Your account is scheduled for deletion and you have been signed out. " +
        "It will be permanently removed after 30 days. Sign in again within " +
        "that time to cancel and restore your account.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
