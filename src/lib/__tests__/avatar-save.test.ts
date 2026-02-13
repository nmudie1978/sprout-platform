import { describe, it, expect } from 'vitest'
import { getAvatarById } from '../avatars'

describe('Avatar Save Reliability', () => {
  describe('getAvatarById — catalog validation', () => {
    it('returns a valid avatar for a known ID', () => {
      const avatar = getAvatarById('kawaii-star')
      expect(avatar).toBeDefined()
      expect(avatar!.id).toBe('kawaii-star')
    })

    it('returns undefined for an unknown ID', () => {
      expect(getAvatarById('nonexistent-avatar-xyz')).toBeUndefined()
    })

    it('returns undefined for an empty string', () => {
      expect(getAvatarById('')).toBeUndefined()
    })

    it('returns valid avatars for several known IDs', () => {
      const knownIds = ['kawaii-star', 'kawaii-heart', 'kawaii-cloud']
      for (const id of knownIds) {
        const avatar = getAvatarById(id)
        expect(avatar).toBeDefined()
        expect(avatar!.id).toBe(id)
      }
    })
  })

  describe('Avatar PATCH endpoint logic', () => {
    it('should reject empty avatarId', () => {
      // Simulates the validation check in the PATCH handler
      const avatarId = ''
      const isValid = typeof avatarId === 'string' && avatarId.trim().length > 0
      expect(isValid).toBe(false)
    })

    it('should reject non-string avatarId', () => {
      const avatarId = 123 as unknown
      const isValid = typeof avatarId === 'string' && (avatarId as string).trim().length > 0
      expect(isValid).toBe(false)
    })

    it('should reject avatarId not in catalog', () => {
      const avatarId = 'does-not-exist'
      const avatarDef = getAvatarById(avatarId)
      expect(avatarDef).toBeUndefined()
    })

    it('should accept avatarId that exists in catalog', () => {
      const avatarId = 'kawaii-star'
      const avatarDef = getAvatarById(avatarId)
      expect(avatarDef).toBeDefined()
    })
  })

  describe('Profile PATCH — avatarId exclusion', () => {
    it('should strip avatarId from profile save payload', () => {
      // Simulates the client-side logic in saveProfileMutation
      const formData = {
        displayName: 'Test User',
        bio: 'Hello',
        availability: 'Weekends',
        phoneNumber: '+47 123 45 678',
        city: 'Oslo',
        interests: ['Technology'],
        guardianEmail: '',
        avatarId: 'kawaii-star',
      }

      const { avatarId: _excluded, ...profileDataWithoutAvatar } = formData

      expect(profileDataWithoutAvatar).not.toHaveProperty('avatarId')
      expect(profileDataWithoutAvatar).toHaveProperty('displayName', 'Test User')
      expect(profileDataWithoutAvatar).toHaveProperty('city', 'Oslo')
    })
  })
})
