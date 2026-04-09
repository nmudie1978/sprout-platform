import { NextResponse } from "next/server";
import { getCareerDetails, hasDetailedContent } from "@/lib/career-typical-days";
import { getCareerById, getCategoryForCareer } from "@/lib/career-pathways";
import { getCareerProgression } from "@/lib/career-progressions";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const careerId = params.id;

  if (!careerId) {
    return NextResponse.json({ error: "Career ID required" }, { status: 400 });
  }

  // Get basic career info
  const career = getCareerById(careerId);
  if (!career) {
    return NextResponse.json({ error: "Career not found" }, { status: 404 });
  }

  // Get category
  const category = getCategoryForCareer(careerId);

  // Get detailed content (typical day). `getCareerDetails` always
  // returns at least the generic `defaultDetails` template, so the
  // Understand tab is never stuck on a "Loading…" placeholder for a
  // career that hasn't been hand-curated yet. `hasDetails` still
  // reports whether the entry was curated, so the UI can show a
  // quiet "generic content" hint if it wants to.
  const hasDetails = hasDetailedContent(careerId);
  const details = getCareerDetails(careerId);

  // Get progression data
  const progression = getCareerProgression(careerId);

  return NextResponse.json({
    career,
    category,
    details,
    progression,
    hasDetails,
  });
}
