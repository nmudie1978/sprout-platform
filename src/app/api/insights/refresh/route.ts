import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  verifyAndRefreshIndustryInsights,
  getModulesNeedingVerification,
} from "@/lib/insights-refresh";

/**
 * GET /api/insights/refresh
 * Check which modules need verification (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const modulesNeedingVerification = await getModulesNeedingVerification();

    return NextResponse.json({
      needsVerification: modulesNeedingVerification.length > 0,
      modules: modulesNeedingVerification.map((m) => ({
        key: m.key,
        title: m.title,
        lastVerifiedAt: m.lastVerifiedAt.toISOString(),
        refreshCadenceDays: m.refreshCadenceDays,
        daysSinceVerified: Math.floor(
          (Date.now() - m.lastVerifiedAt.getTime()) / (24 * 60 * 60 * 1000)
        ),
      })),
    });
  } catch (error) {
    console.error("[Insights Refresh API] Error checking status:", error);
    return NextResponse.json(
      { error: "Failed to check refresh status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights/refresh
 * Trigger the verify and refresh job
 *
 * Can be called by:
 * - Admin users manually
 * - Cron job with secret key
 */
export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    const isAdmin = session?.user?.role === "ADMIN";
    const isValidCron = cronSecret && expectedSecret && cronSecret === expectedSecret;

    if (!isAdmin && !isValidCron) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access or valid cron secret required." },
        { status: 403 }
      );
    }

    console.log("[Insights Refresh] Starting verify and refresh job...");
    const startTime = Date.now();

    const result = await verifyAndRefreshIndustryInsights();

    const duration = Date.now() - startTime;
    console.log(`[Insights Refresh] Completed in ${duration}ms:`, {
      checked: result.modulesChecked,
      verified: result.modulesVerified,
      regenerated: result.modulesRegenerated,
      errors: result.errors.length,
    });

    return NextResponse.json({
      success: true,
      durationMs: duration,
      result,
    });
  } catch (error) {
    console.error("[Insights Refresh API] Error running refresh:", error);
    return NextResponse.json(
      { error: "Failed to run refresh job" },
      { status: 500 }
    );
  }
}
