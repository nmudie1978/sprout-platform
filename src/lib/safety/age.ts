/**
 * CORE SAFETY INVARIANT: Age Verification & Platform Access
 *
 * This is the SINGLE SOURCE OF TRUTH for age-related safety checks.
 * All age gating decisions MUST use this module.
 *
 * PLATFORM AGE POLICY (v1.0):
 * - Target audience: 16-20 years old
 * - Under 16: HARD BLOCKED from platform (MVP)
 * - 16-17: Minor-safe defaults, guardian consent required for sensitive actions
 * - 18-20: Standard flow
 * - Over 20: Allowed but marked as "out of target" (may restrict in future)
 *
 * IMPORTANT: Never expose actual DOB to clients. Use age bands instead.
 */

import { prisma } from "@/lib/prisma";
import type { YouthAgeBand, AccountStatus } from "@prisma/client";

// ============================================
// CONSTANTS (Non-negotiable)
// ============================================

/** Platform minimum age - hard blocked below this */
export const PLATFORM_MIN_AGE = 16;

/** Platform maximum target age */
export const PLATFORM_MAX_AGE = 20;

/** Adult age threshold - no guardian consent needed */
export const ADULT_AGE = 18;

// ============================================
// TYPES
// ============================================

/** Age bands for platform access decisions */
export type AgeBand = "UNDER_16" | "AGE_16_17" | "AGE_18_20" | "OVER_20" | "UNKNOWN";

/** Guardian consent status */
export type ConsentStatus = "NOT_REQUIRED" | "PENDING" | "VERIFIED" | "REJECTED";

/** Platform access result */
export interface PlatformAccessResult {
  allowed: boolean;
  ageBand: AgeBand;
  reason: string;
  requiresGuardianConsent: boolean;
  consentStatus?: ConsentStatus;
}

/** User age info for internal use */
export interface UserAgeInfo {
  age: number | null;
  ageBand: AgeBand;
  dateOfBirth: Date | null;
  youthAgeBand: YouthAgeBand | null;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Calculate age from date of birth.
 * SINGLE SOURCE OF TRUTH for age calculation.
 *
 * @param dateOfBirth - User's date of birth
 * @param now - Reference date (defaults to now)
 * @returns Age in years, or null if DOB is null/invalid
 */
export function getAge(dateOfBirth: Date | string | null | undefined, now: Date = new Date()): number | null {
  if (!dateOfBirth) return null;

  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  if (isNaN(dob.getTime())) return null;

  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Convert age to platform age band.
 * NEVER send actual DOB to client - use this instead.
 *
 * @param age - Age in years
 * @returns AgeBand for access decisions
 */
export function getAgeBand(age: number | null): AgeBand {
  if (age === null) return "UNKNOWN";
  if (age < 16) return "UNDER_16";
  if (age <= 17) return "AGE_16_17";
  if (age <= 20) return "AGE_18_20";
  return "OVER_20";
}

/**
 * Map Prisma YouthAgeBand enum to our AgeBand.
 * Used when DOB is not available but enum is set.
 */
export function mapYouthAgeBandToAgeBand(youthAgeBand: YouthAgeBand | null): AgeBand {
  if (!youthAgeBand) return "UNKNOWN";

  switch (youthAgeBand) {
    case "UNDER_SIXTEEN":
      return "UNDER_16";
    case "SIXTEEN_SEVENTEEN":
      return "AGE_16_17";
    case "EIGHTEEN_TWENTY":
      return "AGE_18_20";
    default:
      return "UNKNOWN";
  }
}

/**
 * Determine if a user is allowed to use the platform based on age band and consent.
 *
 * CORE SAFETY INVARIANT:
 * - UNDER_16: NEVER allowed (hard block)
 * - AGE_16_17: Allowed only with guardian consent for sensitive actions
 * - AGE_18_20: Always allowed (standard flow)
 * - OVER_20: Allowed (out of target but permitted)
 * - UNKNOWN: NOT allowed (fail-safe)
 *
 * @param ageBand - User's age band
 * @param consentStatus - Guardian consent status (for minors)
 * @param checkSensitiveAction - If true, check consent for 16-17 year olds
 * @returns Whether user is allowed to use platform
 */
export function isAllowedToUsePlatform(
  ageBand: AgeBand,
  consentStatus?: ConsentStatus,
  checkSensitiveAction: boolean = false
): PlatformAccessResult {
  switch (ageBand) {
    case "UNDER_16":
      return {
        allowed: false,
        ageBand,
        reason: "Sprout is for users aged 16-20. You must be at least 16 to use this platform.",
        requiresGuardianConsent: false,
      };

    case "AGE_16_17":
      // For sensitive actions (messaging, applying), require guardian consent
      if (checkSensitiveAction) {
        const hasConsent = consentStatus === "VERIFIED";
        return {
          allowed: hasConsent,
          ageBand,
          reason: hasConsent
            ? "Access granted with guardian consent"
            : "Guardian consent is required for this action",
          requiresGuardianConsent: true,
          consentStatus: consentStatus || "PENDING",
        };
      }
      // For browsing, allow but mark as minor
      return {
        allowed: true,
        ageBand,
        reason: "Access granted (minor-safe mode)",
        requiresGuardianConsent: true,
        consentStatus: consentStatus || "PENDING",
      };

    case "AGE_18_20":
      return {
        allowed: true,
        ageBand,
        reason: "Access granted (target audience)",
        requiresGuardianConsent: false,
        consentStatus: "NOT_REQUIRED",
      };

    case "OVER_20":
      return {
        allowed: true,
        ageBand,
        reason: "Access granted (outside target age range)",
        requiresGuardianConsent: false,
        consentStatus: "NOT_REQUIRED",
      };

    case "UNKNOWN":
    default:
      return {
        allowed: false,
        ageBand: "UNKNOWN",
        reason: "Age verification required to use this platform",
        requiresGuardianConsent: false,
      };
  }
}

/**
 * Check if a user is a minor (under 18).
 */
export function isMinor(ageBand: AgeBand): boolean {
  return ageBand === "UNDER_16" || ageBand === "AGE_16_17";
}

/**
 * Check if guardian consent is required for this age band.
 */
export function requiresConsent(ageBand: AgeBand): boolean {
  return ageBand === "AGE_16_17";
}

// ============================================
// DATABASE HELPERS
// ============================================

/**
 * Get user's age info from database.
 * Handles both DOB and youthAgeBand fields.
 *
 * @param userId - User's ID
 * @returns UserAgeInfo with age, ageBand, and raw fields
 */
export async function getUserAgeInfo(userId: string): Promise<UserAgeInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dateOfBirth: true,
      youthAgeBand: true,
    },
  });

  if (!user) {
    return {
      age: null,
      ageBand: "UNKNOWN",
      dateOfBirth: null,
      youthAgeBand: null,
    };
  }

  // Prefer DOB for age calculation
  if (user.dateOfBirth) {
    const age = getAge(user.dateOfBirth);
    return {
      age,
      ageBand: getAgeBand(age),
      dateOfBirth: user.dateOfBirth,
      youthAgeBand: user.youthAgeBand,
    };
  }

  // Fallback to youthAgeBand enum
  return {
    age: null,
    ageBand: mapYouthAgeBandToAgeBand(user.youthAgeBand),
    dateOfBirth: null,
    youthAgeBand: user.youthAgeBand,
  };
}

