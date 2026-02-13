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
        employerProfile: true,
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                category: true,
                payAmount: true,
                payType: true,
              },
            },
          },
        },
        reviews: true,
        receivedReviews: true,
        postedJobs: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
            payAmount: true,
            payType: true,
            location: true,
            status: true,
            createdAt: true,
          },
        },
        earnings: true,
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

    // Fetch messages separately (can be large)
    const messages = await prisma.message.findMany({
      where: { senderId: userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        conversation: {
          select: {
            id: true,
            participant1Id: true,
            participant2Id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Limit to recent messages
    });

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      select: {
        id: true,
        createdAt: true,
        lastMessageAt: true,
        participant1Id: true,
        participant2Id: true,
      },
    });

    // Fetch consent records
    const consents = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { grantedAt: "desc" },
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
          : user.role === "EMPLOYER"
          ? {
              type: "employer",
              ...user.employerProfile,
              userId: undefined,
            }
          : null,
      applications: user.applications.map((app) => ({
        id: app.id,
        status: app.status,
        message: app.message,
        createdAt: app.createdAt,
        job: app.job,
      })),
      postedJobs: user.postedJobs,
      reviewsGiven: user.reviews.map((r) => ({
        id: r.id,
        punctuality: r.punctuality,
        communication: r.communication,
        reliability: r.reliability,
        overall: r.overall,
        positiveTags: r.positiveTags,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      reviewsReceived: user.receivedReviews.map((r) => ({
        id: r.id,
        punctuality: r.punctuality,
        communication: r.communication,
        reliability: r.reliability,
        overall: r.overall,
        positiveTags: r.positiveTags,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      earnings: user.earnings.map((e) => ({
        amount: e.amount,
        status: e.status,
        earnedAt: e.earnedAt,
      })),
      badges: user.badges.map((b) => ({
        type: b.type,
        earnedAt: b.earnedAt,
      })),
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        conversationId: m.conversation.id,
      })),
      conversations: conversations.map((c) => ({
        id: c.id,
        createdAt: c.createdAt,
        lastMessageAt: c.lastMessageAt,
        isParticipant1: c.participant1Id === userId,
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
    };

    // Log successful export
    await logAuditAction({
      userId,
      action: AuditAction.DATA_EXPORT_COMPLETED,
      metadata: {
        applicationCount: user.applications.length,
        reviewCount: user.reviews.length,
        messageCount: messages.length,
        jobCount: user.postedJobs.length,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="sprout-data-export-${userId}-${new Date().toISOString().split("T")[0]}.json"`,
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
