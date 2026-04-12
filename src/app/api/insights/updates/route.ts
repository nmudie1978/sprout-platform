export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getActiveInsightsModules } from "@/lib/insights-refresh";
import { moduleToUpdate } from "@/lib/industry-insights/insight-updates";

/**
 * GET /api/insights/updates
 *
 * Returns recently updated insight modules as InsightUpdate objects.
 * Only modules with version > 1 (i.e. actually refreshed at least once)
 * are included. Limited to the 5 most recent.
 */
export async function GET() {
  try {
    const modules = await getActiveInsightsModules();

    const updates = modules
      .map((m) =>
        moduleToUpdate({
          key: m.key,
          title: m.title,
          version: m.version,
          lastUpdated: m.lastGeneratedAt.toISOString(),
          source: (m.sourceMeta as { name?: string; url?: string } | null) ?? null,
        })
      )
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      .slice(0, 5);

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("[Insight Updates API] Error:", error);
    return NextResponse.json({ updates: [] });
  }
}
