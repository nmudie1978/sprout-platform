import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/career-paths?career=software-developer&career=it-project-manager
 *
 * Returns approved career path contributions matching any of the given career tags.
 * Public endpoint — no auth required (paths are anonymised).
 */
export async function GET(req: NextRequest) {
  const careers = req.nextUrl.searchParams.getAll("career");
  const all = req.nextUrl.searchParams.get("all") === "1";

  const paths = await prisma.careerPathContribution.findMany({
    where: {
      status: "APPROVED",
      ...(careers.length > 0 && !all ? { careerTags: { hasSome: careers } } : {}),
    },
    select: {
      id: true,
      displayName: true,
      currentTitle: true,
      country: true,
      city: true,
      steps: true,
      careerTags: true,
      didAttendUniversity: true,
      yearsOfExperience: true,
      headline: true,
      advice: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    ...(!all ? { take: 6 } : {}),
  });

  return NextResponse.json({ paths, count: paths.length });
}
