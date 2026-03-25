export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { MyJourneyPdfDocument, type JourneyReportData, type RoadmapItem, type SchoolTrackItem } from "@/lib/reports/myJourneyPdf";
import path from "path";
import { Font } from "@react-pdf/renderer";

// Register fonts
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

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        displayName: true,
        primaryGoal: true,
        journeySummary: true,
        generatedTimeline: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const summary = (profile.journeySummary as Record<string, unknown>) || {};
    const primaryGoal = profile.primaryGoal as { title?: string } | null;
    const reflections = (summary.discoverReflections as Record<string, unknown>) || {};
    const actionPlan = ((summary.rolePlans as unknown[]) || [])[0] as JourneyReportData["actionPlan"];

    // Education context
    const eduContext = (summary.educationContext as Record<string, unknown>) || null;

    // Education Roadmap (from generated timeline)
    const timeline = (profile.generatedTimeline as Record<string, unknown>) || null;
    let roadmapItems: RoadmapItem[] = [];
    let schoolTrack: SchoolTrackItem[] = [];
    let roadmapCareer: string | null = null;

    if (timeline) {
      roadmapCareer = (timeline.career as string) || null;
      const rawItems = (timeline.items as RoadmapItem[]) || [];
      roadmapItems = rawItems.map((item) => ({
        stage: item.stage || "foundation",
        title: item.title || "",
        subtitle: item.subtitle,
        startAge: item.startAge || 16,
        endAge: item.endAge,
        isMilestone: item.isMilestone || false,
        description: item.description,
        microActions: item.microActions,
      }));
      const rawSchool = (timeline.schoolTrack as SchoolTrackItem[]) || [];
      schoolTrack = rawSchool.map((item) => ({
        stage: item.stage || "foundation",
        title: item.title || "",
        subjects: item.subjects || [],
        personalLearning: item.personalLearning,
        startAge: item.startAge || 16,
        endAge: item.endAge,
      }));
    }

    const reportData: JourneyReportData = {
      userName: profile.displayName || "User",
      goalTitle: primaryGoal?.title || null,
      generatedDate: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      // Discover
      strengths: (summary.strengths as string[]) || [],
      motivations: (reflections.motivations as string[]) || [],
      workStyle: (reflections.workStyle as string[]) || [],
      growthAreas: (reflections.growthAreas as string[]) || [],
      roleModels: (reflections.roleModels as string) || "",
      experiences: (reflections.experiences as string) || "",
      careerInterests: (summary.careerInterests as string[]) || [],
      // Understand
      roleRealityNotes: (summary.roleRealityNotes as string[]) || [],
      industryInsightNotes: (summary.industryInsightNotes as string[]) || [],
      pathQualifications: (summary.pathQualifications as string[]) || [],
      pathSkills: (summary.pathSkills as string[]) || [],
      pathCourses: (summary.pathCourses as string[]) || [],
      pathRequirements: (summary.pathRequirements as string[]) || [],
      actionPlan: actionPlan || null,
      // Grow
      alignedActions: ((summary.alignedActions as { type: string; title: string }[]) || []),
      reflections: ((summary.alignedActionReflections as { response: string }[]) || []).map((r) => r.response),
      // School
      educationStage: eduContext
        ? (eduContext.stage as string) || null
        : null,
      schoolName: eduContext ? (eduContext.schoolName as string) || null : null,
      subjects: eduContext ? (eduContext.currentSubjects as string[]) || [] : [],
      expectedCompletion: eduContext ? (eduContext.expectedCompletion as string) || null : null,
      // Education Roadmap
      roadmapItems,
      schoolTrack,
      roadmapCareer,
    };

    const pdfBuffer = await renderToBuffer(
      <MyJourneyPdfDocument data={reportData} />
    );

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

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "My Journey Report API. Use POST to generate PDF.",
  });
}
