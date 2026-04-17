export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildViewModel,
  JourneyReportDocument,
  type MapperInput,
} from "@/lib/reports/journey";
import { renderVariantBuffer } from "@/lib/reports/journey/variants/VariantDocument";
import { VARIANTS } from "@/lib/reports/journey/variants/variants";
import {
  getAllCareers,
  getSectorForCareer,
  getPensionNote,
  type Career,
} from "@/lib/career-pathways";
import {
  getCareerRequirements,
  getCertificationPath,
  getProgrammesForCareer,
} from "@/lib/education";
import { getCareerDetails } from "@/lib/career-typical-days";

/**
 * Resolve every data source (DB + career catalogue + education +
 * typical-day details) into the flat `MapperInput` the view-model
 * builder expects. Shared by POST (PDF) and GET (recommendations JSON)
 * so both endpoints produce identical content.
 */
async function resolveMapperInput(userId: string): Promise<MapperInput | null> {
  const [profile, user] = await Promise.all([
    prisma.youthProfile.findUnique({
      where: { userId },
      select: {
        primaryGoal: true,
        journeySummary: true,
        generatedTimeline: true,
        discoveryPreferences: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dateOfBirth: true },
    }),
  ]);

  if (!profile) return null;

  const activeGoalData = await prisma.journeyGoalData.findFirst({
    where: { userId, isActive: true },
    select: { journeySummary: true },
  });

  const primaryGoal = profile.primaryGoal as { title?: string } | null;
  const careerTitle = primaryGoal?.title ?? null;

  let career: Career | null = null;
  if (careerTitle) {
    const all = getAllCareers();
    career = all.find((c) => c.title.toLowerCase() === careerTitle.toLowerCase()) ?? null;
  }
  const careerId = career?.id ?? null;

  const careerRequirements = careerTitle
    ? getCareerRequirements(careerId ?? careerTitle)
    : null;
  const certificationPath = careerId && careerTitle
    ? getCertificationPath(careerId, careerTitle)
    : null;
  const programmes = careerTitle
    ? getProgrammesForCareer(careerId ?? careerTitle)
    : [];
  const careerDetails = careerId ? getCareerDetails(careerId) : null;
  const sector = careerId ? getSectorForCareer(careerId) : null;
  const pensionNote = sector ? getPensionNote(sector) : null;

  let userAge: number | null = null;
  if (user?.dateOfBirth) {
    const dob = new Date(user.dateOfBirth);
    if (!Number.isNaN(dob.getTime())) {
      const now = new Date();
      let a = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a -= 1;
      if (a >= 10 && a <= 30) userAge = a;
    }
  }

  return {
    primaryGoalTitle: careerTitle,
    journeySummary: (profile.journeySummary as Record<string, unknown>) ?? null,
    generatedTimeline: (profile.generatedTimeline as Record<string, unknown>) ?? null,
    activeGoalJourneySummary:
      (activeGoalData?.journeySummary as Record<string, unknown>) ?? null,
    discoverPreferences:
      (profile.discoveryPreferences as Record<string, unknown>) ?? null,
    career: career
      ? {
          id: career.id,
          title: career.title,
          description: career.description,
          avgSalary: career.avgSalary,
          educationPath: career.educationPath,
          keySkills: career.keySkills,
          dailyTasks: career.dailyTasks,
          growthOutlook: career.growthOutlook,
          sector: career.sector,
        }
      : null,
    careerDetails: careerDetails
      ? {
          whatYouActuallyDo: careerDetails.whatYouActuallyDo,
          whoThisIsGoodFor: careerDetails.whoThisIsGoodFor,
          topSkills: careerDetails.topSkills,
          entryPaths: careerDetails.entryPaths,
          realityCheck: careerDetails.realityCheck,
          typicalDay: careerDetails.typicalDay,
        }
      : null,
    careerRequirements: careerRequirements ?? null,
    certificationPath: certificationPath ?? null,
    programmes: programmes.map((p) => ({
      institution: p.institution,
      city: p.city,
      country: p.country,
      programme: p.programme,
      englishName: p.englishName,
      url: p.url,
      type: p.type,
      duration: p.duration,
      languageOfInstruction: p.languageOfInstruction,
      tuitionFee: p.tuitionFee,
    })),
    pensionNote,
    userAge,
    generatedIso: new Date().toISOString(),
  };
}

/**
 * POST /api/reports/my-journey
 * Generates the premium My Journey PDF report.
 *
 * Supports an optional `?variant=<key>` query param to render one of
 * the registered style variants (e.g. `whitepaper`, `11-whitepaper`).
 * The variant key can be the short slug after the numeric prefix or the
 * full key. Unknown variants fall back to the default editorial style.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = await resolveMapperInput(session.user.id);
    if (!input) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const vm = buildViewModel(input);
    const variantKey = new URL(req.url).searchParams.get("variant");
    const variant = variantKey
      ? VARIANTS.find(
          (v) =>
            v.key === variantKey ||
            v.key.replace(/^\d+-/, "") === variantKey,
        )
      : null;
    const pdfBuffer = variant
      ? await renderVariantBuffer(vm, variant)
      : ((await renderToBuffer(<JourneyReportDocument vm={vm} />)) as Buffer);

    const careerSlug = (vm.cover.careerTitle || "career")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "career";
    const datePart = new Date().toISOString().split("T")[0];
    const variantSuffix = variant ? `-${variant.key.replace(/^\d+-/, "")}` : "";
    const filename = `my-journey-report-${careerSlug}${variantSuffix}-${datePart}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("My Journey Report generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/reports/my-journey
 * Returns the `nextSteps` recommendations as JSON — the same list that
 * lands on the "Recommended next steps" page of the PDF. Used by the
 * celebration box on /my-journey so users see a discreet preview of
 * the guidance the full report surfaces.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = await resolveMapperInput(session.user.id);
    if (!input) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const vm = buildViewModel(input);
    return NextResponse.json({ nextSteps: vm.nextSteps });
  } catch (error) {
    console.error("My Journey recommendations fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 },
    );
  }
}
