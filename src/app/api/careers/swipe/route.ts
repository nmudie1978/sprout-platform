import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SwipeDirection } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { careerCardId, direction } = await req.json();

    if (!careerCardId || !direction) {
      return NextResponse.json(
        { error: "careerCardId and direction are required" },
        { status: 400 }
      );
    }

    // Check if already swiped
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        youthId_careerCardId: {
          youthId: session.user.id,
          careerCardId,
        },
      },
    });

    if (existingSwipe) {
      // Update existing swipe
      const updatedSwipe = await prisma.swipe.update({
        where: { id: existingSwipe.id },
        data: {
          direction: direction as SwipeDirection,
          saved: direction === "RIGHT" || direction === "UP",
        },
      });
      return NextResponse.json(updatedSwipe);
    }

    // Create new swipe
    const swipe = await prisma.swipe.create({
      data: {
        youthId: session.user.id,
        careerCardId,
        direction: direction as SwipeDirection,
        saved: direction === "RIGHT" || direction === "UP",
      },
    });

    return NextResponse.json(swipe, { status: 201 });
  } catch (error: any) {
    console.error("Failed to record swipe:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record swipe" },
      { status: 400 }
    );
  }
}
