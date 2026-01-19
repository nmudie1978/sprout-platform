/**
 * AGE ELIGIBILITY POLICY SYSTEM
 *
 * SAFETY CRITICAL - This module enforces age restrictions for job applications.
 * All eligibility checks MUST be performed server-side. Client-side checks are for UX only.
 *
 * See /docs/age-eligibility-policy.md for full documentation.
 */

import { prisma } from '@/lib/prisma'
import type { AgePolicy, AgeEligibilityAction, JobRiskCategory } from '@prisma/client'
import { CATEGORY_RISK_MAP, DEFAULT_RISK_CATEGORY } from './category-risk-map'

// ============================================
// TYPES
// ============================================

export type EligibilityAgeBracket = 'UNDER_15' | 'AGE_15' | 'AGE_16' | 'AGE_17' | 'AGE_18_PLUS'

export interface AgePolicyRules {
  LOW_RISK: { minAge: number }
  MEDIUM_RISK: { minAge: number }
  HIGH_RISK: { minAge: number }
}

export interface AgeEligibilityResult {
  eligible: boolean
  userAge: number
  userAgeBracket: EligibilityAgeBracket
  requiredMinAge: number
  policyVersion: number
  reason: string
}

export interface JobAgeDefaults {
  minimumAge: number
  riskCategory: JobRiskCategory
  policyVersion: number
}

// ============================================
// CONSTANTS
// ============================================

// Platform-wide minimum age (absolute floor)
export const PLATFORM_MINIMUM_AGE = 15

// Default policy rules (used as fallback if no policy exists)
export const DEFAULT_POLICY_RULES: AgePolicyRules = {
  LOW_RISK: { minAge: 15 },
  MEDIUM_RISK: { minAge: 16 },
  HIGH_RISK: { minAge: 18 },
}

// ============================================
// AGE CALCULATION
// ============================================

/**
 * Compute age in years from date of birth.
 * Uses the standard method: subtract years, then adjust if birthday hasn't occurred yet this year.
 *
 * IMPORTANT: This is the single source of truth for age calculation.
 * Use this consistently throughout the application.
 */
export function computeAgeYears(dateOfBirth: Date, now: Date = new Date()): number {
  const birthDate = new Date(dateOfBirth)
  let age = now.getFullYear() - birthDate.getFullYear()

  // Adjust if birthday hasn't occurred yet this year
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Convert age in years to EligibilityAgeBracket for client-side display.
 * NEVER send actual DOB to client - use this bracket instead.
 */
export function getAgeBracket(ageYears: number): EligibilityAgeBracket {
  if (ageYears < 15) return 'UNDER_15'
  if (ageYears === 15) return 'AGE_15'
  if (ageYears === 16) return 'AGE_16'
  if (ageYears === 17) return 'AGE_17'
  return 'AGE_18_PLUS'
}

/**
 * Get minimum age for a bracket (for quick comparisons)
 */
export function getBracketMinAge(bracket: EligibilityAgeBracket): number {
  switch (bracket) {
    case 'UNDER_15': return 0
    case 'AGE_15': return 15
    case 'AGE_16': return 16
    case 'AGE_17': return 17
    case 'AGE_18_PLUS': return 18
  }
}

// ============================================
// POLICY MANAGEMENT
// ============================================

/**
 * Get the currently active age policy.
 * There must always be exactly one ACTIVE policy.
 * If no policy exists, returns null (caller should handle this as an error).
 */
export async function getActiveAgePolicy(): Promise<AgePolicy | null> {
  const policy = await prisma.agePolicy.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { version: 'desc' },
  })
  return policy
}

/**
 * Get policy rules from a policy, with fallback to defaults.
 */
export function getPolicyRules(policy: AgePolicy | null): AgePolicyRules {
  if (!policy) return DEFAULT_POLICY_RULES

  try {
    const parsed = policy.policyJson as unknown as AgePolicyRules
    // Validate structure
    if (
      typeof parsed.LOW_RISK?.minAge === 'number' &&
      typeof parsed.MEDIUM_RISK?.minAge === 'number' &&
      typeof parsed.HIGH_RISK?.minAge === 'number'
    ) {
      return parsed
    }
  } catch {
    // Fall through to default
  }

  return DEFAULT_POLICY_RULES
}

/**
 * Get minimum age for a risk category from policy.
 */
export function getMinAgeForRisk(
  riskCategory: JobRiskCategory,
  policyRules: AgePolicyRules
): number {
  return policyRules[riskCategory]?.minAge ?? PLATFORM_MINIMUM_AGE
}

// ============================================
// ELIGIBILITY CHECKS
// ============================================

/**
 * Check if a user is eligible to apply for a job based on age.
 * This is the AUTHORITATIVE check - must be called server-side.
 *
 * @param userDateOfBirth - User's date of birth (server-side only)
 * @param jobMinimumAge - The job's minimum age requirement
 * @param policyVersion - The policy version for audit logging
 * @returns AgeEligibilityResult with eligibility status and details
 */
