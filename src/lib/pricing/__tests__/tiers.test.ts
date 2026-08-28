import { describe, expect, it } from "vitest";

import {
  FAMILY_TIERS,
  ORGANISATION_TIERS,
  PRICING_CONTACT_EMAIL,
  pricingEnquiryHref,
  type PricingTier,
} from "../tiers";

const ALL_TIERS: PricingTier[] = [...ORGANISATION_TIERS, ...FAMILY_TIERS];

describe("pricing tiers", () => {
  it("gives every tier the fields the cards render", () => {
    for (const tier of ALL_TIERS) {
      expect(tier.id, `${tier.name} id`).toMatch(/^[a-z][a-z-]*$/);
      expect(tier.name.length, `${tier.id} name`).toBeGreaterThan(0);
      expect(tier.audience.length, `${tier.id} audience`).toBeGreaterThan(0);
      expect(tier.basis.length, `${tier.id} basis`).toBeGreaterThan(0);
      expect(tier.features.length, `${tier.id} features`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps tier ids unique", () => {
    const ids = ALL_TIERS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("quotes every price in euros", () => {
    for (const tier of ALL_TIERS) {
      expect(tier.price, `${tier.id} price`).toMatch(/^€/);
    }
  });

  it("highlights at most one organisation tier", () => {
    expect(ORGANISATION_TIERS.filter((t) => t.featured)).toHaveLength(1);
  });

  it("builds a mailto enquiry link, not a checkout", () => {
    const href = pricingEnquiryHref("Education Plus");
    expect(href.startsWith(`mailto:${PRICING_CONTACT_EMAIL}`)).toBe(true);
    expect(href).toContain(encodeURIComponent("Education Plus"));
  });

  it("never links a tier to a payment flow — Endeavrly takes no in-app payments", () => {
    const serialised = JSON.stringify(ALL_TIERS).toLowerCase();
    for (const banned of ["stripe", "checkout", "/pay", "buy now", "add to cart"]) {
      expect(serialised, `tier copy mentions "${banned}"`).not.toContain(banned);
    }
  });
});
