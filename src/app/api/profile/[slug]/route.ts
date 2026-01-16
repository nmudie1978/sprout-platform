import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSkillLevels, getTopSkills } from "@/lib/skills-mapping";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const profile = await prisma.youthProfile.findUnique({
      where: { publicProfileSlug: params.slug },
      include: {
        user: {
          select: {
            id: true,
            location: true,
            ageBracket: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if profile is public
    if (!profile.profileVisibility) {
      return NextResponse.json(
        { error: "This profile is private" },
        { status: 403 }
      );
    }

    // Get completed jobs to calculate skills
    const completedJobs = await prisma.microJob.findMany({
      where: {
        applications: {
          some: {
            youthId: profile.userId,
            status: "ACCEPTED",
          },
        },
        status: "COMPLETED",
      },
      select: {
        category: true,
      },
    });

    // Calculate skill levels
    const skillLevels = calculateSkillLevels(completedJobs);
    const topSkills = getTopSkills(skillLevels);

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: profile.userId,
      },
      select: {
        punctuality: true,
        communication: true,
        reliability: true,
        overall: true,
        positiveTags: true,
        createdAt: true,
        job: {
          select: {
            title: true,
            category: true,
          },
        },
        reviewer: {
          select: {
            employerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Aggregate positive tags
    const tagCounts: Record<string, number> = {};
    reviews.forEach((review) => {
      review.positiveTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Return public profile data
    return NextResponse.json({
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      bio: profile.bio,
      availability: profile.availability,
      interests: profile.interests,
      completedJobsCount: profile.completedJobsCount,
      averageRating: profile.averageRating,
      reliabilityScore: profile.reliabilityScore,
      location: profile.user.location,
      ageBracket: profile.user.ageBracket,
      skillLevels,
      topSkills,
      reviews: reviews.length,
      topTags,
    });
  } catch (error) {
    console.error("Failed to fetch public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
