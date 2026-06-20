/**
 * Bridge Routes Mindmap — pure layout
 *
 * Computes node boxes + bezier edge paths for the left→right SVG "fan"
 * (desktop). No React, no DOM — pure geometry, so it is unit-testable and the
 * component just paints the result. The mobile accordion does not use this.
 */

import type { BridgeBranch, BridgeLeaf, BridgeMindmap } from '../../lib/journey/bridge-mindmap-types';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface LeafLayout extends Box {
  leaf: BridgeLeaf;
}
export interface BranchLayout extends Box {
  branch: BridgeBranch;
  leaves: LeafLayout[];
}
export interface MindmapLayout {
  width: number;
  height: number;
  center: Box & { data: BridgeMindmap['center'] };
  branches: BranchLayout[];
  edges: { d: string }[];
}

const PAD = 8;
const CENTER_X = 8;
const CENTER_W = 196;
const CENTER_H = 100;
const BRANCH_X = 300;
const BRANCH_W = 176;
const BRANCH_H = 64;
const LEAF_X = 520;
const LEAF_H = 48;
const LEAF_GAP = 12;
const BLOCK_GAP = 22;
const TOP = 12;

function blockHeight(branch: BridgeBranch): number {
  const n = Math.max(branch.leaves.length, 1);
  return Math.max(BRANCH_H, n * LEAF_H + (n - 1) * LEAF_GAP);
}

/** Smooth horizontal cubic bezier between two points. */
function edge(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

export function layoutMindmap(model: BridgeMindmap, opts: { width?: number } = {}): MindmapLayout {
  const width = opts.width ?? 920;
  const leafW = width - LEAF_X - PAD;

  // Stack each branch's block top-to-bottom.
  let cursor = TOP;
  const branches: BranchLayout[] = model.branches.map((branch) => {
    const bh = blockHeight(branch);
    const blockTop = cursor;
    const leaves: LeafLayout[] = branch.leaves.map((leaf, i) => ({
      x: LEAF_X,
      y: blockTop + i * (LEAF_H + LEAF_GAP),
      w: leafW,
      h: LEAF_H,
      leaf,
    }));
    const branchY = blockTop + (bh - BRANCH_H) / 2;
    cursor = blockTop + bh + BLOCK_GAP;
    return { x: BRANCH_X, y: branchY, w: BRANCH_W, h: BRANCH_H, branch, leaves };
  });

  const height = Math.max(cursor - BLOCK_GAP + TOP, CENTER_H + TOP * 2);

  const center = {
    x: CENTER_X,
    y: height / 2 - CENTER_H / 2,
    w: CENTER_W,
    h: CENTER_H,
    data: model.center,
  };

  // Edges: centre → each branch, then each branch → its leaves.
  const edges: { d: string }[] = [];
  const cRight = center.x + center.w;
  const cMidY = center.y + center.h / 2;
  for (const b of branches) {
    const bMidY = b.y + b.h / 2;
    edges.push({ d: edge(cRight, cMidY, b.x, bMidY) });
    for (const lf of b.leaves) {
      edges.push({ d: edge(b.x + b.w, bMidY, lf.x, lf.y + lf.h / 2) });
    }
  }

  return { width, height, center, branches, edges };
}
