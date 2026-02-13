import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvatarById } from "@/lib/avatars";

/**
 * Dedicated Avatar Update API
 *
 * This endpoint provides GUARANTEED avatar persistence with:
 * 1. Single source of truth: YouthProfile.avatarId in PostgreSQL
 * 2. Server-side upsert (creates profile if needed)
 * 3. Catalog validation: avatarId must exist in the avatar catalog
 * 4. Write verification (confirms saved value matches)
 * 5. No silent failures - all errors are surfaced
 */

export async function PATCH(req: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { avatarId } = body;

    if (typeof avatarId !== "string" || !avatarId.trim()) {
      return NextResponse.json(
        { error: "Invalid avatarId", code: "INVALID_AVATAR_ID" },
        { status: 400 }
      );
    }

    // Validate avatarId exists in the catalog
    const avatarDef = getAvatarById(avatarId);
    if (!avatarDef) {
      console.warn("[AVATAR API] Rejected unknown avatarId:", { correlationId, avatarId });
      return NextResponse.json(
        { error: "Avatar not found in catalog", code: "INVALID_AVATAR_ID" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    console.log("[AVATAR API] AVATAR_COMMIT_STARTED:", { correlationId, userId, avatarId });

    // Step 1: Upsert the profile with the new avatar
    const now = new Date();
    const savedProfile = await prisma.youthProfile.upsert({
      where: { userId },
      update: {
        avatarId,
        avatarUpdatedAt: now,
        updatedAt: now,
      },
      create: {
        userId,
        displayName: session.user.email?.split("@")[0] || "User",
        avatarId,
        avatarUpdatedAt: now,
        publicProfileSlug: `user-${userId.slice(0, 8)}-${Date.now().toString(36)}`,
        profileVisibility: false,
      },
      select: {
        id: true,
        avatarId: true,
        avatarUpdatedAt: true,
        displayName: true,
      },
    });

    console.log("[AVATAR API] Save result:", {
      correlationId,
      profileId: savedProfile.id,
      savedAvatarId: savedProfile.avatarId,
    });

    // Step 2: Verify the write succeeded
    const verifiedProfile = await prisma.youthProfile.findUnique({
      where: { userId },
      select: { avatarId: true, avatarUpdatedAt: true },
    });

    if (!verifiedProfile) {
      console.error("[AVATAR API] AVATAR_COMMIT_FAILED:", {
        correlationId,
        reason: "PROFILE_NOT_FOUND_AFTER_SAVE",
      });
      return NextResponse.json(
        {
          error: "Avatar save failed - profile not found after save",
          code: "VERIFICATION_FAILED_NO_PROFILE",
        },
        { status: 500 }
      );
    }

    if (verifiedProfile.avatarId !== avatarId) {
      console.error("[AVATAR API] AVATAR_COMMIT_FAILED:", {
        correlationId,
        reason: "MISMATCH",
        expected: avatarId,
        actual: verifiedProfile.avatarId,
      });
      return NextResponse.json(
        {
          error: "Avatar save failed - verification mismatch",
          code: "VERIFICATION_FAILED_MISMATCH",
          expected: avatarId,
          actual: verifiedProfile.avatarId,
        },
        { status: 500 }
      );
    }

    console.log("[AVATAR API] AVATAR_COMMIT_SUCCESS:", { correlationId, avatarId });

    // Step 3: Return success with verified data
    const response = NextResponse.json({
      success: true,
      avatarId: verifiedProfile.avatarId,
      avatarUpdatedAt: verifiedProfile.avatarUpdatedAt,
      profileId: savedProfile.id,
      displayName: savedProfile.displayName,
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    return response;
  } catch (error) {
    console.error("[AVATAR API] AVATAR_COMMIT_FAILED:", {
      correlationId,
      reason: "EXCEPTION",
      error,
    });

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            error: "Profile conflict - please try again",
            code: "UNIQUE_CONSTRAINT_ERROR",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to save avatar",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { avatarId: true, avatarUpdatedAt: true },
    });

    console.log("[AVATAR API] Get:", {
      userId: session.user.id,
      avatarId: profile?.avatarId ?? null,
    });

    const response = NextResponse.json({
      avatarId: profile?.avatarId ?? null,
      avatarUpdatedAt: profile?.avatarUpdatedAt ?? null,
    });

    // No caching — always fresh reads
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    return response;
  } catch (error) {
    console.error("[AVATAR API] Get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
