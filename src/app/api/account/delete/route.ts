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

    // Log the deletion request first (before user is deleted)
    await logAuditAction({
      userId,
      action: AuditAction.DATA_DELETION_REQUESTED,
      metadata: { email: userEmail || null },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Delete the user account (cascades will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log successful deletion (userId will be null since user is deleted)
    await logAuditAction({
      actorId: userId, // Use actorId since userId record is gone
      action: AuditAction.DATA_DELETION_COMPLETED,
      metadata: { email: userEmail || null, deletedUserId: userId },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully. All your data has been removed.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
