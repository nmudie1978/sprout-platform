export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvatarById } from "@/lib/avatars";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { avatarId } = body;

    if (typeof avatarId !== "string" || !avatarId.trim()) {
      return NextResponse.json({ error: "Invalid avatarId" }, { status: 400 });
    }

    if (!getAvatarById(avatarId)) {
      return NextResponse.json({ error: "Avatar not found in catalog" }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date();

    const savedProfile = await prisma.youthProfile.upsert({
      where: { userId },
      update: { avatarId, avatarUpdatedAt: now, updatedAt: now },
      create: {
        userId,
        displayName: session.user.email?.split("@")[0] || "User",
        avatarId,
        avatarUpdatedAt: now,
        publicProfileSlug: `user-${userId.slice(0, 8)}-${Date.now().toString(36)}`,
        profileVisibility: false,
      },
      select: { id: true, avatarId: true, avatarUpdatedAt: true, displayName: true },
    });

    const response = NextResponse.json({
      success: true,
      avatarId: savedProfile.avatarId,
      avatarUpdatedAt: savedProfile.avatarUpdatedAt,
      profileId: savedProfile.id,
      displayName: savedProfile.displayName,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("[AVATAR API] Save failed:", error);
    return NextResponse.json(
      { error: "Failed to save avatar" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { avatarId: true, avatarUpdatedAt: true },
    });

    const response = NextResponse.json({
      avatarId: profile?.avatarId ?? null,
      avatarUpdatedAt: profile?.avatarUpdatedAt ?? null,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("[AVATAR API] Get failed:", error);
    return NextResponse.json({ error: "Failed to fetch avatar" }, { status: 500 });
  }
}
