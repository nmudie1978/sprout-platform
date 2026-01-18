import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getActiveInsightsModules,
  initializeInsightsModules,
} from "@/lib/insights-refresh";

/**
 * GET /api/insights/modules
 * Fetch all active Industry Insights modules for display
 */
export async function GET() {
  try {
    // Initialize modules if needed (first load)
    await initializeInsightsModules();

    // Get all active modules
    const modules = await getActiveInsightsModules();

    // Calculate verification status for UI
    const now = new Date();
    const modulesWithStatus = modules.map((m) => {
      const daysSinceVerified = Math.floor(
        (now.getTime() - m.lastVerifiedAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isVerifiedThisQuarter = daysSinceVerified < 90;

      return {
        key: m.key,
        title: m.title,
        description: m.description,
        content: m.contentJson,
        summary: m.renderedSummary,
        version: m.version,
        lastUpdated: m.lastGeneratedAt.toISOString(),
        verifiedThisQuarter: isVerifiedThisQuarter,
      };
    });

    // Calculate overall verification status
    const allVerified = modulesWithStatus.every((m) => m.verifiedThisQuarter);
    const lastVerification = modules.length > 0
      ? new Date(Math.max(...modules.map((m) => m.lastVerifiedAt.getTime())))
      : null;

    return NextResponse.json({
      modules: modulesWithStatus,
      meta: {
        allVerifiedThisQuarter: allVerified,
        lastVerification: lastVerification?.toISOString(),
        totalModules: modules.length,
      },
    });
  } catch (error) {
    console.error("[Insights Modules API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights modules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights/modules
 * Trigger a refresh check (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admins to trigger refresh
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Dynamic import to avoid loading refresh logic on every request
    const { verifyAndRefreshIndustryInsights } = await import("@/lib/insights-refresh");
    const result = await verifyAndRefreshIndustryInsights();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[Insights Modules API] Refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh insights modules" },
      { status: 500 }
    );
  }
}
