import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/jobs/[id]/confirm-payment - Employer confirms payment for a completed job
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify job belongs to this employer and is completed
    const job = await prisma.microJob.findUnique({
      where: { id: params.id },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
          select: { youthId: true },
        },
        earnings: {
          select: { id: true, status: true, youthId: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only confirm payment for your own jobs" },
        { status: 403 }
      );
    }

    if (job.status !== "COMPLETED" && job.status !== "REVIEWED") {
      return NextResponse.json(
        { error: "Can only confirm payment for completed jobs" },
        { status: 400 }
      );
    }

    if (job.applications.length === 0) {
      return NextResponse.json(
        { error: "No assigned youth worker for this job" },
        { status: 400 }
      );
    }

    const youthId = job.applications[0].youthId;

    // Find or create the earning record and mark as confirmed
    const earning = await prisma.earning.upsert({
      where: {
        youthId_jobId: {
          youthId,
          jobId: job.id,
        },
      },
      update: {
        status: "CONFIRMED",
      },
      create: {
        youthId,
        jobId: job.id,
        amount: job.payAmount,
        status: "CONFIRMED",
        earnedAt: new Date(),
      },
    });

    // Create a notification for the youth worker
    await prisma.notification.create({
      data: {
        userId: youthId,
        type: "SYSTEM",
        title: "Work Completed",
        message: `Employer confirmed work completed for "${job.title}" (${job.payAmount} kr). Payment is arranged directly with the employer.`,
        link: `/dashboard`,
      },
    });

    return NextResponse.json({
      success: true,
      earning,
      message: "Payment confirmed successfully",
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}

// GET /api/jobs/[id]/confirm-payment - Check payment status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const earning = await prisma.earning.findFirst({
      where: { jobId: params.id },
      select: {
        id: true,
        amount: true,
        status: true,
        earnedAt: true,
      },
    });

    return NextResponse.json({
      hasEarning: !!earning,
      earning,
    });
  } catch (error) {
    console.error("Failed to check payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
