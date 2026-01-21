import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { youthProfileSchema, profileVisibilitySchema, careerAspirationSchema } from "@/lib/validations/profile";
import { slugify } from "@/lib/utils";
import { AccountStatus } from "@prisma/client";
import { validateSignupAge, PLATFORM_MIN_AGE, PLATFORM_MAX_AGE } from "@/lib/safety/age";

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
            doNotDisturb: true,
            dateOfBirth: true,
            authProvider: true,
          },
        },
      },
    });

    // PROOF: Log avatar loaded from DB
    console.log("AVATAR LOADED FROM DB:", {
      userId: session.user.id,
      avatarId: profile?.avatarId ?? 'NO_PROFILE',
      profileExists: !!profile
    });

    const response = NextResponse.json(profile);
    // Add short cache for profile data - user-specific, private
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
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
        avatarId: validatedData.avatarId || null,
        phoneNumber: validatedData.phoneNumber || null,
        bio: validatedData.bio,
        availability: validatedData.availability,
        city: validatedData.city || null,
        interests: validatedData.interests,
        guardianEmail: validatedData.guardianEmail,
        guardianConsent: validatedData.guardianConsent || false,
        careerAspiration: validatedData.careerAspiration || null,
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

    // Handle doNotDisturb toggle (on User model, not YouthProfile)
    if ("doNotDisturb" in body && Object.keys(body).length === 1) {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { doNotDisturb: Boolean(body.doNotDisturb) },
        select: { doNotDisturb: true },
      });

      return NextResponse.json(user);
    }

    // Handle dateOfBirth update (on User model, not YouthProfile)
    if ("dateOfBirth" in body && Object.keys(body).length === 1) {
      // Validate dateOfBirth
      const dob = body.dateOfBirth ? new Date(body.dateOfBirth) : null;

      if (dob) {
        // Validate it's a valid date
        if (isNaN(dob.getTime())) {
          return NextResponse.json(
            { error: "Invalid date format" },
            { status: 400 }
          );
        }

        // Validate date is not in the future
        const today = new Date();
        if (dob > today) {
          return NextResponse.json(
            { error: "Date of birth cannot be in the future" },
            { status: 400 }
          );
        }

        // CRITICAL: Use canonical age validation from safety/age module
        // Platform policy: ages 16-20 only (same as signup)
        const ageValidation = validateSignupAge(dob);
        if (!ageValidation.valid) {
          return NextResponse.json(
            { error: ageValidation.error },
            { status: 400 }
          );
        }
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { dateOfBirth: dob },
        select: { dateOfBirth: true },
      });

      return NextResponse.json(user);
    }

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

    // Handle avatar update separately - use upsert to ensure persistence
    if ("avatarId" in body && Object.keys(body).length === 1) {
      const avatarId = body.avatarId;

      // PROOF: Log avatar save attempt
      console.log("AVATAR SAVE ATTEMPT:", { userId: session.user.id, avatarId });

      // Use upsert to handle case where profile doesn't exist yet
      const profile = await prisma.youthProfile.upsert({
        where: { userId: session.user.id },
        update: { avatarId },
        create: {
          userId: session.user.id,
          displayName: session.user.email?.split('@')[0] || 'User',
          avatarId,
          publicProfileSlug: `user-${session.user.id.slice(0, 8)}`,
          profileVisibility: false,
        },
      });

      // PROOF: Log avatar save success
      console.log("AVATAR SAVED TO DB:", { avatarId: profile.avatarId, profileId: profile.id });

      return NextResponse.json(profile);
    }

    // Handle career aspiration update separately
    if ("careerAspiration" in body && Object.keys(body).length === 1) {
      const aspirationData = careerAspirationSchema.parse(body);

      const profile = await prisma.youthProfile.update({
        where: { userId: session.user.id },
        data: { careerAspiration: aspirationData.careerAspiration || null },
      });

      return NextResponse.json(profile);
    }

    // Handle full profile update
    const validatedData = youthProfileSchema.parse(body);

    // Check if user is in ONBOARDING status and should be activated
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountStatus: true, youthAgeBand: true },
    });

    // Profile is complete if required fields are filled
    const hasRequiredFields = validatedData.displayName && validatedData.city;

    // Update profile including avatarId
    const profile = await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: validatedData.displayName,
        avatarId: validatedData.avatarId || undefined, // Include avatar if provided
        phoneNumber: validatedData.phoneNumber || null,
        bio: validatedData.bio,
        availability: validatedData.availability,
        city: validatedData.city || null,
        interests: validatedData.interests,
        guardianEmail: validatedData.guardianEmail,
        guardianConsent: validatedData.guardianConsent,
        careerAspiration: validatedData.careerAspiration || null,
      },
    });

    // If user is in ONBOARDING and has completed required fields, activate them
    if (user?.accountStatus === AccountStatus.ONBOARDING && hasRequiredFields) {
      // Check if under 18 (needs guardian consent first)
      const needsGuardianConsent = user.youthAgeBand === "UNDER_SIXTEEN" || user.youthAgeBand === "SIXTEEN_SEVENTEEN";

      if (needsGuardianConsent && !validatedData.guardianConsent) {
        // Under 18 without guardian consent -> PENDING_VERIFICATION
        await prisma.user.update({
          where: { id: session.user.id },
          data: { accountStatus: AccountStatus.PENDING_VERIFICATION },
        });
      } else {
        // 18+ or has guardian consent -> ACTIVE
        await prisma.user.update({
          where: { id: session.user.id },
          data: { accountStatus: AccountStatus.ACTIVE },
        });
      }
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}
