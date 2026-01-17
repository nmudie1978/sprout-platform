/**
 * Admin Community Guardian Assignment API
 * GET - Get current guardian for community
 * POST - Assign a guardian to community
 * DELETE - Remove guardian from community
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAdmin,
  assignGuardian,
  getGuardianForCommunity,
} from "@/lib/community-guardian";
import { logAuditAction } from "@/lib/safety";
import { AuditAction } from "@prisma/client";

// GET /api/admin/communities/[id]/guardian - Get current guardian
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const guardianInfo = await getGuardianForCommunity(params.id);

    if (!guardianInfo.community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(guardianInfo);
  } catch (error) {
    console.error("Error fetching guardian:", error);
    return NextResponse.json(
      { error: "Failed to fetch guardian" },
      { status: 500 }
    );
  }
}

// POST /api/admin/communities/[id]/guardian - Assign a guardian
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await assignGuardian(params.id, userId, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Guardian assigned successfully" });
  } catch (error) {
    console.error("Error assigning guardian:", error);
    return NextResponse.json(
      { error: "Failed to assign guardian" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/communities/[id]/guardian - Remove guardian
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Deactivate active guardian for this community
    const result = await prisma.communityGuardian.updateMany({
      where: {
        communityId: params.id,
        isActive: true,
      },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "No active guardian to remove" },
        { status: 400 }
      );
    }

    await logAuditAction({
      actorId: session.user.id,
      action: AuditAction.GUARDIAN_DEACTIVATED,
      targetType: "community",
      targetId: params.id,
    });

    return NextResponse.json({ message: "Guardian removed successfully" });
  } catch (error) {
    console.error("Error removing guardian:", error);
    return NextResponse.json(
      { error: "Failed to remove guardian" },
      { status: 500 }
    );
  }
}
