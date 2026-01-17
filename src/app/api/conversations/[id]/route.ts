import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canSendMessage,
  canUseTemplate,
  validatePayload,
  renderMessageText,
  logSafetyAction,
  TemplateAllowedFields,
} from "@/lib/safety-messaging";
import { recordLifeSkillEvent } from "@/lib/life-skills";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participant1: {
          select: {
            id: true,
            role: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
              },
            },
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
              },
            },
          },
        },
        participant2: {
          select: {
            id: true,
            role: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
              },
            },
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            renderedText: true,
            templateId: true,
            senderId: true,
            read: true,
            createdAt: true,
            template: {
              select: {
                key: true,
                label: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if user is part of this conversation
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all messages from the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    // Determine the other party (not the current user)
    const otherParticipant = conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1;

    // Format other party based on their role
    const otherParty = otherParticipant.role === "EMPLOYER"
      ? {
          id: otherParticipant.id,
          name: otherParticipant.employerProfile?.companyName || "Unknown",
          logo: otherParticipant.employerProfile?.companyLogo,
          role: "EMPLOYER" as const,
        }
      : {
          id: otherParticipant.id,
          name: otherParticipant.youthProfile?.displayName || "Unknown",
          avatar: otherParticipant.youthProfile?.avatarId,
          role: "YOUTH" as const,
        };

    return NextResponse.json({
      id: conversation.id,
      status: conversation.status,
      frozenAt: conversation.frozenAt,
      frozenReason: conversation.frozenReason,
      otherParty,
      job: conversation.job,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        content: msg.renderedText,
        templateKey: msg.template?.key,
        templateLabel: msg.template?.label,
        templateCategory: msg.template?.category,
        senderId: msg.senderId,
        read: msg.read,
        createdAt: msg.createdAt,
        isFromMe: msg.senderId === userId,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id] - Send a structured message
// Phase 1 Safety: NO free-text messaging - must use templates
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Rate limit: 60 messages per hour to prevent spam
    const rateLimit = checkRateLimit(
      `message:${userId}`,
      { interval: 3600000, maxRequests: 60 }
    );

    if (!rateLimit.success) {
      const response = NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(rateLimit.limit, rateLimit.remaining, rateLimit.reset);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const body = await req.json();
    const { templateKey, payload } = body;

    // Phase 1 Safety: Template is REQUIRED - no free-text
    if (!templateKey) {
      return NextResponse.json(
        { error: "Template key is required. Free-text messaging is not allowed.", code: "TEMPLATE_REQUIRED" },
        { status: 400 }
      );
    }

    // Phase 1 Safety: Check if user can send messages in this conversation
    const sendCheck = await canSendMessage(userId, id);
    if (!sendCheck.allowed) {
      return NextResponse.json(
        {
          error: sendCheck.reason || "Cannot send message",
          code: sendCheck.code,
        },
        { status: 403 }
      );
    }

    // Get conversation with participant info
    const conversation = await prisma.conversation.findUnique({
      where: { id },
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

    // Determine recipient
    const recipientId =
      conversation.participant1Id === userId
        ? conversation.participant2Id
        : conversation.participant1Id;

    // Phase 1 Safety: Check if user can use this template (direction restrictions)
    const templateCheck = await canUseTemplate(userId, recipientId, templateKey);
    if (!templateCheck.allowed) {
      return NextResponse.json(
        {
          error: templateCheck.reason || "Cannot use this message type",
          code: templateCheck.code,
        },
        { status: 403 }
      );
    }

    // Get the template for validation and rendering
    const template = await prisma.messageTemplate.findUnique({
      where: { key: templateKey },
    });

    if (!template || !template.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive template", code: "INVALID_TEMPLATE" },
        { status: 400 }
      );
    }

    // Phase 1 Safety: Validate payload against template allowed fields
    const allowedFields = template.allowedFields as unknown as TemplateAllowedFields;
    const messagePayload = payload || {};
    const validation = validatePayload(messagePayload, allowedFields);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid message payload",
          code: "INVALID_PAYLOAD",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Phase 1 Safety: Server-side rendering of safe message text
    const renderedText = renderMessageText(
      template.label,
      allowedFields.renderTemplate,
      messagePayload
    );

    // Create the message with template and validated payload
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        templateId: template.id,
        payload: messagePayload,
        renderedText,
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for the recipient (with safe rendered text)
    const notificationPreview = renderedText.slice(0, 60) + (renderedText.length > 60 ? "..." : "");
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: `You have a new message: "${notificationPreview}"`,
        link: `/messages/${id}`,
      },
    });

    // Log message sent for audit
    await logSafetyAction(
      "MESSAGE_SENT",
      userId,
      userId,
      "message",
      message.id,
      {
        conversationId: id,
        templateKey,
        recipientId,
      }
    );

    // Life Skills: Record events based on message context
    if (session.user.role === "YOUTH") {
      // Check if this is the user's first message ever (to any conversation)
      const messageCount = await prisma.message.count({
        where: { senderId: userId },
      });
      if (messageCount === 1) {
        // This was their first message
        await recordLifeSkillEvent(userId, "MESSAGE_SENT_FIRST", id, { templateKey });
      }

      // Record events based on specific template usage
      if (templateKey === "RUNNING_LATE") {
        await recordLifeSkillEvent(userId, "RUNNING_LATE_TEMPLATE_USED", message.id, { conversationId: id });
      } else if (templateKey === "CONFIRM_PAYMENT" || templateKey === "ASK_PAYMENT") {
        await recordLifeSkillEvent(userId, "PAYMENT_DISCUSSED", message.id, { conversationId: id });
      } else if (templateKey === "CONFIRM_LOCATION" || templateKey === "ASK_LOCATION") {
        await recordLifeSkillEvent(userId, "LOCATION_SHARED", message.id, { conversationId: id });
      } else if (templateKey === "DECLINE_POLITELY") {
        await recordLifeSkillEvent(userId, "JOB_DECLINED", id, { conversationId: id });
      }
    }

    return NextResponse.json(
      {
        id: message.id,
        content: renderedText,
        templateKey: template.key,
        templateLabel: template.label,
        senderId: message.senderId,
        createdAt: message.createdAt,
        isFromMe: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
