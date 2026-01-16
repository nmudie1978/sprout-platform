import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/jobs/[id]/repost - Create a new job based on an existing one
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the original job
    const originalJob = await prisma.microJob.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        category: true,
        location: true,
        duration: true,
        payAmount: true,
        payType: true,
        requiredTraits: true,
        images: true,
        postedById: true,
      },
    });

    if (!originalJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (originalJob.postedById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { startDate, modifyTitle } = body;

    // Create the new job with optional modifications
    const newJob = await prisma.microJob.create({
      data: {
        title: modifyTitle
          ? `${originalJob.title} (Repost)`
          : originalJob.title,
        description: originalJob.description,
        category: originalJob.category,
        location: originalJob.location,
        startDate: startDate ? new Date(startDate) : null,
        duration: originalJob.duration,
        payAmount: originalJob.payAmount,
        payType: originalJob.payType,
        requiredTraits: originalJob.requiredTraits,
        images: originalJob.images,
        status: "POSTED",
        postedById: session.user.id,
      },
    });

    return NextResponse.json(
      { id: newJob.id, message: "Job reposted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to repost job:", error);
    return NextResponse.json(
      { error: "Failed to repost job" },
      { status: 500 }
    );
  }
}
