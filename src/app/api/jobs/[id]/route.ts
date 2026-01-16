import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase, JOB_IMAGES_BUCKET } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      include: {
        postedBy: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            employerProfile: {
              select: {
                id: true,
                companyName: true,
                companyLogo: true,
                phoneNumber: true,
                website: true,
                verified: true,
                averageRating: true,
                totalReviews: true,
                createdAt: true,
              },
            },
          },
        },
        applications: {
          include: {
            youth: {
              select: {
                id: true,
                youthProfile: {
                  select: {
                    displayName: true,
                    avatarId: true,
                    phoneNumber: true,
                    publicProfileSlug: true,
                    skillTags: true,
                    completedJobsCount: true,
                    averageRating: true,
                    availabilityStatus: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, startDate, endDate, title, description, location, payAmount, payType, applicationDeadline, duration, images } = body;

    // Verify job ownership and get current state
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
        },
      },
    });

    if (!job || job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if job has accepted applications (assigned to a youth worker)
    const hasAcceptedApplications = job.applications.length > 0;

    // When assigned, only description and location can be edited
    // Title, dates, pay, and duration are locked
    const isEditingLockedFields = title !== undefined ||
                                   startDate !== undefined ||
                                   endDate !== undefined ||
                                   payAmount !== undefined ||
                                   duration !== undefined ||
                                   applicationDeadline !== undefined;

    if (isEditingLockedFields && hasAcceptedApplications) {
      return NextResponse.json(
        { error: "Cannot edit title, dates, or pay after a youth worker has been assigned. Only description and address can be updated." },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (payAmount !== undefined) updateData.payAmount = payAmount;
    if (payType !== undefined) updateData.payType = payType;
    if (duration !== undefined) updateData.duration = duration;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
    if (images !== undefined) updateData.images = images;

    const updatedJob = await prisma.microJob.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify job ownership, status, and get images
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      select: { postedById: true, images: true, status: true },
    });

    if (!job || job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only allow deletion of cancelled jobs
    if (job.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Only cancelled jobs can be deleted. Please cancel the job first." },
        { status: 400 }
      );
    }

    // Delete images from Supabase Storage
    if (job.images && job.images.length > 0) {
      const imagePaths = job.images
        .map((url: string) => {
          const match = url.match(/job-images\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      if (imagePaths.length > 0) {
        await supabase.storage.from(JOB_IMAGES_BUCKET).remove(imagePaths);
      }
    }

    await prisma.microJob.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
