export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitAsync, getRateLimitHeaders, RateLimits } from "@/lib/rate-limit";

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    // The only unauthenticated endpoint that returns anything about a real
    // young person. Throttle per IP so it can't be walked to harvest display
    // names, bios and interests in bulk.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const limit = await checkRateLimitAsync(`public-profile:${ip}`, RateLimits.STANDARD);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(limit.limit, limit.remaining, limit.reset),
        }
      );
    }

    if (!params.slug || params.slug.length > 128) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { publicProfileSlug: params.slug },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if profile is public
    if (!profile.profileVisibility) {
      return NextResponse.json(
        { error: "This profile is private" },
        { status: 403 }
      );
    }

    // Return public profile data. Deliberately minimal: a minor's
    // location and age band are NOT exposed on an anonymously-readable
    // public profile (data minimisation / youth safety — see CLAUDE.md
    // <safeguarding_rules> "No Public Personal Contact Display").
    return NextResponse.json({
      userId: profile.userId,
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      bio: profile.bio,
      interests: profile.interests,
    });
  } catch (error) {
    console.error("Failed to fetch public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
