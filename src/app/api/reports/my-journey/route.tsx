import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { MyJourneyPdfDocument, type ReportData } from "@/lib/reports/myJourneyPdf";
import { z } from "zod";
import path from "path";
import { Font } from "@react-pdf/renderer";

// Register fonts with absolute paths for server-side rendering
const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Poppins",
  fonts: [
    { src: path.join(fontsDir, "Poppins-Medium.ttf"), fontWeight: 500 },
    { src: path.join(fontsDir, "Poppins-SemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "Inter-Medium.ttf"), fontWeight: 500 },
  ],
});

// Request body validation
const reportOptionsSchema = z.object({
  includeNotes: z.boolean().default(false),
  includeSmallJobs: z.boolean().default(true),
  includeInsightsPodcasts: z.boolean().default(true),
});

// Convert age band enum to display string
function getAgeBandDisplay(ageBand: string | null): string {
  switch (ageBand) {
    case "UNDER_SIXTEEN":
      return "Under 16";
    case "SIXTEEN_SEVENTEEN":
      return "16-17";
    case "EIGHTEEN_TWENTY":
      return "18-20";
    default:
      return "Not specified";
  }
}

// Get initials from name
function getInitials(name: string | null): string {
  if (!name) return "User";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse options
    let options = { includeNotes: false, includeSmallJobs: true, includeInsightsPodcasts: true };
    try {
      const body = await request.json();
      options = reportOptionsSchema.parse(body);
    } catch {
      // Use defaults if parsing fails
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        fullName: true,
        youthAgeBand: true,
        youthProfile: {
          select: {
            displayName: true,
            primaryGoal: true,
            secondaryGoal: true,
            notes: {
              orderBy: { createdAt: "desc" },
              take: 50,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get name - prefer initials for privacy
    const userName = user.fullName
      ? `${getInitials(user.fullName)} (${user.fullName.split(" ")[0]})`
      : user.youthProfile?.displayName || "User";

    // Prepare report data
    const reportData: ReportData = {
      userName,
      ageBand: getAgeBandDisplay(user.youthAgeBand),
      generatedDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      primaryGoal: user.youthProfile?.primaryGoal as ReportData["primaryGoal"],
      secondaryGoal: user.youthProfile?.secondaryGoal as ReportData["secondaryGoal"],
      notes: options.includeNotes
        ? (user.youthProfile?.notes || []).map((note) => ({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
          }))
        : [],
      // These fields may not exist in all schemas - provide empty defaults
      exploredCareers: [], // Would need to track this separately
      insightsViewed: [], // Would need to track this separately
      podcasts: [], // Would need to track this separately
      smallJobs: [], // Would need to fetch from jobs
      // Options
      includeNotes: options.includeNotes,
      includeSmallJobs: options.includeSmallJobs,
      includeInsightsPodcasts: options.includeInsightsPodcasts,
    };

    // Try to fetch completed jobs if available
    try {
      const completedJobs = await prisma.application.findMany({
        where: {
          youthId: session.user.id,
          status: "ACCEPTED",
        },
        select: {
          job: { select: { title: true } },
        },
        take: 10,
      });
      if (options.includeSmallJobs && completedJobs.length > 0) {
        reportData.smallJobs = completedJobs.map((app) => app.job.title);
      }
    } catch {
      // Jobs table may not exist or have different structure
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <MyJourneyPdfDocument data={reportData} />
    );

    // Return PDF response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="my-journey-report-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// GET endpoint for basic health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "My Journey Report API. Use POST with options to generate PDF.",
  });
}
