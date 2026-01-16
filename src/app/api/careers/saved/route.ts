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

    const savedSwipes = await prisma.swipe.findMany({
      where: {
        youthId: session.user.id,
        saved: true,
      },
      include: {
        careerCard: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(savedSwipes);
  } catch (error) {
    console.error("Failed to fetch saved careers:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved careers" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const careerCardId = searchParams.get("careerCardId");

    if (!careerCardId) {
      return NextResponse.json(
        { error: "careerCardId is required" },
        { status: 400 }
      );
    }

    // Delete the swipe record entirely so the career becomes "unseen" again
    await prisma.swipe.deleteMany({
      where: {
        youthId: session.user.id,
        careerCardId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsave career:", error);
    return NextResponse.json(
      { error: "Failed to unsave career" },
      { status: 500 }
    );
  }
}
