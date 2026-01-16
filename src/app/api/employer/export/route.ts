import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// GET /api/employer/export - Export employer data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "jobs";
    const formatType = searchParams.get("format") || "csv";

    if (type === "jobs") {
      const jobs = await prisma.microJob.findMany({
        where: { postedById: session.user.id },
        include: {
          applications: {
            where: { status: "ACCEPTED" },
            include: {
              youth: {
                select: {
                  youthProfile: {
                    select: { displayName: true },
                  },
                },
              },
            },
          },
          earnings: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (formatType === "csv") {
        const headers = [
          "Job ID",
          "Title",
          "Category",
          "Status",
          "Location",
          "Scheduled Date",
          "Pay Amount",
          "Pay Type",
          "Worker",
          "Payment Status",
          "Created At",
          "Completed At",
        ];

        const rows = jobs.map((job) => {
          const worker = job.applications[0]?.youth?.youthProfile?.displayName || "";
          const earning = job.earnings[0];
          return [
            job.id,
            `"${job.title.replace(/"/g, '""')}"`,
            job.category,
            job.status,
            `"${job.location.replace(/"/g, '""')}"`,
            job.scheduledDate ? format(new Date(job.scheduledDate), "yyyy-MM-dd") : "",
            job.payAmount.toString(),
            job.payType,
            `"${worker}"`,
            earning?.status || "",
            format(new Date(job.createdAt), "yyyy-MM-dd HH:mm"),
            job.completedAt ? format(new Date(job.completedAt), "yyyy-MM-dd HH:mm") : "",
          ];
        });

        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="jobs-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
          },
        });
      }

      // JSON format
      return NextResponse.json(jobs);
    }

    if (type === "spending") {
      const completedJobs = await prisma.microJob.findMany({
        where: {
          postedById: session.user.id,
          status: "COMPLETED",
        },
        include: {
          applications: {
            where: { status: "ACCEPTED" },
            include: {
              youth: {
                select: {
                  youthProfile: {
                    select: { displayName: true },
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
        orderBy: { completedAt: "desc" },
      });

      if (formatType === "csv") {
        const headers = [
          "Job ID",
          "Title",
          "Category",
          "Worker",
          "Amount Paid",
          "Payment Status",
          "Completed Date",
          "Payment Date",
        ];

        const rows = completedJobs.map((job) => {
          const worker = job.applications[0]?.youth?.youthProfile?.displayName || "";
          const earning = job.earnings[0];
          return [
            job.id,
            `"${job.title.replace(/"/g, '""')}"`,
            job.category,
            `"${worker}"`,
            earning?.amount?.toString() || job.payAmount.toString(),
            earning?.status || "PENDING",
            job.completedAt ? format(new Date(job.completedAt), "yyyy-MM-dd") : "",
            earning?.earnedAt ? format(new Date(earning.earnedAt), "yyyy-MM-dd") : "",
          ];
        });

        const totalSpent = completedJobs.reduce((sum, job) => {
          const earning = job.earnings[0];
          return sum + (earning?.amount || job.payAmount);
        }, 0);

        // Add summary row
        rows.push([]);
        rows.push(["TOTAL", "", "", "", totalSpent.toString(), "", "", ""]);

        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="spending-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
          },
        });
      }

      return NextResponse.json(completedJobs);
    }

    if (type === "workers") {
      const applications = await prisma.application.findMany({
        where: {
          job: {
            postedById: session.user.id,
            status: "COMPLETED",
          },
          status: "ACCEPTED",
        },
        include: {
          youth: {
            select: {
              id: true,
              email: true,
              youthProfile: {
                select: {
                  displayName: true,
                  completedJobsCount: true,
                  averageRating: true,
                },
              },
            },
          },
          job: {
            select: {
              payAmount: true,
              completedAt: true,
            },
          },
        },
      });

      // Aggregate by worker
      const workerMap = new Map<string, any>();
      for (const app of applications) {
        const youthId = app.youthId;
        if (!workerMap.has(youthId)) {
          workerMap.set(youthId, {
            id: youthId,
            displayName: app.youth.youthProfile?.displayName || "Unknown",
            email: app.youth.email,
            totalJobs: 0,
            totalPaid: 0,
            averageRating: app.youth.youthProfile?.averageRating,
            lastJobDate: null,
          });
        }
        const worker = workerMap.get(youthId)!;
        worker.totalJobs += 1;
        worker.totalPaid += app.job.payAmount;
        if (app.job.completedAt) {
          const jobDate = new Date(app.job.completedAt);
          if (!worker.lastJobDate || jobDate > new Date(worker.lastJobDate)) {
            worker.lastJobDate = app.job.completedAt;
          }
        }
      }

      const workers = Array.from(workerMap.values());

      if (formatType === "csv") {
        const headers = [
          "Worker ID",
          "Display Name",
          "Email",
          "Jobs Completed With You",
          "Total Paid",
          "Average Rating",
          "Last Job Date",
        ];

        const rows = workers.map((w) => [
          w.id,
          `"${w.displayName}"`,
          w.email,
          w.totalJobs.toString(),
          w.totalPaid.toString(),
          w.averageRating?.toFixed(1) || "",
          w.lastJobDate ? format(new Date(w.lastJobDate), "yyyy-MM-dd") : "",
        ]);

        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="workers-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
          },
        });
      }

      return NextResponse.json(workers);
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to export data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
