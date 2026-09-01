import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";

/**
 * GET /api/career-paths?career=software-developer&career=it-project-manager
 *
 * Returns approved career path contributions matching any of the given career tags.
 * Public endpoint — no auth required (paths are anonymised).
 */

/**
 * Hard ceiling on `?all=1`. That parameter used to lift the `take` entirely,
 * so one unauthenticated request selected every approved contribution ever
 * written — fine at today's row count, a memory and database problem later,
 * and free bulk collection of the contribution corpus meanwhile.
 */
const MAX_ALL_PATHS = 500;
/** Ceiling on tag filters, so a huge `?career=` list can't build a huge query. */
const MAX_CAREER_FILTERS = 50;

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const limit = await checkRateLimitAsync(`career-paths:${ip}`, RateLimits.GENEROUS);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: getRateLimitHeaders(limit.limit, limit.remaining, limit.reset),
      }
    );
  }

  const careers = req.nextUrl.searchParams.getAll("career").slice(0, MAX_CAREER_FILTERS);
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
      howIGotHere: true,
      whatIStudied: true,
      firstSalary: true,
      hardestPart: true,
      adviceToSeventeen: true,
      realityOfJob: true,
      careerTags: true,
      videoUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: all ? MAX_ALL_PATHS : 6,
  });

  return NextResponse.json({ paths, count: paths.length });
}
