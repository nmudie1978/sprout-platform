export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
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
