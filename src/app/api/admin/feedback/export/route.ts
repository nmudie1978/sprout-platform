import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackToCsv } from "@/lib/feedback-stats";
import type { FeedbackRole } from "@prisma/client";

/**
 * GET /api/admin/feedback/export?role=PARENT_GUARDIAN
 *
 * Streams the raw Feedback table as CSV. Admin-only.
 * Accepts optional ?role= filter (TEEN_16_20 | PARENT_GUARDIAN | ADULT_OTHER).
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role") as FeedbackRole | null;
  const validRoles: FeedbackRole[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"];
  const role = roleParam && validRoles.includes(roleParam) ? roleParam : null;

  const rows = await prisma.feedback.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const csv = feedbackToCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = role
    ? `endeavrly-feedback-${role.toLowerCase()}-${stamp}.csv`
    : `endeavrly-feedback-${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
