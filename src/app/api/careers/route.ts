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

    // Build where clause - optimized single query
    const whereClause: any = {
      active: true,
    };

    // If requesting unseen cards, exclude already-swiped cards in single query
    if (unseen) {
      // Get swiped card IDs in a single query using subquery pattern
      const swipedCardIds = await prisma.swipe.findMany({
        where: { youthId: session.user.id },
        select: { careerCardId: true },
      });

      if (swipedCardIds.length > 0) {
        whereClause.id = {
          notIn: swipedCardIds.map(s => s.careerCardId),
        };
      }
    }

    const careerCards = await prisma.careerCard.findMany({
      where: whereClause,
      orderBy: {
        order: "asc",
      },
    });

    const response = NextResponse.json(careerCards);
    // Add cache headers - careers data doesn't change often
    response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error("Failed to fetch career cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch career cards" },
      { status: 500 }
    );
  }
}
