/**
 * GET /api/insights/ingested  (admin only)
 *
 * Read-only list of the most recently RSS-ingested insight items, so the owner
 * can spot-check what the weekly cron promoted live (it goes live unreviewed).
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 401 }
    );
  }

  const items = await prisma.ingestedInsight.findMany({
    orderBy: { verifiedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ count: items.length, items });
}
