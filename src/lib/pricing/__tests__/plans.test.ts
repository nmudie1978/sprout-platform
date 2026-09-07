import { describe, it, expect } from "vitest";
import {
  COUNTRY_PRICING,
  pricingFor,
  proPrice,
  formatPrice,
  annualSavingPercent,
  PLAN,
} from "../plans";

describe("consumer pricing", () => {
  it("offers exactly two plans", () => {
    expect(Object.keys(PLAN).sort()).toEqual(["FREE", "PRO"]);
  });

  it("prices Pro at 99 monthly and 899 annually in both countries", () => {
    for (const country of ["Norway", "Sweden"]) {
      const p = pricingFor(country);
      expect(p.pro.month, country).toBe(99);
      expect(p.pro.year, country).toBe(899);
    }
  });

  // The two currencies share a "kr" suffix, so a mismatch is invisible on
  // screen and only wrong in the ledger. The currency code is the guard.
  it("bills Norway in NOK and Sweden in SEK", () => {
    expect(pricingFor("Norway").currency).toBe("NOK");
    expect(pricingFor("Sweden").currency).toBe("SEK");
  });

  it("leads with the country's own payment method", () => {
    expect(pricingFor("Norway").paymentMethods[0]).toBe("vipps");
    expect(pricingFor("Sweden").paymentMethods[0]).toBe("swish");
  });

  it("falls back to the home market for unknown or missing countries", () => {
    expect(pricingFor(null).country).toBe("Norway");
    expect(pricingFor("Brazil").country).toBe("Norway");
  });

  it("formats a price with its own country's suffix", () => {
    expect(proPrice("Norway", "month")).toBe("99 kr");
    expect(proPrice("Sweden", "year")).toBe("899 kr");
  });

  it("groups thousands so a four-figure price stays readable", () => {
    expect(formatPrice(1299, COUNTRY_PRICING.Norway)).toBe("1 299 kr");
  });

  it("states the annual saving rather than making the reader work it out", () => {
    // 99 x 12 = 1188 against 899.
    expect(annualSavingPercent(COUNTRY_PRICING.Norway)).toBe(24);
  });

  it("keeps every country complete, so adding one cannot half-land", () => {
    for (const [name, p] of Object.entries(COUNTRY_PRICING)) {
      expect(p.country, name).toBe(name);
      expect(p.currency, name).toMatch(/^[A-Z]{3}$/);
      expect(p.currencySuffix, name).toBeTruthy();
      expect(p.paymentMethods.length, name).toBeGreaterThan(0);
      expect(p.pro.month, name).toBeGreaterThan(0);
      expect(p.pro.year, name).toBeGreaterThan(0);
      // Annual must beat twelve months, or the option is a trap.
      expect(p.pro.year, name).toBeLessThan(p.pro.month * 12);
    }
  });
});
