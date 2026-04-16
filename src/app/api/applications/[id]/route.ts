export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordLifeSkillEvent } from "@/lib/life-skills";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "WITHDRAWN"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { status } = parsed.data;

    // Get application with job details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Per-role status authorisation:
    //   EMPLOYER (must own the job) → ACCEPTED, REJECTED
    //   YOUTH (must own the application) → WITHDRAWN
    // Without this gate a YOUTH could POST {status:"ACCEPTED"} on their
    // own application, self-accept, trigger the auto-reject of every
    // other applicant, and send "you got the job" notifications.
    const isEmployerOwner =
      session.user.role === "EMPLOYER" &&
      application.job.postedById === session.user.id;
    const isYouthOwner =
      session.user.role === "YOUTH" &&
      application.youthId === session.user.id;

    if (!isEmployerOwner && !isYouthOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (isYouthOwner && status !== "WITHDRAWN") {
      return NextResponse.json(
        { error: "Applicants may only withdraw their own application." },
        { status: 403 },
      );
    }
    if (isEmployerOwner && status === "WITHDRAWN") {
      return NextResponse.json(
        { error: "Only the applicant can withdraw their application." },
        { status: 403 },
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // If accepted, update job status to IN_PROGRESS and notify youth
    if (status === "ACCEPTED") {
      await prisma.microJob.update({
        where: { id: application.jobId },
        data: { status: "IN_PROGRESS" },
      });

      // Get employer info for notification
      const employer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          employerProfile: {
            select: { companyName: true },
          },
        },
      });

      // Notify the youth that their application was accepted
      await prisma.notification.create({
        data: {
          userId: application.youthId,
          type: "APPLICATION_ACCEPTED",
          title: "Application Accepted!",
          message: `${employer?.employerProfile?.companyName || "An employer"} accepted your application for "${application.job.title}"`,
          link: "/dashboard",
        },
      });

      // Record life skill event for JOB_ACCEPTED
      await recordLifeSkillEvent(
        application.youthId,
        "JOB_ACCEPTED",
        application.jobId,
        { jobTitle: application.job.title }
      );

      // Auto-reject all other pending applications for this job
      const otherPendingApplications = await prisma.application.findMany({
        where: {
          jobId: application.jobId,
          id: { not: id }, // Exclude the accepted application
          status: "PENDING",
        },
        select: {
          id: true,
          youthId: true,
        },
      });

      if (otherPendingApplications.length > 0) {
        // Update all other applications to REJECTED
        await prisma.application.updateMany({
          where: {
            jobId: application.jobId,
            id: { not: id },
            status: "PENDING",
          },
          data: { status: "REJECTED" },
        });

        // Send notifications to all rejected applicants
        await prisma.notification.createMany({
          data: otherPendingApplications.map((app) => ({
            userId: app.youthId,
            type: "APPLICATION_REJECTED",
            title: "Position Filled",
            message: `The position "${application.job.title}" has been filled. Keep applying — new opportunities are posted regularly!`,
            link: "/jobs",
          })),
        });
      }
    }

    // If rejected, notify the youth
    if (status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: application.youthId,
          type: "APPLICATION_REJECTED",
          title: "Application Update",
          message: `Your application for "${application.job.title}" was not selected`,
          link: "/dashboard",
        },
      });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Failed to update application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
