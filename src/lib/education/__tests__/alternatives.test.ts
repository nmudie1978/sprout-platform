import { describe, it, expect } from "vitest";
import {
  getDisciplineForCareer,
  getLocalAlternatives,
  getEuropeanAlternatives,
} from "../alternatives";

describe("education alternatives resolver", () => {
  it("returns null/empty for an unmapped career", () => {
    expect(getDisciplineForCareer("totally-made-up-career")).toBeNull();
    expect(getEuropeanAlternatives("totally-made-up-career")).toEqual([]);
    expect(getLocalAlternatives("totally-made-up-career", "NO")).toEqual([]);
  });
});
