/**
 * GET /api/admin/events/status
 *
 * Returns provider health status and refresh metadata.
 */

import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { getAllProviderHealth, getHealthSummary } from "@/lib/events/provider-health";
import type { RefreshMetadata } from "@/lib/events/types";

const METADATA_FILE = path.join(process.cwd(), "data", "career-events", "refresh-metadata.json");

function loadMetadata(): RefreshMetadata | null {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return null;
}

export async function GET() {
  try {
    const providerHealth = getAllProviderHealth();
    const healthSummary = getHealthSummary();
    const metadata = loadMetadata();

    return NextResponse.json({
      status: "ok",
      providers: providerHealth,
      summary: healthSummary,
      lastRefresh: metadata
        ? {
            timestamp: metadata.lastRefreshISO,
            totalFetched: metadata.totalFetched,
            totalVerified: metadata.totalVerified,
            totalFailed: metadata.totalFailed,
            duplicatesRemoved: metadata.duplicatesRemoved,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching provider status:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch provider status" },
      { status: 500 }
    );
  }
}
