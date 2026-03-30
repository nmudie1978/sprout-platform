/**
 * Career Journey Types & Stage Configuration
 *
 * Single source of truth for Journey data shape and stage visuals.
 * Used by both the visual timeline and the Mermaid structured view.
 */

import type { CareerJourney, CareerJourneyItem, CareerJourneyStage } from './demoCareerJourney';

// ============================================
// TYPES
// ============================================

export type JourneyStage = 'foundation' | 'education' | 'experience' | 'career';

export interface SuggestedResource {
  label: string;
  url: string;
  type: 'course' | 'article' | 'tool' | 'platform' | 'video';
}

export interface HowToStep {
  step: string;
  detail?: string;
}

export interface JourneyItem {
  id: string;
  stage: JourneyStage;
  title: string;
  subtitle?: string;
  startAge: number;
  endAge?: number;
  isMilestone: boolean;
  icon?: string;
  description?: string;
  microActions?: string[];
  suggestedResources?: SuggestedResource[];
  howTo?: HowToStep[];
  isCustom?: boolean;
}

export interface SchoolTrackItem {
  id: string;
  stage: JourneyStage;
  title: string;
  subjects: string[];
  personalLearning?: string;
  startAge: number;
  endAge?: number;
}

export interface Journey {
  id: string;
  career: string;
  startAge: number;
  startYear: number;
  items: JourneyItem[];
  schoolTrack?: SchoolTrackItem[];
}

// ============================================
// STAGE CONFIGURATION
// ============================================

export interface StageConfig {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
}

export const STAGE_CONFIG: Record<JourneyStage, StageConfig> = {
  foundation: {
    label: 'Foundation',
    color: '#7dae8e',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
    gradientFrom: '#8cc09e',
    gradientTo: '#6a9c7c',
    icon: 'Sparkles',
  },
  education: {
    label: 'Education',
    color: '#5b9bd5',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-600',
    gradientFrom: '#6aaae4',
    gradientTo: '#4a8ac4',
    icon: 'GraduationCap',
  },
  experience: {
    label: 'Experience',
    color: '#e08a4a',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-600',
    gradientFrom: '#ec9a5c',
    gradientTo: '#d47a3a',
    icon: 'Briefcase',
  },
  career: {
    label: 'Career',
    color: '#d4b84a',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-600',
    gradientFrom: '#e0c85c',
    gradientTo: '#c4a83a',
    icon: 'Target',
  },
};

export const STAGE_ORDER: JourneyStage[] = ['foundation', 'education', 'experience', 'career'];

// ============================================
// LEGACY ADAPTER
// ============================================

/**
 * Converts new Journey schema → old CareerJourney schema
 * so careerJourneyToMermaid() works unchanged.
 */
export function journeyToLegacyFormat(journey: Journey): CareerJourney {
  const stages: CareerJourneyStage[] = STAGE_ORDER.map((stageId) => ({
    id: stageId,
    label: STAGE_CONFIG[stageId].label,
    color: STAGE_CONFIG[stageId].color,
    icon: STAGE_CONFIG[stageId].icon,
  }));

  const items: CareerJourneyItem[] = journey.items.map((item) => {
    const yearOffset = item.startAge - journey.startAge;
    const startYear = journey.startYear + yearOffset;
    const durationYears = item.endAge ? item.endAge - item.startAge : 0;

    return {
      title: item.title,
      stage: item.stage,
      startYear,
      durationYears,
      isMilestone: item.isMilestone,
    };
  });

  return {
    career: journey.career,
    startAge: journey.startAge,
    startYear: journey.startYear,
    stages,
    items,
  };
}
