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
  status: z.enum(["exploring", "committed", "paused"]),
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

    // Determine which field to update
    const updateData =
      slot === "primary"
        ? { primaryGoal: goalWithTimestamp }
        : { secondaryGoal: goalWithTimestamp };

    // Upsert the profile
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
