/**
 * Roadmap Rules Engine — single source of truth for the rules that
 * govern roadmap step content.
 *
 * Rules are enforced in three places:
 *  1. AI prompt          — natural-language instructions sent to GPT
 *  2. Fallback generator — hard-coded TypeScript timeline
 *  3. Client sanitiser   — defensive scrubbers on cached/legacy output
 *
 * This module owns:
 *  - the canonical rule list (id + description + where it's enforced)
 *  - `buildPromptRules()`        → the rules section of the AI system prompt
 *  - `sanitizeJourney(journey)`  → applies all client-side scrubbers in one pass
 *
 * Adding a rule? Add it once here. Update `buildPromptRules` if it should
 * appear in the AI prompt. Update `sanitizeJourney` if it can be enforced
 * on output. Update the fallback generator if it shapes the timeline.
 */

import type { Journey, JourneyItem, JourneyStage } from './career-journey-types';

// ────────────────────────────────────────────────────────────────────
// Rule catalogue
// ────────────────────────────────────────────────────────────────────

export type EnforcementPoint = 'prompt' | 'fallback' | 'client';

export interface RoadmapRule {
  id: string;
  title: string;
  description: string;
  enforcedAt: EnforcementPoint[];
}

export const ROADMAP_RULES: RoadmapRule[] = [
  {
    id: 'no-restate-stage',
    title: "Don't restate the user's current stage",
    description:
      "The Foundation card already represents the user's current education stage. The roadmap MUST start at the next phase. Never include a step that restates the current stage (e.g. 'Complete upper secondary', 'Complete videregående', 'Continue your current studies').",
    enforcedAt: ['prompt', 'fallback', 'client'],
  },
  {
    id: 'no-career-name-in-titles',
    title: "Don't repeat the career name in step text",
    description:
      "Titles and subtitles must NOT repeat the career name (or its component words). The user already chose the career; don't echo it back in every step.",
    enforcedAt: ['prompt', 'client'],
  },
  {
    id: 'no-duration-phrases',
    title: "Don't put durations in titles or subtitles",
    description:
      "The timeline already shows ages. Phrases like '(2 years)', 'for 3 years', '~5 yrs' are noise in titles/subtitles.",
    enforcedAt: ['client'],
  },
  {
    id: 'verb-led-titles',
    title: 'Every title must be verb-led',
    description:
      'Every step title must start with an action verb (Apply, Begin, Start, Complete, Finish, Earn, Accept, Gain, Step, Find, Build, Join, Pass, Submit). No bare nouns like "Apprenticeship", "Graduation", "Vocational certificate".',
    enforcedAt: ['prompt', 'client'],
  },
  {
    id: 'application-before-entry',
    title: 'Apply-before-Begin for every formal opportunity',
    description:
      'Every apprenticeship, university place, college course, vocational programme, internship, or job MUST be preceded by an explicit "Apply for X" step. Never collapse the application phase into the entry step.',
    enforcedAt: ['prompt'],
  },
  {
    id: 'two-step-entry-to-work',
    title: 'Two distinct steps for getting into work',
    description:
      'Always include "Apply for entry-level roles" (the job-search milestone) AND a separate "Accept your first entry-level role" (the actual job). Never jump straight from graduation into a role.',
    enforcedAt: ['prompt', 'fallback'],
  },
  {
    id: 'no-early-certifications',
    title: 'No professional certifications before age 23 or before work experience',
    description:
      'Never suggest professional certifications (PRINCE2, PMP, AWS, CISSP, etc.) before age 23 or before the user has actually worked in the field. Certifications follow experience, not the other way round.',
    enforcedAt: ['prompt', 'fallback'],
  },
  {
    id: 'anchored-to-user-age',
    title: 'Anchor every item to the user’s age and finish date',
    description:
      "Every step must have startAge >= the user's current age. If the user has provided an expectedCompletion date for their current stage, the first post-foundation step must start in the SAME year (e.g. finish school summer 2027 → begin university autumn 2027, same age).",
    enforcedAt: ['prompt', 'fallback'],
  },
  {
    id: 'stage-aware-branches',
    title: 'Branch on the user’s declared education stage',
    description:
      "The roadmap must fork on the user's educationStage (school | college | university | other). University students don't get school steps. 'Other' (gap year / working / undeclared) skips formal education entirely. Never assume the school path.",
    enforcedAt: ['prompt', 'fallback', 'client'],
  },
  {
    id: 'locale-neutral-programme-names',
    title: 'Use locale-neutral programme names',
    description:
      "Don't invent country-specific programme names like 'upper secondary — health & social care' or 'videregående'. Use generic phrasing ('Begin university studies', 'Apprenticeship at a care home'). Never invent a programme that doesn't exist in the user's country.",
    enforcedAt: ['prompt'],
  },
  // ── New guardrails ────────────────────────────────────────────────
  {
    id: 'sequential-gating',
    title: 'Steps unlock in order',
    description:
      "A step's progress can only be marked done after every earlier step is done. Future steps are visually locked until the previous step is complete.",
    enforcedAt: ['client'],
  },
  {
    id: 'realistic-age-bands',
    title: 'Each stage has a realistic age band',
    description:
      'Foundation < 19, Education 17–25, Experience 21–30, Career 27+. Items whose startAge falls outside the band for their stage are clamped or dropped.',
    enforcedAt: ['prompt', 'client'],
  },
  {
    id: 'no-overlapping-steps',
    title: 'Steps never overlap (one finishes before the next begins)',
    description:
      "Two steps can never be in progress at the same age. items[i].startAge MUST be strictly greater than the previous item's last occupied age (endAge if defined, otherwise startAge). This is a hard guardrail — sequential progression is the entire point of the roadmap.",
    enforcedAt: ['prompt', 'client'],
  },
  {
    id: 'apply-before-begin-pairing',
    title: 'Every Begin/Accept must be preceded by an Apply',
    description:
      'A Begin/Accept/Start step for a formal opportunity (apprenticeship, university, college, internship, job) must be immediately preceded by a matching "Apply for…" step. If missing, the apply step is synthesised at the same age and stage.',
    enforcedAt: ['prompt', 'client'],
  },
  {
    id: 'apply-and-accept-same-year',
    title: 'Apply and acquire happen in the same year',
    description:
      'For jobs and university (and other formal opportunities), the "Apply for X" step and the matching "Accept/Begin X" step MUST occur at the same age — i.e. application and acquisition happen in the same year. Never spread an apply→accept pair across different ages.',
    enforcedAt: ['prompt', 'fallback', 'client'],
  },
  {
    id: 'safeguarding-content-filter',
    title: 'No unsafe content in step text',
    description:
      'Roadmap content must never contain emails, phone numbers, social-media handles, payment terms, or instructions to contact people outside the platform. Items containing unsafe content are scrubbed; if the title becomes empty, the item is dropped.',
    enforcedAt: ['client'],
  },
];

