/**
 * Education Data — 3-Layer Model
 *
 * Layer 1: Institutions  → which institutions are relevant per career
 * Layer 2: Programmes    → exact programme to apply for (core dataset)
 * Layer 3: Modules       → on-demand course details (lazy-loaded)
 *
 * This is the single import point for all education data in the app.
 * All consumers should import from '@/lib/education' — the old
 * 'nordic-programmes' and 'norway-programmes' files are deprecated.
 *
 * See CLAUDE.md <journey_logic> and docs/education-model.md for the
 * full architecture rationale.
 */

import institutionsData from './data/institutions.json';
import programmesData from './data/programmes.json';
import requirementsData from './data/career-requirements.json';
import programmeValidationData from './data/programme-validation.json';
import { shouldHideFromUi, type ValidationStatus } from './validate-programme-url';

// ── Types ───────────────────────────────────────────────────────────

export type NordicCountry = 'NO' | 'SE' | 'DK' | 'FI' | 'IS';

export type ProgrammeType =
  | 'bachelor'
  | 'master'
  | 'integrated'
  | 'vocational'
  | 'fagbrev'
  | 'phd'
  | 'diploma';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  country: NordicCountry;
  city: string;
  url: string;
  applicationVia: string;
  careerIds: string[];
}

export interface Programme {
  id: string;
  careerId: string;
  institutionId: string;
  programme: string;
  englishName: string;
  url: string;
  type: ProgrammeType;
  duration: string;
  languageOfInstruction?: string;
  tuitionFee?: string;
  entryRequirements?: string;
  careerOutcome?: string;
}

/** Denormalised shape combining programme + institution fields. */
export interface ProgrammeWithInstitution extends Programme {
  institution: string;
  city: string;
  country: NordicCountry;
  applicationVia: string;
}

export interface ProfessionalCert {
  name: string;
  provider: string;
  duration: string;
  cost: string;
  url: string;
  recognised: string;
}

export interface CertificationPath {
  summary: string;
  certifications: ProfessionalCert[];
  recommendedDegrees?: string[];
}

export interface AdvancedCareerMapping {
  baseCareerId: string;
  specialisationNote: string;
}

export interface ModuleEntry {
  programmeId: string;
  year?: number;
  name: string;
  englishName?: string;
  credits?: number;
  url?: string;
}

// ── Internal indexes (built once at module load) ────────────────────

const institutions: Institution[] =
  (institutionsData as { institutions: Institution[] }).institutions;
const institutionById = new Map<string, Institution>();
for (const inst of institutions) institutionById.set(inst.id, inst);

const programmes: Programme[] =
  (programmesData as { programmes: Programme[] }).programmes;
const careerKeyMap: Record<string, string> =
  (programmesData as { careerKeyMap: Record<string, string> }).careerKeyMap;
const advancedCareerMap: Record<string, AdvancedCareerMapping> =
  (programmesData as { advancedCareerMap: Record<string, AdvancedCareerMapping> }).advancedCareerMap;
const alternativePathsMap: Record<string, string[]> =
  (programmesData as { alternativePaths: Record<string, string[]> }).alternativePaths;
const careerSummaries: Record<string, string> =
  (programmesData as { careerSummaries: Record<string, string> }).careerSummaries;
const certPaths: Record<string, CertificationPath & { matchTerms: string[] }> =
  (programmesData as { certificationPaths: Record<string, CertificationPath & { matchTerms: string[] }> }).certificationPaths;

// Index programmes by careerId for O(1) lookup.
const byCareerId = new Map<string, Programme[]>();
for (const p of programmes) {
  const list = byCareerId.get(p.careerId) ?? [];
  list.push(p);
  byCareerId.set(p.careerId, list);
}

// ── Programme URL validation — hidden set ───────────────────────────
//
// `programme-validation.json` is populated by the
// `scripts/validate-programmes.ts` CLI run in CI on a weekly schedule
// (see .github/workflows/validate-programmes.yml). It maps programme
// IDs → { status, httpCode, checkedAt }. At module load time we
// materialise the set of programme IDs whose last validation marks
// them as unambiguously broken (CLIENT_ERROR or DNS) and filter those
// out of every getProgrammesForCareer / getProgrammesByCountry call
// below. Programmes that have never been validated are NOT hidden —
// backwards compatible and defensive against a missing / empty
// validation file.
const validationResults: Record<
  string,
  { url: string; status: ValidationStatus; httpCode: number | null; checkedAt: string }
