import { describe, it, expect } from "vitest";
import {
  normaliseCountry,
  countryToCode,
  defaultLocaleForCountry,
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

  it("defaultLocaleForCountry only diverges for Spain", () => {
    expect(defaultLocaleForCountry("Spain")).toBe("es");
    expect(defaultLocaleForCountry("Norway")).toBeNull();
    expect(defaultLocaleForCountry(undefined)).toBeNull();
  });
});
