import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/[id]/messageable-jobs
 *
 * Returns jobs that the current user can message the target user about.
 * This enforces the safety requirement that all conversations must be tied to a job.
 *
 * Logic:
 * - If current user is YOUTH and target is EMPLOYER:
 *   Returns jobs posted by the employer where the youth has applied
 * - If current user is EMPLOYER and target is YOUTH:
 *   Returns jobs posted by the employer where the youth has applied
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

    // Can't message yourself
    if (targetUserId === currentUserId) {
      return NextResponse.json({ jobs: [] });
    }

    // Get target user's role
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let jobs: Array<{
      id: string;
      title: string;
      status: string;
      category: string;
    }> = [];

    if (currentUserRole === "YOUTH" && targetUser.role === "EMPLOYER") {
      // Youth messaging an Employer
      // Return jobs posted by the employer where youth has applied
      const applications = await prisma.application.findMany({
        where: {
          youthId: currentUserId,
          job: {
            postedById: targetUserId,
            // Only show jobs that are active or where youth was accepted
            OR: [
              { status: { in: ["POSTED", "ON_HOLD", "IN_PROGRESS", "ASSIGNED"] } },
              {
                applications: {
                  some: {
                    youthId: currentUserId,
                    status: "ACCEPTED",
                  },
                },
              },
            ],
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      jobs = applications
        .map((app) => app.job)
        .filter((job): job is NonNullable<typeof job> => job !== null);
    } else if (currentUserRole === "EMPLOYER" && targetUser.role === "YOUTH") {
      // Employer messaging a Youth
      // Return jobs posted by the employer where youth has applied
      const employerJobs = await prisma.microJob.findMany({
        where: {
          postedById: currentUserId,
          applications: {
            some: {
              youthId: targetUserId,
            },
          },
        },
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      jobs = employerJobs;
    } else if (currentUserRole === "EMPLOYER" && targetUser.role === "EMPLOYER") {
      // Employer to Employer - not typically allowed, return empty
      jobs = [];
    } else if (currentUserRole === "YOUTH" && targetUser.role === "YOUTH") {
      // Youth to Youth - not typically allowed, return empty
      jobs = [];
    }

    // Dedupe jobs by id (in case of multiple applications to same job)
    const uniqueJobs = Array.from(
      new Map(jobs.map((job) => [job.id, job])).values()
    );

    return NextResponse.json({ jobs: uniqueJobs });
  } catch (error) {
    console.error("Failed to fetch messageable jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch messageable jobs" },
      { status: 500 }
    );
  }
}
