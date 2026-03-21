export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  validateAllPendingClips,
  validateAndUpdateClip,
} from "@/lib/career-clips";

/**
 * POST /api/admin/validate-career-clips
 *
 * Validates career clip URLs. Only accessible in development or by admins.
 *
 * Body:
 * - clipId (optional): Validate a specific clip
 * - If no clipId, validates all pending clips
 */
export async function POST(req: NextRequest) {
  try {
    // Check environment or admin access
    const isDev = process.env.NODE_ENV === "development";
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    if (!isDev && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { clipId } = body as { clipId?: string };

    if (clipId) {
      // Validate a specific clip
      const result = await validateAndUpdateClip(clipId);

      return NextResponse.json({
        clipId,
        success: result.success,
        isValid: result.isValid,
        reason: result.reason,
      });
    }

    // Validate all pending clips
    const result = await validateAllPendingClips();

    return NextResponse.json({
      message: "Validation complete",
      ...result,
    });
  } catch (error) {
    console.error("[Validate Career Clips] Error:", error);
    return NextResponse.json(
      { error: "Failed to validate clips" },
      { status: 500 }
    );
  }
}
