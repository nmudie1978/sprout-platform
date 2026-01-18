/**
 * AGE ELIGIBILITY VALIDATION SCHEMAS
 *
 * Zod schemas for validating age-related inputs in job creation and applications.
 */

import { z } from 'zod'
import { PLATFORM_MINIMUM_AGE } from './index'

/**
 * Risk category enum for validation
 */
export const riskCategorySchema = z.enum(['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'])

/**
 * Age bracket enum for validation (client-side safe)
 */
export const eligibilityAgeBracketSchema = z.enum([
  'UNDER_15',
  'AGE_15',
  'AGE_16',
  'AGE_17',
  'AGE_18_PLUS',
])

/**
 * Job age settings validation (for job creation/update)
 */
export const jobAgeSettingsSchema = z.object({
  riskCategory: riskCategorySchema.optional(),
  minimumAge: z.number()
    .int()
    .min(PLATFORM_MINIMUM_AGE, `Minimum age cannot be below ${PLATFORM_MINIMUM_AGE}`)
    .max(21, 'Maximum age cannot exceed 21')
    .optional(),
  requiresAdultPresent: z.boolean().optional(),
})

/**
 * Age policy JSON schema
 */
export const agePolicyJsonSchema = z.object({
  LOW_RISK: z.object({ minAge: z.number().int().min(15).max(21) }),
  MEDIUM_RISK: z.object({ minAge: z.number().int().min(15).max(21) }),
  HIGH_RISK: z.object({ minAge: z.number().int().min(15).max(21) }),
})

/**
 * Age eligibility check request schema
 */
export const ageEligibilityCheckSchema = z.object({
  jobId: z.string().min(1),
  userId: z.string().min(1).optional(), // Optional for logged-in user
})

/**
 * Validate minimum age against risk baseline
 */
export function validateMinAgeAgainstBaseline(
  minimumAge: number,
  baselineAge: number
): z.ZodIssue | null {
  if (minimumAge < baselineAge) {
    return {
      code: z.ZodIssueCode.too_small,
      minimum: baselineAge,
      inclusive: true,
      type: 'number',
      message: `Minimum age cannot be below ${baselineAge} for this risk category`,
      path: ['minimumAge'],
    }
  }
  return null
}

export type RiskCategory = z.infer<typeof riskCategorySchema>
export type EligibilityAgeBracket = z.infer<typeof eligibilityAgeBracketSchema>
export type JobAgeSettings = z.infer<typeof jobAgeSettingsSchema>
export type AgePolicyJson = z.infer<typeof agePolicyJsonSchema>
