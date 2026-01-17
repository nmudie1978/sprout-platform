import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordLifeSkillEvent } from "@/lib/life-skills";

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
    const body = await req.json();
    const { status } = body;

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

    // Only job poster can accept/reject
    if (
      session.user.role === "EMPLOYER" &&
      application.job.postedById !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only applicant can withdraw
    if (
      session.user.role === "YOUTH" &&
      application.youthId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
