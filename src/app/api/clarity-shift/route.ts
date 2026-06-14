export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isClarityScore } from "@/lib/clarity-shift/types";
import { getCareerById } from "@/lib/career-pathways";

/**
 * GET /api/clarity-shift            → { shifts: [...] } (all for the user)
 * GET /api/clarity-shift?careerSlug → { shift: {...} | null } (one career)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const careerSlug = req.nextUrl.searchParams.get("careerSlug");

    if (careerSlug) {
      const shift = await prisma.clarityShift.findUnique({
        where: { userId_careerSlug: { userId: session.user.id, careerSlug } },
        select: { careerSlug: true, beforeScore: true, afterScore: true, updatedAt: true },
      });
      return NextResponse.json({ shift });
    }

    const shifts = await prisma.clarityShift.findMany({
      where: { userId: session.user.id },
      select: { careerSlug: true, beforeScore: true, afterScore: true, updatedAt: true },
    });
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Failed to load clarity shift:", error);
    return NextResponse.json({ error: "Failed to load clarity shift" }, { status: 500 });
  }
}

/**
 * PUT /api/clarity-shift
 *
 * Upsert one endpoint of a career's clarity shift.
 * Body: { careerSlug, phase: "before" | "after", score: 1..5 }.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const careerSlug = typeof body?.careerSlug === "string" ? body.careerSlug.trim() : "";
    const phase = body?.phase;
    const score = body?.score;

    if (!careerSlug || !getCareerById(careerSlug)) {
      return NextResponse.json({ error: "Unknown careerSlug" }, { status: 400 });
    }
    if (phase !== "before" && phase !== "after") {
      return NextResponse.json({ error: "phase must be 'before' or 'after'" }, { status: 400 });
    }
    if (!isClarityScore(score)) {
      return NextResponse.json({ error: "score must be an integer 1–5" }, { status: 400 });
    }

    const field = phase === "before" ? "beforeScore" : "afterScore";

    const shift = await prisma.clarityShift.upsert({
      where: { userId_careerSlug: { userId: session.user.id, careerSlug } },
      create: { userId: session.user.id, careerSlug, [field]: score },
      update: { [field]: score },
      select: { careerSlug: true, beforeScore: true, afterScore: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, shift });
  } catch (error) {
    console.error("Failed to save clarity shift:", error);
    return NextResponse.json({ error: "Failed to save clarity shift" }, { status: 500 });
  }
}
