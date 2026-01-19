import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MAX_GOALS = 4;

const updateGoalsSchema = z.object({
  goals: z.array(z.string().min(1).max(100)).max(MAX_GOALS),
});

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goals } = updateGoalsSchema.parse(body);

    // Remove duplicates while preserving order
    const uniqueGoals = [...new Set(goals)];

    // Use upsert to create profile if it doesn't exist
    const updatedProfile = await prisma.youthProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        displayName: session.user.name || "User",
        careerAspiration: uniqueGoals.join(", "),
        desiredRoles: uniqueGoals,
        activeCareerGoal: uniqueGoals.length > 0 ? uniqueGoals[0] : null,
        pathUpdatedAt: new Date(),
      },
      update: {
        // Store as comma-separated in careerAspiration for backwards compatibility
        careerAspiration: uniqueGoals.join(", "),
        // Also store in desiredRoles array
        desiredRoles: uniqueGoals,
        // Set first goal as active if not already set
        activeCareerGoal: uniqueGoals.length > 0 ? uniqueGoals[0] : null,
        pathUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      goals: uniqueGoals,
      activeGoal: updatedProfile.activeCareerGoal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating career goals:", error);
    return NextResponse.json(
      { error: "Failed to update career goals" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        careerAspiration: true,
        desiredRoles: true,
        activeCareerGoal: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ goals: [], activeGoal: null });
    }

    // Parse goals from careerAspiration (comma-separated) or desiredRoles
    let goals: string[] = [];

    if (profile.careerAspiration) {
      goals = profile.careerAspiration
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    // Merge with desiredRoles if they contain different values
    if (profile.desiredRoles?.length) {
      for (const role of profile.desiredRoles) {
        if (!goals.includes(role)) {
          goals.push(role);
        }
      }
    }

    // Limit to max goals
    goals = goals.slice(0, MAX_GOALS);

    return NextResponse.json({
      goals,
      activeGoal: profile.activeCareerGoal || (goals.length > 0 ? goals[0] : null),
    });
  } catch (error) {
    console.error("Error fetching career goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch career goals" },
      { status: 500 }
    );
  }
}

// Update active career goal (for tab switching)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { activeGoal } = z.object({ activeGoal: z.string().nullable() }).parse(body);

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: { activeCareerGoal: activeGoal },
    });

    return NextResponse.json({ success: true, activeGoal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating active goal:", error);
    return NextResponse.json(
      { error: "Failed to update active goal" },
      { status: 500 }
    );
  }
}
