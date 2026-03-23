/**
 * Education Alignment Utilities
 *
 * Maps careers to relevant subjects, determines alignment state,
 * classifies roadmap step types, and generates "why it matters" content.
 */

import type {
  SubjectAlignment,
  RoadmapStepType,
  CareerSubjectMapping,
} from './types';
import type { JourneyItem, JourneyStage } from '@/lib/journey/career-journey-types';

// ── Career → Subject Mappings ────────────────────────────────────────
// Covers the most common career paths. Falls back gracefully for unknown careers.

const CAREER_SUBJECT_MAP: CareerSubjectMapping[] = [
  {
    career: 'doctor',
    keySubjects: ['Biology', 'Chemistry', 'Mathematics'],
    supportingSubjects: ['Physics', 'Psychology', 'English'],
    focusAreas: ['Science fundamentals', 'Problem-solving', 'Communication skills'],
    nextDecisions: ['Choose science subjects for next year', 'Research medical school entry requirements', 'Look into hospital volunteering'],
    whySubjectsMatter: 'Medicine requires strong science foundations — biology and chemistry are essential for entry.',
  },
  {
    career: 'nurse',
    keySubjects: ['Biology', 'Chemistry', 'Health Science'],
    supportingSubjects: ['Psychology', 'Mathematics', 'English'],
    focusAreas: ['Biology fundamentals', 'Patient care understanding', 'Communication'],
    nextDecisions: ['Choose biology and chemistry for exams', 'Research nursing programs', 'Explore care home volunteering'],
    whySubjectsMatter: 'Nursing requires strong biology and an understanding of health science for entry.',
  },
  {
    career: 'physiotherapist',
    keySubjects: ['Biology', 'Physical Education', 'Chemistry'],
    supportingSubjects: ['Mathematics', 'Psychology', 'Physics'],
    focusAreas: ['Human biology', 'Anatomy and movement', 'Scientific reasoning'],
    nextDecisions: ['Keep biology and PE as core subjects', 'Research physiotherapy degree requirements', 'Look into volunteer work in health settings'],
    whySubjectsMatter: 'Physiotherapy combines biology with physical understanding — PE and biology are your strongest foundations.',
  },
  {
    career: 'software developer',
    keySubjects: ['Mathematics', 'Computer Science', 'Physics'],
    supportingSubjects: ['English', 'Design & Technology', 'Business Studies'],
    focusAreas: ['Logical thinking', 'Problem-solving', 'Programming basics'],
    nextDecisions: ['Start learning a programming language', 'Choose maths and computing subjects', 'Build a small project or portfolio'],
    whySubjectsMatter: 'Software development relies on logical and mathematical thinking. Starting early with code gives you a real advantage.',
  },
  {
    career: 'engineer',
    keySubjects: ['Mathematics', 'Physics', 'Design & Technology'],
    supportingSubjects: ['Computer Science', 'Chemistry', 'English'],
    focusAreas: ['Mathematical reasoning', 'Physics principles', 'Design thinking'],
    nextDecisions: ['Choose maths and physics at higher levels', 'Research engineering specialisations', 'Enter a STEM competition or project'],
    whySubjectsMatter: 'Engineering is built on maths and physics. Strong foundations here open doors to many specialisations.',
  },
  {
    career: 'teacher',
    keySubjects: ['English', 'Mathematics', 'Psychology'],
    supportingSubjects: ['Any subject you want to teach', 'Sociology', 'Drama'],
    focusAreas: ['Communication skills', 'Subject knowledge', 'Understanding how people learn'],
    nextDecisions: ['Choose subjects you might want to teach', 'Research education degree requirements', 'Get experience with younger students'],
    whySubjectsMatter: 'Teaching requires strong knowledge in your chosen subject plus an understanding of how learning works.',
  },
  {
    career: 'graphic designer',
    keySubjects: ['Art & Design', 'Design & Technology', 'Computer Science'],
    supportingSubjects: ['English', 'Media Studies', 'Business Studies'],
    focusAreas: ['Visual creativity', 'Digital design tools', 'Communication through design'],
    nextDecisions: ['Build a portfolio of creative work', 'Learn design software (Figma, Illustrator)', 'Research design courses or apprenticeships'],
    whySubjectsMatter: 'Design is a creative and technical field — art gives you the eye, technology gives you the tools.',
  },
  {
    career: 'business',
    keySubjects: ['Business Studies', 'Mathematics', 'English'],
    supportingSubjects: ['Economics', 'Computer Science', 'Psychology'],
    focusAreas: ['Financial literacy', 'Communication', 'Strategic thinking'],
    nextDecisions: ['Choose business and maths subjects', 'Research business degrees or apprenticeships', 'Start a small project or side venture'],
    whySubjectsMatter: 'Business careers need numeracy, communication, and an understanding of how organisations work.',
  },
  {
    career: 'lawyer',
    keySubjects: ['English', 'History', 'Law'],
    supportingSubjects: ['Politics', 'Philosophy', 'Sociology'],
    focusAreas: ['Critical thinking', 'Written communication', 'Analytical reasoning'],
    nextDecisions: ['Strengthen essay writing and analysis skills', 'Research law degree requirements', 'Look into debating or mock trial activities'],
    whySubjectsMatter: 'Law requires strong analytical and communication skills — English and humanities build these foundations.',
  },
];

