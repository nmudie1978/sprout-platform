export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/badges/user/[userId] - Get badges for any user (public endpoint)
export async function GET(req: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const badges = await prisma.badge.findMany({
      where: { youthId: params.userId },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Failed to fetch user badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
