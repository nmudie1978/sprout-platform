/**
 * Career DNA — data & derivation
 *
 * "Career DNA shows what a career is made of — not who you are."
 *
 * Every career resolves to a {@link CareerDNAProfile} of ten objective
 * traits. A small set of careers are hand-authored (curated) for quality;
 * every other career is synthesised deterministically from its existing
 * structured fields, so the feature works for the whole catalogue without
 * a backend or migration.
 */

import { inferEducationRoute, type Career } from '@/lib/career-pathways';
import type {
  CareerDNAProfile,
  CareerDNATrait,
  CareerDNATraitId,
} from '@/types/career-dna';

// ─── Trait metadata ──────────────────────────────────────────────────────────

type TraitMeta = {
  id: CareerDNATraitId;
  label: string;
  /** Accent colour, chosen to read on both the light (warm-paper) and
      dark (default) themes. */
  color: string;
};

/** Canonical trait order + colours (matches the product spec). */
export const TRAIT_META: TraitMeta[] = [
  { id: 'technical-depth', label: 'Technical Depth', color: '#8B5CF6' }, // purple
  { id: 'problem-solving', label: 'Problem Solving', color: '#3B82F6' }, // blue
  { id: 'people-interaction', label: 'People Interaction', color: '#14B8A6' }, // teal
  { id: 'creativity', label: 'Creativity', color: '#22C55E' }, // green
  { id: 'leadership', label: 'Leadership Potential', color: '#EAB308' }, // gold
  { id: 'ai-exposure', label: 'AI Exposure', color: '#F97316' }, // orange
  { id: 'income-potential', label: 'Income Potential', color: '#EC4899' }, // pink
  { id: 'work-life-balance', label: 'Work-Life Balance', color: '#7C3AED' }, // violet
  { id: 'education-length', label: 'Education Length', color: '#6366F1' }, // indigo
  { id: 'independence', label: 'Independence', color: '#06B6D4' }, // cyan
];

const TRAIT_BY_ID = new Map(TRAIT_META.map((t) => [t.id, t]));

/** Short, band-based explanation for a trait at a given score. */
function describeTrait(id: CareerDNATraitId, score: number): string {
  const band: 'low' | 'mid' | 'high' = score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low';
  const copy: Record<CareerDNATraitId, Record<typeof band, string>> = {
    'technical-depth': {
      high: 'Requires advanced technical knowledge and focused expertise.',
      mid: 'Involves solid technical know-how you build over time.',
      low: 'Light on technical depth — skills are learned mostly on the job.',
    },
    'problem-solving': {
      high: 'Centred on solving complex, open-ended problems daily.',
      mid: 'Regular problem-solving, often within established methods.',
      low: 'More routine and process-led than problem-led.',
    },
    'people-interaction': {
      high: 'People are at the heart of the work — constant interaction.',
      mid: 'A healthy mix of working with people and working solo.',
      low: 'Mostly heads-down work with limited people contact.',
    },
    creativity: {
      high: 'Creative thinking and original ideas drive the role.',
      mid: 'Room for creativity within practical constraints.',
      low: 'More structured and methodical than creative.',
    },
    leadership: {
      high: 'Strong path into leading people, projects, or strategy.',
      mid: 'Leadership grows with experience and seniority.',
      low: 'An individual-contributor role more than a leadership one.',
    },
    'ai-exposure': {
      high: 'Heavily shaped by AI and automation — tools change fast.',
      mid: 'AI is starting to reshape parts of the day-to-day.',
      low: 'Less exposed to AI — the human element stays central.',
    },
    'income-potential': {
      high: 'Strong earning potential as you gain experience.',
      mid: 'Comfortable, steady earning potential over time.',
      low: 'Modest pay — often driven by purpose over income.',
    },
    'work-life-balance': {
      high: 'Generally predictable hours and good balance.',
      mid: 'Balance is manageable but varies with the workload.',
      low: 'Can be demanding, with pressure and long hours at times.',
    },
    'education-length': {
      high: 'A long, structured education path is usually required.',
      mid: 'A focused training route, or a degree for some paths.',
      low: 'You can enter with shorter training or on the job.',
    },
    independence: {
      high: 'A lot of autonomy over how and when you work.',
      mid: 'A balance of independent work and team structure.',
      low: 'Work is more directed and team- or institution-led.',
    },
  };
  return copy[id][band];
}

