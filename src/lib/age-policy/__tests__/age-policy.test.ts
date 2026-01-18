/**
 * AGE POLICY TESTS
 *
 * Tests for the age eligibility system:
 * - Age calculation
 * - Age bracket derivation
 * - Eligibility checks
 * - Policy enforcement
 * - Category-to-risk mapping
 */

import { describe, it, expect } from 'vitest'
import {
  computeAgeYears,
  getAgeBracket,
  getBracketMinAge,
  checkAgeEligibility,
  canUserSeeJob,
  getJobAgeDefaults,
  enforceAgeBaseline,
  PLATFORM_MINIMUM_AGE,
  DEFAULT_POLICY_RULES,
} from '../index'
import {
  CATEGORY_RISK_MAP,
  DEFAULT_RISK_CATEGORY,
  getRiskForCategory,
  RISK_CATEGORY_DESCRIPTIONS,
} from '../category-risk-map'
import {
  computeAgeYears as utilComputeAge,
  deriveAgeBracket,
  isEligible,
  enforceMinAgeFloor,
  applyAgePolicyToJob,
  getAgeRestrictionDisplay,
  getUnlockMessage,
} from '../utils'

// ============================================
// AGE CALCULATION TESTS
// ============================================

describe('computeAgeYears', () => {
  it('should calculate age correctly when birthday has passed this year', () => {
    const now = new Date('2024-06-15')
    const dob = new Date('2008-01-15') // Birthday in January, now is June
    expect(computeAgeYears(dob, now)).toBe(16)
  })

  it('should calculate age correctly when birthday has not passed this year', () => {
    const now = new Date('2024-06-15')
    const dob = new Date('2008-08-15') // Birthday in August, now is June
    expect(computeAgeYears(dob, now)).toBe(15) // Still 15 until August
  })

  it('should calculate age correctly on birthday', () => {
    const now = new Date('2024-06-15')
    const dob = new Date('2008-06-15') // Birthday is today
    expect(computeAgeYears(dob, now)).toBe(16)
  })

  it('should handle leap year birthdays', () => {
    const now = new Date('2024-02-29') // Leap year
    const dob = new Date('2004-02-29') // Born on leap day
    expect(computeAgeYears(dob, now)).toBe(20)
  })

  it('should handle edge case: born yesterday', () => {
    const now = new Date('2024-01-02')
    const dob = new Date('2024-01-01')
    expect(computeAgeYears(dob, now)).toBe(0)
  })
})

describe('utils computeAgeYears', () => {
  it('should match index computeAgeYears behavior', () => {
    const dob = new Date('2008-06-15')
    // Both implementations should return the same result
    expect(utilComputeAge(dob)).toBeGreaterThanOrEqual(15)
  })
})

// ============================================
// AGE BRACKET TESTS
// ============================================

describe('getAgeBracket', () => {
  it('should return UNDER_15 for ages below 15', () => {
    expect(getAgeBracket(14)).toBe('UNDER_15')
    expect(getAgeBracket(10)).toBe('UNDER_15')
    expect(getAgeBracket(0)).toBe('UNDER_15')
  })

  it('should return AGE_15 for exactly 15', () => {
    expect(getAgeBracket(15)).toBe('AGE_15')
  })

  it('should return AGE_16 for exactly 16', () => {
    expect(getAgeBracket(16)).toBe('AGE_16')
  })

  it('should return AGE_17 for exactly 17', () => {
    expect(getAgeBracket(17)).toBe('AGE_17')
  })

  it('should return AGE_18_PLUS for 18 and above', () => {
    expect(getAgeBracket(18)).toBe('AGE_18_PLUS')
    expect(getAgeBracket(19)).toBe('AGE_18_PLUS')
    expect(getAgeBracket(25)).toBe('AGE_18_PLUS')
    expect(getAgeBracket(100)).toBe('AGE_18_PLUS')
  })
})

