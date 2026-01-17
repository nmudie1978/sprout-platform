import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationReportCategory } from "@prisma/client";
import { logSafetyAction } from "@/lib/safety-messaging";

// Valid report categories
const VALID_CATEGORIES = [
  "INAPPROPRIATE_CONTENT",
  "HARASSMENT",
  "SPAM",
  "CONTACT_SHARING",
  "SUSPICIOUS_BEHAVIOR",
  "OTHER",
] as const;

// POST /api/conversations/[id]/report - Report a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const reporterId = session.user.id;

    const body = await req.json();
    const { reportedId, category, details } = body;

    // Validate required fields
    if (!reportedId) {
      return NextResponse.json(
        { error: "Reported user ID is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Report category is required" },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: "Invalid report category",
          validCategories: VALID_CATEGORIES,
        },
        { status: 400 }
      );
    }

    // Can't report yourself
    if (reportedId === reporterId) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        participant1Id: true,
        participant2Id: true,
        status: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if reporter is a participant
    const isParticipant =
      conversation.participant1Id === reporterId ||
      conversation.participant2Id === reporterId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Verify reported user is the other participant
    const otherParticipantId =
      conversation.participant1Id === reporterId
        ? conversation.participant2Id
        : conversation.participant1Id;

    if (reportedId !== otherParticipantId) {
      return NextResponse.json(
        { error: "Can only report the other participant in this conversation" },
        { status: 400 }
      );
    }

    // Check if reporter has already reported this conversation
    const existingReport = await prisma.conversationReport.findFirst({
      where: {
        conversationId,
        reporterId,
        status: { in: ["OPEN", "IN_REVIEW"] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          error: "You have already reported this conversation",
          code: "ALREADY_REPORTED",
          reportId: existingReport.id,
        },
        { status: 400 }
      );
    }

    // Validate details length if provided
    if (details && details.length > 500) {
      return NextResponse.json(
        { error: "Details must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Create the report
    // Note: The trigger will automatically freeze the conversation
    const report = await prisma.conversationReport.create({
      data: {
        reporterId,
        reportedId,
        conversationId,
        category: category as ConversationReportCategory,
        details: details || null,
        status: "OPEN",
      },
    });

    // Log the report action (trigger handles freezing audit)
    await logSafetyAction(
      "CONVERSATION_REPORTED",
      reportedId,
      reporterId,
      "conversation",
      conversationId,
      {
        reportId: report.id,
        category,
        hasDetails: !!details,
      }
    );

    return NextResponse.json(
      {
        id: report.id,
        category: report.category,
        status: report.status,
        createdAt: report.createdAt,
        message: "Report submitted successfully. The conversation has been frozen pending review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// GET /api/conversations/[id]/report - Get reports for a conversation (admin/guardian only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check permissions - admins and guardians can see all reports
    // Regular users can only see their own reports
    const isAdmin = userRole === "ADMIN" || userRole === "COMMUNITY_GUARDIAN";

    // Build where clause
    const whereClause = isAdmin
      ? { conversationId }
      : { conversationId, reporterId: userId };

    const reports = await prisma.conversationReport.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: {
            id: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        reported: {
          select: {
            id: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
