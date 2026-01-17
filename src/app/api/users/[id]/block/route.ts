import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logSafetyAction } from "@/lib/safety-messaging";

// POST /api/users/[id]/block - Block a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: blockedId } = await params;
    const blockerId = session.user.id;

    // Can't block yourself
    if (blockedId === blockerId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Check if user to block exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });

    if (!userToBlock) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if block already exists
    const existingBlock = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: "User is already blocked", code: "ALREADY_BLOCKED" },
        { status: 400 }
      );
    }

    // Get optional reason from body
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body.reason;
    } catch {
      // No body or invalid JSON - that's fine, reason is optional
    }

    // Create the block
    const block = await prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
        reason,
      },
    });

    // Log the block action
    await logSafetyAction(
      "USER_BLOCKED",
      blockedId,
      blockerId,
      "user",
      blockedId,
      {
        reason,
      }
    );

    return NextResponse.json(
      {
        id: block.id,
        blockedId: block.blockedId,
        createdAt: block.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to block user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/block - Unblock a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: blockedId } = await params;
    const blockerId = session.user.id;

    // Check if block exists
    const existingBlock = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: "User is not blocked", code: "NOT_BLOCKED" },
        { status: 404 }
      );
    }

    // Delete the block
    await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    // Log the unblock action
    await logSafetyAction(
      "USER_UNBLOCKED",
      blockedId,
      blockerId,
      "user",
      blockedId,
      {}
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unblock user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/block - Check if a user is blocked
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    const currentUserId = session.user.id;

    // Check if either user has blocked the other
    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedId: userId },
          { blockerId: userId, blockedId: currentUserId },
        ],
      },
      select: {
        id: true,
        blockerId: true,
        blockedId: true,
        createdAt: true,
      },
    });

    if (!block) {
      return NextResponse.json({ blocked: false });
    }

    return NextResponse.json({
      blocked: true,
      blockedByMe: block.blockerId === currentUserId,
      blockedByThem: block.blockedId === currentUserId,
      createdAt: block.createdAt,
    });
  } catch (error) {
    console.error("Failed to check block status:", error);
    return NextResponse.json(
      { error: "Failed to check block status" },
      { status: 500 }
    );
  }
}
