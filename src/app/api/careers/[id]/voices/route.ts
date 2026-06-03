// src/app/api/careers/[id]/voices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCareerById } from "@/lib/career-pathways";
import { buildVoicesResponse } from "@/lib/career-voices/public";

/** GET /api/careers/[id]/voices — moderated real-human stories + contributions for a career. */
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const career = getCareerById(id);
  if (!career) {
    return NextResponse.json({ stories: [], contributions: [] });
  }

  try {
    const [stories, contributions] = await Promise.all([
      prisma.careerStory.findMany({ where: { published: true } }),
      prisma.careerPathContribution.findMany({ where: { status: "APPROVED" } }),
    ]);
    const body = buildVoicesResponse(career, stories, contributions);
    return NextResponse.json(body, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("[career-voices] error:", error);
    // Never 500 the detail sheet — degrade to empty.
    return NextResponse.json({ stories: [], contributions: [] }, { status: 200 });
  }
}

// ISR. Next requires a literal here.
export const revalidate = 300;