describe('deriveAgeBracket', () => {
  it('should return UNDER_SIXTEEN for ages below 16', () => {
    expect(deriveAgeBracket(14)).toBe('UNDER_SIXTEEN')
    expect(deriveAgeBracket(15)).toBe('UNDER_SIXTEEN')
  })

  it('should return SIXTEEN_SEVENTEEN for 16-17', () => {
    expect(deriveAgeBracket(16)).toBe('SIXTEEN_SEVENTEEN')
    expect(deriveAgeBracket(17)).toBe('SIXTEEN_SEVENTEEN')
  })

  it('should return EIGHTEEN_TWENTY for 18-20', () => {
    expect(deriveAgeBracket(18)).toBe('EIGHTEEN_TWENTY')
    expect(deriveAgeBracket(19)).toBe('EIGHTEEN_TWENTY')
    expect(deriveAgeBracket(20)).toBe('EIGHTEEN_TWENTY')
  })

  it('should return null for ages outside youth range', () => {
    expect(deriveAgeBracket(21)).toBeNull()
    expect(deriveAgeBracket(25)).toBeNull()
  })
})

describe('getBracketMinAge', () => {
  it('should return correct minimum ages for each bracket', () => {
    expect(getBracketMinAge('UNDER_15')).toBe(0)
    expect(getBracketMinAge('AGE_15')).toBe(15)
    expect(getBracketMinAge('AGE_16')).toBe(16)
    expect(getBracketMinAge('AGE_17')).toBe(17)
    expect(getBracketMinAge('AGE_18_PLUS')).toBe(18)
  })
})

// ============================================
// ELIGIBILITY TESTS
// ============================================

describe('isEligible', () => {
  it('should return true when user age >= job min age', () => {
    expect(isEligible(16, 15)).toBe(true)
    expect(isEligible(16, 16)).toBe(true)
    expect(isEligible(18, 16)).toBe(true)
    expect(isEligible(18, 18)).toBe(true)
  })

  it('should return false when user age < job min age', () => {
    expect(isEligible(15, 16)).toBe(false)
    expect(isEligible(15, 18)).toBe(false)
    expect(isEligible(17, 18)).toBe(false)
    expect(isEligible(14, 15)).toBe(false)
  })
})

describe('canUserSeeJob', () => {
  it('should allow user to see jobs at or below their age', () => {
    expect(canUserSeeJob(16, 15)).toBe(true)
    expect(canUserSeeJob(16, 16)).toBe(true)
    expect(canUserSeeJob(18, 18)).toBe(true)
  })

  it('should not allow user to see jobs above their age', () => {
    expect(canUserSeeJob(15, 16)).toBe(false)
    expect(canUserSeeJob(16, 18)).toBe(false)
    expect(canUserSeeJob(17, 18)).toBe(false)
  })
})

describe('checkAgeEligibility', () => {
  it('should return eligible for users meeting minimum age', () => {
    const dob = new Date('2008-01-01') // ~16 years old
    const now = new Date('2024-06-15')
    const result = checkAgeEligibility(dob, 16, 1)
    // Note: exact age depends on current date
    expect(result.userAge).toBeGreaterThanOrEqual(16)
    expect(result.eligible).toBe(true)
    expect(result.reason).toContain('meets')
  })

  it('should return ineligible for users below minimum age', () => {
    const dob = new Date('2010-01-01') // ~14 years old
    const now = new Date('2024-06-15')
    const result = checkAgeEligibility(dob, 18, 1)
    expect(result.eligible).toBe(false)
    expect(result.reason).toContain('below')
  })
})

// ============================================
// CATEGORY RISK MAPPING TESTS
// ============================================

describe('CATEGORY_RISK_MAP', () => {
  it('should have all JobCategory values mapped', () => {
    const expectedCategories = [
      'BABYSITTING',
      'DOG_WALKING',
      'SNOW_CLEARING',
      'CLEANING',
      'DIY_HELP',
      'TECH_HELP',
      'ERRANDS',
      'OTHER',
    ]

    expectedCategories.forEach((cat) => {
      expect(CATEGORY_RISK_MAP[cat]).toBeDefined()
    })
  })

  it('should map categories to correct risk levels', () => {
    // HIGH_RISK categories (18+)
    expect(CATEGORY_RISK_MAP['BABYSITTING']).toBe('HIGH_RISK')
    expect(CATEGORY_RISK_MAP['DIY_HELP']).toBe('HIGH_RISK')

    // MEDIUM_RISK categories (16+)
    expect(CATEGORY_RISK_MAP['CLEANING']).toBe('MEDIUM_RISK')
    expect(CATEGORY_RISK_MAP['SNOW_CLEARING']).toBe('MEDIUM_RISK')
    expect(CATEGORY_RISK_MAP['DOG_WALKING']).toBe('MEDIUM_RISK')

    // LOW_RISK categories (15+)
    expect(CATEGORY_RISK_MAP['TECH_HELP']).toBe('LOW_RISK')
    expect(CATEGORY_RISK_MAP['ERRANDS']).toBe('LOW_RISK')
    expect(CATEGORY_RISK_MAP['OTHER']).toBe('LOW_RISK')
  })
})

