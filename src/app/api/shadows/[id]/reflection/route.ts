import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch reflection for a shadow request
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
      include: { reflection: true },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    // Only youth or host can view reflection
    if (shadow.youthId !== session.user.id && shadow.hostId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(shadow.reflection || null);
  } catch (error) {
    console.error("Failed to fetch reflection:", error);
    return NextResponse.json(
      { error: "Failed to fetch reflection" },
      { status: 500 }
    );
  }
}

// POST - Create or update reflection (youth only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shadow = await prisma.shadowRequest.findUnique({
      where: { id },
      include: { reflection: true },
    });

    if (!shadow) {
      return NextResponse.json({ error: "Shadow request not found" }, { status: 404 });
    }

    // Only the youth who did the shadow can reflect
    if (shadow.youthId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Shadow must be completed
    if (shadow.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only reflect on completed shadows" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      whatSurprised,
      whatLiked,
      whatDisliked,
      skillsNoticed,
      wouldExplore,
      wouldExploreReason,
      keyTakeaways,
      questionsAsked,
      followUpActions,
      overallExperience,
      hostHelpfulness,
    } = body;

    // Validate keyTakeaways limit
    if (keyTakeaways && keyTakeaways.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 key takeaways allowed" },
        { status: 400 }
      );
    }

    // Create or update reflection
    const reflectionData = {
      whatSurprised: whatSurprised || null,
      whatLiked: whatLiked || null,
      whatDisliked: whatDisliked || null,
      skillsNoticed: skillsNoticed || [],
      wouldExplore: wouldExplore ?? null,
      wouldExploreReason: wouldExploreReason || null,
      keyTakeaways: keyTakeaways || [],
      questionsAsked: questionsAsked || [],
      followUpActions: followUpActions || [],
      overallExperience: overallExperience || null,
      hostHelpfulness: hostHelpfulness || null,
    };

    let reflection;

    if (shadow.reflection) {
      // Update existing reflection
      reflection = await prisma.shadowReflection.update({
        where: { id: shadow.reflection.id },
        data: reflectionData,
      });
    } else {
      // Create new reflection
      reflection = await prisma.shadowReflection.create({
        data: {
          shadowRequestId: id,
          youthId: session.user.id,
          ...reflectionData,
        },
      });
    }

    // Update journey integration flags
    const integrationUpdates: any = {
      addedToTimeline: true,
    };

    // Mark strengths as updated if skills were noticed
    if (skillsNoticed && skillsNoticed.length > 0) {
      integrationUpdates.strengthsUpdated = true;
    }

    // Mark goal stack updated if youth wants to explore further
    if (wouldExplore === true) {
      integrationUpdates.goalStackUpdated = true;
    }

    // Apply integration updates to reflection
    reflection = await prisma.shadowReflection.update({
      where: { id: reflection.id },
      data: integrationUpdates,
    });

    return NextResponse.json(reflection, { status: shadow.reflection ? 200 : 201 });
  } catch (error) {
    console.error("Failed to save reflection:", error);
    return NextResponse.json(
      { error: "Failed to save reflection" },
      { status: 500 }
    );
  }
}
