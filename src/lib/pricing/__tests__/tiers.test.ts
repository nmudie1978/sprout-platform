import { describe, expect, it } from "vitest";

import {
  FAMILY_TIERS,
  ORGANISATION_TIERS,
  MAX_ANNUAL_PRICE_EUR,
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

  it("keeps every advertised price at or under the owner-set ceiling", () => {
    // "€25K–€50K" -> [25000, 50000]; "€99–€199" -> [99, 199]
    const parse = (price: string): number[] =>
      [...price.matchAll(/€([\d.]+)(K?)/g)].map(
        ([, n, k]) => Number(n) * (k ? 1_000 : 1)
      );

    for (const tier of ALL_TIERS) {
      const amounts = parse(tier.price);
      expect(amounts.length, `${tier.id} price is unparseable`).toBeGreaterThan(0);
      for (const amount of amounts) {
        expect(amount, `${tier.id} (${tier.price}) exceeds the ceiling`)
          .toBeLessThanOrEqual(MAX_ANNUAL_PRICE_EUR);
      }
      // An open-ended top ("€100K+") would sail past the ceiling in practice.
      expect(tier.price, `${tier.id} advertises an open-ended price`).not.toContain("+");
    }
  });

  it("keeps the organisation tiers distinguishable from one another", () => {
    // Not an ascending ladder: Workforce sells to employers, a different
    // segment, so it sits below Public Enterprise by design. What must hold
    // is that no two tiers advertise the same range — that would make the
    // choice between them meaningless on the page.
    const ranges = ORGANISATION_TIERS.map((t) => t.price);
    expect(new Set(ranges).size).toBe(ranges.length);
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
