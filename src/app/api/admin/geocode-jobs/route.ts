import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";

/**
 * POST /api/admin/geocode-jobs
 * Backfill coordinates for jobs that don't have them.
 * Rate limited to respect Nominatim's 1 request/second limit.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow admin or any authenticated user for now (you can restrict to admin later)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get batch size from query params (default 50, max 100)
    const { searchParams } = new URL(req.url);
    const batchSize = Math.min(parseInt(searchParams.get("batch") || "50"), 100);

    // Get jobs without coordinates
    const jobsWithoutCoords = await prisma.microJob.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
        location: { not: "" },
      },
      select: {
        id: true,
        location: true,
      },
      take: batchSize, // Process batch at a time
    });

    if (jobsWithoutCoords.length === 0) {
      return NextResponse.json({
        message: "All jobs already have coordinates",
        updated: 0,
        remaining: 0,
      });
    }

    const results: { id: string; success: boolean; location: string }[] = [];

    for (const job of jobsWithoutCoords) {
      try {
        const coords = await geocodeAddress(job.location);

        if (coords) {
          await prisma.microJob.update({
            where: { id: job.id },
            data: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          });
          results.push({ id: job.id, success: true, location: job.location });
        } else {
          results.push({ id: job.id, success: false, location: job.location });
        }

        // Wait 1.1 seconds between requests to respect rate limits
        if (jobsWithoutCoords.indexOf(job) < jobsWithoutCoords.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      } catch (error) {
        console.error(`Failed to geocode job ${job.id}:`, error);
        results.push({ id: job.id, success: false, location: job.location });
      }
    }

    // Count remaining jobs
    const remaining = await prisma.microJob.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
        location: { not: "" },
      },
    });

    return NextResponse.json({
      message: `Processed ${results.length} jobs`,
      updated: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      remaining: remaining - results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error("Geocode jobs error:", error);
    return NextResponse.json(
      { error: "Failed to geocode jobs" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/geocode-jobs
 * Get status of jobs needing geocoding
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withCoords = await prisma.microJob.count({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    const withoutCoords = await prisma.microJob.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
    });

    const total = await prisma.microJob.count();

    return NextResponse.json({
      total,
      withCoordinates: withCoords,
      withoutCoordinates: withoutCoords,
      percentComplete: total > 0 ? Math.round((withCoords / total) * 100) : 100,
    });
  } catch (error) {
    console.error("Get geocode status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
