import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logSafetyAction } from "@/lib/safety-messaging";

// GET /api/guardian/conversation-reports/[id] - Get a specific report with conversation messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Only admins and guardians can view reports
    if (userRole !== "ADMIN" && userRole !== "COMMUNITY_GUARDIAN") {
      return NextResponse.json(
        { error: "Not authorized to view this report" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const report = await prisma.conversationReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            role: true,
            ageBracket: true,
            youthProfile: { select: { displayName: true, avatarId: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        reported: {
          select: {
            id: true,
            role: true,
            ageBracket: true,
            youthProfile: { select: { displayName: true, avatarId: true } },
            employerProfile: { select: { companyName: true, eidVerified: true } },
          },
        },
        conversation: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            messages: {
              orderBy: { createdAt: "asc" },
              include: {
                template: {
                  select: {
                    key: true,
                    label: true,
                    category: true,
                  },
                },
                sender: {
                  select: {
                    id: true,
                    role: true,
                    youthProfile: { select: { displayName: true } },
                    employerProfile: { select: { companyName: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to fetch conversation report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH /api/guardian/conversation-reports/[id] - Update report status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Only admins and guardians can update reports
    if (userRole !== "ADMIN" && userRole !== "COMMUNITY_GUARDIAN") {
      return NextResponse.json(
        { error: "Not authorized to update reports" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, note, actionTaken } = body;

    // Validate action
    const validActions = ["claim", "resolve", "dismiss", "unfreeze"];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action", validActions },
        { status: 400 }
      );
    }

    // Get the report
    const report = await prisma.conversationReport.findUnique({
      where: { id },
      include: {
        conversation: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case "claim":
        // Claim the report for review
        await prisma.conversationReport.update({
          where: { id },
          data: {
            status: "IN_REVIEW",
            reviewerId: userId,
          },
        });

        await logSafetyAction(
          "REPORT_CLAIMED",
          report.reportedId,
          userId,
          "conversation_report",
          id,
          { category: report.category }
        );
        break;

      case "resolve":
        // Resolve the report with action taken
        if (!actionTaken) {
          return NextResponse.json(
            { error: "Action taken is required when resolving" },
            { status: 400 }
          );
        }

        await prisma.conversationReport.update({
          where: { id },
          data: {
            status: "RESOLVED",
            reviewerId: userId,
            reviewerNote: note || null,
            actionTaken,
            reviewedAt: new Date(),
          },
        });

        await logSafetyAction(
          "REPORT_RESOLVED",
          report.reportedId,
          userId,
          "conversation_report",
          id,
          { category: report.category, actionTaken }
        );
        break;

      case "dismiss":
        // Dismiss the report (no action needed)
        await prisma.conversationReport.update({
          where: { id },
          data: {
            status: "DISMISSED",
            reviewerId: userId,
            reviewerNote: note || null,
            reviewedAt: new Date(),
          },
        });

        // Unfreeze the conversation if it was frozen by this report
        if (report.conversation.status === "FROZEN") {
          await prisma.conversation.update({
            where: { id: report.conversationId },
            data: {
              status: "ACTIVE",
              frozenAt: null,
              frozenReason: null,
            },
          });
        }

        await logSafetyAction(
          "REPORT_DISMISSED",
          report.reportedId,
          userId,
          "conversation_report",
          id,
          { category: report.category }
        );
        break;

      case "unfreeze":
        // Manually unfreeze a conversation (keep report status)
        await prisma.conversation.update({
          where: { id: report.conversationId },
          data: {
            status: "ACTIVE",
            frozenAt: null,
            frozenReason: null,
          },
        });

        await logSafetyAction(
          "CONVERSATION_UNFROZEN",
          report.reportedId,
          userId,
          "conversation",
          report.conversationId,
          { reportId: id, note }
        );
        break;
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Failed to update conversation report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