// ────────────────────────────────────────────────────────────────────
// Age bands per stage (rule: realistic-age-bands)
// ────────────────────────────────────────────────────────────────────

export const STAGE_AGE_BANDS: Record<JourneyStage, { min: number; max: number }> = {
  foundation: { min: 14, max: 19 },
  education: { min: 17, max: 25 },
  experience: { min: 21, max: 30 },
  career: { min: 27, max: 65 },
};

// ────────────────────────────────────────────────────────────────────
// AI prompt builder — derives the RULES section from the catalogue
// ────────────────────────────────────────────────────────────────────

export function buildPromptRules(): string {
  return ROADMAP_RULES.filter((r) => r.enforcedAt.includes('prompt'))
    .map((r, i) => `${i + 1}. ${r.title.toUpperCase()} — ${r.description}`)
    .join('\n');
}

// ────────────────────────────────────────────────────────────────────
// Client-side sanitisers
// ────────────────────────────────────────────────────────────────────

const VERBS = [
  'apply', 'begin', 'start', 'complete', 'finish', 'earn', 'accept',
  'gain', 'step', 'find', 'build', 'join', 'pass', 'submit', 'continue',
  'graduate', 'enrol', 'enroll', 'take', 'choose', 'pick', 'study',
  // Verbs that read as natural step starters but were missing from
  // the list, causing the sanitiser to prepend "Begin " and produce
  // junk like "Begin consider professional certifications".
  'consider', 'explore', 'pursue', 'develop', 'specialise', 'specialize',
  'qualify', 'register', 'volunteer', 'shadow', 'attend', 'research',
  'prepare', 'practise', 'practice', 'become', 'move',
];

const NOUN_PREFIX_FIXES: Array<[RegExp, string]> = [
  [/^apprenticeship\b/i, 'Begin apprenticeship'],
  [/^internship\b/i, 'Begin internship'],
  [/^vocational\s+(certificate|qualification|diploma|training)\b/i, 'Earn vocational $1'],
  [/^professional\s+certifications?\b/i, 'Gain professional certifications'],
  [/^entry[-\s]level\s+role/i, 'Accept entry-level role'],
  [/^graduation\b/i, 'Complete graduation'],
  [/^senior\s+role\b/i, 'Step up to a senior role'],
  [/^university\s+studies?\b/i, 'Begin university studies'],
];

const RESTATES_FOUNDATION_RE =
  /\b(?:upper\s+secondary|videregående|secondary\s+school|finish\s+school|complete\s+school|continue\s+(?:your\s+)?(?:university\s+)?studies?|continue\s+studying|in\s+secondary)\b/i;

