import { describe, it, expect } from "vitest";
import { layoutWindingRoad, truncate } from "../winding-road-layout";

const W = 491;

describe("layoutWindingRoad", () => {
  it("returns no nodes and zero size for an empty roadmap", () => {
    const l = layoutWindingRoad(0, { width: W });
    expect(l.nodes).toHaveLength(0);
    expect(l.height).toBe(0);
    expect(l.path).toBe("");
  });

  it("lays a single step as one node on one row", () => {
    const l = layoutWindingRoad(1, { width: W });
    expect(l.nodes).toHaveLength(1);
    expect(l.nodes[0].row).toBe(0);
    // A single node still produces a moveTo so the renderer has an anchor.
    expect(l.path.startsWith("M")).toBe(true);
  });

  it("balances rows: 6→2×3, 8→2×4, 5→3+2", () => {
    const six = layoutWindingRoad(6, { width: W });
    expect(Math.max(...six.nodes.map((n) => n.row))).toBe(1); // 2 rows
    expect(six.nodes.filter((n) => n.row === 0)).toHaveLength(3);

    const eight = layoutWindingRoad(8, { width: W });
    expect(Math.max(...eight.nodes.map((n) => n.row))).toBe(1);
    expect(eight.nodes.filter((n) => n.row === 0)).toHaveLength(4);

    const five = layoutWindingRoad(5, { width: W });
    expect(Math.max(...five.nodes.map((n) => n.row))).toBe(1);
    expect(five.nodes.filter((n) => n.row === 0)).toHaveLength(3);
    expect(five.nodes.filter((n) => n.row === 1)).toHaveLength(2);
  });

  it("caps at maxPerRow=4 so a single row never overflows width", () => {
    const l = layoutWindingRoad(10, { width: W });
    const perRow0 = l.nodes.filter((n) => n.row === 0).length;
    expect(perRow0).toBeLessThanOrEqual(4);
  });

  it("keeps every node inside the [0,width] × [0,height] box", () => {
    for (const count of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12]) {
      const l = layoutWindingRoad(count, { width: W });
      for (const n of l.nodes) {
        expect(n.cx - n.r).toBeGreaterThanOrEqual(0);
        expect(n.cx + n.r).toBeLessThanOrEqual(l.width + 0.001);
        expect(n.cy - n.r).toBeGreaterThanOrEqual(0);
        expect(n.cy + n.r).toBeLessThanOrEqual(l.height + 0.001);
      }
    }
  });

  it("snakes: row 0 increases x left→right, row 1 decreases x right→left", () => {
    const l = layoutWindingRoad(6, { width: W });
    const row0 = l.nodes.filter((n) => n.row === 0);
    const row1 = l.nodes.filter((n) => n.row === 1);
    for (let i = 1; i < row0.length; i++) {
      expect(row0[i].cx).toBeGreaterThan(row0[i - 1].cx);
    }
    for (let i = 1; i < row1.length; i++) {
      expect(row1[i].cx).toBeLessThan(row1[i - 1].cx);
    }
  });

  it("keeps the road continuous: last node of a full row sits above the first node of the next row", () => {
    const l = layoutWindingRoad(6, { width: W });
    const row0 = l.nodes.filter((n) => n.row === 0);
    const row1 = l.nodes.filter((n) => n.row === 1);
    const lastOfRow0 = row0[row0.length - 1];
    const firstOfRow1 = row1[0];
    expect(Math.abs(lastOfRow0.cx - firstOfRow1.cx)).toBeLessThan(0.001);
    expect(firstOfRow1.cy).toBeGreaterThan(lastOfRow0.cy);
  });

  it("scales down to fit when natural height exceeds maxHeight", () => {
    const natural = layoutWindingRoad(12, { width: W });
    const constrained = layoutWindingRoad(12, { width: W, maxHeight: 120 });
    expect(natural.height).toBeGreaterThan(120);
    expect(constrained.scale).toBeLessThan(1);
    expect(constrained.height).toBeLessThanOrEqual(120 + 0.001);
    // Nodes still inside the (scaled) box.
    for (const n of constrained.nodes) {
      expect(n.cy + n.r).toBeLessThanOrEqual(constrained.height + 0.001);
    }
  });

  it("does not upscale when content already fits (scale = 1)", () => {
    const l = layoutWindingRoad(4, { width: W, maxHeight: 600 });
    expect(l.scale).toBe(1);
  });

  it("path is a moveto followed by line/curve commands", () => {
    const l = layoutWindingRoad(6, { width: W });
    expect(l.path.startsWith("M")).toBe(true);
    expect(l.path).toMatch(/[LC]/); // has straight runs and/or U-turn curves
  });
});

describe("truncate", () => {
  it("leaves short strings untouched", () => {
    expect(truncate("Short title", 48)).toBe("Short title");
  });
  it("clips long strings with an ellipsis", () => {
    const out = truncate("a".repeat(80), 48);
    expect(out.length).toBeLessThanOrEqual(48);
    expect(out.endsWith("…")).toBe(true);
  });
  it("handles empty/undefined input", () => {
    expect(truncate("", 48)).toBe("");
    expect(truncate(undefined as unknown as string, 48)).toBe("");
  });
});