export function checkAgeEligibility(
  userDateOfBirth: Date,
  jobMinimumAge: number,
  policyVersion: number
): AgeEligibilityResult {
  const userAge = computeAgeYears(userDateOfBirth)
  const userAgeBracket = getAgeBracket(userAge)
  const eligible = userAge >= jobMinimumAge

  return {
    eligible,
    userAge,
    userAgeBracket,
    requiredMinAge: jobMinimumAge,
    policyVersion,
    reason: eligible
      ? `User age ${userAge} meets minimum requirement of ${jobMinimumAge}`
      : `User age ${userAge} is below minimum requirement of ${jobMinimumAge}`,
  }
}

/**
 * Check if a user can see a job (for filtering job listings).
 * Returns true if the user meets the minimum age.
 */
export function canUserSeeJob(
  userAge: number,
  jobMinimumAge: number
): boolean {
  return userAge >= jobMinimumAge
}

// ============================================
// JOB CREATION HELPERS
// ============================================

/**
 * Get default age settings for a new job based on category and risk.
 *
 * @param jobCategory - The job category (e.g., BABYSITTING, TECH_HELP)
 * @param policy - The active age policy
 * @returns JobAgeDefaults with minimumAge, riskCategory, and policyVersion
 */
export function getJobAgeDefaults(
  jobCategory: string,
  policy: AgePolicy
): JobAgeDefaults {
  const riskCategory = CATEGORY_RISK_MAP[jobCategory] ?? DEFAULT_RISK_CATEGORY
  const policyRules = getPolicyRules(policy)
  const minimumAge = getMinAgeForRisk(riskCategory, policyRules)

  return {
    minimumAge,
    riskCategory,
    policyVersion: policy.version,
  }
}

/**
 * Enforce baseline minimum age for a job.
 * If employer requests an age below the baseline, auto-correct to baseline.
 *
 * @param requestedAge - The age the employer requested
 * @param riskCategory - The job's risk category
 * @param policy - The active age policy
 * @returns { finalAge, wasAdjusted, baselineAge }
 */
export function enforceAgeBaseline(
  requestedAge: number,
  riskCategory: JobRiskCategory,
  policy: AgePolicy
): { finalAge: number; wasAdjusted: boolean; baselineAge: number } {
  const policyRules = getPolicyRules(policy)
  const baselineAge = getMinAgeForRisk(riskCategory, policyRules)

  // Enforce platform minimum
  const effectiveBaseline = Math.max(baselineAge, PLATFORM_MINIMUM_AGE)

  if (requestedAge < effectiveBaseline) {
    return {
      finalAge: effectiveBaseline,
      wasAdjusted: true,
      baselineAge: effectiveBaseline,
    }
  }

  return {
    finalAge: requestedAge,
    wasAdjusted: false,
    baselineAge: effectiveBaseline,
  }
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log an age eligibility decision to the audit log.
 * CRITICAL: All eligibility decisions must be logged for compliance.
 */
export async function logAgeEligibilityDecision(params: {
  workerId?: string
  jobId: string
  employerId?: string
  action: AgeEligibilityAction
  reason: string
  requiredMinAge: number
  userAge?: number
  userAgeBracket?: string
  policyVersion: number
  metadata?: Record<string, unknown>
  ipAddress?: string
}): Promise<void> {
  await prisma.ageEligibilityAuditLog.create({
    data: {
      workerId: params.workerId,
      jobId: params.jobId,
      employerId: params.employerId,
      action: params.action,
      reason: params.reason,
      requiredMinAge: params.requiredMinAge,
      userAge: params.userAge,
      userAgeBracket: params.userAgeBracket,
      policyVersion: params.policyVersion,
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      ipAddress: params.ipAddress,
    },
  })
}

// Re-export category risk map for convenience
export { CATEGORY_RISK_MAP, DEFAULT_RISK_CATEGORY } from './category-risk-map'

// Re-export from policy.ts for extended functionality
export {
  CURRENT_POLICY_VERSION,
  CURRENT_POLICY,
  BASELINE_MIN_AGE_BY_RISK,
  CATEGORY_RULES,
  DETAILED_CATEGORY_RULES,
  getCategoryRule,
  getBaselineMinAge,
  getNextAgeUnlock,
  canSeeJobsWithMinAge,
  parsePolicyJson,
  getPolicyJson,
  type CategoryRule,
  type AgePolicyConfig,
} from './policy'

// Re-export from utils.ts for job filtering and enforcement
export {
  deriveAgeBracket,
  getAgeBracketDisplay,
  isEligible,
  canApplyToJob,
  deriveCategoryRule,
  enforceMinAgeFloor,
  getActiveAgePolicy as getActivePolicyFromDb,
  logAgeEligibilityEvent,
  buildAgeEligibilityFilter,
  buildNextUnlockFilter,
  getUserAge,
  applyAgePolicyToJob,
  getAgeRestrictionDisplay,
  getUnlockMessage,
  getPreparationTips,
} from './utils'
