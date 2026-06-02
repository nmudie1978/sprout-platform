export const dynamic = "force-dynamic";
/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data (Article 20)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Log the export request
    await logAuditAction({
      userId,
      action: AuditAction.DATA_EXPORT_REQUESTED,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        youthProfile: true,
        badges: true,
        notifications: {
          take: 100, // Limit to recent notifications
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch consent records
    const consents = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { grantedAt: "desc" },
    });

    // Fetch Career Twin conversation messages
    const twinMessages = await prisma.careerTwinMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { careerId: true, role: true, content: true, mode: true, createdAt: true },
    });

    // Structure the export data
    const exportData = {
      exportDate: new Date().toISOString(),
      dataSubject: {
        id: user.id,
        email: user.email,
        role: user.role,
        ageBracket: user.ageBracket,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile:
        user.role === "YOUTH"
          ? {
              type: "youth",
              ...user.youthProfile,
              // Remove internal IDs
              userId: undefined,
            }
          : null,
      badges: user.badges.map((b) => ({
        type: b.type,
        earnedAt: b.earnedAt,
      })),
      notifications: user.notifications.map((n) => ({
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      consents: consents.map((c) => ({
        type: c.consentType,
        version: c.version,
        granted: c.granted,
        grantedAt: c.grantedAt,
        revokedAt: c.revokedAt,
      })),
      careerTwinConversations: twinMessages,
    };

    // Log successful export
    await logAuditAction({
      userId,
      action: AuditAction.DATA_EXPORT_COMPLETED,
      metadata: {
        badgeCount: user.badges.length,
        notificationCount: user.notifications.length,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="endeavrly-data-export-${userId}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
