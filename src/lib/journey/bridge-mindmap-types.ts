/**
 * Bridge Routes Mindmap — types
 *
 * A calm, deterministic map of routes back into work for users whose
 * Clarity foundation stage is `other` (self-directed / between jobs /
 * career-switch). See docs/superpowers/specs/2026-06-20-bridge-routes-mindmap-design.md
 */

export type TriedRoute =
  | 'course'
  | 'applications'
  | 'cv'
  | 'networking'
  | 'placement'
  | 'freelancing';

export type Blocker = 'no-experience' | 'no-callbacks' | 'unknown-routes';

/** Runtime lists for validation + UI (kept in sync with the unions above). */
export const TRIED_ROUTES: TriedRoute[] = [
  'course',
  'applications',
  'cv',
  'networking',
  'placement',
  'freelancing',
];
export const BLOCKERS: Blocker[] = ['no-experience', 'no-callbacks', 'unknown-routes'];

export type BranchKind =
  | 'anchor'
  | 'workplace-nav'
  | 'proof'
  | 'training'
  | 'network'
  | 'tried';

export interface BridgeInput {
  /** What the user did before — anchors the `anchor` branch. Optional. */
  previousOccupation: string | null;
  /** The journey goal — the centre of the map. */
  targetCareer: string;
  /** Whether the user is currently working with NAV — gates the NAV branch. */
  withNav: boolean;
  /** Routes the user has already tried — powers tried/untried. */
  triedRoutes: TriedRoute[];
  /** The user's main blocker — orders the branches. */
  blocker: Blocker;
}

export interface BridgeLeaf {
  id: string;
  label: string;
  /** "What this is / how to start" — expanded on tap. */
  detail?: string;
  state: 'untried' | 'tried';
  /** NAV leaf → factual treatment + nav.no pointer. */
  navFact?: boolean;
  /** If this route is in the user's triedRoutes, the leaf is dropped from its
   *  home branch (the tried branch represents it once instead). */
  mapsToTriedRoute?: TriedRoute;
}

export interface BridgeBranch {
  id: string;
  kind: BranchKind;
  title: string;
  /** Blocker-driven subtle highlight. */
  emphasis: boolean;
  leaves: BridgeLeaf[];
}

export interface BridgeMindmap {
  center: { targetCareer: string; previousOccupation: string | null };
  branches: BridgeBranch[];
}
