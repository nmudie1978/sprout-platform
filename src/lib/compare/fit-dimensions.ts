/**
 * Fit Dimensions — Derive 6 simple "feel" scores for a career.
 *
 * Each dimension returns 0–5 (5 dots). The goal is NOT analytical
 * precision — it's letting a 17-year-old eyeball "creativity" and
 * "people interaction" across 2–3 careers in under 10 seconds.
 *
 * Logic is deterministic and rule-based. Inputs are existing fields
 * on Career (workSetting, peopleIntensity, keySkills, dailyTasks,
 * educationPath, category) plus light keyword matching.
 */

import type { Career, CareerCategory } from '@/lib/career-pathways';
import { inferEducationRoute } from '@/lib/career-pathways';
// Pure, catalog-free resolvers — keeps this module out of the radar bundle.
import { workSettingFor, peopleIntensityFor } from '@/lib/matching/lookups';
import { resolveTrainingYears } from '@/lib/compare/key-facts';

export type FitDimensionId =
  | 'creativity'
  | 'people'
  | 'handsOn'
  | 'variety'
  | 'academic'
  | 'outdoor';

export interface FitDimension {
  id: FitDimensionId;
  label: string;
  /** 0–5, where 5 means "high on this dimension" */
  score: number;
  /** What "high" means for this dimension — used in tooltips */
  highMeans: string;
}

// ── Keyword sets ────────────────────────────────────────────────────

const CREATIVE_KEYWORDS = [
  'design', 'creative', 'art', 'visual', 'illustrat', 'compose', 'write',
  'edit', 'film', 'video', 'photo', 'music', 'brand', 'story', 'craft',
  'animat', 'sculpt', 'paint', 'imagin',
];

const VARIETY_KEYWORDS = [
  'project', 'travel', 'event', 'response', 'emergency', 'field', 'site',
  'investigat', 'consult', 'sales', 'pitch', 'launch', 'campaign',
];

const STRUCTURE_KEYWORDS = [
  'compliance', 'audit', 'protocol', 'procedure', 'document', 'admin',
  'process', 'maintain', 'regulat', 'policy',
];


// Strict — only words that genuinely imply being outside. Ambiguous terms
// (site, field, travel, mission, patrol) were removed: they over-fired on
// indoor desk/clinical roles. Genuinely-outdoor careers carry an "outdoors"
// work-setting, which is the primary signal.
const OUTDOOR_KEYWORDS = [
  'outdoor', 'outdoors', 'wilderness', 'farm', 'forest', 'offshore',
  'marine', 'mountain', 'glacier', 'trail', 'fieldwork', 'open air',
];

function countKeywordHits(haystack: string, keywords: string[]): number {
  const lower = haystack.toLowerCase();
  let hits = 0;
  for (const k of keywords) if (lower.includes(k)) hits++;
  return hits;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n)));
}

// ── Per-dimension scoring ───────────────────────────────────────────

function scoreCreativity(career: Career, cat: CareerCategory | undefined, text: string): number {
  let s = 1;
  if (cat === 'CREATIVE_MEDIA') s += 4;
  else if (cat === 'SALES_MARKETING' || cat === 'HOSPITALITY_TOURISM') s += 1;
  if (workSettingFor(career, cat) === 'creative') s += 2;
  s += Math.min(2, countKeywordHits(text, CREATIVE_KEYWORDS));
  return clamp(s);
}

function scorePeople(career: Career, cat: CareerCategory | undefined): number {
  const intensity = peopleIntensityFor(career, cat);
  if (intensity === 'high') return 5;
  if (intensity === 'medium') return 3;
  return 1;
}

function scoreHandsOn(career: Career, cat: CareerCategory | undefined): number {
  const setting = workSettingFor(career, cat);
  if (setting === 'hands-on') return 5;
  if (setting === 'outdoors') return 5;
  if (setting === 'mixed') return 3;
  if (setting === 'creative') return 3;
  return 1; // desk
}

function scoreVariety(career: Career, text: string): number {
  let s = 2;
  s += Math.min(3, countKeywordHits(text, VARIETY_KEYWORDS));
  s -= Math.min(2, countKeywordHits(text, STRUCTURE_KEYWORDS));
  return clamp(s);
}

function scoreAcademic(career: Career): number {
  // Drive Academic off the actual training route + length, not literal
  // "bachelor/master" keywords — a surgeon's path reads "Medical Degree +
  // Specialisation" (no such keyword) yet is the most academic of all.
  const route = inferEducationRoute(career);
  const years = resolveTrainingYears(career);
  let s: number;
  if (route === 'on-the-job') s = 1;
  else if (route === 'vocational') s = 2;
  else if (route === 'mixed') s = 3;
  else s = 4; // university
  if (years != null) {
    if (years >= 8) s = 5; // long professional / medical / doctoral
    else if (years >= 5) s = Math.max(s, 4);
    else if (years <= 1) s = Math.min(s, 1);
  }
  // Doctoral / specialist study is unambiguously top of the scale.
  if (/\b(phd|doctorate)\b|profesjonsstudium|specialis|fellowship|residency/i.test(career.educationPath))
    s = 5;
  return clamp(s);
}

