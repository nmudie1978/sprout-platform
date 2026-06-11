export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STEPS = new Set(["discover", "understand", "clarity"]);

/**
 * POST /api/journey/completion/sync
 *
 * One-time, idempotent backfill of device-local journey-lens completion into
 * each goal's `journeyCompletedSteps`. Body:
 *   { completions: { [goalId]: ("discover"|"understand"|"clarity")[] } }
 *
 * Completion is monotonic (a user only ever GAINS lenses), so we UNION the
 * incoming steps with whatever the row already has. This is loss-free and
 * cross-device safe — no device can erase another's progress — and lets a
 * later "clarity" land even if only "discover" synced earlier. Safe to call
 * repeatedly; only writes when the union actually grows the stored set.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const completions = body?.completions;
    if (!completions || typeof completions !== "object") {
      return NextResponse.json({ error: "completions object is required" }, { status: 400 });
    }

    // Normalise: keep only valid, non-empty step sets.
    const incoming = new Map<string, string[]>();
    for (const [goalId, steps] of Object.entries(completions as Record<string, unknown>)) {
      if (!goalId || !Array.isArray(steps)) continue;
      const clean = steps.filter((s): s is string => typeof s === "string" && VALID_STEPS.has(s));
      if (clean.length > 0) incoming.set(goalId, Array.from(new Set(clean)));
    }
    if (incoming.size === 0) {
      return NextResponse.json({ updated: 0 });
    }

    const rows = await prisma.journeyGoalData.findMany({
      where: { userId: session.user.id, goalId: { in: Array.from(incoming.keys()) } },
      select: { goalId: true, journeyCompletedSteps: true },
    });

    let updated = 0;
    for (const row of rows) {
      const steps = incoming.get(row.goalId);
      if (!steps) continue;
      // Union — additive, never erases progress made on another device.
      const union = Array.from(new Set([...row.journeyCompletedSteps, ...steps]));
      if (union.length === row.journeyCompletedSteps.length) continue; // no growth
      await prisma.journeyGoalData.update({
        where: { userId_goalId: { userId: session.user.id, goalId: row.goalId } },
        data: { journeyCompletedSteps: union, updatedAt: new Date() },
      });
      updated += 1;
    }

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Failed to sync journey completion:", error);
    return NextResponse.json({ error: "Failed to sync journey completion" }, { status: 500 });
  }
}
