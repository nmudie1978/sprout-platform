export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { withDbRetry } from "@/lib/db-retry";
import { EMPTY_BOARD, type DecisionBoardState } from "@/lib/decision-board/types";

export const decisionBoardSchema = z.object({
  order: z.array(z.string().max(120)).max(200).optional().default([]),
  ruledOut: z.array(z.string().max(120)).max(200).optional().default([]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: { decisionBoard: true },
  });
  const board = (profile?.decisionBoard as DecisionBoardState | null) ?? EMPTY_BOARD;
  return NextResponse.json({ board });
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const board = decisionBoardSchema.parse(await request.json());
    await withDbRetry(() =>
      prisma.youthProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          displayName: session.user.name || "User",
          decisionBoard: board as unknown as Prisma.InputJsonValue,
        },
        update: { decisionBoard: board as unknown as Prisma.InputJsonValue },
      }),
    );
    return NextResponse.json({ success: true, board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid board", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error saving decision board:", error);
    return NextResponse.json({ error: "Failed to save board" }, { status: 500 });
  }
}
