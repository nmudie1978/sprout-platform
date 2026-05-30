export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveItem } from "@/lib/journey/saved-items-service";

/**
 * POST /api/career-twin/save-insight
 *
 * Save a Career Twin reply into the user's My Library. Reuses the existing
 * SavedItem store (source = "Career Twin"). The full insight lives in
 * `description`; `url` deep-links back to the Twin for this career.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content: string = (body.content ?? "").toString().trim();
    const careerId: string = (body.careerId ?? "").toString().trim();
    const careerTitle: string = (body.careerTitle ?? "").toString().trim();
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // Get or create the youth profile (mirrors the saved-items route).
    let profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      profile = await prisma.youthProfile.create({
        data: {
          userId: session.user.id,
          displayName: session.user.email?.split("@")[0] || "User",
        },
        select: { id: true },
      });
    }

    // Derive a short title from the first sentence of the insight.
    const firstSentence = content.split(/(?<=[.!?])\s/)[0] ?? content;
    const title = (
      careerTitle ? `Future ${careerTitle}: ` : "Career Twin: "
    ).concat(firstSentence).slice(0, 290);

    // Build an absolute deep-link back to the Twin (kept unique per save so
    // distinct insights don't collapse via the service's URL de-dupe).
    const base =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      req.nextUrl.origin ||
      "https://endeavrly.com";
    const url = `${base}/career-advisor?tab=twin${
      careerId ? `&career=${encodeURIComponent(careerId)}` : ""
    }&t=${Date.now()}`;

    const item = await saveItem({
      profileId: profile.id,
      userId: session.user.id,
      type: "ARTICLE",
      title,
      url,
      source: "Career Twin",
      tags: ["career-twin", ...(careerTitle ? [careerTitle] : [])],
      careerPathId: careerId || undefined,
      description: content.slice(0, 4000),
    });

    return NextResponse.json({ success: true, item: { id: item.id, title } });
  } catch (error) {
    console.error("[Career Twin] save-insight error:", error);
    return NextResponse.json({ error: "Failed to save insight" }, { status: 500 });
  }
}
