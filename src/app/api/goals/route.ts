export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { CareerGoal, GoalSlot } from "@/lib/goals/types";

/** Slugify a goal title for use as goalId */
function slugifyGoal(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Validation schema for a goal
const nextStepSchema = z.object({
  id: z.string(),
  text: z.string().max(200),
  completed: z.boolean(),
});

const goalSchema = z.object({
  title: z.string().min(1).max(100),
  status: z.enum(["exploring", "committed"]),
  confidence: z.enum(["low", "medium", "high"]),
  timeframe: z.enum(["this-year", "1-2-years", "3-plus-years"]),
  why: z.string().max(500).optional().default(""),
  nextSteps: z.array(nextStepSchema).max(5).optional().default([]),
  skills: z.array(z.string().max(50)).max(8).optional().default([]),
  updatedAt: z.string().optional(),
});

const updateGoalsSchema = z.object({
  slot: z.enum(["primary", "secondary"]),
  goal: goalSchema.nullable(),
});

// GET - Fetch user's goals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        primaryGoal: true,
        secondaryGoal: true,
      },
    });

    return NextResponse.json({
      primaryGoal: profile?.primaryGoal as CareerGoal | null,
      secondaryGoal: profile?.secondaryGoal as CareerGoal | null,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// PUT - Update a goal slot
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slot, goal } = updateGoalsSchema.parse(body);

    // Add updatedAt timestamp if goal exists
    const goalWithTimestamp = goal
      ? { ...goal, updatedAt: new Date().toISOString() }
      : Prisma.DbNull;

    // Prevent primary and secondary from having the same title
    if (goal) {
      const profile = await prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: { primaryGoal: true, secondaryGoal: true },
      });

      const otherSlot = slot === "primary" ? "secondaryGoal" : "primaryGoal";
      const otherGoal = profile?.[otherSlot] as CareerGoal | null;

      if (otherGoal && otherGoal.title === goal.title) {
        return NextResponse.json(
          { error: "Primary and secondary goals cannot be the same career" },
          { status: 400 }
        );
      }
    }

    // Determine which field to update
    const updateData =
      slot === "primary"
        ? { primaryGoal: goalWithTimestamp }
        : { secondaryGoal: goalWithTimestamp };

    // If changing the primary goal, save the previous goal's roadmap
    // snapshot under JourneyGoalData and restore the new goal's snapshot
    // (if any). The legacy `journeyState` / `journeyCompletedSteps` /
    // `journeySkippedSteps` fields are no longer touched — see CLAUDE.md
    // <journey_logic>.
    //
    // Key architectural rule, learned the hard way:
    // `journeySummary` is a mixed bag of profile-level data
    // (educationContext, discoverProfile, strengths, careerInterests)
    // AND per-goal data (discoverReflections). Only per-goal fields get
    // snapshotted into JourneyGoalData; profile-level fields stay on
    // YouthProfile.journeySummary and are NEVER overwritten by a goal
    // switch. Previous versions of this handler rebuilt journeySummary
    // wholesale from the restored snapshot, which stale-overwrote the
    // user's "Your Starting Point" data every time they toggled between
    // career goals. Do not reintroduce that pattern.
    const PER_GOAL_FIELDS = ['discoverReflections'] as const;
    const pickPerGoal = (s: Record<string, unknown> | null | undefined) => {
      if (!s) return {};
      const out: Record<string, unknown> = {};
      for (const f of PER_GOAL_FIELDS) if (s[f] !== undefined) out[f] = s[f];
      return out;
    };
    const stripPerGoal = (s: Record<string, unknown> | null | undefined) => {
      if (!s) return {};
      const out: Record<string, unknown> = { ...s };
      for (const f of PER_GOAL_FIELDS) delete out[f];
      return out;
    };

    if (slot === "primary" && goal) {
      const updatedProfile = await prisma.$transaction(async (tx) => {
        const currentProfile = await tx.youthProfile.findUnique({
          where: { userId: session.user.id },
          select: {
            primaryGoal: true,
            journeySummary: true,
          },
        });

        const currentGoal = currentProfile?.primaryGoal as CareerGoal | null;
        const currentSummary =
          (currentProfile?.journeySummary as Record<string, unknown> | null) || {};

        // Save the OLD goal's per-goal slice to JourneyGoalData. We
        // deliberately snapshot only per-goal fields so the snapshot
        // can never clobber profile-level data when the user comes back.
        if (currentGoal?.title && currentGoal.title !== goal.title) {
          const goalId = slugifyGoal(currentGoal.title);
          const perGoalSnapshot = pickPerGoal(currentSummary);
          const hasPerGoalData = Object.keys(perGoalSnapshot).length > 0;
          await tx.journeyGoalData.upsert({
            where: { userId_goalId: { userId: session.user.id, goalId } },
            create: {
              userId: session.user.id,
              goalId,
              goalTitle: currentGoal.title,
              journeySummary: hasPerGoalData
                ? (JSON.parse(JSON.stringify(perGoalSnapshot)) as Prisma.InputJsonValue)
                : undefined,
            },
            update: {
              goalTitle: currentGoal.title,
              journeySummary: hasPerGoalData
                ? (JSON.parse(JSON.stringify(perGoalSnapshot)) as Prisma.InputJsonValue)
                : Prisma.DbNull,
            },
          });
        }

        // Rebuild the profile's journeySummary for the NEW goal.
        // Start from the current profile-level summary (this preserves
        // educationContext, discoverProfile, strengths, careerInterests
        // and anything else that's user-scoped), strip the OLD goal's
        // per-goal fields, and overlay the NEW goal's per-goal fields
        // (if we have a saved snapshot for it).
        let journeyUpdate: Record<string, unknown> = {};
        if (currentGoal?.title !== goal.title) {
          const newGoalId = slugifyGoal(goal.title);
          const savedData = await tx.journeyGoalData.findUnique({
            where: { userId_goalId: { userId: session.user.id, goalId: newGoalId } },
          });

          const profileLevel = stripPerGoal(currentSummary);
          const restoredPerGoal =
            savedData && savedData.goalTitle === goal.title
              ? pickPerGoal(savedData.journeySummary as Record<string, unknown> | null)
              : {};

          journeyUpdate = {
            journeySummary: { ...profileLevel, ...restoredPerGoal } as Prisma.InputJsonValue,
          };
        }

        // Always ensure a JourneyGoalData record exists for the NEW
        // primary goal — this is what powers "My Explored Journeys" on
        // the dashboard. Without this upsert, first-time goal selection
        // never created a row, so the explored list stayed empty until
        // the user switched goals at least once.
        const newGoalId = slugifyGoal(goal.title);
        await tx.journeyGoalData.upsert({
          where: { userId_goalId: { userId: session.user.id, goalId: newGoalId } },
          create: {
            userId: session.user.id,
            goalId: newGoalId,
            goalTitle: goal.title,
            isActive: true,
          },
          update: {
            goalTitle: goal.title,
            isActive: true,
            updatedAt: new Date(),
          },
        });
        // Deactivate any other active rows so isActive is unique-per-user.
        await tx.journeyGoalData.updateMany({
          where: {
            userId: session.user.id,
            isActive: true,
            NOT: { goalId: newGoalId },
          },
          data: { isActive: false },
        });

        // Atomically update the profile with new goal + journey state
        return tx.youthProfile.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            displayName: session.user.name || "User",
            ...updateData,
            ...journeyUpdate,
          },
          update: {
            ...updateData,
            ...journeyUpdate,
          },
        });
      });

      return NextResponse.json({
        success: true,
        primaryGoal: updatedProfile.primaryGoal as CareerGoal | null,
        secondaryGoal: updatedProfile.secondaryGoal as CareerGoal | null,
      });
    }

    // Non-primary goal or clearing — simple upsert
    const updatedProfile = await prisma.youthProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        displayName: session.user.name || "User",
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      primaryGoal: updatedProfile.primaryGoal as CareerGoal | null,
      secondaryGoal: updatedProfile.secondaryGoal as CareerGoal | null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE - Clear a goal slot
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slot = searchParams.get("slot") as GoalSlot;

    if (!slot || !["primary", "secondary"].includes(slot)) {
      return NextResponse.json(
        { error: "Invalid slot parameter" },
        { status: 400 }
      );
    }

    if (slot === "primary") {
      await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { primaryGoal: Prisma.DbNull },
      });
    } else {
      await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { secondaryGoal: Prisma.DbNull },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing goal:", error);
    return NextResponse.json(
      { error: "Failed to clear goal" },
      { status: 500 }
    );
  }
}
