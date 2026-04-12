import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/career-paths?status=PENDING
 * List contributed paths for admin review.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") || "PENDING";
  const paths = await prisma.careerPathContribution.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ paths });
}

/**
 * PATCH /api/admin/career-paths
 * Approve or reject a contributed path.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.careerPathContribution.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    },
  });

  return NextResponse.json({ path: updated });
}
