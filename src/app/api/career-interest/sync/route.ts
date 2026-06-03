export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isInterestLevel } from "@/lib/interest-level/types";
import { getCareerById } from "@/lib/career-pathways";

/**
 * POST /api/career-interest/sync
 *
 * One-time, idempotent backfill of device-local interest ratings into the
 * server. Body: { interests: { [careerId]: 1|2|3|4|5 } }.
 *
 * Creates rows ONLY where the server has none — it never overwrites an
 * existing rating, because the server is the source of truth and may hold a
 * newer value set on another device. Safe to call repeatedly.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const interests = body?.interests;
    if (!interests || typeof interests !== "object") {
      return NextResponse.json({ error: "interests object is required" }, { status: 400 });
    }

    // Keep only well-formed, known careers — silently drop junk.
    const candidates = Object.entries(interests as Record<string, unknown>)
      .filter(([careerId, level]) => careerId && getCareerById(careerId) && isInterestLevel(level))
      .map(([careerId, level]) => ({ careerId, level: level as number }));

    if (candidates.length === 0) {
      return NextResponse.json({ created: 0 });
    }

    const existing = await prisma.careerInterest.findMany({
      where: { userId: session.user.id, careerId: { in: candidates.map((c) => c.careerId) } },
      select: { careerId: true },
    });
    const have = new Set(existing.map((e) => e.careerId));
    const toCreate = candidates.filter((c) => !have.has(c.careerId));

    if (toCreate.length > 0) {
      await prisma.careerInterest.createMany({
        data: toCreate.map((c) => ({ userId: session.user.id, careerId: c.careerId, level: c.level })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ created: toCreate.length });
  } catch (error) {
    console.error("Failed to sync career interests:", error);
    return NextResponse.json({ error: "Failed to sync career interests" }, { status: 500 });
  }
}
