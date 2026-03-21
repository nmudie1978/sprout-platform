/**
 * Admin API route for managing founder spotlights
 *
 * POST /api/admin/founders - Add a new spotlight
 * PUT /api/admin/founders - Update an existing spotlight
 * DELETE /api/admin/founders - Delete a spotlight
 *
 * All endpoints require ADMIN_API_KEY header for authorization.
 */

import { NextResponse } from "next/server";
import {
  addSpotlight,
  updateSpotlight,
  deleteSpotlight,
  loadSpotlights,
  reverifyAllSpotlights,
} from "@/lib/founders/store";
import { FounderSpotlightInput } from "@/lib/founders/types";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "dev-admin-key";

/**
 * Verify admin authorization
 */
function verifyAdmin(request: Request): boolean {
  const apiKey = request.headers.get("x-admin-api-key");
  return apiKey === ADMIN_API_KEY;
}

/**
 * POST - Add a new founder spotlight
 */
export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input: FounderSpotlightInput = {
      title: body.title,
      founderName: body.founderName,
      founderAgeAtStart: body.founderAgeAtStart,
      country: body.country,
      whatTheyBuilt: body.whatTheyBuilt,
      whyItMatters: body.whyItMatters,
      keyLesson: body.keyLesson,
      sourceName: body.sourceName,
      sourceUrl: body.sourceUrl,
      publishedDateISO: body.publishedDateISO,
      tags: body.tags,
    };

    const result = await addSpotlight(input, body.addedBy || "admin");

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      spotlight: result.spotlight,
    });
  } catch (error) {
    console.error("[admin/founders] POST error:", error);
    return NextResponse.json(
      { error: "Failed to add spotlight" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing spotlight or re-verify all
 */
export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Special action: reverify all spotlights
    if (body.action === "reverify-all") {
      const result = await reverifyAllSpotlights();
      return NextResponse.json({
        success: true,
        message: `Re-verification complete: ${result.verified} verified, ${result.failed} failed, ${result.unchanged} unchanged`,
        result,
      });
    }

    // Update specific spotlight
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Spotlight ID is required" }, { status: 400 });
    }

    const result = await updateSpotlight(id, updates);

    if (result.notFound) {
      return NextResponse.json({ error: "Spotlight not found" }, { status: 404 });
    }

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      spotlight: result.spotlight,
    });
  } catch (error) {
    console.error("[admin/founders] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update spotlight" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a spotlight
 */
export async function DELETE(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Spotlight ID is required" }, { status: 400 });
    }

    const deleted = deleteSpotlight(id);

    if (!deleted) {
      return NextResponse.json({ error: "Spotlight not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Spotlight deleted",
    });
  } catch (error) {
    console.error("[admin/founders] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete spotlight" },
      { status: 500 }
    );
  }
}

/**
 * GET - List all spotlights (admin view, includes unverified)
 */
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const spotlights = loadSpotlights();

    return NextResponse.json({
      spotlights,
      summary: {
        total: spotlights.length,
        verified: spotlights.filter((s) => s.verified).length,
        pending: spotlights.filter((s) => !s.verified && !s.checkFailReason).length,
        failed: spotlights.filter((s) => !s.verified && s.checkFailReason).length,
      },
    });
  } catch (error) {
    console.error("[admin/founders] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load spotlights" },
      { status: 500 }
    );
  }
}
