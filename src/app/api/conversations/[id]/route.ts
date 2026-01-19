import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageIntent } from "@prisma/client";
import {
  canSendMessage,
  logSafetyAction,
} from "@/lib/safety-messaging";
import {
  validateIntentVariables,
  checkHardBlocks,
  getIntentTemplate,
} from "@/lib/message-intents";
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
            intent: true,
            renderedMessage: true,
            isLegacy: true,
            // Legacy fields for backward compatibility
            templateId: true,
            content: true,
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
      messages: conversation.messages.map((msg) => {
        // Get the template info for intent-based messages
        const intentTemplate = msg.intent ? getIntentTemplate(msg.intent) : null;

        return {
          id: msg.id,
          // Prefer new intent-based content, fall back to legacy fields
          content: msg.renderedMessage || msg.content || "",
          intent: msg.intent,
          intentLabel: intentTemplate?.label,
          isLegacy: msg.isLegacy,
          // Legacy template fields for backward compatibility
          templateKey: msg.template?.key,
          templateLabel: msg.template?.label,
          templateCategory: msg.template?.category,
          senderId: msg.senderId,
          read: msg.read,
          createdAt: msg.createdAt,
          isFromMe: msg.senderId === userId,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id] - Send an intent-based message
// CORE SAFETY FEATURE: NO free-text messaging - must use intents
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
    const { intent, variables } = body as {
      intent: MessageIntent | undefined;
      variables: Record<string, string> | undefined;
    };

    // HARD BLOCK: Check basic requirements
    const hardBlock = checkHardBlocks(intent, variables || {}, id);
    if (hardBlock.blocked) {
      return NextResponse.json(
        { error: hardBlock.reason, code: "HARD_BLOCK" },
        { status: 400 }
      );
    }

    // CORE SAFETY: Intent is REQUIRED - no free-text
    if (!intent || !Object.values(MessageIntent).includes(intent)) {
      return NextResponse.json(
        { error: "Please select a message type. Free-text messaging is not allowed.", code: "INTENT_REQUIRED" },
        { status: 400 }
      );
    }

    // Check if user can send messages in this conversation
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

    // Get user's age bracket for safety checks
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ageBracket: true },
    });

    // Determine recipient
    const recipientId =
      conversation.participant1Id === userId
        ? conversation.participant2Id
        : conversation.participant1Id;

    // CORE SAFETY: Validate variables against intent template
    // This includes age-based safety checks for contact info detection
    const validation = validateIntentVariables(
      intent,
      variables || {},
      user?.ageBracket
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.errors[0] || "Invalid message",
          code: "INVALID_MESSAGE",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get the intent template for response
    const intentTemplate = getIntentTemplate(intent);

    // Create the message with intent and validated variables
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        intent: intent,
        variables: variables || {},
        renderedMessage: validation.renderedMessage!,
        isLegacy: false,
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for the recipient (with safe rendered text)
    const notificationPreview =
      validation.renderedMessage!.slice(0, 60) +
      (validation.renderedMessage!.length > 60 ? "..." : "");
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
        intent,
        recipientId,
      }
    );

    // Life Skills: Record events based on message intent
    if (session.user.role === "YOUTH") {
      // Check if this is the user's first message ever (to any conversation)
      const messageCount = await prisma.message.count({
        where: { senderId: userId },
      });
      if (messageCount === 1) {
        // This was their first message
        await recordLifeSkillEvent(userId, "MESSAGE_SENT_FIRST", id, { intent });
      }

      // Record events based on specific intent usage
      if (intent === MessageIntent.CONFIRM_COMPLETION) {
        await recordLifeSkillEvent(userId, "JOB_COMPLETED", message.id, { conversationId: id });
      } else if (intent === MessageIntent.UNABLE_TO_PROCEED) {
        await recordLifeSkillEvent(userId, "JOB_DECLINED", id, { conversationId: id });
      } else if (intent === MessageIntent.CONFIRM_AVAILABILITY) {
        await recordLifeSkillEvent(userId, "JOB_ACCEPTED", message.id, { conversationId: id });
      }
    }

    return NextResponse.json(
      {
        id: message.id,
        content: validation.renderedMessage,
        intent: intent,
        intentLabel: intentTemplate?.label,
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
