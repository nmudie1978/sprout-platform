/**
 * Age Policy Utilities
 *
 * Core utility functions for age safety system:
 * - Age calculation and bracket derivation
 * - Eligibility checks
 * - Policy enforcement
 * - Audit logging
 *
 * LANGUAGE: English only.
 */

import { prisma } from "@/lib/prisma";
import {
  JobCategory,
  JobRiskCategory,
  AgeEligibilityAction,
  YouthAgeBand,
  Prisma,
} from "@prisma/client";
import {
  CURRENT_POLICY_VERSION,
  BASELINE_MIN_AGE_BY_RISK,
  getCategoryRule,
  getBaselineMinAge,
  getNextAgeUnlock,
  type AgePolicyConfig,
  type CategoryRule,
} from "./policy";

// ============================================
// AGE CALCULATION
// ============================================

/**
 * Calculate age in years from date of birth
 */
export function computeAgeYears(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Derive YouthAgeBand from age in years
 */
export function deriveAgeBracket(ageYears: number): YouthAgeBand | null {
  if (ageYears < 16) return "UNDER_SIXTEEN";
  if (ageYears >= 16 && ageYears <= 17) return "SIXTEEN_SEVENTEEN";
  if (ageYears >= 18 && ageYears <= 20) return "EIGHTEEN_TWENTY";
  return null; // Outside youth age range
}

/**
 * Get age bracket string for display
 */
export function getAgeBracketDisplay(bracket: YouthAgeBand | null): string {
  switch (bracket) {
    case "UNDER_SIXTEEN":
      return "Under 16";
    case "SIXTEEN_SEVENTEEN":
      return "16-17";
    case "EIGHTEEN_TWENTY":
      return "18-20";
    default:
      return "Unknown";
  }
}

// ============================================
// ELIGIBILITY CHECKS
// ============================================

/**
 * Check if a user is eligible for a job based on age
 */
export function isEligible(userAgeYears: number, jobMinAge: number): boolean {
  return userAgeYears >= jobMinAge;
}

/**
 * Check if user can apply to a job (server-side enforcement)
 */
export async function canApplyToJob(
  userId: string,
  jobId: string
): Promise<{ allowed: boolean; reason: string; userAge?: number; requiredAge?: number }> {
  // Fetch user and job
  const [user, job] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, dateOfBirth: true, youthAgeBand: true },
    }),
    prisma.microJob.findUnique({
      where: { id: jobId },
      select: { id: true, minimumAge: true, title: true },
    }),
  ]);

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  if (!job) {
    return { allowed: false, reason: "Job not found" };
  }

  if (!user.dateOfBirth) {
    return { allowed: false, reason: "Date of birth not set" };
  }

  const userAge = computeAgeYears(user.dateOfBirth);
  const requiredAge = job.minimumAge;

  if (userAge < requiredAge) {
    return {
      allowed: false,
      reason: `You must be at least ${requiredAge} years old to apply for this job`,
      userAge,
      requiredAge,
    };
  }

  return { allowed: true, reason: "Eligible", userAge, requiredAge };
}

// ============================================
// CATEGORY RULE DERIVATION
// ============================================

/**
 * Derive risk category and baseline minimum age from job category
 */
export function deriveCategoryRule(category: JobCategory): {
  riskCategory: JobRiskCategory;
  baselineMinAge: number;
  requiresAdultPresent: boolean;
  constraints?: CategoryRule["constraints"];
} {
  const rule = getCategoryRule(category);
  return {
    riskCategory: rule.riskCategory,
    baselineMinAge: rule.baselineMinAge,
    requiresAdultPresent: rule.requiresAdultPresentDefault,
    constraints: rule.constraints,
  };
}

/**
 * Enforce minimum age floor - employer cannot set below baseline
 * Returns the adjusted minAge and whether an adjustment was made
 */
export function enforceMinAgeFloor(
  category: JobCategory,
  requestedMinAge: number
): { adjustedMinAge: number; wasAdjusted: boolean } {
  const rule = getCategoryRule(category);
  const baseline = rule.baselineMinAge;

  if (requestedMinAge < baseline) {
    return { adjustedMinAge: baseline, wasAdjusted: true };
  }

  return { adjustedMinAge: requestedMinAge, wasAdjusted: false };
}

// ============================================
// POLICY MANAGEMENT
// ============================================

/**
 * Get the currently active age policy from the database
 * Falls back to code-defined policy if none in database
 */
export async function getActiveAgePolicy(): Promise<{
  version: number;
  policyJson: AgePolicyConfig;
}> {
  const activePolicy = await prisma.agePolicy.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { version: "desc" },
  });

  if (activePolicy) {
    return {
      version: activePolicy.version,
      policyJson: activePolicy.policyJson as unknown as AgePolicyConfig,
    };
  }

  // Fallback to code-defined policy
  return {
    version: CURRENT_POLICY_VERSION,
    policyJson: {
      version: CURRENT_POLICY_VERSION,
      baselineMinAgeByRisk: BASELINE_MIN_AGE_BY_RISK,
      categoryRules: [],
      constraintFlags: {
        nightWorkDisallowedUnder18: true,
        chemicalsDisallowedUnder18: true,
        powerToolsDisallowedUnder18: true,
        heightsDisallowedUnder18: true,
        maxLiftingKgUnder16: 5,
        maxLiftingKgUnder18: 10,
      },
    },
  };
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log an age eligibility event to the audit log
 */
