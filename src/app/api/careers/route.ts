import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unseen = searchParams.get("unseen") === "true";

    // Get all active career cards
    let careerCards = await prisma.careerCard.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // If requesting unseen cards only
    if (unseen) {
      const swipes = await prisma.swipe.findMany({
        where: {
          youthId: session.user.id,
        },
        select: {
          careerCardId: true,
        },
      });

      const seenCardIds = swipes.map((s) => s.careerCardId);
      careerCards = careerCards.filter((card) => !seenCardIds.includes(card.id));
    }

    return NextResponse.json(careerCards);
  } catch (error) {
    console.error("Failed to fetch career cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch career cards" },
      { status: 500 }
    );
  }
}
