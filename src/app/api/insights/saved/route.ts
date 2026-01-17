import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Check if an industry is saved or get all saved industries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isSaved: false, savedIndustries: [] });
    }

    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get("industryId");

    if (industryId) {
      // Check if specific industry is saved
      const saved = await prisma.savedIndustry.findUnique({
        where: {
          userId_industryId: {
            userId: session.user.id,
            industryId,
          },
        },
      });
      return NextResponse.json({ isSaved: !!saved });
    }

    // Get all saved industries
    const savedIndustries = await prisma.savedIndustry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedIndustries });
  } catch (error) {
    console.error("Error fetching saved industries:", error);
    return NextResponse.json({ error: "Failed to fetch saved industries" }, { status: 500 });
  }
}

// POST - Save an industry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { industryId, notes } = body;

    if (!industryId) {
      return NextResponse.json({ error: "Industry ID required" }, { status: 400 });
    }

    const saved = await prisma.savedIndustry.create({
      data: {
        userId: session.user.id,
        industryId,
        notes,
      },
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: true, message: "Already saved" });
    }
    console.error("Error saving industry:", error);
    return NextResponse.json({ error: "Failed to save industry" }, { status: 500 });
  }
}

// DELETE - Unsave an industry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { industryId } = body;

    if (!industryId) {
      return NextResponse.json({ error: "Industry ID required" }, { status: 400 });
    }

    await prisma.savedIndustry.delete({
      where: {
        userId_industryId: {
          userId: session.user.id,
          industryId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: true, message: "Already removed" });
    }
    console.error("Error removing saved industry:", error);
    return NextResponse.json({ error: "Failed to remove saved industry" }, { status: 500 });
  }
}
