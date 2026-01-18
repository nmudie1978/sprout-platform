import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/history - Fetch chat history for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch last 50 messages for the user, ordered by creation time
    const messages = await prisma.aiChatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: {
        id: true,
        role: true,
        content: true,
        intent: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[Chat History] Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/history - Clear chat history for the current user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all chat messages for the user
    const result = await prisma.aiChatMessage.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("[Chat History] Error clearing history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}