> = (programmeValidationData as {
  results: Record<
    string,
    { url: string; status: ValidationStatus; httpCode: number | null; checkedAt: string }
  >;
}).results;

const hiddenProgrammeIds = new Set<string>();
for (const [id, result] of Object.entries(validationResults)) {
  if (shouldHideFromUi(result.status)) hiddenProgrammeIds.add(id);
}

/**
 * Exported for unit testing — returns the set of programme IDs
 * currently hidden by the URL validator. Empty set when the
 * validation file is empty (first-run / fresh clone).
 */
export function getHiddenProgrammeIds(): ReadonlySet<string> {
  return hiddenProgrammeIds;
}

// ── Career ID resolver ──────────────────────────────────────────────

function resolveCareerId(raw: string): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Direct match
  if (byCareerId.has(slug)) return slug;
  if (byCareerId.has(lower)) return lower;

  // Advanced career → base career (e.g. "surgeon" → "doctor")
  if (advancedCareerMap[slug]) return advancedCareerMap[slug].baseCareerId;

  // Local-language alias (e.g. "sykepleier" → "nurse")
  if (careerKeyMap[lower]) return careerKeyMap[lower];
  if (careerKeyMap[slug]) return careerKeyMap[slug];

  // Partial match
  for (const [alias, id] of Object.entries(careerKeyMap)) {
    if (lower.includes(alias) || alias.includes(lower)) return id;
  }
  return null;
}

// ── Public API ──────────────────────────────────────────────────────

export interface ProgrammeFilter {
  country?: NordicCountry;
  type?: ProgrammeType;
}

/**
 * Resolve any raw career string to the canonical careerId.
 * Returns the base careerId for advanced careers.
 */
export function resolveCareer(raw: string): string | null {
  return resolveCareerId(raw);
}

/**
 * If the career is an "advanced" specialisation (surgeon, psychiatrist,
 * etc.), returns the mapping with baseCareerId + a human-readable
 * specialisation note. Returns null for direct-entry careers.
 */
export function getAdvancedCareerMapping(
  careerIdOrTitle: string,
): AdvancedCareerMapping | null {
  const slug = careerIdOrTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return advancedCareerMap[slug] ?? null;
}

// ── Layer 1: Institutions ───────────────────────────────────────────

/**
 * Get institutions relevant for a career, optionally in a specific
 * country. Lightweight — no programme details, just discovery.
 */
export function getInstitutionsForCareer(
  careerIdOrTitle: string,
  country?: NordicCountry,
): Institution[] {
  const id = resolveCareerId(careerIdOrTitle);
  if (!id) return [];
  let result = institutions.filter((inst) => inst.careerIds.includes(id));
  if (country) result = result.filter((inst) => inst.country === country);
  return result;
}

/**
 * Get a single institution by its stable ID.
 */
export function getInstitutionById(id: string): Institution | null {
  return institutionById.get(id) ?? null;
}

/**
 * Get all institutions, optionally filtered by country.
 */
export function getAllInstitutions(country?: NordicCountry): Institution[] {
  if (country) return institutions.filter((inst) => inst.country === country);
  return institutions;
}

// ── Layer 2: Programmes ─────────────────────────────────────────────

/**
 * Get denormalised programmes (with institution fields joined in)
 * for a career, optionally filtered by country/type. The core query.
 */
export function getProgrammesForCareer(
  careerIdOrTitle: string,
  filter?: ProgrammeFilter,
): ProgrammeWithInstitution[] {
  const id = resolveCareerId(careerIdOrTitle);
  if (!id) return [];
  let list = byCareerId.get(id) ?? [];
  // Hide programmes whose URL was last classified as broken
  // (CLIENT_ERROR / DNS). Programmes never validated stay visible.
  // See hiddenProgrammeIds above.
  if (hiddenProgrammeIds.size > 0) {
    list = list.filter((p) => !hiddenProgrammeIds.has(p.id));
  }
  if (filter?.country) {
    list = list.filter((p) => {
      const inst = institutionById.get(p.institutionId);
      return inst?.country === filter.country;
    });
  }
  if (filter?.type) list = list.filter((p) => p.type === filter.type);
  return list.map(denormalise);
}

