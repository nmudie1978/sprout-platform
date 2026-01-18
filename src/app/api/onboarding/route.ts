import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/onboarding - Check onboarding status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        onboardingCompletedAt: true,
        careerAspiration: true,
        currentPriorities: true,
        availabilityLevel: true,
      },
    });

    if (!youthProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      needsOnboarding: !youthProfile.onboardingCompletedAt,
      completedAt: youthProfile.onboardingCompletedAt,
      careerAspiration: youthProfile.careerAspiration,
      currentPriorities: youthProfile.currentPriorities,
      availabilityLevel: youthProfile.availabilityLevel,
    });
  } catch (error) {
    console.error("Failed to check onboarding status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding - Complete onboarding
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { careerAspiration, currentPriorities, availabilityLevel } = body;

    // Validate priorities
    const validPriorities = ["earn", "skills", "explore", "prepare"];
    const validatedPriorities = (currentPriorities || []).filter(
      (p: string) => validPriorities.includes(p)
    );

    // Validate availability level
    const validAvailability = ["busy", "some", "plenty"];
    const validatedAvailability = validAvailability.includes(availabilityLevel)
      ? availabilityLevel
      : null;

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        careerAspiration: careerAspiration || undefined,
        currentPriorities: validatedPriorities,
        availabilityLevel: validatedAvailability,
        onboardingCompletedAt: new Date(),
        pathUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/onboarding - Reset onboarding (for testing)
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        onboardingCompletedAt: null,
        currentPriorities: [],
        availabilityLevel: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset onboarding:", error);
    return NextResponse.json(
      { error: "Failed to reset onboarding" },
      { status: 500 }
    );
  }
}
