/**
 * Nordic Programmes Loader
 *
 * Single source of truth for education programmes across Norway,
 * Sweden, Denmark, Finland and Iceland, mapped to career IDs.
 *
 * Data lives in `./nordic-programmes.json` — a static, git-committed
 * dataset sourced from official Nordic admissions portals (Samordna
 * opptak, antagning.se, optagelse.dk, opintopolku.fi, haskolinn.is).
 *
 * Usage:
 *   import { getProgrammesForCareer } from '@/lib/education/nordic-programmes';
 *   const progs = getProgrammesForCareer('nurse', { country: 'SE' });
 *
 * Backward compatibility:
 *   `getNorwayProgrammes(careerId, careerTitle)` still works — it's a
 *   thin wrapper that filters to country "NO" and returns the legacy
 *   `CareerEducationPath` shape expected by the Education & Certs tab.
 *   Existing call sites don't need to change.
 */

import rawData from './nordic-programmes.json';

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

export interface NordicProgramme {
  careerId: string;
  country: NordicCountry;
  institution: string;
  programme: string;
  englishName: string;
  city: string;
  url: string;
  type: ProgrammeType;
  duration: string;
  applicationVia: string;
  languageOfInstruction?: string;
  tuitionFee?: string;
  entryRequirements?: string;
  careerOutcome?: string;
}

// ── Parse + index the dataset once at module load ───────────────────

const programmes: NordicProgramme[] = (rawData.programmes ?? []) as NordicProgramme[];
const careerKeyMap: Record<string, string> = (rawData.careerKeyMap ?? {}) as Record<string, string>;

// Index by careerId for O(1) lookup.
const byCareerId = new Map<string, NordicProgramme[]>();
for (const p of programmes) {
  const list = byCareerId.get(p.careerId) ?? [];
  list.push(p);
  byCareerId.set(p.careerId, list);
}

// ── Lookup helpers ──────────────────────────────────────────────────

/**
 * Resolve a raw career string to a canonical careerId.
 *
 * Tries (in order):
 *   1. Direct match against existing careerIds in the dataset
 *   2. Slugified match (e.g. "Software Developer" → "software-developer")
 *   3. Local-language alias via careerKeyMap (e.g. "sykepleier" → "nurse")
 */
function resolveCareerId(raw: string): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // 1. Direct match on careerId
  if (byCareerId.has(slug)) return slug;
  if (byCareerId.has(lower)) return lower;

  // 2. Slug of the raw title (e.g. "Software Developer" → "software-developer")
  if (byCareerId.has(slug)) return slug;

  // 3. Local-language alias map
  if (careerKeyMap[lower]) return careerKeyMap[lower];
  if (careerKeyMap[slug]) return careerKeyMap[slug];

  // 4. Partial match — try each word of the raw string
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
 * Get all programmes matching a career, optionally filtered by country
 * and/or programme type.
 *
 * Accepts both canonical IDs ("nurse") and raw titles / local names
 * ("Sykepleier", "Software Developer") — the resolver handles it.
 */
export function getProgrammesForCareer(
  careerIdOrTitle: string,
  filter?: ProgrammeFilter,
): NordicProgramme[] {
  const id = resolveCareerId(careerIdOrTitle);
  if (!id) return [];
  let list = byCareerId.get(id) ?? [];
  if (filter?.country) list = list.filter((p) => p.country === filter.country);
  if (filter?.type) list = list.filter((p) => p.type === filter.type);
  return list;
}

/**
 * Get all distinct career IDs that have at least one programme in the
 * dataset. Useful for coverage audits.
 */
export function getCoveredCareerIds(): string[] {
  return [...byCareerId.keys()];
}

/**
 * Get all programmes for a given country (all careers).
 */
export function getProgrammesByCountry(country: NordicCountry): NordicProgramme[] {
  return programmes.filter((p) => p.country === country);
}

/**
 * Total programme count — useful for the header badge on /careers.
 */
export function getProgrammeCount(): number {
  return programmes.length;
}

// ── Legacy backward-compat wrappers ─────────────────────────────────
//
// The old `getNorwayProgrammes(careerId, careerTitle)` and
// `getCertificationPath(careerId, careerTitle)` were used by:
//   - my-journey/page.tsx (Education & Certs tab)
//   - career-opportunities agent (Stage 1 seed)
//   - momentum suggested-move URL builder
//
// These wrappers keep the old call sites working without edits.
// Over time they should migrate to `getProgrammesForCareer`.

export interface NorwayProgramme {
  programme: string;
  englishName: string;
  institution: string;
  city: string;
  duration: string;
  type: string;
  applicationVia: string;
  url: string;
}

export interface CareerEducationPath {
  careerId: string;
  summary: string;
  programmes: NorwayProgramme[];
  alternativePaths?: string[];
}

/**
 * Legacy wrapper — returns Norwegian programmes in the old shape.
 * Returns null if no programmes found for this career in Norway.
 */
export function getNorwayProgrammes(
  careerId: string,
  careerTitle: string,
): CareerEducationPath | null {
  const progs = getProgrammesForCareer(careerId || careerTitle, { country: 'NO' });
  if (progs.length === 0) {
    // Try title as fallback
    const byTitle = getProgrammesForCareer(careerTitle, { country: 'NO' });
    if (byTitle.length === 0) return null;
    return toLegacyShape(careerId || careerTitle, byTitle);
  }
  return toLegacyShape(careerId, progs);
}

function toLegacyShape(careerId: string, progs: NordicProgramme[]): CareerEducationPath {
  return {
    careerId,
    summary: progs[0]?.careerOutcome
      ? `${progs[0].englishName} in Norway. ${progs[0].careerOutcome}.`
      : `Study ${progs[0]?.englishName || 'this career'} at a Norwegian university or college.`,
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
  };
}

// ── Certification path — kept as a pass-through to the old module ───
//
// Certifications aren't in the Nordic programmes dataset (they're
// provider-specific, not university programmes). We re-export the
// old lookup so existing call sites keep working.

// The old file is still at this path but we renamed it to avoid
// circular imports. If the old file is gone, this import will fail
// at build time — that's intentional, it tells you to either add
// certifications to the JSON or port them here.
// Re-export from the legacy file which still holds the hand-curated
// certification data (PRINCE2, PMP, CISSP, etc.). These are vendor
// certifications, not university programmes, so they don't belong
// in the Nordic dataset.
export { getCertificationPath } from './norway-programmes';
