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
  it("launches exactly Norway, Spain, Sweden and Denmark", () => {
    expect(LAUNCHED_COUNTRIES.map((c) => c.name)).toEqual([
      "Norway",
      "Spain",
      "Sweden",
      "Denmark",
    ]);
  });
  it("is a subset of SUPPORTED_COUNTRIES", () => {
    const supported = new Set(SUPPORTED_COUNTRIES.map((c) => c.name));
    for (const c of LAUNCHED_COUNTRIES) expect(supported.has(c.name)).toBe(true);
  });
  it("isLaunchedCountry only true for launched", () => {
    expect(isLaunchedCountry("Spain")).toBe(true);
    expect(isLaunchedCountry("Italy")).toBe(false);
    expect(isLaunchedCountry(null)).toBe(false);
  });
});
