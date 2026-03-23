/**
 * Discover Profile Types
 *
 * The structured self-discovery data that drives personalisation
 * across the entire Endeavrly platform.
 */

// ============================================
// DISCOVER OPTIONS (selectable by user)
// ============================================

export const INTEREST_OPTIONS = [
  { id: 'helping-people', label: 'Helping people', emoji: '🤝', tags: ['care', 'social', 'service'] },
  { id: 'solving-problems', label: 'Solving problems', emoji: '🧩', tags: ['analytical', 'logic', 'technical'] },
  { id: 'building-things', label: 'Building things', emoji: '🔨', tags: ['practical', 'hands-on', 'engineering'] },
  { id: 'technology', label: 'Working with technology', emoji: '💻', tags: ['tech', 'digital', 'innovation'] },
  { id: 'being-creative', label: 'Being creative', emoji: '🎨', tags: ['creative', 'design', 'arts'] },
  { id: 'working-outdoors', label: 'Working outdoors', emoji: '🌿', tags: ['outdoor', 'nature', 'physical'] },
  { id: 'organising', label: 'Organising things', emoji: '📋', tags: ['structured', 'planning', 'admin'] },
  { id: 'leading-others', label: 'Leading others', emoji: '🎯', tags: ['leadership', 'management', 'strategy'] },
  { id: 'caring-for-people', label: 'Caring for people', emoji: '❤️', tags: ['healthcare', 'nurturing', 'empathy'] },
  { id: 'working-with-numbers', label: 'Working with numbers', emoji: '📊', tags: ['finance', 'data', 'analytical'] },
  { id: 'communicating', label: 'Communicating & presenting', emoji: '🎤', tags: ['communication', 'media', 'social'] },
  { id: 'researching', label: 'Researching & learning', emoji: '🔬', tags: ['research', 'academic', 'science'] },
] as const;

export const STRENGTH_OPTIONS = [
  { id: 'explain-well', label: 'I explain things well', tags: ['communication', 'teaching'] },
  { id: 'calm-pressure', label: 'I stay calm under pressure', tags: ['resilience', 'steady'] },
  { id: 'problem-solver', label: 'I like solving difficult problems', tags: ['analytical', 'logic'] },
  { id: 'reliable', label: 'I\'m reliable', tags: ['responsibility', 'trust'] },
  { id: 'people-person', label: 'I enjoy working with people', tags: ['social', 'teamwork'] },
  { id: 'detail-oriented', label: 'I pay attention to detail', tags: ['precision', 'quality'] },
  { id: 'quick-learner', label: 'I learn quickly', tags: ['adaptable', 'growth'] },
  { id: 'practical', label: 'I\'m practical & hands-on', tags: ['practical', 'hands-on'] },
  { id: 'creative-ideas', label: 'I like creating ideas', tags: ['creative', 'innovation'] },
  { id: 'persistent', label: 'I stick with things', tags: ['grit', 'determination'] },
  { id: 'curious', label: 'I\'m curious', tags: ['exploration', 'learning'] },
  { id: 'structured', label: 'I like structure', tags: ['organised', 'planning'] },
] as const;

export const WORK_STYLE_OPTIONS = {
  peoplePreference: [
    { id: 'with-people', label: 'With people' },
    { id: 'independently', label: 'Independently' },
    { id: 'mix-people', label: 'A mix of both' },
  ],
  workType: [
    { id: 'practical', label: 'Practical / hands-on' },
    { id: 'academic', label: 'Academic / research' },
    { id: 'creative', label: 'Creative' },
    { id: 'technical', label: 'Technical' },
  ],
  pace: [
    { id: 'fast-paced', label: 'Fast-paced' },
    { id: 'steady', label: 'Steady & predictable' },
    { id: 'varied', label: 'Varied — different each day' },
  ],
  environment: [
    { id: 'indoor', label: 'Indoor / office' },
    { id: 'outdoor', label: 'Outdoor / active' },
    { id: 'mix-environment', label: 'A mix of both' },
  ],
} as const;

export const MOTIVATION_OPTIONS = [
  { id: 'make-difference', label: 'I want to make a difference', tags: ['purpose', 'impact'] },
  { id: 'financial-stability', label: 'I want financial stability', tags: ['security', 'income'] },
  { id: 'flexibility', label: 'I want flexibility', tags: ['freedom', 'balance'] },
  { id: 'keep-learning', label: 'I want to keep learning', tags: ['growth', 'development'] },
  { id: 'be-respected', label: 'I want to be respected', tags: ['status', 'recognition'] },
  { id: 'work-with-people', label: 'I want to work with people', tags: ['social', 'teamwork'] },
  { id: 'meaningful-work', label: 'I want to do meaningful work', tags: ['purpose', 'fulfillment'] },
  { id: 'independence', label: 'I want freedom & independence', tags: ['autonomy', 'entrepreneurial'] },
] as const;

export const CLARITY_OPTIONS = [
  { id: 'clear', label: 'I know what I want', description: 'You have a clear direction' },
  { id: 'few-ideas', label: 'I have a few ideas', description: 'You\'re narrowing it down' },
  { id: 'unsure', label: 'I\'m still unsure', description: 'That\'s completely fine' },
  { id: 'explore-broadly', label: 'I want to explore broadly', description: 'Open to discovery' },
] as const;

// ============================================
// DISCOVER PROFILE (stored per user)
// ============================================

export interface DiscoverProfile {
  interests: string[];          // IDs from INTEREST_OPTIONS
  strengths: string[];          // IDs from STRENGTH_OPTIONS
  workPreferences: {
    peoplePreference: string | null;
    workType: string[];         // Can select multiple
    pace: string | null;
    environment: string | null;
  };
  motivations: string[];        // IDs from MOTIVATION_OPTIONS
  clarityLevel: string | null;  // ID from CLARITY_OPTIONS
  completedAt: string | null;
  lastUpdatedAt: string | null;
  currentStep: number;          // For save/resume (0-4)
}

export const DEFAULT_DISCOVER_PROFILE: DiscoverProfile = {
  interests: [],
  strengths: [],
  workPreferences: {
    peoplePreference: null,
    workType: [],
    pace: null,
    environment: null,
  },
  motivations: [],
  clarityLevel: null,
  completedAt: null,
  lastUpdatedAt: null,
  currentStep: 0,
};

// ============================================
// DERIVED SIGNALS (computed from profile)
// ============================================

export interface DiscoverSignals {
  topTags: string[];            // Aggregated tags from all selections
  summaryText: string;          // Human-readable summary
  careerFitTags: string[];      // Tags used for career matching
  jobFitTags: string[];         // Tags used for job matching
}
