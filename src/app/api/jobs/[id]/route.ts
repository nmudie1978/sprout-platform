export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase, JOB_IMAGES_BUCKET } from "@/lib/supabase";
import { sanitizeText } from "@/lib/validation/sanitize";
import { apiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Viewer identity drives what PII we expose. The Prisma include
    // set is built to always fetch the safe fields; PII fields
    // (employer email/phone, applicant phone numbers, application
    // list) are pruned from the response UNLESS the viewer is:
    //   - the employer who posted this job
    //   - an ADMIN
    //
    // Previously this route selected `email`, `phoneNumber`, and the
    // full `applications` array unconditionally — any authenticated
    // youth could harvest employer contact info via the jobs API.
    // Direct violation of CLAUDE.md §Safeguarding "No Public Contact
    // Information Displayed". See F-L1 in the 2026-04-20 audit.
    const session = await getServerSession(authOptions);
    const viewerId = session?.user?.id ?? null;
    const viewerRole = session?.user?.role ?? null;

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
                badges: {
                  select: {
                    id: true,
                    type: true,
                    earnedAt: true,
                  },
                  orderBy: {
                    earnedAt: "desc",
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
      return apiError("NOT_FOUND", "Job not found", { request: req });
    }

    const isOwner = viewerId != null && job.postedById === viewerId;
    const isAdmin = viewerRole === "ADMIN";
    const canSeePii = isOwner || isAdmin;

    // Shape-safe projection. We copy the job object and strip fields
    // that the viewer isn't allowed to see. Using a literal rebuild
    // (not delete) so TS keeps the payload type clear.
    const safeJob = {
      ...job,
      postedBy: {
        ...job.postedBy,
        // Youth never see the employer's email — the conversation
        // thread (structured messages) is the only allowed channel.
        email: canSeePii ? job.postedBy.email : null,
        employerProfile: job.postedBy.employerProfile
          ? {
              ...job.postedBy.employerProfile,
              phoneNumber: canSeePii ? job.postedBy.employerProfile.phoneNumber : null,
            }
          : null,
      },
      // Applications are a private operational list — only the
      // employer who owns the job (and admins) see who applied,
      // their contact info, and their badge activity. Return an
      // empty array to keep the shape stable for consumers that
      // depend on `.length`.
      applications: canSeePii
        ? job.applications.map((app) => ({
            ...app,
            youth: {
              ...app.youth,
              youthProfile: app.youth.youthProfile
                ? {
                    ...app.youth.youthProfile,
                    // Even the owner doesn't get the applicant phone
                    // until they accept the application — the phone
                    // is for after-hire coordination. If a legitimate
                    // use case needs it pre-accept, do that via a
                    // separate authenticated lookup.
                    phoneNumber:
                      isAdmin || app.status === "ACCEPTED"
                        ? app.youth.youthProfile.phoneNumber
                        : null,
                  }
                : null,
            },
          }))
        : [],
    };

    return NextResponse.json(safeJob);
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return apiError("INTERNAL", "Failed to fetch job", { request: req });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
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
      return apiError("FORBIDDEN", "You don't have permission to edit this job", { request: req });
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
    if (title !== undefined) updateData.title = sanitizeText(String(title));
    if (description !== undefined) updateData.description = sanitizeText(String(description));
    if (location !== undefined) updateData.location = sanitizeText(String(location));
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
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
    }

    // Verify job ownership, status, and get images
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      select: { postedById: true, images: true, status: true },
    });

    if (!job || job.postedById !== session.user.id) {
      return apiError("FORBIDDEN", "You don't have permission to delete this job", { request: req });
    }

    // Only allow deletion of cancelled jobs
    if (job.status !== "CANCELLED") {
      return apiError("CONFLICT", "Only cancelled jobs can be deleted. Please cancel the job first.", {
        request: req,
        status: 400,
      });
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
