import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/job";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = reviewSchema.parse(body);

    // Verify the job is completed and reviewer has permission
    const job = await prisma.microJob.findUnique({
      where: { id: validatedData.jobId },
      include: {
        applications: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });

    if (!job || job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Job must be completed before reviewing" },
        { status: 400 }
      );
    }

    // Verify reviewer is authorized (either employer who posted job OR youth who worked on it)
    const isEmployer = session.user.role === "EMPLOYER" && job.postedById === session.user.id;
    const isYouth = session.user.role === "YOUTH" && job.applications.some(
      (app) => app.youthId === session.user.id
    );

    if (!isEmployer && !isYouth) {
      return NextResponse.json(
        { error: "You are not authorized to review this job" },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        jobId_reviewerId_reviewedId: {
          jobId: validatedData.jobId,
          reviewerId: session.user.id,
          reviewedId: validatedData.reviewedId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this person for this job" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        ...validatedData,
        reviewerId: session.user.id,
      },
    });

    // Update ratings for the reviewed user (bidirectional support)
    await updateUserRating(validatedData.reviewedId);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 400 }
    );
  }
}

// Helper function to update user ratings (supports both youth and employer)
async function updateUserRating(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return;

  const reviews = await prisma.review.findMany({
    where: { reviewedId: userId },
  });

  if (reviews.length === 0) return;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.overall, 0) / reviews.length;

  if (user.role === "YOUTH") {
    // Update youth profile rating and increment job count
    await prisma.youthProfile.update({
      where: { userId },
      data: {
        averageRating: avgRating,
        completedJobsCount: {
          increment: 1,
        },
      },
    });
  } else if (user.role === "EMPLOYER") {
    // Update employer profile rating
    await prisma.employerProfile.update({
      where: { userId },
      data: {
        averageRating: avgRating,
        totalReviews: reviews.length,
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const withStats = searchParams.get("withStats") === "true";

    // If no userId provided, get current user's reviews with stats
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json(
          { error: "userId is required or must be authenticated" },
          { status: 400 }
        );
      }

      return getReviewsWithStats(session.user.id);
    }

    // Get reviews for specified user
    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: userId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            role: true,
            employerProfile: {
              select: {
                companyName: true,
                companyLogo: true,
                verified: true,
              },
            },
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
              },
            },
          },
        },
        job: {
          select: {
            title: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If withStats requested, calculate and return stats
    if (withStats) {
      return getReviewsWithStats(userId);
    }

    const response = NextResponse.json(reviews);
    // Add cache headers - reviews don't change frequently
    response.headers.set('Cache-Control', 'private, max-age=120, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Helper to get reviews with statistics
async function getReviewsWithStats(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      reviewedId: userId,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          role: true,
          employerProfile: {
            select: {
              companyName: true,
              companyLogo: true,
              verified: true,
            },
          },
          youthProfile: {
            select: {
              displayName: true,
              avatarId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate rating statistics
  const totalReviews = reviews.length;
  let avgOverall = 0;
  let avgPunctuality = 0;
  let avgCommunication = 0;
  let avgReliability = 0;

  if (totalReviews > 0) {
    avgOverall = reviews.reduce((sum, r) => sum + r.overall, 0) / totalReviews;
    avgPunctuality = reviews.reduce((sum, r) => sum + r.punctuality, 0) / totalReviews;
    avgCommunication = reviews.reduce((sum, r) => sum + r.communication, 0) / totalReviews;
    avgReliability = reviews.reduce((sum, r) => sum + r.reliability, 0) / totalReviews;
  }

  // Aggregate positive tags
  const tagCounts: Record<string, number> = {};
  reviews.forEach((review) => {
    review.positiveTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }));

  // Calculate rating distribution (1-5 stars)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rounded = Math.round(review.overall);
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded]++;
    }
  });

  // Determine rating tier
  let tier: "BRONZE" | "SILVER" | "GOLD" | "NONE" = "NONE";
  if (totalReviews >= 10 && avgOverall >= 4.5) {
    tier = "GOLD";
  } else if (totalReviews >= 5 && avgOverall >= 4.0) {
    tier = "SILVER";
  } else if (totalReviews >= 2 && avgOverall >= 3.5) {
    tier = "BRONZE";
  }

  const response = NextResponse.json({
    reviews,
    stats: {
      totalReviews,
      avgOverall: Math.round(avgOverall * 10) / 10,
      avgPunctuality: Math.round(avgPunctuality * 10) / 10,
      avgCommunication: Math.round(avgCommunication * 10) / 10,
      avgReliability: Math.round(avgReliability * 10) / 10,
      distribution,
      topTags,
      tier,
    },
  });
  // Add cache headers for reviews with stats
  response.headers.set('Cache-Control', 'private, max-age=120, stale-while-revalidate=300');
  return response;
}
