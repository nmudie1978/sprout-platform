/**
 * Security Test Fixtures — Users & Sessions
 *
 * Provides mock users, sessions, and auth states for security testing.
 * These simulate authenticated, unauthenticated, and cross-user scenarios.
 */

export const USER_A = {
  id: 'user-a-uuid-1111-1111-111111111111',
  email: 'alice@example.com',
  role: 'YOUTH' as const,
  name: 'Alice',
};

export const USER_B = {
  id: 'user-b-uuid-2222-2222-222222222222',
  email: 'bob@example.com',
  role: 'YOUTH' as const,
  name: 'Bob',
};

export const EMPLOYER_USER = {
  id: 'employer-uuid-3333-3333-333333333333',
  email: 'employer@company.com',
  role: 'EMPLOYER' as const,
  name: 'Employer Corp',
};

export const ADMIN_USER = {
  id: 'admin-uuid-4444-4444-444444444444',
  email: 'admin@endeavrly.com',
  role: 'ADMIN' as const,
  name: 'Admin',
};

/** Simulates a valid NextAuth session for a given user */
export function makeSession(user: typeof USER_A) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** Simulates an expired session */
export function makeExpiredSession(user: typeof USER_A) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** No session at all — unauthenticated */
export const NO_SESSION = null;

/** Partial session — missing user ID */
export const PARTIAL_SESSION = {
  user: {
    email: 'partial@example.com',
    role: 'YOUTH' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/** Profile data for User A */
export const USER_A_PROFILE = {
  id: 'profile-a-uuid',
  userId: USER_A.id,
  displayName: 'Alice',
  bio: 'Testing user A',
  city: 'Oslo',
  skillTags: ['Communication'],
  interests: ['Medicine'],
  careerAspiration: 'Doctor',
  journeyState: 'REFLECT_ON_STRENGTHS',
  journeyCompletedSteps: [] as string[],
  journeySkippedSteps: null,
  journeySummary: null,
  journeyLastUpdated: null,
  primaryGoal: null,
};

/** Profile data for User B */
export const USER_B_PROFILE = {
  id: 'profile-b-uuid',
  userId: USER_B.id,
  displayName: 'Bob',
  bio: 'Testing user B',
  city: 'Bergen',
  skillTags: ['Design'],
  interests: ['Engineering'],
  careerAspiration: 'Engineer',
  journeyState: 'CAREER_SHADOW',
  journeyCompletedSteps: [
    'REFLECT_ON_STRENGTHS',
    'EXPLORE_CAREERS',
    'ROLE_DEEP_DIVE',
    'REVIEW_INDUSTRY_OUTLOOK',
  ],
  journeySkippedSteps: null,
  journeySummary: {
    strengths: ['Design', 'Creativity', 'Analytical'],
    careerInterests: ['Engineering'],
    exploredRoles: [{ title: 'Engineer', exploredAt: '2026-01-01' }],
    primaryGoal: { title: 'Engineer', selectedAt: '2026-01-01' },
  },
  journeyLastUpdated: new Date(),
  primaryGoal: { title: 'Engineer' },
};
