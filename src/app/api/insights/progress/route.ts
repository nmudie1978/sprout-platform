import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's progress for an industry
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ progress: [] });
    }

    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get("industryId");

    if (!industryId) {
      return NextResponse.json({ error: "Industry ID required" }, { status: 400 });
    }

    const progress = await prisma.industryProgress.findMany({
      where: {
        userId: session.user.id,
        industryId,
      },
      select: {
        stepId: true,
        stepType: true,
        completedAt: true,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// POST - Mark a step as completed
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { industryId, stepId, stepType } = body;

    if (!industryId || !stepId || !stepType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const progress = await prisma.industryProgress.create({
      data: {
        userId: session.user.id,
        industryId,
        stepId,
        stepType,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    // Handle unique constraint violation (already completed)
    if (error.code === "P2002") {
      return NextResponse.json({ success: true, message: "Already completed" });
    }
    console.error("Error saving progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

// DELETE - Unmark a step as completed
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { industryId, stepId, stepType } = body;

    if (!industryId || !stepId || !stepType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.industryProgress.delete({
      where: {
        userId_industryId_stepType_stepId: {
          userId: session.user.id,
          industryId,
          stepType,
          stepId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Handle not found
    if (error.code === "P2025") {
      return NextResponse.json({ success: true, message: "Already removed" });
    }
    console.error("Error removing progress:", error);
    return NextResponse.json({ error: "Failed to remove progress" }, { status: 500 });
  }
}
