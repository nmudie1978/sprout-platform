import { NextResponse } from "next/server";
import { CAREER_PATHWAYS } from "@/lib/career-pathways";

// The career catalog is static reference content — identical for every
// user and only changes on deploy. Serving it from here (instead of
// statically importing the ~728KB CAREER_PATHWAYS constant into client
// bundles) keeps it out of every authenticated route's First Load JS;
// the client fetches it once and caches it (see use-career-catalog).
export const dynamic = "force-static";
export const revalidate = 86400; // 24h

export function GET() {
  const response = NextResponse.json(CAREER_PATHWAYS);
  response.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );
  return response;
}
