import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRecommendationSchema = z.object({
  status: z.enum(["VIEWED", "CONTACTED", "HIRED", "DISMISSED"]),
});

// PATCH /api/recommendations/[id] - Update recommendation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateRecommendationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Get the recommendation
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        recommended: {
          include: {
            youthProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
        recommender: {
          include: {
            youthProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // Only employer who owns the job can update status
    if (session.user.role !== "EMPLOYER" || recommendation.employerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the job owner can update recommendation status" },
        { status: 403 }
      );
    }

    // Update the recommendation
    const updatedRecommendation = await prisma.recommendation.update({
      where: { id },
      data: { status },
      include: {
        recommender: {
          include: {
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
              },
            },
          },
        },
        recommended: {
          include: {
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
            id: true,
            title: true,
          },
        },
      },
    });

    // Send notification to recommended youth if status is CONTACTED or HIRED
    if (status === "CONTACTED" || status === "HIRED") {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: session.user.id },
        select: { companyName: true },
      });

      const employerName = employerProfile?.companyName || "An employer";

      if (status === "CONTACTED") {
        await prisma.notification.create({
          data: {
            userId: recommendation.recommendedId,
            type: "SYSTEM",
            title: "Employer Interested!",
            message: `${employerName} is interested in you for "${recommendation.job.title}" based on a recommendation`,
            link: `/jobs/${recommendation.jobId}`,
          },
        });
      } else if (status === "HIRED") {
        // Notify the recommended youth
        await prisma.notification.create({
          data: {
            userId: recommendation.recommendedId,
            type: "SYSTEM",
            title: "Congratulations! 🎉",
            message: `You were hired for "${recommendation.job.title}" through a recommendation!`,
            link: `/jobs/${recommendation.jobId}`,
          },
        });

        // Notify the recommender
        await prisma.notification.create({
          data: {
            userId: recommendation.recommenderId,
            type: "SYSTEM",
            title: "Your Recommendation Helped!",
            message: `${recommendation.recommended.youthProfile?.displayName || "Your friend"} was hired for "${recommendation.job.title}" thanks to your recommendation!`,
            link: `/jobs/${recommendation.jobId}`,
          },
        });
      }
    }

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}

// GET /api/recommendations/[id] - Get single recommendation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        recommender: {
          include: {
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                completedJobsCount: true,
                averageRating: true,
              },
            },
          },
        },
        recommended: {
          include: {
            youthProfile: {
              select: {
                displayName: true,
                avatarId: true,
                completedJobsCount: true,
                averageRating: true,
                bio: true,
                skillTags: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            payAmount: true,
            payType: true,
          },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view
    const canView =
      recommendation.recommenderId === session.user.id ||
      recommendation.recommendedId === session.user.id ||
      recommendation.employerId === session.user.id;

    if (!canView) {
      return NextResponse.json(
        { error: "You don't have permission to view this recommendation" },
        { status: 403 }
      );
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation" },
      { status: 500 }
    );
  }
}
