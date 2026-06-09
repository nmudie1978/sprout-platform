/**
 * Salary progression — parsing + synthesis.
 *
 * The synthesized curve is shown to youth users labelled "Estimated", so the
 * invariants that keep it honest matter: parse real avgSalary strings, levels
 * must strictly increase, curated data must win, and an unparseable salary with
 * no curated data must degrade to null (no popup) rather than render garbage.
 */

import { describe, it, expect } from "vitest";
import {
  parseSalaryRangeK,
  synthesizeProgression,
  buildSalaryProgression,
} from "../salary-progression";

describe("parseSalaryRangeK", () => {
  it("parses a comma-thousands NOK range", () => {
    expect(parseSalaryRangeK("560,000 - 760,000 kr/year")).toEqual({ minK: 560, maxK: 760 });
  });

  it("parses an en-dash range and already-in-thousands values", () => {
    expect(parseSalaryRangeK("450k–610k")).toEqual({ minK: 450, maxK: 610 });
  });

  it("orders min/max regardless of input order", () => {
    expect(parseSalaryRangeK("760,000 - 560,000 kr")).toEqual({ minK: 560, maxK: 760 });
  });

  it("turns a single value into a ±10% band (rounded to 10k)", () => {
    expect(parseSalaryRangeK("600,000 kr/year")).toEqual({ minK: 540, maxK: 660 });
  });

  it("returns null when there is no number", () => {
    expect(parseSalaryRangeK("Competitive")).toBeNull();
    expect(parseSalaryRangeK("")).toBeNull();
    expect(parseSalaryRangeK(null)).toBeNull();
  });
});

describe("synthesizeProgression", () => {
  const prog = synthesizeProgression({ minK: 560, maxK: 760 });

  it("produces four levels flagged estimated", () => {
    expect(prog.steps).toHaveLength(4);
    expect(prog.estimated).toBe(true);
  });

  it("strictly increases on both min and max across levels", () => {
    for (let i = 1; i < prog.steps.length; i++) {
      expect(prog.steps[i].minK).toBeGreaterThan(prog.steps[i - 1].minK);
      expect(prog.steps[i].maxK).toBeGreaterThan(prog.steps[i - 1].maxK);
    }
  });

  it("keeps the stated range as the Established (mid-career) band", () => {
    const established = prog.steps.find((s) => s.label === "Established")!;
    expect(established.minK).toBe(560);
    expect(established.maxK).toBe(760);
  });

  it("rounds every value to the nearest 10k", () => {
    for (const s of prog.steps) {
      expect(s.minK % 10).toBe(0);
      expect(s.maxK % 10).toBe(0);
    }
  });
});

describe("buildSalaryProgression", () => {
  it("uses curated data (estimated:false) for a curated career", () => {
    const prog = buildSalaryProgression({ id: "doctor", avgSalary: "1 - 2 kr" });
    expect(prog).not.toBeNull();
    expect(prog!.estimated).toBe(false);
    // curated doctor data starts at LIS1, not a synthesized "Entry level"
    expect(prog!.steps[0].label.toLowerCase()).toContain("lis1");
  });

  it("synthesizes (estimated:true) for an uncurated career with a range", () => {
    const prog = buildSalaryProgression({ id: "underwater-basket-weaver", avgSalary: "560,000 - 760,000 kr/year" });
    expect(prog).not.toBeNull();
    expect(prog!.estimated).toBe(true);
    expect(prog!.steps).toHaveLength(4);
  });

  it("returns null when uncurated and salary is unparseable", () => {
    expect(buildSalaryProgression({ id: "mystery-job", avgSalary: "Competitive" })).toBeNull();
    expect(buildSalaryProgression({ id: "mystery-job", avgSalary: null })).toBeNull();
  });
});