/**
 * Get guardian consent status for a user.
 *
 * @param userId - User's ID
 * @returns ConsentStatus
 */
export async function getGuardianConsentStatus(userId: string): Promise<ConsentStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      youthProfile: {
        select: {
          guardianConsent: true,
          guardianEmail: true,
        },
      },
    },
  });

  if (!user?.youthProfile) {
    return "NOT_REQUIRED";
  }

  if (user.youthProfile.guardianConsent) {
    return "VERIFIED";
  }

  if (user.youthProfile.guardianEmail) {
    return "PENDING";
  }

  return "PENDING";
}

/**
 * Full platform access check for a user.
 * Combines age and consent checks.
 *
 * @param userId - User's ID
 * @param checkSensitiveAction - If true, verify consent for sensitive actions
 * @returns PlatformAccessResult
 */
export async function checkPlatformAccess(
  userId: string,
  checkSensitiveAction: boolean = false
): Promise<PlatformAccessResult> {
  const ageInfo = await getUserAgeInfo(userId);

  // Get consent status if minor
  let consentStatus: ConsentStatus = "NOT_REQUIRED";
  if (isMinor(ageInfo.ageBand)) {
    consentStatus = await getGuardianConsentStatus(userId);
  }

  return isAllowedToUsePlatform(ageInfo.ageBand, consentStatus, checkSensitiveAction);
}

/**
 * Validate age for signup.
 * Returns error message if age is invalid, null if valid.
 *
 * @param dateOfBirth - Date of birth string
 * @returns Error message or null
 */
export function validateSignupAge(dateOfBirth: string | Date): { valid: boolean; error?: string; ageBand: AgeBand } {
  const age = getAge(dateOfBirth);
  const ageBand = getAgeBand(age);

  if (age === null) {
    return { valid: false, error: "Invalid date of birth", ageBand: "UNKNOWN" };
  }

  if (ageBand === "UNDER_16") {
    return {
      valid: false,
      error: "Sprout is for users aged 16-20. You must be at least 16 to create an account.",
      ageBand,
    };
  }

  if (age > 25) {
    // Soft limit for youth platform
    return {
      valid: false,
      error: "This platform is designed for young people aged 16-20.",
      ageBand: "OVER_20",
    };
  }

  return { valid: true, ageBand };
}

// ============================================
// EXPORTS FOR CONVENIENCE
// ============================================

// Re-export constants with alternative names for convenience
export {
  PLATFORM_MIN_AGE as MIN_AGE,
  PLATFORM_MAX_AGE as MAX_AGE,
};
