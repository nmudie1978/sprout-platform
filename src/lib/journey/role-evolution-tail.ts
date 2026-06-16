/**
 * Role-evolution tail — the deterministic "how the role grows from here" coda
 * the Clarity-tab roadmap appends after the last journey milestone.
 *
 * It is derived purely from existing bundled data (no fetch):
 *  - getCareerPathProgression → entry/core/next (+ optional expert/lead fork)
 *  - getCareerProgression     → the level ladder (titles + yearsExperience)
 *  - getSpecialisms           → "what type of X" branches
 *
 * The senior stage BRANCHES only when the career's data actually diverges
 * (specialisms → expert/lead fork → flat grows-into); otherwise it stays a
 * single linear senior node. Careers with no progression data return `null`
 * (the renderer then shows nothing extra). See the design doc:
 * docs/superpowers/specs/2026-06-16-roadmap-role-evolution-tail-design.md
 */

import {
  getCareerProgression,
  getCareerPathProgression,
  type CareerProgression,
} from '@/lib/career-progressions';
import { getSpecialisms } from '@/lib/career-specialisms';

export interface EvolutionStage {
  title: string;
  /** Approximate CALENDAR age (entry-role age + years-of-experience offset). */
  approxAge: number;
}

export type EvolutionBranchKind = 'specialism' | 'track' | 'next' | 'single';

export interface EvolutionBranch extends EvolutionStage {
  kind: EvolutionBranchKind;
  /** Only for the expert/lead fork — e.g. "Specialist track" / "Lead track". */
  trackLabel?: string;
}

export interface RoleEvolutionTail {
  /** The established ("core") role the entry job grows into. */
  core: EvolutionStage;
  /** True when the senior stage diverges into 2–3 branches. */
  forked: boolean;
  /** 1 senior node (linear) or 2–3 (forked). */
  branches: EvolutionBranch[];
}

const MAX_BRANCHES = 3;

/** First integer in a "2-6 years" / "10+ years" / "0-2 years" string. */
function lowerYears(years: string | undefined): number | undefined {
  if (!years) return undefined;
  const m = years.match(/\d+/);
  return m ? parseInt(m[0], 10) : undefined;
}

function levelYearsLower(
  prog: CareerProgression | undefined,
  level: 'entry' | 'mid' | 'senior' | 'lead',
): number | undefined {
  return lowerYears(prog?.levels.find((l) => l.level === level)?.yearsExperience);
}

function levelTitle(
  prog: CareerProgression | undefined,
  level: 'entry' | 'mid' | 'senior' | 'lead',
): string | undefined {
  return prog?.levels.find((l) => l.level === level)?.title;
}

/**
 * Build the role-evolution coda for a career, or `null` when there isn't enough
 * data to show real role titles.
 *
 * @param careerId       The career's id (already resolved from the goal title).
 * @param entryRoleAge   Calendar age at the roadmap's final milestone (first
 *                       entry-level role) — the anchor the coda grows from.
 */
export function deriveRoleEvolutionTail(
  careerId: string,
  entryRoleAge: number,
): RoleEvolutionTail | null {
  const path = getCareerPathProgression(careerId);
  const prog = getCareerProgression(careerId);
  const specialisms = getSpecialisms(careerId);

  // ── CORE title — the established role the entry job grows into.
  const coreTitle =
    path?.core?.[0] ?? levelTitle(prog, 'mid') ?? levelTitle(prog, 'entry') ?? null;
  if (!coreTitle) return null;

  // ── Approximate ages. Core sits at the "mid" rung; senior at the "senior"
  // rung. Fall back to gentle defaults when the ladder isn't curated, and
  // always keep senior strictly later than core.
  const coreOffset = levelYearsLower(prog, 'mid') ?? levelYearsLower(prog, 'entry') ?? 3;
  const coreAge = entryRoleAge + coreOffset;
  const seniorOffset = levelYearsLower(prog, 'senior') ?? levelYearsLower(prog, 'lead') ?? coreOffset + 4;
  const seniorAge = Math.max(entryRoleAge + seniorOffset, coreAge + 2);

  const core: EvolutionStage = { title: coreTitle, approxAge: coreAge };

  // ── Senior branches, in priority order (the fork-applicability rule).
  let branches: EvolutionBranch[];
  let forked: boolean;

  if (specialisms.length >= 2) {
    branches = specialisms.slice(0, MAX_BRANCHES).map((s) => ({
      title: s.title,
      kind: 'specialism' as const,
      approxAge: seniorAge,
    }));
    forked = true;
  } else if (path?.nextExpert?.length && path?.nextLead?.length) {
    branches = [
      { title: path.nextExpert[0], kind: 'track', trackLabel: 'Specialist track', approxAge: seniorAge },
      { title: path.nextLead[0], kind: 'track', trackLabel: 'Lead track', approxAge: seniorAge },
    ];
    forked = true;
  } else if (path?.next && path.next.length >= 2) {
    branches = path.next.slice(0, MAX_BRANCHES).map((t) => ({
      title: t,
      kind: 'next' as const,
      approxAge: seniorAge,
    }));
    forked = true;
  } else {
    // Linear: one senior node. Prefer a named grows-into, else the top of the
    // ladder (the most aspirational rung), anchored at that rung's age.
    const leadOffset = levelYearsLower(prog, 'lead') ?? levelYearsLower(prog, 'senior');
    const singleTitle =
      path?.next?.[0] ??
      levelTitle(prog, 'lead') ??
      levelTitle(prog, 'senior') ??
      specialisms[0]?.title ??
      null;
    if (!singleTitle) return null;
    const singleAge = leadOffset !== undefined ? Math.max(entryRoleAge + leadOffset, coreAge + 2) : seniorAge;
    branches = [{ title: singleTitle, kind: 'single', approxAge: singleAge }];
    forked = false;
  }

  return { core, forked, branches };
}
