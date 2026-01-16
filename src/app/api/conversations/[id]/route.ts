import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
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
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            senderId: true,
            read: true,
            createdAt: true,
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
      conversation.employerId !== session.user.id &&
      conversation.youthId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark all messages from the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    });

    const isEmployer = session.user.role === "EMPLOYER";
    const otherParty = isEmployer
      ? {
          id: conversation.youth.id,
          name: conversation.youth.youthProfile?.displayName || "Unknown",
          avatar: conversation.youth.youthProfile?.avatarId,
        }
      : {
          id: conversation.employer.id,
          name: conversation.employer.employerProfile?.companyName || "Unknown",
          logo: conversation.employer.employerProfile?.companyLogo,
        };

    return NextResponse.json({
      id: conversation.id,
      otherParty,
      job: conversation.job,
      messages: conversation.messages.map((msg) => ({
        ...msg,
        isFromMe: msg.senderId === session.user.id,
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

// POST /api/conversations/[id] - Send a message
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
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        employerId: true,
        youthId: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.employerId !== session.user.id &&
      conversation.youthId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content.trim(),
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for the recipient
    const recipientId =
      conversation.employerId === session.user.id
        ? conversation.youthId
        : conversation.employerId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: `You have a new message: "${content.slice(0, 50)}${content.length > 50 ? "..." : ""}"`,
        link: `/messages/${id}`,
      },
    });

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
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
