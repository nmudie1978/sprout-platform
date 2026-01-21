import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Report an issue with a shadow experience
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    // Only youth or host can report
    const isYouth = shadow.youthId === session.user.id;
    const isHost = shadow.hostId === session.user.id;

    if (!isYouth && !isHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { details } = body;

    if (!details || details.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more details about what happened" },
        { status: 400 }
      );
    }

    // Update shadow with report
    const updated = await prisma.shadowRequest.update({
      where: { id },
      data: {
        reportedIssue: true,
        reportedAt: new Date(),
        reportDetails: details,
      },
    });

    // Create a formal report for admin review
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType: "shadow_request",
        targetId: id,
        reason: `Shadow experience concern for role "${shadow.roleTitle}" reported by ${isYouth ? "youth" : "host"}. Details: ${details}`,
      },
    });

    // Notify admins (in production, this would trigger an alert)
    // For now, we create a notification for admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "SHADOW_REPORT",
          title: "Shadow Experience Report",
          message: `A ${isYouth ? "youth" : "host"} has reported an issue with a shadow experience.`,
          link: `/admin/reports?type=shadow&id=${id}`,
        },
      });
    }

    return NextResponse.json({
      message: "Report submitted. Our team will review this promptly.",
      reported: true,
    });
  } catch (error) {
    console.error("Failed to submit report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