const YEARS_PAREN_RE = /\s*\(\s*\d+\s*(?:\+|-\s*\d+)?\s*(?:years?|yrs?)\b[^)]*\)/gi;
const YEARS_INLINE_RE = /\b(?:for\s+|over\s+|~?\s*)?\d+\s*(?:\+|-\s*\d+)?\s*(?:years?|yrs?)\b/gi;
const DANGLING_RE = /\s+(?:as|of|for|in|at|to|with|the|a|an|and|or|on|by)\b[\s.,;:—–-]*$/i;
const LEADING_RE = /^(?:as|of|for|in|at|to|with|the|a|an|and|or|on|by)\s+/i;

/** Build a regex that matches the career name and any of its 4+ char component words. */
function buildCareerRegex(career: string): RegExp | null {
  const trimmed = career.trim();
  if (!trimmed) return null;
  const tokens = [trimmed, ...trimmed.split(/[\s—–\-/,]+/).filter((w) => w.length >= 4)];
  const escaped = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$1'))
    .sort((a, b) => b.length - a.length);
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'gi');
}

/** Strip career name, duration phrases, and dangling prepositions. */
export function scrubText(s: string | null | undefined, careerRe: RegExp | null): string | undefined {
  if (!s) return s ?? undefined;
  let out = s
    .replace(YEARS_PAREN_RE, '')
    .replace(YEARS_INLINE_RE, '');
  if (careerRe) out = out.replace(careerRe, '');
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/[\s,.;:—–-]+$/g, '')
    .replace(/^[\s,.;:—–-]+/g, '')
    .trim();
  let prev = '';
  while (prev !== out) {
    prev = out;
    out = out.replace(DANGLING_RE, '').replace(LEADING_RE, '').trim();
  }
  return out;
}

