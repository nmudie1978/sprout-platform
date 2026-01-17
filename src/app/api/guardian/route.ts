/**
 * Guardian Overview API
 * GET - Get guardian's overview (assignment, counts, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyGuardianAssignment, isAdmin } from "@/lib/community-guardian";

// GET /api/guardian - Get guardian overview
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(session.user.id);
    const assignment = await getMyGuardianAssignment(session.user.id);

    // If user is neither admin nor guardian, they can still view (just no data)
    if (!isAdminUser && !assignment.isGuardian) {
      return NextResponse.json({
        isGuardian: false,
        isAdmin: false,
        communityId: null,
        communityName: null,
        counts: {
          openReports: 0,
          underReviewReports: 0,
          totalReports: 0,
          totalJobsInCommunity: 0,
          pausedJobs: 0,
        },
      });
    }

    // Build counts query
    const communityId = assignment.communityId;

    let counts = {
      openReports: 0,
      underReviewReports: 0,
      totalReports: 0,
      totalJobsInCommunity: 0,
      pausedJobs: 0,
    };

    if (communityId || isAdminUser) {
      const reportWhere = communityId ? { communityId } : {};

      const [openReports, underReviewReports, totalReports] = await Promise.all([
        prisma.communityReport.count({
          where: { ...reportWhere, status: "OPEN" },
        }),
        prisma.communityReport.count({
          where: { ...reportWhere, status: "UNDER_REVIEW" },
        }),
        prisma.communityReport.count({
          where: reportWhere,
        }),
      ]);

      counts.openReports = openReports;
      counts.underReviewReports = underReviewReports;
      counts.totalReports = totalReports;

      // Job counts only if we have a specific community
      if (communityId) {
        const [totalJobs, pausedJobs] = await Promise.all([
          prisma.microJob.count({
            where: { communityId },
          }),
          prisma.microJob.count({
            where: { communityId, isPaused: true },
          }),
        ]);

        counts.totalJobsInCommunity = totalJobs;
        counts.pausedJobs = pausedJobs;
      }
    }

    return NextResponse.json({
      isGuardian: assignment.isGuardian,
      isAdmin: isAdminUser,
      communityId: assignment.communityId,
      communityName: assignment.communityName,
      counts,
    });
  } catch (error) {
    console.error("Error fetching guardian overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch guardian overview" },
      { status: 500 }
    );
  }
}
