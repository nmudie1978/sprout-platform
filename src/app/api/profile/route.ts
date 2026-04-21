export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRLSContext } from "@/lib/prisma";
import { youthProfileSchema, profileVisibilitySchema, careerAspirationSchema } from "@/lib/validations/profile";
import { slugify } from "@/lib/utils";
import { AccountStatus } from "@prisma/client";
import { validateSignupAge, PLATFORM_MIN_AGE, PLATFORM_MAX_AGE } from "@/lib/safety/age";
import { apiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
    }

    // L4 phase-1 RLS wrap. Once phase 2 forces RLS, the
    // youth_profile_self_read policy restricts the YouthProfile
    // row to the userId matching the session context — so any
    // future code path that drops the `where: { userId }` still
    // can't return another user's profile.
    const profile = await withRLSContext(session.user.id, (tx) =>
      tx.youthProfile.findUnique({
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
      }),
    );

    // Strip PII fields that should never travel to the client browser.
    // The fields exist in the DB for backend use (guardian flow, admin
    // view) but must not appear in the JSON response — even to the
    // profile owner — to satisfy GDPR data-minimisation and prevent
    // leaks via browser devtools, Sentry breadcrumbs, or TanStack
    // Query cache. phoneNumber + surname + guardianEmail are the three
    // fields identified in the T3 security audit.
    const { phoneNumber: _pn, surname: _sn, guardianEmail: _ge, ...safeProfile } = profile ?? {};
    const response = NextResponse.json(safeProfile);
    // No caching to ensure avatar changes are reflected immediately
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return apiError("INTERNAL", "Failed to fetch profile", { request: req });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
    }

    const body = await req.json();
    const validatedData = youthProfileSchema.parse(body);

    // Check if profile already exists
    const existingProfile = await prisma.youthProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return apiError("CONFLICT", "Profile already exists. Use PATCH to update.", { request: req });
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
    return apiError("VALIDATION_FAILED", error.message || "Failed to create profile", { request: req });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "YOUTH") {
      return apiError("UNAUTHORIZED", "Please sign in", { request: req });
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
          return apiError("VALIDATION_FAILED", "Invalid date format", { request: req, details: { field: "dateOfBirth" } });
        }

        // Validate date is not in the future
        const today = new Date();
        if (dob > today) {
          return apiError("VALIDATION_FAILED", "Date of birth cannot be in the future", { request: req, details: { field: "dateOfBirth" } });
        }

        // CRITICAL: Use canonical age validation from safety/age module
        // Platform policy: ages 15-23 only (same as signup)
        const ageValidation = validateSignupAge(dob);
        if (!ageValidation.valid) {
          return apiError("VALIDATION_FAILED", ageValidation.error || "Age not allowed", { request: req, details: { field: "dateOfBirth" } });
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
        return apiError("VALIDATION_FAILED", "Invalid availability status", { request: req, details: { field: "availabilityStatus" } });
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

      const response = NextResponse.json(profile);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Handle discovery preferences update separately
    // Shape: { subjects?: string[], workStyles?: string[], peoplePref?: string, interests?: string[] }
    if ("discoveryPreferences" in body && Object.keys(body).length === 1) {
      const dp = body.discoveryPreferences;

      // Allow null to clear preferences
      if (dp !== null && (typeof dp !== "object" || Array.isArray(dp))) {
        return apiError("VALIDATION_FAILED", "discoveryPreferences must be an object or null", {
          request: req,
          details: { field: "discoveryPreferences" },
        });
      }

      // Light validation — strip unknown fields, cap array sizes
      const sanitized = dp
        ? {
            subjects: Array.isArray(dp.subjects) ? dp.subjects.slice(0, 20).map(String) : [],
            starredSubjects: Array.isArray(dp.starredSubjects) ? dp.starredSubjects.slice(0, 20).map(String) : [],
            workStyles: Array.isArray(dp.workStyles) ? dp.workStyles.slice(0, 10).map(String) : [],
            peoplePref: typeof dp.peoplePref === "string" ? dp.peoplePref.slice(0, 50) : undefined,
            interests: Array.isArray(dp.interests) ? dp.interests.slice(0, 30).map(String) : [],
          }
        : null;

      const profile = await prisma.youthProfile.upsert({
        where: { userId: session.user.id },
        update: { discoveryPreferences: sanitized as any },
        create: {
          userId: session.user.id,
          displayName: session.user.email?.split("@")[0] || "User",
          publicProfileSlug: `user-${session.user.id.slice(0, 8)}`,
          profileVisibility: false,
          discoveryPreferences: sanitized as any,
        },
      });

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

    // Update profile — avatarId is intentionally excluded here.
    // Avatar changes go exclusively through /api/profile/avatar to prevent
    // stale formData from overwriting a recently-saved avatar.
    const profile = await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: validatedData.displayName,
        surname: validatedData.surname || null,
        phoneNumber: validatedData.phoneNumber || null,
        bio: validatedData.bio || null,
        availability: validatedData.availability || null,
        city: validatedData.city || null,
        interests: validatedData.interests,
        guardianEmail: validatedData.guardianEmail || null,
        ...(validatedData.guardianConsent !== undefined && { guardianConsent: validatedData.guardianConsent }),
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
    return apiError("VALIDATION_FAILED", error.message || "Failed to update profile", { request: req });
  }
}
