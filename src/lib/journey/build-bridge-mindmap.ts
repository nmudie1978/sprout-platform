/**
 * Bridge Routes Mindmap — engine
 *
 * Pure, deterministic. Turns a BridgeInput into a BridgeMindmap by:
 *   1. building the curated source branches,
 *   2. gating the NAV branch on `withNav`,
 *   3. dropping tried-mapped leaves from live branches,
 *   4. ordering + emphasising branches by the user's blocker,
 *   5. appending a single "Already tried" branch.
 */

import type {
  Blocker,
  BranchKind,
  BridgeBranch,
  BridgeInput,
  BridgeMindmap,
} from './bridge-mindmap-types';
import { buildCatalogueBranches, TRIED_ROUTE_LABELS } from './bridge-catalogue';

/** Branch priority per blocker (first = floated to top + emphasised). */
const BLOCKER_ORDER: Record<Blocker, BranchKind[]> = {
  'no-callbacks': ['workplace-nav', 'network', 'anchor', 'proof', 'training'],
  'no-experience': ['proof', 'workplace-nav', 'anchor', 'network', 'training'],
  'unknown-routes': ['anchor', 'workplace-nav', 'proof', 'network', 'training'],
};

function orderIndex(order: BranchKind[], kind: BranchKind): number {
  const i = order.indexOf(kind);
  return i === -1 ? order.length : i;
}

function buildTriedBranch(input: BridgeInput): BridgeBranch {
  return {
    id: 'tried',
    kind: 'tried',
    title: 'Already tried',
    emphasis: false,
    leaves: input.triedRoutes.map((route) => ({
      id: `tried-${route}`,
      label: TRIED_ROUTE_LABELS[route],
      state: 'tried' as const,
    })),
  };
}

export function buildBridgeMindmap(input: BridgeInput): BridgeMindmap {
  const tried = new Set(input.triedRoutes);

  // 1 + 2: source branches, NAV-gated.
  let branches = buildCatalogueBranches(input).filter(
    (b) => b.kind !== 'workplace-nav' || input.withNav,
  );

  // 3: drop tried-mapped leaves from their home branch (represented once in
  //    the tried branch instead).
  branches = branches.map((b) => ({
    ...b,
    leaves: b.leaves.filter((l) => !(l.mapsToTriedRoute && tried.has(l.mapsToTriedRoute))),
  }));

  // 4: order by blocker (stable sort), then emphasise the first present branch
  //    (none for `unknown-routes`).
  const order = BLOCKER_ORDER[input.blocker];
  branches.sort((a, b) => orderIndex(order, a.kind) - orderIndex(order, b.kind));
  branches = branches.map((b, i) => ({
    ...b,
    emphasis: input.blocker !== 'unknown-routes' && i === 0,
  }));

  // 5: append the single "Already tried" branch.
  if (input.triedRoutes.length > 0) branches.push(buildTriedBranch(input));

  return {
    center: {
      targetCareer: input.targetCareer,
      previousOccupation: input.previousOccupation,
    },
    branches,
  };
}
