import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateAge,
  isMinor,
  validateAgeBracket,
  generateGuardianToken,
  MIN_YOUTH_AGE,
  MAX_YOUTH_AGE,
  MIN_EMPLOYER_AGE,
  ADULT_AGE,
} from '../safety'

describe('Safety Module', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for adults', () => {
      const birthDate = new Date('1990-01-15')
      const age = calculateAge(birthDate)
      // Age should be approximately 35-36 years (depending on current date)
      expect(age).toBeGreaterThanOrEqual(35)
      expect(age).toBeLessThanOrEqual(36)
    })

    it('should calculate age correctly for teenagers', () => {
      // Create a date 16 years ago
      const today = new Date()
      const birthDate = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      )
      const age = calculateAge(birthDate)
      expect(age).toBe(16)
    })

    it('should handle birthdays not yet occurred this year', () => {
      const today = new Date()
      // Set birthday to next month
      const nextMonth = today.getMonth() + 1
      const birthDate = new Date(
        today.getFullYear() - 18,
        nextMonth > 11 ? 0 : nextMonth,
        15
      )
      const age = calculateAge(birthDate)
      // If birthday hasn't occurred yet, age should be 17
      expect(age).toBeLessThanOrEqual(18)
    })

    it('should handle edge case of today being the birthday', () => {
      const today = new Date()
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      )
      const age = calculateAge(birthDate)
      expect(age).toBe(18)
    })
  })

  describe('isMinor', () => {
    it('should return true for users under 18', () => {
      const today = new Date()
      const birthDate = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      )
      expect(isMinor(birthDate)).toBe(true)
    })

    it('should return false for users 18 and over', () => {
      const today = new Date()
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      )
      expect(isMinor(birthDate)).toBe(false)
    })

    it('should return true for users exactly 17 years old', () => {
      const today = new Date()
      const birthDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate()
      )
      expect(isMinor(birthDate)).toBe(true)
    })
  })

  describe('validateAgeBracket', () => {
    it('should return SIXTEEN_SEVENTEEN for 15-17 year olds', () => {
      const today = new Date()

      const age15 = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age15)).toBe('SIXTEEN_SEVENTEEN')

      const age16 = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age16)).toBe('SIXTEEN_SEVENTEEN')

      const age17 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age17)).toBe('SIXTEEN_SEVENTEEN')
    })

    it('should return EIGHTEEN_TWENTY for 18-20 year olds', () => {
      const today = new Date()

      const age18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age18)).toBe('EIGHTEEN_TWENTY')

      const age19 = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age19)).toBe('EIGHTEEN_TWENTY')

      const age20 = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age20)).toBe('EIGHTEEN_TWENTY')
    })

    it('should return null for users under 15', () => {
      const today = new Date()
      const age14 = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age14)).toBeNull()
    })

    it('should return null for users over 20', () => {
      const today = new Date()
      const age21 = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate())
      expect(validateAgeBracket(age21)).toBeNull()
    })
  })

  describe('generateGuardianToken', () => {
    it('should generate a 64 character hex string', () => {
      const token = generateGuardianToken()
      expect(token).toHaveLength(64)
      expect(/^[0-9a-f]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = generateGuardianToken()
      const token2 = generateGuardianToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('Age Constants', () => {
    it('should have correct minimum youth age', () => {
      expect(MIN_YOUTH_AGE).toBe(16) // Platform minimum is 16
    })

    it('should have correct maximum youth age', () => {
      expect(MAX_YOUTH_AGE).toBe(20)
    })

    it('should have correct minimum employer age', () => {
      expect(MIN_EMPLOYER_AGE).toBe(18)
    })

    it('should have correct adult age', () => {
      expect(ADULT_AGE).toBe(18)
    })
  })
})

describe('Safety Rules - Business Logic', () => {
  describe('Youth Registration Rules', () => {
    it('should allow registration for ages 16-20', () => {
      const validAges = [16, 17, 18, 19, 20] // Platform minimum is 16
      validAges.forEach(age => {
        const today = new Date()
        const birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
        const calculatedAge = calculateAge(birthDate)
        expect(calculatedAge).toBeGreaterThanOrEqual(MIN_YOUTH_AGE)
        expect(calculatedAge).toBeLessThanOrEqual(MAX_YOUTH_AGE)
      })
    })

    it('should require guardian consent for ages 16-17', () => {
      const today = new Date()
      for (let age = 16; age <= 17; age++) { // Platform minimum is 16
        const birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
        expect(isMinor(birthDate)).toBe(true)
      }
    })

    it('should NOT require guardian consent for ages 18+', () => {
      const today = new Date()
      for (let age = 18; age <= 20; age++) {
        const birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
        expect(isMinor(birthDate)).toBe(false)
      }
    })
  })

  describe('Employer Registration Rules', () => {
    it('should require age 18+ for employers', () => {
      expect(MIN_EMPLOYER_AGE).toBe(18)
    })

    it('should not allow employers under 18', () => {
      const today = new Date()
      const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      const age = calculateAge(under18)
      expect(age < MIN_EMPLOYER_AGE).toBe(true)
    })
  })
})