function scoreOutdoor(career: Career, cat: CareerCategory | undefined, text: string): number {
  // Outdoor work is genuinely rare. Only an outdoors work-setting (or an
  // explicit outdoor signal) should lift it — being "hands-on" indoors
  // (surgery, welding, a lab, a kitchen) is NOT outdoor work.
  const setting = workSettingFor(career, cat);
  if (setting === 'outdoors') return 5;
  let s = countKeywordHits(text, OUTDOOR_KEYWORDS);
  // A "mixed" setting may include some field/site time, but no more than a hint
  // unless the text actually says so.
  if (setting === 'mixed') s = Math.max(s, 1);
  return clamp(s);
}

// ── Public API ──────────────────────────────────────────────────────

export function getFitDimensions(
  career: Career,
  category: CareerCategory | null | undefined,
): FitDimension[] {
  const cat = category ?? undefined;
  const text = `${career.description} ${career.keySkills.join(' ')} ${career.dailyTasks.join(' ')}`;

  return [
    {
      id: 'creativity',
      label: 'Creativity',
      score: scoreCreativity(career, cat, text),
      highMeans: 'You shape, design, or invent things often.',
    },
    {
      id: 'people',
      label: 'People',
      score: scorePeople(career, cat),
      highMeans: 'You spend most of your day with people.',
    },
    {
      id: 'handsOn',
      label: 'Hands-on',
      score: scoreHandsOn(career, cat),
      highMeans: 'You work with your hands or on your feet, not behind a desk.',
    },
    {
      id: 'variety',
      label: 'Variety',
      score: scoreVariety(career, text),
      highMeans: 'No two days look the same.',
    },
    {
      id: 'academic',
      label: 'Academic',
      score: scoreAcademic(career),
      highMeans: 'Long study, deep theory, formal qualifications.',
    },
    {
      id: 'outdoor',
      label: 'Outdoor',
      score: scoreOutdoor(career, cat, text),
      highMeans: 'Lots of time outside, not in an office.',
    },
  ];
}

// ── Reality check helpers ───────────────────────────────────────────

export type TimeToGetThere = 'Short' | 'Medium' | 'Long';
export type Competitiveness = 'Low' | 'Medium' | 'High';

/** Estimate "time to get there" from the educationPath string. */
export function estimateTimeToGetThere(career: Career): TimeToGetThere {
  const path = career.educationPath.toLowerCase();
  if (path.includes('phd') || path.includes('master') || path.includes('6 year') || path.includes('5 year')) {
    return 'Long';
  }
  if (path.includes('bachelor') || path.includes('3 year') || path.includes('apprentice') || path.includes('vocational')) {
    return 'Medium';
  }
  if (path.includes('self-taught') || path.includes('on-the-job') || path.includes('no formal') || path.includes('on the job')) {
    return 'Short';
  }
  return 'Medium';
}

/**
 * Estimate competitiveness from growthOutlook + entry level signals.
 * High-growth + non-entry roles tend to be more competitive at the top end,
 * but entry-level keeps the floor accessible.
 */
export function estimateCompetitiveness(career: Career): Competitiveness {
  // Roles where breaking in is famously brutal
  const HIGH_COMP_KEYWORDS = ['astronaut', 'professional', 'pilot', 'surgeon', 'investment banker', 'special forces', 'footballer', 'tennis player'];
  const titleLower = career.title.toLowerCase();
  if (HIGH_COMP_KEYWORDS.some((k) => titleLower.includes(k))) return 'High';

  if (career.entryLevel) return 'Low';
  if (career.growthOutlook === 'high') return 'Medium';
  return 'Medium';
}

/** Build a 1-line "typical path" summary from the educationPath string. */
export function shortPath(career: Career): string {
  // Strip parentheticals to get a cleaner one-liner
  return career.educationPath.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

/** Pick up to 3 simple-language daily tasks. */
export function shortDayToDay(career: Career): string[] {
  return career.dailyTasks.slice(0, 3);
}

// ── "Why it might suit you" ──────────────────────────────────────────

/**
 * Cheap, optimistic one-liner that pulls a hint from the user's
 * DiscoveryPreferences if available, otherwise falls back to the
 * dominant fit dimension.
 */
export function whyItMightSuitYou(
  career: Career,
  category: CareerCategory | null | undefined,
  preferences: { workStyles?: string[]; peoplePref?: string; subjects?: string[]; interests?: string[] } | null | undefined,
): string {
  const dims = getFitDimensions(career, category);
  const top = dims.slice().sort((a, b) => b.score - a.score)[0];

  // Personalised hook if we have preferences
  if (preferences) {
    const setting = workSettingFor(career, category);
    const styles = preferences.workStyles ?? [];
    if (styles.includes('hands-on') && (setting === 'hands-on' || setting === 'outdoors')) {
      return 'Hands-on work matches what you said you enjoy.';
    }
    if (styles.includes('desk') && setting === 'desk') {
      return 'Mostly desk-based, the way you said you prefer.';
    }
    if (styles.includes('creative') && setting === 'creative') {
      return 'Creative work fits your "what I like" answers.';
    }
    if (styles.includes('outdoors') && setting === 'outdoors') {
      return 'Outdoor work — matches what you said you enjoy.';
    }
    const intensity = peopleIntensityFor(career, category);
    if (preferences.peoplePref === 'with-people' && intensity === 'high') {
      return 'Lots of people interaction — what you said you wanted.';
    }
    if (preferences.peoplePref === 'mostly-alone' && intensity === 'low') {
      return 'Mostly independent work — matches your preference.';
    }
  }

  // Fallback: lean on the strongest dimension
  if (top.score >= 4) {
    return `Strong on ${top.label.toLowerCase()} — ${top.highMeans.toLowerCase()}`;
  }
  return 'A balanced career — a bit of everything.';
}
