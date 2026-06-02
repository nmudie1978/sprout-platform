/**
 * AGE UTILITIES
 *
 * Pure, dependency-free age math used for roadmap personalisation.
 *
 * NOTE: The legacy job-eligibility "age gate" (risk categories, job minimum-age
 * enforcement, eligibility audit logging) was removed with the jobs marketplace.
 * Age is a PERSONALISATION SIGNAL ONLY — it never blocks an in-app action.
 * See CLAUDE.md <age_policy>.
 */

export type EligibilityAgeBracket =
  | 'UNDER_15'
  | 'AGE_15'
  | 'AGE_16'
  | 'AGE_17'
  | 'AGE_18_PLUS'

// Platform-wide minimum signup age (eligibility floor only — enforced at signup).
export const PLATFORM_MINIMUM_AGE = 15

/**
 * Compute age in years from date of birth.
 * Single source of truth for age calculation across the app.
 */
export function computeAgeYears(dateOfBirth: Date, now: Date = new Date()): number {
  const birthDate = new Date(dateOfBirth)
  let age = now.getFullYear() - birthDate.getFullYear()

  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Convert age in years to a coarse bracket for client-side display.
 * NEVER send actual DOB to the client — use this bracket instead.
 */
export function getAgeBracket(ageYears: number): EligibilityAgeBracket {
  if (ageYears < 15) return 'UNDER_15'
  if (ageYears === 15) return 'AGE_15'
  if (ageYears === 16) return 'AGE_16'
  if (ageYears === 17) return 'AGE_17'
  return 'AGE_18_PLUS'
}

/**
 * Get the minimum age represented by a bracket (for quick comparisons).
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
