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
  if (careers.length === 0) {
    return NextResponse.json({ paths: [], count: 0 });
  }

  const paths = await prisma.careerPathContribution.findMany({
    where: {
      status: "APPROVED",
      careerTags: { hasSome: careers },
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
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return NextResponse.json({ paths, count: paths.length });
}
