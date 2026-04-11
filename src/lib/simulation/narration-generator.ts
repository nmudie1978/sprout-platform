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
  /** e.g. "1,100,000 - 2,000,000 kr/year" — from career-pathways */
  salaryRange?: string;
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

/**
 * Parse a salary range string like "1,100,000 - 2,000,000 kr/year"
 * into a low and high number for narration phrasing.
 */
function parseSalary(range?: string): { low: string; high: string } | null {
  if (!range) return null;
  const nums = range.match(/[\d,]+/g);
  if (!nums || nums.length < 2) return null;
  // Format as shorter "1.1 million" style for natural speech
  const format = (s: string) => {
    const n = parseInt(s.replace(/,/g, ''), 10);
    if (isNaN(n)) return s;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')} million`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
    return String(n);
  };
  return { low: format(nums[0]), high: format(nums[1]) };
}

/** Detect if a step title is about getting the first job */
function isEntryJobStep(title: string): boolean {
  const t = title.toLowerCase();
  return /\b(accept|start|begin)\b.*\b(entry|first|junior)\b.*\b(role|job|position)\b/i.test(t)
    || /\b(entry[-\s]level)\b/i.test(t)
    || /\bfirst.*role\b/i.test(t);
}

/** Detect if a step title is about reaching a senior role */
function isSeniorStep(title: string): boolean {
  const t = title.toLowerCase();
  return /\b(senior|step up|advance|lead|specialist|expert)\b/i.test(t);
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

  // Stage-aware institution description
  const stageLabel = education?.stage === 'university' ? 'studying at'
    : education?.stage === 'college' ? 'attending'
    : 'at';

  if (education?.schoolName) {
    foundationText += `${name.charAt(0).toUpperCase() + name.slice(1)} is currently ${userAge ? `${userAge} years old, ` : ''}${stageLabel} ${education.schoolName}`;
    if (education.studyProgram) {
      foundationText += `, on the ${education.studyProgram} programme`;
    }
    if (education.expectedCompletion) {
      foundationText += `, finishing around ${education.expectedCompletion}`;
    }
    foundationText += '. ';
  } else if (userAge) {
    foundationText += `${name.charAt(0).toUpperCase() + name.slice(1)} is ${userAge} years old. `;
  }

  if (education?.currentSubjects && education.currentSubjects.length > 0) {
    foundationText += `${possessive} current subjects — ${subjectList(education.currentSubjects)} — are a good start. `;
  }

  // Actionable advice based on education stage + what comes next
  const firstStep = items[0];
  if (education?.stage === 'university') {
    foundationText += `Since ${name} is already at university, the focus should be on completing the degree strongly and building relevant experience through internships or projects. `;
  } else if (education?.stage === 'college') {
    foundationText += `The focus right now should be on completing the vocational programme and gaining practical experience. `;
  } else if (firstStep) {
    const titleLower = firstStep.title.toLowerCase();
    if (/university|degree|bachelor|master/i.test(titleLower)) {
      foundationText += `The focus right now should be on achieving strong grades, especially in relevant subjects, to qualify for a university place. `;
    } else if (/apprentice|vocational|fagbrev/i.test(titleLower)) {
      foundationText += `The next step is applying for the right vocational programme, so focus on keeping grades solid and exploring practical work experience. `;
    } else if (/apply|intern/i.test(titleLower)) {
      foundationText += `The priority right now is building a strong application — grades, relevant experience, and a clear sense of direction. `;
    }
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

  const salary = parseSalary(ctx.salaryRange);

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
      const sentences = item.description.split(/(?<=[.!?])\s+/).slice(0, 2);
      text += sentences.join(' ') + ' ';
    }

    // Micro-actions add a concrete "what this actually means" layer
    if (item.microActions && item.microActions.length > 0) {
      const action = item.microActions[0];
      text += `This means things like: ${action.charAt(0).toLowerCase()}${action.slice(1)}. `;
    }

    // Salary context at key career milestones
    if (salary && isEntryJobStep(item.title)) {
      text += `This is when ${name} starts earning — entry-level salaries for this field typically start around ${salary.low} kroner per year. `;
    } else if (salary && isSeniorStep(item.title)) {
      text += `At this level, experienced professionals in this field earn up to ${salary.high} kroner per year. `;
    }

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

  let outcomeText = `So there it is — ${possessive.toLowerCase()} complete path to becoming a ${careerTitle}. `;
  if (spanYears > 0) {
    outcomeText += `From where ${name} is today to a fully qualified ${careerTitle} is roughly ${spanYears} years. `;
  }
  if (salary) {
    outcomeText += `Along the way, ${name} will go from earning around ${salary.low} kroner at the start to up to ${salary.high} kroner at the senior level. `;
  }
  outcomeText += `It's a real commitment — but every single step builds on the last, and thousands of people walk this exact path every year. `;
  outcomeText += `${name.charAt(0).toUpperCase() + name.slice(1)} doesn't need to have it all figured out right now. The fact that ${name} is exploring this path already puts ${name === 'you' ? 'you' : 'them'} ahead. `;
  outcomeText += `The future is closer than it looks.`;

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