/**
 * Get a single programme by its stable ID. Returns null for hidden
 * (broken-URL) programmes so deep-link callers behave the same way
 * as list-level callers.
 */
export function getProgrammeById(id: string): ProgrammeWithInstitution | null {
  if (hiddenProgrammeIds.has(id)) return null;
  const p = programmes.find((pr) => pr.id === id);
  if (!p) return null;
  return denormalise(p);
}

/**
 * Get all programmes for a country (all careers). Hidden (broken-URL)
 * programmes are excluded.
 */
export function getProgrammesByCountry(
  country: NordicCountry,
): ProgrammeWithInstitution[] {
  return programmes
    .filter(
      (p) =>
        !hiddenProgrammeIds.has(p.id) &&
        institutionById.get(p.institutionId)?.country === country,
    )
    .map(denormalise);
}

/**
 * Get career summary text (1-2 sentence overview).
 */
export function getCareerSummary(
  careerIdOrTitle: string,
): string | null {
  const slug = careerIdOrTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return careerSummaries[slug] ?? null;
}

/**
 * Get alternative paths for a career (non-university routes).
 */
export function getAlternativePaths(careerIdOrTitle: string): string[] {
  const id = resolveCareerId(careerIdOrTitle);
  if (!id) return [];
  return alternativePathsMap[id] ?? [];
}

/**
 * All distinct career IDs that have at least one programme.
 */
export function getCoveredCareerIds(): string[] {
  return [...byCareerId.keys()];
}

/**
 * Total programme count.
 */
export function getProgrammeCount(): number {
  return programmes.length;
}

// ── Layer 3: Modules (lazy-loaded, on demand) ───────────────────────

let _modulesLoaded = false;
let _modules: ModuleEntry[] = [];

/**
 * Load modules for a specific programme. Lazy-loads the modules.json
 * file on first call, then filters. Returns empty array if no modules
 * exist for the programme yet.
 */
export async function getModulesForProgramme(
  programmeId: string,
): Promise<ModuleEntry[]> {
  if (!_modulesLoaded) {
    try {
      const data = await import('./data/modules.json');
      _modules = (data.modules ?? []) as ModuleEntry[];
    } catch {
      _modules = [];
    }
    _modulesLoaded = true;
  }
  return _modules.filter((m) => m.programmeId === programmeId);
}

// ── Certification path lookup ───────────────────────────────────────

/**
 * Look up a certification path by career ID or title. Matches against
 * the `matchTerms` on each cert path entry.
 */
export function getCertificationPath(
  careerId: string,
  careerTitle: string,
): CertificationPath | null {
  const idLower = careerId.toLowerCase();
  const titleLower = careerTitle.toLowerCase();
  for (const value of Object.values(certPaths)) {
    for (const term of value.matchTerms) {
      if (idLower.includes(term) || titleLower.includes(term)) {
        const { matchTerms: _, ...rest } = value;
        return rest;
      }
    }
  }
  return null;
}

// ── Legacy backward-compat wrappers ─────────────────────────────────
//
// These keep existing call sites working without changes. Over time
// they should migrate to the typed API above.

export interface CareerEducationPath {
  careerId: string;
  summary: string;
  programmes: {
    programme: string;
    englishName: string;
    institution: string;
    city: string;
    duration: string;
    type: string;
    applicationVia: string;
    url: string;
  }[];
  alternativePaths?: string[];
  /** Set for advanced/specialisation careers (surgeon etc.) */
  specialisationNote?: string;
}

/**
 * Legacy wrapper — returns Norwegian programmes in the old shape.
 * For advanced careers (surgeon, psychiatrist, etc.), returns the
 * base career's programmes plus a specialisationNote.
 */
export function getNorwayProgrammes(
  careerId: string,
  careerTitle: string,
): CareerEducationPath | null {
  const advanced =
    getAdvancedCareerMapping(careerId) ||
    getAdvancedCareerMapping(careerTitle);
  const lookupId = advanced?.baseCareerId ?? careerId;

  let progs = getProgrammesForCareer(lookupId, { country: 'NO' });
  if (progs.length === 0 && !advanced) {
    progs = getProgrammesForCareer(careerTitle, { country: 'NO' });
  }
  if (progs.length === 0) return null;
  return toLegacyShape(careerId, progs, advanced?.specialisationNote);
}

// ── Internal helpers ────────────────────────────────────────────────

