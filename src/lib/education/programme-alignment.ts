/**
 * Programme Alignment
 *
 * Computes how well a specific programme fits the user's Foundation
 * data (subjects, education stage, study programme). Used by the
 * University & Course Browser to surface meaningful alignment signals
 * without overwhelming the user.
 *
 * Three outcomes:
 *   aligned        — strong subject overlap, user is on track
 *   partial        — some overlap, may need extra subjects
 *   needs_attention — low overlap or missing prerequisites
 *
 * When Foundation data is unavailable, returns 'unknown' so the UI
 * can gracefully skip the badge rather than showing a misleading signal.
 */

import type { ProgrammeWithInstitution } from './index';

export type AlignmentStatus = 'aligned' | 'partial' | 'needs_attention' | 'unknown';

export interface AlignmentResult {
  status: AlignmentStatus;
  /** Short explanation, e.g. "Strong match for your current subjects" */
  reason: string;
  /** Subjects from the user's Foundation that match the programme */
  matchedSubjects: string[];
  /** Subjects the programme likely needs that the user is missing */
  missingSubjects: string[];
}

export interface FoundationContext {
  stage?: 'school' | 'college' | 'university' | 'other';
  currentSubjects?: string[];
  studyProgram?: string;
}

// ── Subject requirement patterns per programme type ──────────────────

const SCIENCE_SUBJECTS = ['math', 'mathematics', 'physics', 'chemistry', 'biology', 'science', 'statistics'];
const TECH_SUBJECTS = ['math', 'mathematics', 'computer science', 'it', 'physics', 'statistics', 'design & technology'];
const BUSINESS_SUBJECTS = ['math', 'mathematics', 'economics', 'business studies', 'accounting', 'statistics'];
const HEALTH_SUBJECTS = ['biology', 'chemistry', 'math', 'mathematics', 'health science', 'science', 'physics'];
const HUMANITIES_SUBJECTS = ['history', 'geography', 'psychology', 'sociology', 'philosophy', 'law', 'politics'];
const CREATIVE_SUBJECTS = ['art & design', 'music', 'drama', 'media studies', 'design & technology'];
const LANGUAGE_SUBJECTS = ['english', 'norwegian', 'german', 'french', 'spanish'];

/**
 * Infer which subjects a programme likely requires based on its
 * title, entry requirements, and career outcome text.
 */
function inferRequiredSubjects(prog: ProgrammeWithInstitution): string[] {
  const text = [
    prog.programme,
    prog.englishName,
    prog.entryRequirements ?? '',
    prog.careerOutcome ?? '',
    prog.careerId,
  ]
    .join(' ')
    .toLowerCase();

  const required: string[] = [];

  // Science / medicine / health
  if (/medis|medisin|medicine|health|helse|sykepleie|nurs|dental|tannlege|physio|farma|pharm|biomedic|veterinær|veterinar/.test(text)) {
    required.push(...HEALTH_SUBJECTS);
  }
  // Engineering / tech
  if (/engineer|ingeniør|teknolog|comput|data|it-|cyber|software|program|informatik|elektro|maskin/.test(text)) {
    required.push(...TECH_SUBJECTS);
  }
  // Science / natural
  if (/biolog|kjemi|chemi|fysik|physic|geolog|mathemat|matema|science|realfag/.test(text)) {
    required.push(...SCIENCE_SUBJECTS);
  }
  // Business / economics / finance
  if (/business|økonom|econom|finans|financ|account|regnskap|handel/.test(text)) {
    required.push(...BUSINESS_SUBJECTS);
  }
  // Law / social science
  if (/law|jus|juri|rettsvi|politi|social|sosial|psych|psykol/.test(text)) {
    required.push(...HUMANITIES_SUBJECTS);
  }
  // Architecture / design / creative
  if (/arkitek|architect|design|kunst|art\b|creative|media|film/.test(text)) {
    required.push(...CREATIVE_SUBJECTS);
  }
  // Education / teaching
  if (/lærer|teacher|læreru|pedagog|educati/.test(text)) {
    required.push(...LANGUAGE_SUBJECTS, 'mathematics');
  }
  // Pilot / aviation
  if (/pilot|flyger|aviati|luftfart/.test(text)) {
    required.push('math', 'mathematics', 'physics', 'english');
  }

  // Deduplicate
  return [...new Set(required)];
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function subjectMatches(userSubject: string, required: string): boolean {
  const u = normalise(userSubject);
  const r = normalise(required);
  return u === r || u.includes(r) || r.includes(u);
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Compute alignment between a user's Foundation data and a specific
 * programme. Returns a deterministic result based on subject overlap.
 */
export function computeProgrammeAlignment(
  programme: ProgrammeWithInstitution,
  foundation: FoundationContext | null | undefined,
): AlignmentResult {
  // No foundation → unknown
  if (!foundation || !foundation.currentSubjects || foundation.currentSubjects.length === 0) {
    return { status: 'unknown', reason: '', matchedSubjects: [], missingSubjects: [] };
  }

  const requiredSubjects = inferRequiredSubjects(programme);
  if (requiredSubjects.length === 0) {
    return { status: 'unknown', reason: '', matchedSubjects: [], missingSubjects: [] };
  }

  const userNorm = foundation.currentSubjects;
  const matched: string[] = [];
  const missing: string[] = [];

  const seen = new Set<string>();
  for (const req of requiredSubjects) {
    const key = normalise(req);
    if (seen.has(key)) continue;
    seen.add(key);

    const hit = userNorm.some((u) => subjectMatches(u, req));
    if (hit) matched.push(req);
    else missing.push(req);
  }

  const ratio = matched.length / (matched.length + missing.length);

  if (ratio >= 0.5) {
    return {
      status: 'aligned',
      reason: 'Strong match for your current subjects',
      matchedSubjects: matched,
      missingSubjects: missing,
    };
  }

  if (ratio >= 0.25) {
    const hint = missing.length > 0 ? `${missing[0]} may be needed` : '';
    return {
      status: 'partial',
      reason: hint || 'Some subject overlap',
      matchedSubjects: matched,
      missingSubjects: missing,
    };
  }

  const hint = missing.length > 0 ? `Usually expects ${missing.slice(0, 2).join(' & ')}` : '';
  return {
    status: 'needs_attention',
    reason: hint || 'Low subject overlap',
    matchedSubjects: matched,
    missingSubjects: missing,
  };
}
