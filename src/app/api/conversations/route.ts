import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isEmployer = session.user.role === "EMPLOYER";

    const conversations = await prisma.conversation.findMany({
      where: isEmployer
        ? { employerId: session.user.id }
        : { youthId: session.user.id },
      include: {
        employer: {
          select: {
            id: true,
            employerProfile: {
              select: {
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
        youth: {
          select: {
            id: true,
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
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
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format conversations with last message info and unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.user.id },
            read: false,
          },
        });

        const lastMessage = conv.messages[0];
        const otherParty = isEmployer
          ? {
              id: conv.youth.id,
              name: conv.youth.youthProfile?.displayName || "Unknown",
              avatar: conv.youth.youthProfile?.avatarId,
            }
          : {
              id: conv.employer.id,
              name: conv.employer.employerProfile?.companyName || "Unknown",
              logo: conv.employer.employerProfile?.logoUrl,
            };

        return {
          id: conv.id,
          otherParty,
          job: conv.job,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isFromMe: lastMessage.senderId === session.user.id,
              }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { youthId, employerId, jobId } = body;

    // Validate the request
    const isEmployer = session.user.role === "EMPLOYER";

    if (isEmployer) {
      if (!youthId) {
        return NextResponse.json(
          { error: "Youth ID is required" },
          { status: 400 }
        );
      }
    } else {
      if (!employerId) {
        return NextResponse.json(
          { error: "Employer ID is required" },
          { status: 400 }
        );
      }
    }

    const actualEmployerId = isEmployer ? session.user.id : employerId;
    const actualYouthId = isEmployer ? youthId : session.user.id;

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        employerId: actualEmployerId,
        youthId: actualYouthId,
        ...(jobId ? { jobId } : {}),
      },
    });

    if (existingConversation) {
      return NextResponse.json({ id: existingConversation.id });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        employerId: actualEmployerId,
        youthId: actualYouthId,
        jobId: jobId || null,
      },
    });

    return NextResponse.json({ id: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
