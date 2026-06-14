export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isArrivalMood, isSameDay, moodAcknowledgementKey } from "@/lib/arrival/types";

/**
 * GET /api/arrival-check-in
 *
 * Returns the current user's check-in for TODAY (if any), so the UI knows not
 * to re-prompt:
 *   { today: { mood, createdAt } | null }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latest = await prisma.arrivalCheckIn.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { mood: true, createdAt: true },
    });

    const today = latest && isSameDay(latest.createdAt, new Date()) ? latest : null;

    return NextResponse.json({ today });
  } catch (error) {
    console.error("Failed to load arrival check-in:", error);
    return NextResponse.json({ error: "Failed to load arrival check-in" }, { status: 500 });
  }
}

/**
 * POST /api/arrival-check-in
 *
 * Records a self-reported arrival mood. Body: { mood }.
 * Returns the acknowledgement i18n key so the client can respond in-voice.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const mood = body?.mood;

    if (!isArrivalMood(mood)) {
      return NextResponse.json(
        { error: "mood must be one of: lost, curious, pressured, motivated" },
        { status: 400 },
      );
    }

    await prisma.arrivalCheckIn.create({
      data: { userId: session.user.id, mood },
    });

    return NextResponse.json({
      success: true,
      acknowledgementKey: moodAcknowledgementKey(mood),
    });
  } catch (error) {
    console.error("Failed to save arrival check-in:", error);
    return NextResponse.json({ error: "Failed to save arrival check-in" }, { status: 500 });
  }
}
