import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus, BadgeType } from "@prisma/client";

// Helper function to check and award badges
async function checkAndAwardBadges(youthId: string) {
  try {
    // Get youth's stats
    const youthProfile = await prisma.youthProfile.findUnique({
      where: { userId: youthId },
    });

    if (!youthProfile) return;

    const completedJobs = youthProfile.completedJobsCount || 0;
    const avgRating = youthProfile.averageRating || 0;
    const reliabilityScore = youthProfile.reliabilityScore || 0;

    // Get existing badges
    const existingBadges = await prisma.badge.findMany({
      where: { youthId },
      select: { type: true },
    });
    const earnedTypes = new Set(existingBadges.map((b) => b.type));

    const badgesToAward: BadgeType[] = [];

    // Job milestone badges
    if (completedJobs >= 1 && !earnedTypes.has("FIRST_JOB")) {
      badgesToAward.push("FIRST_JOB");
    }
    if (completedJobs >= 5 && !earnedTypes.has("FIVE_JOBS")) {
      badgesToAward.push("FIVE_JOBS");
    }
    if (completedJobs >= 10 && !earnedTypes.has("TEN_JOBS")) {
      badgesToAward.push("TEN_JOBS");
    }
    if (completedJobs >= 25 && !earnedTypes.has("TWENTY_FIVE_JOBS")) {
      badgesToAward.push("TWENTY_FIVE_JOBS");
    }
    if (completedJobs >= 50 && !earnedTypes.has("FIFTY_JOBS")) {
      badgesToAward.push("FIFTY_JOBS");
    }

    // Rating badges
    if (avgRating >= 4.5 && completedJobs >= 3 && !earnedTypes.has("HIGHLY_RATED")) {
      badgesToAward.push("HIGHLY_RATED");
    }

    // Reliability badges
    if (reliabilityScore >= 90 && !earnedTypes.has("RELIABLE")) {
      badgesToAward.push("RELIABLE");
    }
    if (reliabilityScore >= 100 && !earnedTypes.has("SUPER_RELIABLE")) {
      badgesToAward.push("SUPER_RELIABLE");
    }

    // Check for first review badge
    const reviewCount = await prisma.review.count({
      where: { reviewedId: youthId },
    });
    if (reviewCount >= 1 && !earnedTypes.has("FIRST_REVIEW")) {
      badgesToAward.push("FIRST_REVIEW");
    }

    // Check for 5-star rating badge
    const fiveStarReviews = await prisma.review.count({
      where: { reviewedId: youthId, overall: 5 },
    });
    if (fiveStarReviews >= 1 && !earnedTypes.has("FIVE_STAR_RATING")) {
      badgesToAward.push("FIVE_STAR_RATING");
    }

    // Check for multi-talented badge (3+ categories)
    const earnings = await prisma.earning.findMany({
      where: { youthId },
      include: { job: { select: { category: true } } },
    });
    const uniqueCategories = new Set(earnings.map((e) => e.job.category));
    if (uniqueCategories.size >= 3 && !earnedTypes.has("MULTI_TALENTED")) {
      badgesToAward.push("MULTI_TALENTED");
    }

    // Award badges
    if (badgesToAward.length > 0) {
      await prisma.badge.createMany({
        data: badgesToAward.map((type) => ({
          youthId,
          type,
        })),
        skipDuplicates: true,
      });
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, statusReason } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Verify job belongs to this employer and get job details
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
          select: { youthId: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only manage your own jobs" },
        { status: 403 }
      );
    }

    // Update job status
    const updatedJob = await prisma.microJob.update({
      where: { id: params.id },
      data: {
        status: status as JobStatus,
        statusReason: statusReason || null,
      },
    });

    // If job is being marked as COMPLETED, create earning record and update youth profile
    if (status === "COMPLETED" && job.applications.length > 0) {
      const acceptedYouthId = job.applications[0].youthId;

      // Create earning record (upsert to avoid duplicates)
      await prisma.earning.upsert({
        where: {
          youthId_jobId: {
            youthId: acceptedYouthId,
            jobId: job.id,
          },
        },
        update: {
          amount: job.payAmount,
          earnedAt: new Date(),
        },
        create: {
          youthId: acceptedYouthId,
          jobId: job.id,
          amount: job.payAmount,
          status: "PENDING",
          earnedAt: new Date(),
        },
      });

      // Update youth profile completed jobs count
      await prisma.youthProfile.update({
        where: { userId: acceptedYouthId },
        data: {
          completedJobsCount: { increment: 1 },
        },
      });

      // Check and award any new badges
      await checkAndAwardBadges(acceptedYouthId);
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Failed to update job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }
}