// ── Fuzzy career matching ────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getCareerSubjectMapping(careerTitle: string): CareerSubjectMapping | null {
  const norm = normalise(careerTitle);
  // Direct match
  const direct = CAREER_SUBJECT_MAP.find((m) => normalise(m.career) === norm);
  if (direct) return direct;
  // Partial match — career title contains the keyword
  const partial = CAREER_SUBJECT_MAP.find((m) => norm.includes(normalise(m.career)));
  if (partial) return partial;
  // Keyword match in reverse
  const reverse = CAREER_SUBJECT_MAP.find((m) => normalise(m.career).includes(norm));
  if (reverse) return reverse;
  return null;
}

// ── Subject Alignment Calculation ────────────────────────────────────

export function calculateSubjectAlignment(
  currentSubjects: string[],
  careerTitle: string,
): { alignment: SubjectAlignment; matchedKey: string[]; missingKey: string[] } {
  const mapping = getCareerSubjectMapping(careerTitle);
  if (!mapping) return { alignment: 'unknown', matchedKey: [], missingKey: [] };
  if (currentSubjects.length === 0) return { alignment: 'unknown', matchedKey: [], missingKey: mapping.keySubjects };

  const normSubjects = currentSubjects.map(normalise);
  const matchedKey = mapping.keySubjects.filter((s) => normSubjects.some((cs) => cs.includes(normalise(s)) || normalise(s).includes(cs)));
  const missingKey = mapping.keySubjects.filter((s) => !matchedKey.includes(s));

  const ratio = matchedKey.length / mapping.keySubjects.length;
  if (ratio >= 0.66) return { alignment: 'strong', matchedKey, missingKey };
  if (ratio >= 0.33) return { alignment: 'partial', matchedKey, missingKey };
  return { alignment: 'missing', matchedKey, missingKey };
}

// ── Step Type Classification ─────────────────────────────────────────

export function classifyStepType(item: JourneyItem): RoadmapStepType {
  const title = item.title.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const combined = `${title} ${desc}`;

  if (item.isMilestone) return 'milestone';

  // School-related keywords
  if (/school|gcse|a-level|ib|exam|subject|grade|coursework|study/i.test(combined)) return 'school';

  // Qualification keywords
  if (/degree|certification|diploma|qualification|licence|accredit/i.test(combined)) return 'qualification';

  // Real-world keywords
  if (/intern|volunteer|job|shadow|work experience|portfolio|project|apply|placement/i.test(combined)) return 'real-world';

  // Stage-based fallback
  const stageMap: Record<JourneyStage, RoadmapStepType> = {
    foundation: 'learning',
    education: 'school',
    experience: 'real-world',
    career: 'milestone',
  };
  return stageMap[item.stage] || 'learning';
}

// ── "Why This Step Matters" Content ──────────────────────────────────

const WHY_PATTERNS: { test: RegExp; why: string }[] = [
  { test: /strength|self-aware|reflect/, why: 'Understanding yourself helps you make better decisions about your future.' },
  { test: /explore.*career|career.*explor|browse.*role/, why: 'Exploring options now helps you find a path that genuinely fits.' },
  { test: /volunteer|communit/, why: 'Volunteering builds real skills and shows initiative to future employers.' },
  { test: /intern|placement|work experience/, why: 'Real-world experience is one of the strongest things on any application.' },
  { test: /portfolio|project|build/, why: 'Building something tangible proves your ability more than any qualification alone.' },
  { test: /course|certif|study|learn/, why: 'Focused learning gives you the knowledge employers and programs look for.' },
  { test: /degree|university|college/, why: 'Formal education opens doors and deepens your expertise in the field.' },
  { test: /network|connect|mentor/, why: 'The people you meet can shape opportunities you never expected.' },
  { test: /apply|application|entry/, why: 'Taking the step to apply turns your preparation into real progress.' },
  { test: /shadow|observe/, why: 'Seeing a role up close helps you understand what the work really involves.' },
  { test: /goal|direction|plan/, why: 'Having a clear direction makes every step feel more intentional.' },
  { test: /skill|practice|develop/, why: 'Building skills now gives you a head start when it matters most.' },
];

export function getWhyItMatters(item: JourneyItem): string {
  const combined = `${item.title} ${item.description || ''} ${(item.microActions || []).join(' ')}`.toLowerCase();
  for (const pattern of WHY_PATTERNS) {
    if (pattern.test.test(combined)) return pattern.why;
  }
  // Stage-based fallback
  const stageFallback: Record<JourneyStage, string> = {
    foundation: 'Building foundations now makes everything that follows easier.',
    education: 'The right knowledge opens doors you can\'t see yet.',
    experience: 'Real experience teaches things no classroom can.',
    career: 'Every step here moves you closer to doing what you care about.',
  };
  return stageFallback[item.stage];
}