export async function logAgeEligibilityEvent(params: {
  workerId?: string;
  jobId: string;
  action: AgeEligibilityAction;
  reason: string;
  requiredMinAge: number;
  userAgeYears?: number;
  userAgeBracket?: string;
}): Promise<void> {
  const policy = await getActiveAgePolicy();

  await prisma.ageEligibilityAuditLog.create({
    data: {
      workerId: params.workerId,
      jobId: params.jobId,
      action: params.action,
      reason: params.reason,
      requiredMinAge: params.requiredMinAge,
      userAge: params.userAgeYears,
      userAgeBracket: params.userAgeBracket,
      policyVersion: policy.version,
    },
  });
}

// ============================================
// JOB VISIBILITY HELPERS
// ============================================

/**
 * Build Prisma where clause for age-filtered job queries
 * This is the core filter for job visibility
 */
export function buildAgeEligibilityFilter(
  userAge: number,
  includeIneligible: boolean = false
): Prisma.MicroJobWhereInput {
  if (includeIneligible) {
    // Return all jobs (no age filter)
    return {};
  }

  // Default: only show jobs where user meets minimum age
  return {
    minimumAge: {
      lte: userAge,
    },
  };
}

/**
 * Get jobs for "Next unlock" recommendations
 * Returns jobs at the next age threshold the user will unlock
 */
export function buildNextUnlockFilter(userAge: number): Prisma.MicroJobWhereInput | null {
  const nextAge = getNextAgeUnlock(userAge);
  if (!nextAge) return null; // User can see all jobs

  // Get jobs that require the next age bracket
  // For age 15 → show 16+ jobs
  // For age 16-17 → show 18+ jobs
  return {
    minimumAge: {
      equals: nextAge,
    },
  };
}

/**
 * Get user's age from their profile
 */
export async function getUserAge(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dateOfBirth: true },
  });

  if (!user?.dateOfBirth) return null;
  return computeAgeYears(user.dateOfBirth);
}

// ============================================
// JOB PUBLISH PIPELINE HELPERS
// ============================================

/**
 * Apply age policy to a job being created/published
 * Returns the job data with policy-enforced fields
 */
export function applyAgePolicyToJob(params: {
  category: JobCategory;
  requestedMinAge?: number;
  requestedRequiresAdult?: boolean;
}): {
  riskCategory: JobRiskCategory;
  minimumAge: number;
  requiresAdultPresent: boolean;
  agePolicyVersion: number;
  wasMinAgeAdjusted: boolean;
} {
  const rule = getCategoryRule(params.category);

  // Use requested minAge if provided and valid, otherwise use baseline
  const requestedMinAge = params.requestedMinAge ?? rule.baselineMinAge;
  const { adjustedMinAge, wasAdjusted } = enforceMinAgeFloor(
    params.category,
    requestedMinAge
  );

  return {
    riskCategory: rule.riskCategory,
    minimumAge: adjustedMinAge,
    requiresAdultPresent: params.requestedRequiresAdult ?? rule.requiresAdultPresentDefault,
    agePolicyVersion: CURRENT_POLICY_VERSION,
    wasMinAgeAdjusted: wasAdjusted,
  };
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Get display text for job age restriction
 */
export function getAgeRestrictionDisplay(minAge: number): string {
  return `${minAge}+`;
}

/**
 * Get unlock message for ineligible jobs
 */
export function getUnlockMessage(jobMinAge: number, userAge: number): string {
  if (userAge >= jobMinAge) return ""; // Already eligible

  const yearsUntil = jobMinAge - userAge;
  if (yearsUntil === 1) {
    return `Unlocks in 1 year when you turn ${jobMinAge}`;
  }
  return `Unlocks in ${yearsUntil} years when you turn ${jobMinAge}`;
}

/**
 * Get preparation tips for next age bracket
 */
export function getPreparationTips(currentAge: number): string[] {
  if (currentAge < 16) {
    return [
      "Build reliability through small tasks",
      "Practice communication skills",
      "Learn time management",
    ];
  }
  if (currentAge < 18) {
    return [
      "Gain experience in your current age bracket",
      "Build your profile with completed jobs",
      "Collect positive reviews from employers",
    ];
  }
  return [];
}

// ============================================
// EXPORTS INDEX
// ============================================

export {
  CURRENT_POLICY_VERSION,
  BASELINE_MIN_AGE_BY_RISK,
  getCategoryRule,
  getBaselineMinAge,
  getNextAgeUnlock,
} from "./policy";
