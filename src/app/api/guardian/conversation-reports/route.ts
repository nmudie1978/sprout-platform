import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/guardian/conversation-reports - Get conversation reports for moderation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;

    // Only admins and guardians can view conversation reports
    if (userRole !== "ADMIN" && userRole !== "COMMUNITY_GUARDIAN") {
      return NextResponse.json(
        { error: "Not authorized to view reports" },
        { status: 403 }
      );
    }

    // Get filter from query params
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build where clause
    const whereClause: any = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const reports = await prisma.conversationReport.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: {
            id: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        reported: {
          select: {
            id: true,
            role: true,
            youthProfile: { select: { displayName: true } },
            employerProfile: { select: { companyName: true } },
          },
        },
        conversation: {
          select: {
            id: true,
            status: true,
            frozenAt: true,
            frozenReason: true,
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    // Get summary counts
    const counts = await prisma.conversationReport.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const countsByStatus = counts.reduce(
      (acc, c) => {
        acc[c.status] = c._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      reports,
      counts: {
        total: reports.length,
        open: countsByStatus["OPEN"] || 0,
        inReview: countsByStatus["IN_REVIEW"] || 0,
        resolved: countsByStatus["RESOLVED"] || 0,
        dismissed: countsByStatus["DISMISSED"] || 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch conversation reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation reports" },
      { status: 500 }
    );
  }
}
