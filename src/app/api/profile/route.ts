import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { youthProfileSchema, profileVisibilitySchema } from "@/lib/validations/profile";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            ageBracket: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = youthProfileSchema.parse(body);

    // Check if profile already exists
    const existingProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PATCH to update." },
        { status: 400 }
      );
    }

    // Generate unique public profile slug
    const baseSlug = slugify(validatedData.displayName);
    let publicProfileSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.youthProfile.findUnique({ where: { publicProfileSlug } })
    ) {
      publicProfileSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const profile = await prisma.youthProfile.create({
      data: {
        userId: session.user.id,
        displayName: validatedData.displayName,
        phoneNumber: validatedData.phoneNumber || null,
        bio: validatedData.bio,
        availability: validatedData.availability,
        interests: validatedData.interests,
        guardianEmail: validatedData.guardianEmail,
        guardianConsent: validatedData.guardianConsent || false,
        publicProfileSlug,
        profileVisibility: false, // Default to private
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create profile" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Handle visibility toggle separately
    if ("profileVisibility" in body) {
      const visibilityData = profileVisibilitySchema.parse(body);

      const profile = await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { profileVisibility: visibilityData.profileVisibility },
      });

      return NextResponse.json(profile);
    }

    // Handle availability status separately
    if ("availabilityStatus" in body) {
      if (!["AVAILABLE", "BUSY", "NOT_LOOKING"].includes(body.availabilityStatus)) {
        return NextResponse.json(
          { error: "Invalid availability status" },
          { status: 400 }
        );
      }

      const profile = await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { availabilityStatus: body.availabilityStatus },
      });

      return NextResponse.json(profile);
    }

    // Handle avatar update separately
    if ("avatarId" in body && Object.keys(body).length === 1) {
      const profile = await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { avatarId: body.avatarId },
      });

      return NextResponse.json(profile);
    }

    // Handle full profile update
    const validatedData = youthProfileSchema.parse(body);

    const profile = await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: validatedData.displayName,
        avatarId: validatedData.avatarId,
        phoneNumber: validatedData.phoneNumber || null,
        bio: validatedData.bio,
        availability: validatedData.availability,
        interests: validatedData.interests,
        guardianEmail: validatedData.guardianEmail,
        guardianConsent: validatedData.guardianConsent,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}
