/**
 * Self-Reflection Types for My Journey
 *
 * A guided reflection with 3 gentle prompts:
 * "What did you give a go?" -> "What did this show you?" -> "Anything you didn't expect?"
 *
 * This is for youth identity-building — not a diary, not therapy, not AI-evaluated.
 * All data stays in localStorage (private to the user's device).
 */

import type { JourneyLens } from '@/lib/journey/types';

export interface ReflectionEntry {
  id: string;
  createdAt: string;
  awareness: { tried?: string; learned?: string; surprised?: string };
  energy: { level: number; notes?: string };
  capability: { skills?: string[]; responsibility?: string; growthNote?: string };
  direction: { nextInterest?: string; perspectiveShift?: string; addToRoadmap?: boolean };
  linkedPhase?: JourneyLens;
}

export type ReflectionStep = 'tried' | 'learned' | 'surprised';

export const REFLECTION_STEPS: ReflectionStep[] = ['tried', 'learned', 'surprised'];

export const STEP_META: Record<ReflectionStep, { title: string; description: string; placeholder: string }> = {
  tried: {
    title: 'What did you give a go?',
    description: 'Think about something recent — a conversation, a task, a moment.',
    placeholder: 'I helped at a community event...',
  },
  learned: {
    title: 'What did this show you?',
    description: 'Even small things count.',
    placeholder: 'I realised I enjoy organising things...',
  },
  surprised: {
    title: 'Anything you didn\'t expect?',
    description: 'Sometimes the unexpected parts matter most.',
    placeholder: 'I didn\'t expect to enjoy speaking up...',
  },
};

export const DEFAULT_SKILLS = [
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Leadership',
  'Organisation',
  'Creativity',
  'Technical Skills',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
];

export const ENERGY_LABELS = ['Drained', 'Low', 'Neutral', 'Good', 'Energised'] as const;
