/**
 * Transition directions — per-mindmap-branch roadmaps for career-changers.
 *
 * Pure + deterministic. The Career Transition mindmap shows a career-changer
 * several *directions* back into work (build proof, go through people, a
 * structured trainee route, targeted upskilling). This module turns each of
 * those directions into a genuinely different roadmap step-sequence, so the
 * roadmap "Scenarios" toggle can reshape the path ("try this direction… try
 * that") instead of just annotating a single fixed path.
 *
 * No AI: every direction is a deterministic template, parameterised by the
 * target career, the user's current age, and (for the structured route) the
 * sector-matched named trainee programmes from {@link trainee-programmes}.
 */

import type { JourneyItem } from './career-journey-types';
import type { BridgeMindmap, BranchKind } from './bridge-mindmap-types';
import type { CareerCategory } from '@/lib/career-pathways';
import { getTraineeProgrammesForCategory } from './trainee-programmes';

export type DirectionId = 'structured' | 'proof' | 'network' | 'training';

export interface TransitionDirection {
  id: DirectionId;
  label: string;
  branchKind: BranchKind;
}

export interface DirectionContext {
  targetCareer: string;
  /** The user's current age — the roadmap starts here. */
  startAge: number;
  targetCategory?: CareerCategory;
  previousOccupation?: string | null;
}

/** Which mindmap branch kinds map to a roadmap direction (and their labels). */
const DIRECTION_FOR_KIND: Partial<Record<BranchKind, { id: DirectionId; label: string }>> = {
  programmes: { id: 'structured', label: 'Via a structured route' },
  proof: { id: 'proof', label: 'Build proof first' },
  network: { id: 'network', label: 'Through people' },
  training: { id: 'training', label: 'Targeted upskilling' },
};

/**
 * The directions a user can try, derived from (and ordered by) the mindmap's
 * present branches. Anchor / workplace / tried branches are not "directions".
 */
export function getTransitionDirections(model: BridgeMindmap): TransitionDirection[] {
  const out: TransitionDirection[] = [];
  for (const branch of model.branches) {
    const d = DIRECTION_FOR_KIND[branch.kind];
    if (d) out.push({ id: d.id, label: d.label, branchKind: branch.kind });
  }
  return out;
}

// ── Step builder ────────────────────────────────────────────────────

interface StepSpec {
  stage: JourneyItem['stage'];
  title: string;
  subtitle?: string;
  /** Offset from startAge for this step's start. */
  from: number;
  /** Offset from startAge for this step's end (omit for a point milestone). */
  to?: number;
  milestone?: boolean;
  icon?: string;
}

function toItems(id: DirectionId, startAge: number, specs: StepSpec[]): JourneyItem[] {
  return specs.map((s, i) => ({
    id: `dir-${id}-${i}`,
    stage: s.stage,
    title: s.title,
    subtitle: s.subtitle,
    startAge: startAge + s.from,
    endAge: s.to != null ? startAge + s.to : undefined,
    isMilestone: s.milestone ?? false,
    icon: s.icon,
  }));
}

const FIRST_ROLE: StepSpec = {
  stage: 'career',
  title: 'Land your first paid role',
  subtitle: 'Your first real role in the new field — paid, with a team around you.',
  from: 3,
  milestone: true,
  icon: 'Briefcase',
};
const GROW: StepSpec = {
  stage: 'career',
  title: 'Grow into an established role',
  subtitle: 'Build depth, take on more, and step up as you find your feet.',
  from: 5,
  icon: 'TrendingUp',
};

/**
 * Build the roadmap step-sequence for a chosen direction. Returns the steps
 * AFTER the foundation (the renderer injects "Your Starting Point" itself).
 */
export function buildDirectionJourney(id: DirectionId, ctx: DirectionContext): JourneyItem[] {
  const { startAge, targetCategory } = ctx;

  switch (id) {
    case 'structured': {
      const companies = getTraineeProgrammesForCategory(targetCategory)
        .slice(0, 3)
        .map((p) => p.company);
      const applyNote = companies.length
        ? `Apply to graduate/trainee programmes (e.g. ${companies.join(', ')}) — typically Aug–Nov.`
        : 'Apply to graduate, trainee and apprenticeship schemes (incl. lærling) in your field.';
      return toItems('structured', startAge, [
        { stage: 'experience', title: 'Prepare a strong application', subtitle: 'Tailor your CV to the programme and brush up the basics it expects.', from: 0, to: 1, icon: 'FileText' },
        { stage: 'experience', title: 'Apply to a structured programme', subtitle: applyNote, from: 1, milestone: true, icon: 'Send' },
        { stage: 'experience', title: 'Trainee / structured role', subtitle: 'Learn on the job with training and support built in.', from: 1, to: 3, icon: 'GraduationCap' },
        FIRST_ROLE,
        GROW,
      ]);
    }
    case 'proof':
      return toItems('proof', startAge, [
        { stage: 'experience', title: 'Build a portfolio of real work', subtitle: 'Run one pro-bono project and collect the evidence employers want to see.', from: 0, to: 1, icon: 'FolderOpen' },
        { stage: 'experience', title: 'Land a supported placement', subtitle: 'A work trial or internship that turns your portfolio into real experience.', from: 1, to: 2, icon: 'Handshake' },
        FIRST_ROLE,
        GROW,
      ]);
    case 'network':
      return toItems('network', startAge, [
        { stage: 'experience', title: 'Reconnect and get referred', subtitle: 'Ex-colleagues and informational chats open doors cold applications never will.', from: 0, to: 1, icon: 'Users' },
        { stage: 'experience', title: 'Temp / fixed-term via an agency', subtitle: 'A short contract converts to the experience line you are missing.', from: 1, to: 2, icon: 'Clock' },
        FIRST_ROLE,
        GROW,
      ]);
    case 'training':
      return toItems('training', startAge, [
        { stage: 'certification', title: 'Close one named skill gap', subtitle: 'A short, targeted course or certification — not a whole new degree.', from: 0, to: 1, icon: 'Award' },
        { stage: 'experience', title: 'Apply with the new credential', subtitle: 'Put the credential to work on real applications and a small project.', from: 1, to: 2, icon: 'Send' },
        FIRST_ROLE,
        GROW,
      ]);
  }
}
