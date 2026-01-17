import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUserSendMessages } from "@/lib/safety";
import { canInitiateConversation, logSafetyAction } from "@/lib/safety-messaging";
import { recordLifeSkillEvent } from "@/lib/life-skills";
import { UserRole } from "@prisma/client";

// Helper to normalize participant order (smaller ID first)
function normalizeParticipants(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

// GET /api/conversations - Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find all conversations where user is either participant1 or participant2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
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
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            renderedText: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Get all unread counts in a SINGLE query (fixes N+1 problem)
    const conversationIds = conversations.map(c => c.id);
    const unreadCounts = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        read: false,
      },
      _count: {
        id: true,
      },
    });

    // Create a map for O(1) lookup
    const unreadCountMap = new Map(
      unreadCounts.map(uc => [uc.conversationId, uc._count.id])
    );

    // Format conversations with last message info and unread count
    const formattedConversations = conversations.map((conv) => {
        const unreadCount = unreadCountMap.get(conv.id) || 0;
        const lastMessage = conv.messages[0];

        // Determine the other party (not the current user)
        const otherParticipant = conv.participant1Id === userId
          ? conv.participant2
          : conv.participant1;

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

        return {
          id: conv.id,
          otherParty,
          job: conv.job,
          status: conv.status,
          lastMessage: lastMessage
            ? {
                content: lastMessage.renderedText,
                createdAt: lastMessage.createdAt,
                isFromMe: lastMessage.senderId === userId,
              }
            : null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
        };
      });

    const response = NextResponse.json(formattedConversations);
    // Short cache for conversations - needs to stay reasonably fresh
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=20');
    return response;
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create or get existing conversation
// Phase 1 Safety: All conversations MUST be tied to a job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safety gate: Check if user can send messages
    const safetyCheck = await canUserSendMessages(
      session.user.id,
      session.user.role as UserRole
    );
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        {
          error: safetyCheck.reason || "Not authorized to send messages",
          code: safetyCheck.code,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { recipientId, jobId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    // Phase 1 Safety: jobId is REQUIRED - no random DMs
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required. Conversations must be related to a job.", code: "JOB_REQUIRED" },
        { status: 400 }
      );
    }

    // Can't message yourself
    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    // Phase 1 Safety: Comprehensive safety gate check
    const initiateCheck = await canInitiateConversation(
      session.user.id,
      recipientId,
      jobId
    );

    if (!initiateCheck.allowed) {
      return NextResponse.json(
        {
          error: initiateCheck.reason || "Cannot start conversation",
          code: initiateCheck.code,
        },
        { status: 403 }
      );
    }

    // If conversation already exists, return it
    if (initiateCheck.code === "CONVERSATION_EXISTS") {
      // Normalize participant order to find the conversation
      const [participant1Id, participant2Id] = normalizeParticipants(
        session.user.id,
        recipientId
      );
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          participant1Id,
          participant2Id,
          jobId,
        },
      });
      if (existingConversation) {
        return NextResponse.json({ id: existingConversation.id, existing: true });
      }
    }

    // Normalize participant order (smaller ID first)
    const [participant1Id, participant2Id] = normalizeParticipants(
      session.user.id,
      recipientId
    );

    // Create new conversation with ACTIVE status
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id,
        participant2Id,
        jobId,
        status: "ACTIVE",
      },
    });

    // Log conversation creation for audit
    await logSafetyAction(
      "CONVERSATION_CREATED",
      session.user.id,
      session.user.id,
      "conversation",
      conversation.id,
      {
        participant1Id,
        participant2Id,
        jobId,
      }
    );

    // Record life skill event for CONVERSATION_STARTED (for youth users)
    if (session.user.role === "YOUTH") {
      await recordLifeSkillEvent(
        session.user.id,
        "CONVERSATION_STARTED",
        conversation.id,
        { jobId, recipientId }
      );
    }

    return NextResponse.json({ id: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
