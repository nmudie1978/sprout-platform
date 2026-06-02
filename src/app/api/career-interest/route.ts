export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isInterestLevel } from "@/lib/interest-level/types";
import { getCareerById } from "@/lib/career-pathways";

/**
 * GET /api/career-interest
 *
 * Returns every Interest Level the current user has set, keyed by careerId:
 *   { interests: { [careerId]: 1|2|3|4|5 } }
 *
 * Source of truth for the My Library "Exploring" tab. Device-local
 * localStorage remains an optimistic cache on other surfaces.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.careerInterest.findMany({
      where: { userId: session.user.id },
      select: { careerId: true, level: true },
    });

    const interests: Record<string, number> = {};
    for (const r of rows) interests[r.careerId] = r.level;

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Failed to load career interests:", error);
    return NextResponse.json({ error: "Failed to load career interests" }, { status: 500 });
  }
}

/**
 * PUT /api/career-interest
 *
 * Upsert a single career's Interest Level. Body: { careerId, level }.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const careerId = typeof body?.careerId === "string" ? body.careerId.trim() : "";
    const level = body?.level;

    if (!careerId || !getCareerById(careerId)) {
      return NextResponse.json({ error: "Unknown careerId" }, { status: 400 });
    }
    if (!isInterestLevel(level)) {
      return NextResponse.json({ error: "level must be an integer 1–5" }, { status: 400 });
    }

    await prisma.careerInterest.upsert({
      where: { userId_careerId: { userId: session.user.id, careerId } },
      create: { userId: session.user.id, careerId, level },
      update: { level },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save career interest:", error);
    return NextResponse.json({ error: "Failed to save career interest" }, { status: 500 });
  }
}