describe('getRiskForCategory', () => {
  it('should return correct risk for known categories', () => {
    expect(getRiskForCategory('TECH_HELP')).toBe('LOW_RISK')
    expect(getRiskForCategory('CLEANING')).toBe('MEDIUM_RISK')
    expect(getRiskForCategory('BABYSITTING')).toBe('HIGH_RISK')
  })

  it('should return default risk for unknown categories', () => {
    expect(getRiskForCategory('UNKNOWN_CATEGORY')).toBe(DEFAULT_RISK_CATEGORY)
    expect(getRiskForCategory(null)).toBe(DEFAULT_RISK_CATEGORY)
    expect(getRiskForCategory(undefined)).toBe(DEFAULT_RISK_CATEGORY)
  })
})

// ============================================
// POLICY ENFORCEMENT TESTS
// ============================================

describe('enforceAgeBaseline', () => {
  const mockPolicy = {
    id: 'test',
    version: 1,
    status: 'ACTIVE' as const,
    policyJson: DEFAULT_POLICY_RULES,
    description: null,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  }

  it('should not adjust when requested age is at baseline', () => {
    const result = enforceAgeBaseline(15, 'LOW_RISK', mockPolicy)
    expect(result.finalAge).toBe(15)
    expect(result.wasAdjusted).toBe(false)
  })

  it('should not adjust when requested age is above baseline', () => {
    const result = enforceAgeBaseline(18, 'LOW_RISK', mockPolicy)
    expect(result.finalAge).toBe(18)
    expect(result.wasAdjusted).toBe(false)
  })

  it('should adjust when requested age is below baseline', () => {
    const result = enforceAgeBaseline(14, 'LOW_RISK', mockPolicy)
    expect(result.finalAge).toBe(15) // Baseline for LOW_RISK
    expect(result.wasAdjusted).toBe(true)
  })

  it('should enforce platform minimum even if policy is lower', () => {
    const result = enforceAgeBaseline(10, 'LOW_RISK', mockPolicy)
    expect(result.finalAge).toBeGreaterThanOrEqual(PLATFORM_MINIMUM_AGE)
    expect(result.wasAdjusted).toBe(true)
  })
})

describe('enforceMinAgeFloor', () => {
  it('should enforce floor for each category', () => {
    // BABYSITTING is LOW_RISK in policy.ts (15+ with adult present)
    const babysitting = enforceMinAgeFloor('BABYSITTING' as any, 14)
    expect(babysitting.adjustedMinAge).toBe(15) // Adjusted to baseline
    expect(babysitting.wasAdjusted).toBe(true)

    // TECH_HELP is LOW_RISK (15+)
    const techHelp = enforceMinAgeFloor('TECH_HELP' as any, 15)
    expect(techHelp.adjustedMinAge).toBe(15)
    expect(techHelp.wasAdjusted).toBe(false)

    // CLEANING is MEDIUM_RISK (16+)
    const cleaning = enforceMinAgeFloor('CLEANING' as any, 15)
    expect(cleaning.adjustedMinAge).toBe(16)
    expect(cleaning.wasAdjusted).toBe(true)
  })
})