function denormalise(p: Programme): ProgrammeWithInstitution {
  const inst = institutionById.get(p.institutionId);
  return {
    ...p,
    institution: inst?.name ?? p.institutionId,
    city: inst?.city ?? '',
    country: (inst?.country ?? 'NO') as NordicCountry,
    applicationVia: inst?.applicationVia ?? '',
  };
}

function toLegacyShape(
  careerId: string,
  progs: ProgrammeWithInstitution[],
  specialisationNote?: string,
): CareerEducationPath {
  const summary =
    getCareerSummary(careerId) ??
    (progs[0]?.careerOutcome
      ? `${progs[0].englishName} in Norway. ${progs[0].careerOutcome}.`
      : `Study ${progs[0]?.englishName || 'this career'} at a Norwegian university or college.`);
  return {
    careerId,
    summary,
    programmes: progs.map((p) => ({
      programme: p.programme,
      englishName: p.englishName,
      institution: p.institution,
      city: p.city,
      duration: p.duration,
      type: p.type,
      applicationVia: p.applicationVia,
      url: p.url,
    })),
    alternativePaths: getAlternativePaths(careerId),
    ...(specialisationNote ? { specialisationNote } : {}),
  };
}

// ── Career Requirements (structured "What You Need" chain) ──────────

export interface CareerRequirements {
  schoolSubjects: {
    required: string[];
    recommended: string[];
    minimumGrade: string;
  };
  universityPath: {
    programme: string;
    duration: string;
    type: string;
    examples: string[];
    applicationRoute: string;
    competitiveness: string;
  };
  entryLevelRequirements: {
    title: string;
    description: string;
    whatYouNeed: string;
  };
  qualifiesFor: {
    immediate: string;
    withExperience: string;
    seniorPath: string;
  };
  specialisationNote: string | null;
}

const requirementsMap: Record<string, CareerRequirements> =
  (requirementsData as { requirements: Record<string, CareerRequirements> }).requirements;

/**
 * Get the structured entry-requirements chain for a career.
 * Returns null if no data exists for this career yet.
 */
export function getCareerRequirements(
  careerIdOrTitle: string,
): CareerRequirements | null {
  const slug = careerIdOrTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (requirementsMap[slug]) return requirementsMap[slug];
  // Try resolving via career alias
  const resolved = resolveCareerId(careerIdOrTitle);
  if (resolved && requirementsMap[resolved]) return requirementsMap[resolved];
  // Token-subset match: "secondary-school-teacher" → "secondary-teacher",
  // "primary-school-teacher" → "primary-teacher", etc. Handles the split
  // where programmes.json uses a generic bucket ("teacher") but
  // requirements.json has tiered records (secondary-teacher, primary-
  // teacher, music-teacher). Pick the key with the most matching tokens
  // so the most specific record wins.
  const slugTokens = slug.split('-').filter(Boolean);
  if (slugTokens.length > 0) {
    let best: { key: string; score: number } | null = null;
    for (const key of Object.keys(requirementsMap)) {
      const keyTokens = key.split('-').filter(Boolean);
      if (keyTokens.every((t) => slugTokens.includes(t))) {
        if (!best || keyTokens.length > best.score) best = { key, score: keyTokens.length };
      }
    }
    if (best) return requirementsMap[best.key];
  }
  return null;
}

// ── First-role suggestion (for roadmap "entry-level role" step) ──────
//
// Sourced directly from career-requirements.json's entryLevelRequirements
// record — 744/816 careers covered. The role is the curated, real entry
// title (e.g. "Junior Aerospace Engineer"), the reason is the curated
// description + whatYouNeed blurb so the user understands why that role
// is realistic for them after their education path.

export interface FirstRoleSuggestion {
  /** Real entry-level role title, e.g. "Junior Aerospace Engineer" */
  role: string;
  /** What this role involves day-to-day — the "what" */
  description: string;
  /** What qualifications the user will have that make them a fit — the "why" */
  whatYouNeed: string;
}

export function getFirstRoleSuggestion(
  careerIdOrTitle: string,
): FirstRoleSuggestion | null {
  const reqs = getCareerRequirements(careerIdOrTitle);
  const entry = reqs?.entryLevelRequirements;
  if (!entry?.title) return null;
  return {
    role: entry.title,
    description: entry.description ?? '',
    whatYouNeed: entry.whatYouNeed ?? '',
  };
}
