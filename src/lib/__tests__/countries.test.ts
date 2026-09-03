import { describe, it, expect } from "vitest";
import {
  normaliseCountry,
  countryToCode,
  defaultLocaleForCountry,
  LAUNCHED_COUNTRIES,
  SUPPORTED_COUNTRIES,
  isLaunchedCountry,
} from "../countries";

describe("countries helpers", () => {
  it("normaliseCountry keeps supported names, falls back to Norway", () => {
    expect(normaliseCountry("Spain")).toBe("Spain");
    expect(normaliseCountry("Norway")).toBe("Norway");
    expect(normaliseCountry("Atlantis")).toBe("Norway");
    expect(normaliseCountry(undefined)).toBe("Norway");
  });

  it("countryToCode maps names to ISO codes", () => {
    expect(countryToCode("Spain")).toBe("ES");
    expect(countryToCode("Norway")).toBe("NO");
    expect(countryToCode("Atlantis")).toBeNull();
    expect(countryToCode(null)).toBeNull();
  });

  it("defaultLocaleForCountry maps Spain/Sweden/Denmark; Norway stays en-GB", () => {
    expect(defaultLocaleForCountry("Spain")).toBe("es");
    expect(defaultLocaleForCountry("Sweden")).toBe("sv");
    expect(defaultLocaleForCountry("Denmark")).toBe("da");
    expect(defaultLocaleForCountry("Norway")).toBeNull();
    expect(defaultLocaleForCountry(undefined)).toBeNull();
  });
});

describe("launched countries", () => {
  // Norway only for the commercial launch. Spain, Sweden and Denmark were
  // withdrawn from signup on 2026-09-03 — see the note in src/lib/countries.ts
  // before widening this.
  it("launches exactly Norway", () => {
    expect(LAUNCHED_COUNTRIES.map((c) => c.name)).toEqual(["Norway"]);
  });

  it("does not offer the withdrawn markets", () => {
    for (const closed of ["Spain", "Sweden", "Denmark"]) {
      expect(isLaunchedCountry(closed)).toBe(false);
    }
  });
  it("is a subset of SUPPORTED_COUNTRIES", () => {
    const supported = new Set(SUPPORTED_COUNTRIES.map((c) => c.name));
    for (const c of LAUNCHED_COUNTRIES) expect(supported.has(c.name)).toBe(true);
  });
  it("isLaunchedCountry only true for launched", () => {
    expect(isLaunchedCountry("Norway")).toBe(true);
    expect(isLaunchedCountry("Italy")).toBe(false);
    expect(isLaunchedCountry(null)).toBe(false);
  });

  // Withdrawing a market must not remove it from the roadmap list: existing
  // accounts still store these names and normaliseCountry must keep resolving
  // them rather than silently rewriting someone's country to Norway.
  it("keeps withdrawn markets resolvable for existing accounts", () => {
    for (const closed of ["Spain", "Sweden", "Denmark"]) {
      expect(normaliseCountry(closed)).toBe(closed);
    }
  });
});