/** Force a title to start with a verb. Uses the noun→verb fix table, then a generic "Begin" fallback. */
export function verbLead(title: string): string {
  let trimmed = title.trim();

  // Defensive: strip a stale "Begin <verb>" double-prefix that an
  // earlier version of this sanitiser may have produced (e.g.
  // "Begin consider professional certifications" → "Consider
  // professional certifications"). The cached server roadmap can
  // still hold these stale strings.
  const doubleVerb = trimmed.match(/^Begin\s+(\w+)\b(.*)$/i);
  if (doubleVerb) {
    const inner = doubleVerb[1].toLowerCase();
    if (VERBS.includes(inner)) {
      trimmed = doubleVerb[1].charAt(0).toUpperCase() + doubleVerb[1].slice(1) + doubleVerb[2];
    }
  }

  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[,.;:]+$/, '');
  if (firstWord && VERBS.includes(firstWord)) return trimmed;
  for (const [pattern, replacement] of NOUN_PREFIX_FIXES) {
    if (pattern.test(trimmed)) return trimmed.replace(pattern, replacement);
  }
  return `Begin ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
}

/** True if a title restates the user's current education stage (a Foundation duplicate). */
export function restatesFoundation(title: string): boolean {
  return RESTATES_FOUNDATION_RE.test(title);
}

// ────────────────────────────────────────────────────────────────────
// Safeguarding filter (rule: safeguarding-content-filter)
// ────────────────────────────────────────────────────────────────────

const UNSAFE_PATTERNS: RegExp[] = [
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gi, // email addresses
  /(?:\+?\d[\d\s().-]{7,}\d)/g, // phone numbers (loose)
  /(?<!\w)@\w{3,}/g, // social handles
  /\b(?:dm|message|whatsapp|instagram|insta|tiktok|snapchat|telegram|messenger|facebook|fb)\s+(?:me|the\s+\w+|them|us)\b/gi,
  /\b(?:venmo|paypal|cash\s*app|zelle|bank\s+transfer|wire\s+transfer|send\s+money|pay\s+(?:cash|in\s+advance))\b/gi,
];

/** Strip unsafe content (contact info, payment terms, off-platform contact). */
export function safeguardScrub(s: string | null | undefined): string | undefined {
  if (!s) return s ?? undefined;
  let out = s;
  for (const re of UNSAFE_PATTERNS) out = out.replace(re, '');
  return out.replace(/\s{2,}/g, ' ').trim();
}

// ────────────────────────────────────────────────────────────────────
// Apply→Begin pairing (rule: apply-before-begin-pairing)
// ────────────────────────────────────────────────────────────────────

const BEGIN_VERBS_RE = /^(?:begin|accept|start)\b/i;
/** Words that signal a "formal opportunity" the user enters into. */
const FORMAL_OPP_RE =
  /\b(?:apprenticeship|internship|university|college|degree|programme|program|course|training|role|job|position)\b/i;

function makeId(): string {
  return `synth-${Math.random().toString(36).slice(2, 9)}`;
}

/** Insert a synthetic "Apply for X" step before any Begin/Accept that lacks one. */
function ensureApplyBeforeBegin(items: JourneyItem[]): JourneyItem[] {
  const out: JourneyItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    const isBegin = BEGIN_VERBS_RE.test(cur.title) && FORMAL_OPP_RE.test(cur.title);
    if (isBegin) {
      const prev = out[out.length - 1];
      const prevHasApply = prev && /^apply\b/i.test(prev.title);
      if (!prevHasApply) {
        const noun = cur.title.replace(BEGIN_VERBS_RE, '').trim();
        out.push({
          ...cur,
          id: makeId(),
          title: `Apply for ${noun.charAt(0).toLowerCase()}${noun.slice(1)}`,
          subtitle: undefined,
          isMilestone: true,
          // Apply at the same start age — application happens just before entry
          endAge: cur.startAge,
        });
      }
    }
    out.push(cur);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Age band clamping + monotonic enforcement
// ────────────────────────────────────────────────────────────────────

/**
 * Clamp items to stage bands AND enforce strict non-overlap between
 * consecutive steps. One step must finish before the next begins —
 * never two steps in progress at the same age.
 *
 * Rule: items[i].startAge > (items[i-1].endAge ?? items[i-1].startAge).
 * In age units that means items[i].startAge >= prevLastAge + 1.
 *
 * If a previous item has no endAge it's treated as occupying its single
 * startAge year, so the next item starts the year after.
 */
function enforceAgeRules(items: JourneyItem[]): JourneyItem[] {
  if (items.length === 0) return items;
  let prevLastAge = -Infinity;
  let prevStartAge = -Infinity;
  let prevTitle = '';
  const out: JourneyItem[] = [];
  for (const it of items) {
    const band = STAGE_AGE_BANDS[it.stage];
    let startAge = it.startAge;
    // 1) Clamp to the stage's reasonable age band first.
    if (band) {
      if (startAge < band.min) startAge = band.min;
      if (startAge > band.max) startAge = band.max;
    }
    // 2) Apply→Accept/Begin pairing: an entry step that follows its
    //    matching apply step shares the same start age — application
    //    and acquisition happen in the same year (rule:
    //    apply-and-accept-same-year). For these pairs we override the
    //    strict non-overlap below.
    const isPair =
      /^apply\b/i.test(prevTitle) &&
      BEGIN_VERBS_RE.test(it.title) &&
      FORMAL_OPP_RE.test(it.title);
    if (isPair) {
      startAge = prevStartAge;
    } else if (startAge <= prevLastAge) {
      // 3) Strict non-overlap with the previous item.
      startAge = prevLastAge + 1;
    }
    // 4) endAge must be >= startAge.
    let endAge = it.endAge;
    if (endAge !== undefined && endAge !== null && endAge < startAge) endAge = startAge;
    // 5) Track the *last* age this step occupies so the next item can
    //    start strictly after it.
    const lastAge = endAge !== undefined && endAge !== null ? endAge : startAge;
    prevLastAge = Math.max(prevLastAge, lastAge);
    prevStartAge = startAge;
    prevTitle = it.title;
    out.push({ ...it, startAge, endAge });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Sequential gating (rule: sequential-gating)
// ────────────────────────────────────────────────────────────────────

/** True if a step at index `i` is unlocked (every earlier step is done). */
export function isStepLocked(
  items: JourneyItem[],
  index: number,
  statusOf: (id: string) => 'not_started' | 'in_progress' | 'done' | undefined,
): boolean {
  for (let j = 0; j < index; j++) {
    if (statusOf(items[j].id) !== 'done') return true;
  }
  return false;
}

// ────────────────────────────────────────────────────────────────────
// Single-pass sanitiser
// ────────────────────────────────────────────────────────────────────

/** Apply every client-side rule to a Journey in one pass. */
export function sanitizeJourney(journey: Journey): Journey {
  const careerRe = buildCareerRegex(journey.career || '');

  // Stage 1: text rules — scrub, verb-lead, drop foundation duplicates,
  // drop items whose title is fully unsafe.
  const cleaned: JourneyItem[] = journey.items
    .filter((it) => !restatesFoundation(it.title))
    .map((it) => {
      const safeTitle = safeguardScrub(it.title) || '';
      const scrubbedTitle = scrubText(safeTitle, careerRe) || safeTitle;
      const safeSubtitle = safeguardScrub(it.subtitle);
      const scrubbedSubtitle = scrubText(safeSubtitle, careerRe);
      return {
        ...it,
        title: scrubbedTitle ? verbLead(scrubbedTitle) : '',
        subtitle: scrubbedSubtitle || undefined,
      };
    })
    .filter((it) => it.title.length > 0);

  // Stage 2: structural rules — Apply→Begin pairing, age band clamping,
  // monotonic ages.
  const paired = ensureApplyBeforeBegin(cleaned);
  const aged = enforceAgeRules(paired);

  return { ...journey, items: aged };
}
