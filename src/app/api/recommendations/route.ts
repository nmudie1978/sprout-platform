import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRecommendationSchema = z.object({
  recommendedId: z.string().min(1, "Recommended user ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  message: z.string().max(500).optional(),
});

// GET /api/recommendations - Get recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    // Base query conditions
    const whereConditions: Record<string, unknown> = {};

    if (session.user.role === "YOUTH") {
      // Youth can see recommendations they made OR received
      whereConditions.OR = [
        { recommenderId: session.user.id },
        { recommendedId: session.user.id },
      ];
    } else if (session.user.role === "EMPLOYER") {
      // Employers can see recommendations for their jobs
      whereConditions.employerId = session.user.id;
    }

    // Filter by job if specified
    if (jobId) {
      whereConditions.jobId = jobId;
    }

    const recommendations = await prisma.recommendation.findMany({
      where: whereConditions,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

// POST /api/recommendations - Create a recommendation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only youth can recommend
    if (session.user.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Only youth workers can recommend others" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createRecommendationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { recommendedId, jobId, message } = validation.data;

    // Can't recommend yourself
    if (recommendedId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot recommend yourself" },
        { status: 400 }
      );
    }

    // Get the job and verify it exists and is POSTED
    const job = await prisma.microJob.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "POSTED") {
      return NextResponse.json(
        { error: "This job is not accepting recommendations" },
        { status: 400 }
      );
    }

    // Verify the recommended user exists and has a visible profile
    const recommendedUser = await prisma.user.findUnique({
      where: { id: recommendedId },
      include: {
        youthProfile: {
          select: {
            displayName: true,
            profileVisibility: true,
          },
        },
      },
    });

    if (!recommendedUser || recommendedUser.role !== "YOUTH") {
      return NextResponse.json(
        { error: "Recommended user not found" },
        { status: 404 }
      );
    }

    if (!recommendedUser.youthProfile?.profileVisibility) {
      return NextResponse.json(
        { error: "This user's profile is not visible" },
        { status: 400 }
      );
    }

    // Get recommender's profile for notification
    const recommenderProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true },
    });

    // Check for duplicate recommendation
    const existingRecommendation = await prisma.recommendation.findUnique({
      where: {
        recommenderId_recommendedId_jobId: {
          recommenderId: session.user.id,
          recommendedId,
          jobId,
        },
      },
    });

    if (existingRecommendation) {
      return NextResponse.json(
        { error: "You have already recommended this person for this job" },
        { status: 400 }
      );
    }

    // Create the recommendation
    const recommendation = await prisma.recommendation.create({
      data: {
        recommenderId: session.user.id,
        recommendedId,
        jobId,
        employerId: job.postedById,
        message: message?.trim() || null,
      },
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

    // Create notifications
    const recommenderName = recommenderProfile?.displayName || "A youth worker";
    const recommendedName = recommendedUser.youthProfile?.displayName || "Someone";

    // Notification to employer
    await prisma.notification.create({
      data: {
        userId: job.postedById,
        type: "NEW_RECOMMENDATION",
        title: "New Recommendation",
        message: `${recommenderName} recommended ${recommendedName} for your job "${job.title}"`,
        link: `/jobs/${jobId}`,
      },
    });

    // Notification to recommended youth
    await prisma.notification.create({
      data: {
        userId: recommendedId,
        type: "NEW_RECOMMENDATION",
        title: "You've Been Recommended!",
        message: `${recommenderName} recommended you for the job "${job.title}"`,
        link: `/jobs/${jobId}`,
      },
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to create recommendation" },
      { status: 500 }
    );
  }
}
