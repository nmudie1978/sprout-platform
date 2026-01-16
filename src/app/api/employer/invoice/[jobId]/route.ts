import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/employer/invoice/[jobId] - Generate invoice data for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    const job = await prisma.microJob.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            email: true,
            employerProfile: {
              select: {
                companyName: true,
                phoneNumber: true,
              },
            },
          },
        },
        applications: {
          where: { status: "ACCEPTED" },
          include: {
            youth: {
              select: {
                id: true,
                email: true,
                youthProfile: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        },
        earnings: {
          select: {
            amount: true,
            status: true,
            earnedAt: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.postedById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Invoice only available for completed jobs" },
        { status: 400 }
      );
    }

    const worker = job.applications[0]?.youth;
    const earning = job.earnings[0];

    // Generate invoice number (simple format: INV-YYYYMMDD-JOBID)
    const completedDate = job.updatedAt;
    const invoiceNumber = `INV-${new Date(completedDate).toISOString().slice(0, 10).replace(/-/g, "")}-${job.id.slice(-6).toUpperCase()}`;

    const invoice = {
      invoiceNumber,
      issueDate: completedDate,

      employer: {
        companyName: job.postedBy.employerProfile?.companyName || "Employer",
        email: job.postedBy.email,
        phone: job.postedBy.employerProfile?.phoneNumber || "",
      },

      worker: worker
        ? {
            displayName: worker.youthProfile?.displayName || "Worker",
            email: worker.email,
          }
        : null,

      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category,
        location: job.location,
        startDate: job.startDate,
        duration: job.duration,
        completedAt: job.updatedAt,
      },

      payment: {
        amount: earning?.amount || job.payAmount,
        payType: job.payType,
        status: earning?.status || "PENDING",
        paidAt: earning?.earnedAt || null,
      },

      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to generate invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
