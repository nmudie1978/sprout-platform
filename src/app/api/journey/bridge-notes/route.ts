export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyBranchNote, readBridgeNotes } from "@/lib/journey/bridge-notes";

/**
 * Per-user notes on the Career Transition Map branches. The mindmap is
 * generic across careers, so notes are one set keyed by branch id, stored in
 * youthProfile.journeySummary.bridgeNotes. Owner-only.
 */

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true },
    });
    const summary = (profile?.journeySummary as Record<string, unknown> | null) || null;
    return NextResponse.json({ notes: readBridgeNotes(summary?.bridgeNotes) });
  } catch (error) {
    console.error("Failed to load bridge notes:", error);
    return NextResponse.json({ error: "Failed to load bridge notes" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { journeySummary: true, displayName: true },
    });
    const summary = (profile?.journeySummary as Record<string, unknown> | null) || {};
    const next = applyBranchNote(readBridgeNotes(summary.bridgeNotes), body.branchId, body.note);

    const merged = { ...summary, bridgeNotes: next };
    await prisma.youthProfile.upsert({
      where: { userId: session.user.id },
      update: { journeySummary: JSON.parse(JSON.stringify(merged)) },
      create: {
        userId: session.user.id,
        displayName: session.user.email?.split("@")[0] || "User",
        journeySummary: JSON.parse(JSON.stringify(merged)),
      },
    });
    return NextResponse.json({ notes: next });
  } catch (error) {
    console.error("Failed to save bridge note:", error);
    return NextResponse.json({ error: "Failed to save bridge note" }, { status: 500 });
  }
}
