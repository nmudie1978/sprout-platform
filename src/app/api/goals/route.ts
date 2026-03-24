export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { CareerGoal, GoalSlot } from "@/lib/goals/types";

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

    // If changing the primary goal, save current progress then reset journey
    if (slot === "primary" && goal) {
      const currentProfile = await prisma.youthProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          primaryGoal: true,
          journeyState: true,
          journeyCompletedSteps: true,
          journeySkippedSteps: true,
          journeySummary: true,
        },
      });

      const currentGoal = currentProfile?.primaryGoal as CareerGoal | null;

      // Save current goal's progress before switching (if there is a current goal)
      if (currentGoal?.title && currentGoal.title !== goal.title) {
        const goalId = currentGoal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        try {
          await prisma.journeyGoalData.upsert({
            where: { userId_goalId: { userId: session.user.id, goalId } },
            create: {
              userId: session.user.id,
              goalId,
              goalTitle: currentGoal.title,
              journeyState: currentProfile!.journeyState,
              journeyCompletedSteps: currentProfile!.journeyCompletedSteps,
              journeySummary: currentProfile!.journeySummary || undefined,
            },
            update: {
              goalTitle: currentGoal.title,
              journeyState: currentProfile!.journeyState,
              journeyCompletedSteps: currentProfile!.journeyCompletedSteps,
              journeySummary: currentProfile!.journeySummary || undefined,
            },
          });
        } catch {
          // Non-blocking — save failed but we still switch
        }
      }

      // Check if the new goal has saved progress to restore
      if (currentGoal?.title !== goal.title) {
        const newGoalId = goal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let restored = false;
        try {
          const savedData = await prisma.journeyGoalData.findUnique({
            where: { userId_goalId: { userId: session.user.id, goalId: newGoalId } },
          });
          if (savedData) {
            // Restore saved progress for this goal
            await prisma.youthProfile.update({
              where: { userId: session.user.id },
              data: {
                journeyState: savedData.journeyState,
                journeyCompletedSteps: savedData.journeyCompletedSteps,
                journeySkippedSteps: Prisma.DbNull,
                journeySummary: savedData.journeySummary || undefined,
                journeyLastUpdated: new Date(),
              },
            });
            restored = true;
          }
        } catch {
          // Non-blocking
        }

        // If no saved progress, reset to beginning
        if (!restored) {
          const existingSummary = (currentProfile?.journeySummary as Record<string, unknown>) || {};
          await prisma.youthProfile.update({
            where: { userId: session.user.id },
            data: {
              journeyState: "REFLECT_ON_STRENGTHS",
              journeyCompletedSteps: [],
              journeySkippedSteps: Prisma.DbNull,
              journeySummary: {
                strengths: existingSummary.strengths || [],
                careerInterests: existingSummary.careerInterests || [],
              },
              journeyLastUpdated: new Date(),
            },
          });
        }
      }
    }

    // Upsert the profile with the new goal
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
