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

  // Get detailed content (typical day) - this is the large data
  const hasDetails = hasDetailedContent(careerId);
  const details = hasDetails ? getCareerDetails(careerId) : null;

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
