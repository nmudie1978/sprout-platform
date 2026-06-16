/**
 * Pure geometry for the PDF "Winding Road" roadmap visual.
 *
 * Lays a sequence of roadmap steps out as a serpentine path: nodes run
 * left→right across a row, then the road wraps to the next row and runs
 * right→left (a true "winding road"). This guarantees any number of steps
 * fits the fixed page width — the road never runs off the edge.
 *
 * No `@react-pdf` import on purpose: this module is pure data → geometry so
 * it can be unit-tested in isolation. The renderer (`winding-road.tsx`)
 * turns this output into SVG primitives + labels.
 */

export interface WindingNode {
  index: number;
  /** Centre, in points, within the [0,width] × [0,height] box. */
  cx: number;
  cy: number;
  /** Node radius in points (already scaled). */
  r: number;
  row: number;
  /** Visual column slot (0 = leftmost), independent of serpentine direction. */
  col: number;
}

export interface WindingLayout {
  width: number;
  height: number;
  /** Uniform scale applied to fit `maxHeight` (1 when no downscale needed). */
  scale: number;
  /** Per-column width, used to size the centred labels under each node. */
  colWidth: number;
  nodes: WindingNode[];
  /** SVG path `d` for the connecting road, in the same coordinate space. */
  path: string;
}

export interface WindingOpts {
  /** Page content width in points (the road fills this). */
  width: number;
  /** Optional cap — the layout uniformly scales down if it would exceed it. */
  maxHeight?: number;
  maxPerRow?: number;
  /** Base (non-milestone) node radius. Milestones are drawn larger by the renderer. */
  nodeR?: number;
  /** Vertical distance between row centres. */
  rowHeight?: number;
  /** Side inset the U-turn curves bulge into, keeping the road inside `width`. */
  turnPad?: number;
  /** Space above the first row of nodes. */
  topPad?: number;
  /** Vertical space reserved beneath the last row for its label block. */
  labelBlockH?: number;
}

const DEFAULTS = {
  maxPerRow: 4,
  nodeR: 7,
  rowHeight: 84,
  turnPad: 18,
  topPad: 12,
  labelBlockH: 42,
} as const;

export function layoutWindingRoad(count: number, opts: WindingOpts): WindingLayout {
  const width = opts.width;
  const maxPerRow = opts.maxPerRow ?? DEFAULTS.maxPerRow;
  const nodeR = opts.nodeR ?? DEFAULTS.nodeR;
  const rowHeight = opts.rowHeight ?? DEFAULTS.rowHeight;
  const turnPad = opts.turnPad ?? DEFAULTS.turnPad;
  const topPad = opts.topPad ?? DEFAULTS.topPad;
  const labelBlockH = opts.labelBlockH ?? DEFAULTS.labelBlockH;

  if (count <= 0) {
    return { width, height: 0, scale: 1, colWidth: width, nodes: [], path: "" };
  }

  const rows = Math.ceil(count / maxPerRow);
  const perRow = Math.ceil(count / rows);
  const colWidth = (width - 2 * turnPad) / perRow;

  // Milestone nodes are drawn a touch larger; reserve that radius for the box
  // so the largest node never clips the top/bottom edge.
  const maxR = nodeR + 3;

  const nodes: WindingNode[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow);
    const colInRow = i % perRow;
    const leftToRight = row % 2 === 0;
    const col = leftToRight ? colInRow : perRow - 1 - colInRow;
    const cx = turnPad + (col + 0.5) * colWidth;
    const cy = topPad + maxR + row * rowHeight;
    nodes.push({ index: i, cx, cy, r: nodeR, row, col });
  }

  const naturalHeight = topPad + 2 * maxR + (rows - 1) * rowHeight + labelBlockH;

  let scale = 1;
  if (opts.maxHeight != null && naturalHeight > opts.maxHeight) {
    scale = opts.maxHeight / naturalHeight;
  }

  if (scale !== 1) {
    for (const n of nodes) {
      n.cx *= scale;
      n.cy *= scale;
      n.r *= scale;
    }
  }

  const scaledWidth = width * scale;
  const scaledColWidth = colWidth * scale;
  const scaledTurnPad = turnPad * scale;
  const height = naturalHeight * scale;

  const path = buildPath(nodes, scaledWidth, scaledTurnPad);

  return {
    width: scaledWidth,
    height,
    scale,
    colWidth: scaledColWidth,
    nodes,
    path,
  };
}

function buildPath(nodes: WindingNode[], width: number, turnPad: number): string {
  if (nodes.length === 0) return "";
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = `M ${f(nodes[0].cx)} ${f(nodes[0].cy)}`;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    if (a.row === b.row) {
      d += ` L ${f(b.cx)} ${f(b.cy)}`;
    } else {
      // U-turn: a sits at a page edge, b is directly below at the same edge.
      // Bulge the curve out toward that edge for a rounded "road" turn.
      const edgeRight = a.cx > width / 2;
      const bulge = turnPad * 0.85 * (edgeRight ? 1 : -1);
      const c1x = a.cx + bulge;
      const c1y = a.cy + (b.cy - a.cy) * 0.25;
      const c2x = b.cx + bulge;
      const c2y = a.cy + (b.cy - a.cy) * 0.75;
      d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(b.cx)} ${f(b.cy)}`;
    }
  }
  return d;
}

/** Clip a label to `max` characters, appending an ellipsis when cut. */
export function truncate(s: string, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}