const clamp = (n: number): number => Math.max(0, Math.min(10, Math.round(n)));

/** Build a full trait object from an id + score (label/colour/description). */
function makeTrait(id: CareerDNATraitId, score: number): CareerDNATrait {
  const meta = TRAIT_BY_ID.get(id)!;
  const s = clamp(score);
  return { id, label: meta.label, color: meta.color, score: s, description: describeTrait(id, s) };
}

/** Assemble traits in canonical order from a partial score map. */
function traitsFromScores(scores: Record<CareerDNATraitId, number>): CareerDNATrait[] {
  return TRAIT_META.map((m) => makeTrait(m.id, scores[m.id]));
}

// ─── Derivation from a Career ────────────────────────────────────────────────

const has = (text: string, terms: string[]): boolean => terms.some((t) => text.includes(t));

/** Highest number found in a string like "700,000 - 1,400,000 kr/year". */
function maxNumber(s: string): number | null {
  const nums = (s.match(/[\d.,]+/g) ?? [])
    .map((n) => parseInt(n.replace(/[.,]/g, ''), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length ? Math.max(...nums) : null;
}

/** Map a top-of-range NOK salary to a 0–10 income score. */
function incomeScore(career: Career): number {
  const top = maxNumber(career.avgSalary);
  if (top == null) return 5;
  if (top >= 1_500_000) return 10;
  if (top >= 1_100_000) return 9;
  if (top >= 900_000) return 8;
  if (top >= 750_000) return 7;
  if (top >= 600_000) return 6;
  if (top >= 480_000) return 5;
  if (top >= 380_000) return 4;
  return 3;
}

/** Longest year count mentioned in the education path, e.g. "6 years". */
function educationYears(career: Career): number | null {
  const matches = [...career.educationPath.matchAll(/(\d+)\s*(?:-|–|to)?\s*(\d+)?\s*year/gi)];
  const years = matches.flatMap((m) => [m[1], m[2]].filter(Boolean).map((n) => parseInt(n!, 10)));
  return years.length ? Math.max(...years) : null;
}

function educationScore(career: Career): number {
  const years = educationYears(career);
  let base: number;
  if (years != null) base = years <= 1 ? 2 : years <= 2 ? 4 : years <= 3 ? 5 : years <= 5 ? 7 : 9;
  else base = 5;
  // Use the *resolved* route (inferEducationRoute applies educationPath
  // keywords + sensible category defaults), not the raw field — which is
  // unset on ~95% of careers and otherwise leaves trades / service / manual
  // roles reading as if a degree is required.
  switch (inferEducationRoute(career)) {
    case 'on-the-job':
      base = Math.min(base, 2);
      break;
    case 'vocational':
      // fagbrev / apprenticeship is genuinely short vs a degree — keep it in
      // the "shorter training or on the job" band so it never implies a degree.
      base = Math.min(base, 3);
      break;
    case 'university':
      // Genuine degree routes belong in the high band ("long, structured
      // education"), so the mid band can honestly mean "mixed / shorter".
      base = Math.max(base, 7);
      break;
    // 'mixed' keeps the year/keyword-derived base (several viable routes).
  }
  if (/doctor|phd|doctorate|specialis/i.test(career.educationPath)) base = Math.max(base, 9);
  return base;
}

/**
 * Synthesise a Career DNA profile from a career's structured fields.
 * Deterministic — the same career always yields the same profile.
 */
export function deriveCareerDNA(career: Career): CareerDNAProfile {
  const text = [
    career.title,
    career.description,
    career.keySkills.join(' '),
    career.dailyTasks.join(' '),
  ]
    .join(' ')
    .toLowerCase();
  const titleLc = career.title.toLowerCase();

  // Technical depth
  let technical = 4;
  if (has(text, ['software', 'engineer', 'programming', 'code', 'coding', 'developer', 'data', 'scientist', 'algorithm', 'architecture', 'system design', 'technical', 'mathemat', 'research'])) technical += 3;
  if (has(text, ['surgery', 'clinical', 'diagnos', 'biolog', 'chemis', 'physic', 'mechanic', 'electric'])) technical += 2;
  if (career.educationRoute === 'university') technical += 1;
  if (career.workSetting === 'creative') technical -= 1;

  // Problem solving
  let problem = 5;
  if (has(text, ['problem', 'analy', 'diagnos', 'debug', 'troubleshoot', 'strategy', 'research', 'critical', 'design', 'optimis', 'optimize', 'investigat'])) problem += 3;
  if (career.growthOutlook === 'high') problem += 1;

  // People interaction
  let people: number;
  if (career.peopleIntensity === 'high') people = 9;
  else if (career.peopleIntensity === 'medium') people = 6;
  else if (career.peopleIntensity === 'low') people = 3;
  else {
    people = 5;
    if (has(text, ['patient', 'client', 'customer', 'teach', 'care', 'communicat', 'stakeholder', 'team', 'counsel', 'sales', 'community', 'people'])) people += 3;
    if (has(text, ['solo', 'independent', 'remote', 'data', 'code', 'research'])) people -= 1;
  }

  // Creativity
  let creativity = 3;
  if (career.workSetting === 'creative') creativity += 5;
  if (has(text, ['design', 'creative', 'art', 'visual', 'brand', 'write', 'writing', 'compose', 'craft', 'content', 'media', 'illustrat', 'innovat'])) creativity += 3;

  // Leadership potential
  let leadership = 4;
  if (/manager|lead|director|chief|head of|principal|supervisor|partner|founder/.test(titleLc)) leadership += 4;
  if (has(text, ['leadership', 'manage', 'mentor', 'strategy', 'coordinat', 'deleg'])) leadership += 1;

  // AI exposure (how much AI is reshaping / used in the role)
  let ai = 4;
  if (has(text, ['ai', 'machine learning', 'data', 'software', 'algorithm', 'automation', 'digital', 'cloud', 'analytics', 'code', 'tech'])) ai += 4;
  if (has(text, ['care', 'patient', 'manual', 'hands-on', 'craft', 'trade', 'physical', 'outdoor'])) ai -= 1;
  if (career.workSetting === 'hands-on' || career.workSetting === 'outdoors') ai -= 1;

  // Income potential
  const income = incomeScore(career);

  // Work-life balance (lower = more demanding)
  let wlb = 6;
  if (has(text, ['surgeon', 'doctor', 'medic', 'emergency', 'lawyer', 'legal', 'law ', 'finance', 'banking', 'trading', 'consult', 'founder', 'startup', 'investment'])) wlb -= 3;
  if (career.sector === 'public') wlb += 1;
  if (has(text, ['shift', 'on-call', 'night'])) wlb -= 1;

  // Education length
  const education = educationScore(career);

  // Independence
  let independence = 5;
  if (career.sector === 'private') independence += 1;
  if (career.workSetting === 'creative') independence += 1;
  if (has(text, ['freelance', 'independent', 'autonom', 'self-employ', 'consult', 'founder', 'own '])) independence += 2;
  if (career.pathType || has(text, ['hospital', 'institution', 'force', 'department', 'agency'])) independence -= 1;

  const scores: Record<CareerDNATraitId, number> = {
    'technical-depth': clamp(technical),
    'problem-solving': clamp(problem),
    'people-interaction': clamp(people),
    creativity: clamp(creativity),
    leadership: clamp(leadership),
    'ai-exposure': clamp(ai),
    'income-potential': income,
    'work-life-balance': clamp(wlb),
    'education-length': education,
    independence: clamp(independence),
  };

  return {
    careerId: career.id,
    careerTitle: career.title,
    subtitle: 'The unique DNA profile that defines this career.',
    traits: traitsFromScores(scores),
    primaryGenes: deriveGenes(scores, text),
    snapshot: deriveSnapshot(career, scores),
    curated: false,
  };
}

/** Pick up to four "primary genes" from the dominant traits. */
function deriveGenes(scores: Record<CareerDNATraitId, number>, text: string): string[] {
  const genes: string[] = [];
  const add = (g: string) => {
    if (!genes.includes(g)) genes.push(g);
  };
  if (scores['problem-solving'] >= 7) add('Problem Solver');
  if (scores['technical-depth'] >= 7) add('Systems Thinker');
  if (scores['technical-depth'] >= 6 && has(text, ['build', 'develop', 'engineer', 'construct', 'create'])) add('Builder');
  if (scores.creativity >= 7) add('Creator');
  if (scores.leadership >= 7) add('Leader');
  if (scores['people-interaction'] >= 7) add('Connector');
  if (scores.independence >= 7) add('Self-Starter');
  if (scores['problem-solving'] >= 6 || scores['technical-depth'] >= 6) add('Analytical');
  // Always surface at least a couple of genes.
  if (genes.length < 2) {
    add('Specialist');
    add('Lifelong Learner');
  }
  return genes.slice(0, 4);
}

function deriveSnapshot(
  career: Career,
  scores: Record<CareerDNATraitId, number>,
): CareerDNAProfile['snapshot'] {
  // Career type from the dominant trait.
  const typeRanks: Array<[CareerDNATraitId, string]> = [
    ['creativity', 'Creative career'],
    ['technical-depth', 'Technical career'],
    ['people-interaction', 'People-focused career'],
    ['leadership', 'Leadership career'],
    ['problem-solving', 'Analytical career'],
  ];
  const careerType =
    typeRanks
      .map(([id, label]) => ({ label, score: scores[id] }))
      .sort((a, b) => b.score - a.score)[0]?.label ?? 'Specialist career';

  const envMap: Record<NonNullable<Career['workSetting']>, string> = {
    desk: 'Mostly office or desk-based',
    'hands-on': 'Hands-on and practical',
    outdoors: 'Outdoors or on-site',
    creative: 'Studio or creative settings',
    mixed: 'A mix of settings',
  };
  const workEnvironment = career.workSetting
    ? envMap[career.workSetting]
    : 'Varies by employer and team';

  const inc = scores['income-potential'];
  const incomePotential =
    inc >= 8 ? 'High earning potential' : inc >= 6 ? 'Good earning potential' : inc >= 4 ? 'Moderate earning potential' : 'Modest earning potential';

  const jobOutlook =
    career.growthOutlook === 'high'
      ? 'High demand and growing'
      : career.growthOutlook === 'medium'
        ? 'Growing steadily'
        : 'Stable and established';

  const eduMap: Record<NonNullable<Career['educationRoute']>, string> = {
    vocational: 'Vocational training or apprenticeship',
    university: 'University degree',
    mixed: 'Several viable routes',
    'on-the-job': 'On-the-job or entry-level',
  };
  // Always resolve the route (keyword + category default) rather than relying
  // on the raw field, so the snapshot never defaults to a degree-shaped line
  // for trades / service / manual careers that have no explicit route set.
  const educationPath = eduMap[inferEducationRoute(career)];

  return { careerType, workEnvironment, incomePotential, jobOutlook, educationPath };
}

// ─── Curated profiles ────────────────────────────────────────────────────────

type CuratedSeed = {
  ids: string[]; // catalogue ids this profile should win for
  titleMatches: string[]; // normalised title fallbacks
  careerTitle: string;
  scores: Record<CareerDNATraitId, number>;
  primaryGenes: string[];
  snapshot: CareerDNAProfile['snapshot'];
};

const CURATED_SEEDS: CuratedSeed[] = [
  {
    ids: ['software-developer', 'senior-software-engineer', 'telco-software-engineer'],
    titleMatches: ['software engineer', 'software developer'],
    careerTitle: 'Software Engineer',
    scores: {
      'technical-depth': 10,
      'problem-solving': 9,
      'people-interaction': 4,
      creativity: 7,
      leadership: 5,
      'ai-exposure': 6,
      'income-potential': 8,
      'work-life-balance': 6,
      'education-length': 6,
      independence: 7,
    },
    primaryGenes: ['Problem Solver', 'Systems Thinker', 'Builder', 'Analytical'],
    snapshot: {
      careerType: 'Technical career',
      workEnvironment: 'Mostly office or remote',
      incomePotential: 'High earning potential',
      jobOutlook: 'High demand and growing',
      educationPath: 'University degree or self-taught route',
    },
  },
  {
    ids: ['doctor'],
    titleMatches: ['doctor', 'physician'],
    careerTitle: 'Doctor',
    scores: {
      'technical-depth': 9,
      'problem-solving': 9,
      'people-interaction': 9,
      creativity: 4,
      leadership: 7,
      'ai-exposure': 5,
      'income-potential': 9,
      'work-life-balance': 3,
      'education-length': 10,
      independence: 5,
    },
    primaryGenes: ['Problem Solver', 'Connector', 'Specialist', 'Analytical'],
    snapshot: {
      careerType: 'People-focused career',
      workEnvironment: 'Hospitals and clinics',
      incomePotential: 'High earning potential',
      jobOutlook: 'High demand and growing',
      educationPath: 'Long medical degree and specialisation',
    },
  },
  {
    ids: ['lawyer'],
    titleMatches: ['lawyer', 'solicitor', 'barrister', 'attorney'],
    careerTitle: 'Lawyer',
    scores: {
      'technical-depth': 7,
      'problem-solving': 9,
      'people-interaction': 7,
      creativity: 5,
      leadership: 7,
      'ai-exposure': 6,
      'income-potential': 9,
      'work-life-balance': 3,
      'education-length': 8,
      independence: 6,
    },
    primaryGenes: ['Problem Solver', 'Analytical', 'Connector', 'Specialist'],
    snapshot: {
      careerType: 'Analytical career',
      workEnvironment: 'Offices and courtrooms',
      incomePotential: 'High earning potential',
      jobOutlook: 'Stable and established',
      educationPath: 'Law degree and professional qualification',
    },
  },
  {
    ids: ['project-manager', 'telco-project-manager'],
    titleMatches: ['project manager', 'technical project manager'],
    careerTitle: 'Technical Project Manager',
    scores: {
      'technical-depth': 6,
      'problem-solving': 8,
      'people-interaction': 9,
      creativity: 5,
      leadership: 9,
      'ai-exposure': 6,
      'income-potential': 8,
      'work-life-balance': 5,
      'education-length': 5,
      independence: 6,
    },
    primaryGenes: ['Leader', 'Connector', 'Problem Solver', 'Systems Thinker'],
    snapshot: {
      careerType: 'Leadership career',
      workEnvironment: 'Offices and cross-team settings',
      incomePotential: 'High earning potential',
      jobOutlook: 'Growing steadily',
      educationPath: 'Degree plus project certifications',
    },
  },
  {
    ids: ['graphic-designer'],
    titleMatches: ['graphic designer'],
    careerTitle: 'Graphic Designer',
    scores: {
      'technical-depth': 5,
      'problem-solving': 6,
      'people-interaction': 6,
      creativity: 10,
      leadership: 4,
      'ai-exposure': 7,
      'income-potential': 5,
      'work-life-balance': 6,
      'education-length': 4,
      independence: 8,
    },
    primaryGenes: ['Creator', 'Self-Starter', 'Builder', 'Analytical'],
    snapshot: {
      careerType: 'Creative career',
      workEnvironment: 'Studios, agencies, or freelance',
      incomePotential: 'Moderate earning potential',
      jobOutlook: 'Growing steadily',
      educationPath: 'Design degree or strong portfolio',
    },
  },
];

const norm = (s: string): string => s.trim().toLowerCase();

function seedToProfile(seed: CuratedSeed, career: Career): CareerDNAProfile {
  return {
    careerId: career.id,
    careerTitle: career.title || seed.careerTitle,
    subtitle: 'The unique DNA profile that defines this career.',
    traits: traitsFromScores(seed.scores),
    primaryGenes: seed.primaryGenes,
    snapshot: seed.snapshot,
    curated: true,
  };
}

/** Number of hand-authored profiles available (used by tests/inventory). */
export const CURATED_PROFILE_COUNT = CURATED_SEEDS.length;

/**
 * Resolve the Career DNA profile for a career: a curated profile when one
 * matches (by id or title), otherwise a derived one. Always returns a
 * complete, valid profile.
 */
export function getCareerDNA(career: Career): CareerDNAProfile {
  const idLc = norm(career.id);
  const titleLc = norm(career.title);
  const seed = CURATED_SEEDS.find(
    (s) => s.ids.map(norm).includes(idLc) || s.titleMatches.map(norm).includes(titleLc),
  );
  return seed ? seedToProfile(seed, career) : deriveCareerDNA(career);
}

/** Standalone curated profiles (e.g. for a default/preview when no career
    is in context). Returns synthetic Career-less profiles. */
export function getCuratedProfiles(): CareerDNAProfile[] {
  return CURATED_SEEDS.map((seed) => ({
    careerId: seed.ids[0],
    careerTitle: seed.careerTitle,
    subtitle: 'The unique DNA profile that defines this career.',
    traits: traitsFromScores(seed.scores),
    primaryGenes: seed.primaryGenes,
    snapshot: seed.snapshot,
    curated: true,
  }));
}
