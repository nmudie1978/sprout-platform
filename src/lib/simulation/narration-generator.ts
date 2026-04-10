/**
 * Narration Script Generator
 *
 * Pure function that builds a structured narration script from Journey
 * + Foundation data. No AI call — the Journey data already contains
 * everything needed for a meaningful, personalised narration.
 *
 * Each segment maps to one roadmap step (or the Foundation). The hook
 * feeds each segment's `text` to the TTS API one at a time, synced
 * with UI focus transitions.
 *
 * Design: deterministic, fast (~1ms), no side effects. The only
 * variable data comes from the user's actual Foundation + Journey.
 */

import type { Journey, JourneyItem } from '@/lib/journey/career-journey-types';
import { FOUNDATION_ITEM_ID } from '@/components/journey/renderers/zigzag-renderer';

// ── Types ───────────────────────────────────────────────────────────

export interface NarrationSegment {
  /** -1 = foundation intro, 0..N = journey items index */
  stepIndex: number;
  /** item.id or FOUNDATION_ITEM_ID */
  stepId: string;
  /** Step title for UI overlay display */
  title: string;
  /** Text to send to TTS */
  text: string;
  /** Rough estimate in ms (~150 words/min = 2.5 words/sec) */
  estimatedDurationMs: number;
}

export interface NarrationScript {
  career: string;
  totalSegments: number;
  segments: NarrationSegment[];
}

export interface EducationSnapshot {
  stage?: string;
  schoolName?: string;
  studyProgram?: string;
  expectedCompletion?: string;
  currentSubjects?: string[];
}

export interface NarrationContext {
  journey: Journey;
  userName?: string;
  userAge?: number;
  education?: EducationSnapshot | null;
  careerTitle: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

function estimateMs(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.round((words / 2.5) * 1000); // ~150 wpm for TTS
}

function possessiveName(name?: string): string {
  if (!name) return 'Your';
  const capitalised = name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalised}'s`;
}

function subjectList(subjects?: string[]): string {
  if (!subjects || subjects.length === 0) return '';
  if (subjects.length === 1) return subjects[0];
  if (subjects.length === 2) return `${subjects[0]} and ${subjects[1]}`;
  return `${subjects.slice(0, -1).join(', ')}, and ${subjects[subjects.length - 1]}`;
}

// ── Generator ───────────────────────────────────────────────────────

export function generateNarrationScript(ctx: NarrationContext): NarrationScript {
  const { journey, userName, userAge, education, careerTitle } = ctx;
  const segments: NarrationSegment[] = [];
  const name = userName || 'you';
  const possessive = possessiveName(userName);
  const items = journey.items;

  // ── Foundation segment (index -1) ─────────────────────────────────

  let foundationText = `Let's walk through ${possessive.toLowerCase()} path to becoming a ${careerTitle}. `;

  if (education?.schoolName) {
    foundationText += `Right now, ${name} ${userAge ? `is ${userAge} years old and ` : ''}studying at ${education.schoolName}. `;
  } else if (userAge) {
    foundationText += `${name.charAt(0).toUpperCase() + name.slice(1)} is ${userAge} years old. `;
  }

  if (education?.currentSubjects && education.currentSubjects.length > 0) {
    foundationText += `${possessive} subjects in ${subjectList(education.currentSubjects)} form the foundation for this career. `;
  }

  if (education?.expectedCompletion) {
    foundationText += `The current stage finishes around ${education.expectedCompletion}. `;
  }

  foundationText += 'This is where the journey begins.';

  segments.push({
    stepIndex: -1,
    stepId: FOUNDATION_ITEM_ID,
    title: 'Your Starting Point',
    text: foundationText.trim(),
    estimatedDurationMs: estimateMs(foundationText),
  });

  // ── Step segments (0..N) ──────────────────────────────────────────

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isLast = i === items.length - 1;
    let text = '';

    // Age context
    if (item.startAge) {
      text += `At age ${item.startAge}${item.endAge && item.endAge !== item.startAge ? ` to ${item.endAge}` : ''}, `;
    }

    // Core narration from title
    text += `${name} will ${item.title.charAt(0).toLowerCase()}${item.title.slice(1)}. `;

    // Description adds depth
    if (item.description) {
      // Take first 2 sentences max to keep it concise
      const sentences = item.description.split(/(?<=[.!?])\s+/).slice(0, 2);
      text += sentences.join(' ') + ' ';
    }

    // Micro-actions add a concrete "what this actually means" layer
    if (item.microActions && item.microActions.length > 0) {
      const action = item.microActions[0];
      text += `This means things like: ${action.charAt(0).toLowerCase()}${action.slice(1)}. `;
    }

    // Transition or closing
    if (isLast) {
      text += `And that's the destination.`;
    }

    segments.push({
      stepIndex: i,
      stepId: item.id,
      title: item.title,
      text: text.trim(),
      estimatedDurationMs: estimateMs(text),
    });
  }

  // ── Outcome segment (appended after last step) ────────────────────

  const lastItem = items[items.length - 1];
  const firstAge = journey.startAge;
  const lastAge = lastItem?.endAge ?? lastItem?.startAge ?? firstAge;
  const spanYears = lastAge - firstAge;

  let outcomeText = `So there it is — ${possessive.toLowerCase()} full path to becoming a ${careerTitle}. `;
  if (spanYears > 0) {
    outcomeText += `From where ${name} is now to the end of this roadmap is roughly ${spanYears} years. `;
  }
  outcomeText += `It's a real commitment, but every step builds on the last. `;
  outcomeText += `The most important thing right now isn't to have it all figured out — it's to understand what the path looks like and decide if it feels right.`;

  segments.push({
    stepIndex: items.length, // one past the last item
    stepId: 'outcome',
    title: 'Your Future',
    text: outcomeText.trim(),
    estimatedDurationMs: estimateMs(outcomeText),
  });

  return {
    career: careerTitle,
    totalSegments: segments.length,
    segments,
  };
}