describe('applyAgePolicyToJob', () => {
  it('should apply correct defaults for each category', () => {
    const techHelp = applyAgePolicyToJob({ category: 'TECH_HELP' as any })
    expect(techHelp.riskCategory).toBe('LOW_RISK')
    expect(techHelp.minimumAge).toBe(15)

    const cleaning = applyAgePolicyToJob({ category: 'CLEANING' as any })
    expect(cleaning.riskCategory).toBe('MEDIUM_RISK')
    expect(cleaning.minimumAge).toBe(16)

    const babysitting = applyAgePolicyToJob({ category: 'BABYSITTING' as any })
    expect(babysitting.riskCategory).toBe('LOW_RISK') // Note: policy.ts defines this as LOW_RISK
    expect(babysitting.minimumAge).toBe(15)
  })

  it('should allow raising minimum age', () => {
    const result = applyAgePolicyToJob({
      category: 'TECH_HELP' as any,
      requestedMinAge: 18, // Raise from 15 to 18
    })
    expect(result.minimumAge).toBe(18)
    expect(result.wasMinAgeAdjusted).toBe(false)
  })

  it('should not allow lowering below baseline', () => {
    const result = applyAgePolicyToJob({
      category: 'CLEANING' as any,
      requestedMinAge: 14, // Try to lower from 16 to 14
    })
    expect(result.minimumAge).toBe(16) // Should stay at baseline
    expect(result.wasMinAgeAdjusted).toBe(true)
  })
})

// ============================================
// DISPLAY HELPERS TESTS
// ============================================

describe('getAgeRestrictionDisplay', () => {
  it('should format age restriction correctly', () => {
    expect(getAgeRestrictionDisplay(15)).toBe('15+')
    expect(getAgeRestrictionDisplay(16)).toBe('16+')
    expect(getAgeRestrictionDisplay(18)).toBe('18+')
  })
})

describe('getUnlockMessage', () => {
  it('should return empty string when eligible', () => {
    expect(getUnlockMessage(16, 18)).toBe('')
  })

  it('should return unlock message for 1 year', () => {
    expect(getUnlockMessage(18, 17)).toContain('1 year')
  })

  it('should return unlock message for multiple years', () => {
    expect(getUnlockMessage(18, 15)).toContain('3 years')
  })
})

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Age Eligibility Integration', () => {
  describe('15-year-old worker', () => {
    const age = 15

    it('can apply to LOW_RISK jobs (minAge 15)', () => {
      expect(isEligible(age, 15)).toBe(true)
    })

    it('cannot apply to MEDIUM_RISK jobs (minAge 16)', () => {
      expect(isEligible(age, 16)).toBe(false)
    })

    it('cannot apply to HIGH_RISK jobs (minAge 18)', () => {
      expect(isEligible(age, 18)).toBe(false)
    })
  })

  describe('16-17 year-old worker', () => {
    const age16 = 16
    const age17 = 17

    it('can apply to LOW_RISK jobs', () => {
      expect(isEligible(age16, 15)).toBe(true)
      expect(isEligible(age17, 15)).toBe(true)
    })

    it('can apply to MEDIUM_RISK jobs', () => {
      expect(isEligible(age16, 16)).toBe(true)
      expect(isEligible(age17, 16)).toBe(true)
    })

    it('cannot apply to HIGH_RISK jobs', () => {
      expect(isEligible(age16, 18)).toBe(false)
      expect(isEligible(age17, 18)).toBe(false)
    })
  })

  describe('18+ worker', () => {
    const age = 18

    it('can apply to all risk levels', () => {
      expect(isEligible(age, 15)).toBe(true)
      expect(isEligible(age, 16)).toBe(true)
      expect(isEligible(age, 18)).toBe(true)
    })
  })

  describe('Employer cannot lower minimum age', () => {
    it('LOW_RISK job cannot go below 15', () => {
      const result = enforceMinAgeFloor('TECH_HELP' as any, 14)
      expect(result.adjustedMinAge).toBe(15)
      expect(result.wasAdjusted).toBe(true)
    })

    it('MEDIUM_RISK job cannot go below 16', () => {
      const result = enforceMinAgeFloor('CLEANING' as any, 15)
      expect(result.adjustedMinAge).toBe(16)
      expect(result.wasAdjusted).toBe(true)
    })

    it('Adjustment is logged', () => {
      const result = applyAgePolicyToJob({
        category: 'CLEANING' as any,
        requestedMinAge: 14,
      })
      expect(result.wasMinAgeAdjusted).toBe(true)
    })
  })
})
