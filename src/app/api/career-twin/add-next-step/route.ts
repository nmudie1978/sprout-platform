export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/career-twin/add-next-step
 *
 * Append a Career-Twin-suggested next step to the user's active My Journey
 * goal. The step is written into `journeySummary.momentumActions` using the
 * same `{ text, done, type }` shape the Journey + report already render.
 *
 * Confirmation is enforced in the UI — this endpoint is only ever called
 * after the user explicitly confirms, and never adds anything automatically.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const text: string = (body.text ?? "").toString().trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const step = { text: text.slice(0, 300), done: false, type: "career-twin" as const };

    // Prefer the goal the user is actively on; else the most recent goal.
    const goal =
      (await prisma.journeyGoalData.findFirst({
        where: { userId: session.user.id, isActive: true },
        orderBy: { updatedAt: "desc" },
      })) ??
      (await prisma.journeyGoalData.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
      }));

    if (!goal) {
      // No journey yet — tell the client so it can nudge them to start one.
      return NextResponse.json({ success: false, noActiveGoal: true });
    }

    const summary = (goal.journeySummary as Record<string, unknown> | null) ?? {};
    const existing = Array.isArray(summary.momentumActions)
      ? (summary.momentumActions as unknown[])
      : [];

    // Skip if an identical step already exists (idempotent re-confirms).
    const duplicate = existing.some(
      (a) =>
        a &&
        typeof a === "object" &&
        ((a as Record<string, unknown>).text ?? "").toString().trim() === step.text,
    );
    const merged = duplicate ? existing : [...existing, step].slice(-500);

    const mergedSummary = { ...summary, momentumActions: merged };

    await prisma.journeyGoalData.update({
      where: { id: goal.id },
      data: {
        journeySummary: JSON.parse(JSON.stringify(mergedSummary)),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, goalTitle: goal.goalTitle, added: !duplicate });
  } catch (error) {
    console.error("[Career Twin] add-next-step error:", error);
    return NextResponse.json({ error: "Failed to add next step" }, { status: 500 });
  }
}
