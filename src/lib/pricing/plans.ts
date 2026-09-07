/**
 * Consumer pricing — the single source of truth for what Endeavrly charges.
 *
 * Two plans only: FREE (Discover) and PRO (Plan). No Plus, no ladder. The
 * institutional and family tiers are a different product and live in
 * `tiers.ts`, sold by enquiry rather than checkout.
 *
 * Prices live here and nowhere else. A component that hardcodes "99 kr" is a
 * bug: it will be wrong for one of the two countries the moment the figures
 * diverge, and it makes a price change a search-and-replace instead of an
 * edit.
 *
 * Adding a country is a new entry in COUNTRY_PRICING. Nothing in the
 * entitlement system reads a country, so a third country needs no changes
 * beyond its prices and payment methods.
 */

/** The only two consumer plans. */
export const PLAN = {
  FREE: "FREE",
  PRO: "PRO",
} as const;

export type PlanId = (typeof PLAN)[keyof typeof PLAN];

export type BillingInterval = "month" | "year";

/**
 * Payment methods we intend to offer per country.
 *
 * TARGETS, NOT INTEGRATIONS. None of these is wired up yet — they describe
 * what the checkout should support once a provider is chosen, and they drive
 * what the pricing page is allowed to promise. Do not render a method here as
 * available until its integration actually exists.
 */
export type PaymentMethod = "vipps" | "swish" | "card" | "apple_pay" | "google_pay";

export interface CountryPricing {
  /** Display name, matching YouthProfile.country. */
  country: string;
  /** ISO 4217. */
  currency: "NOK" | "SEK";
  /** Symbol/suffix as written locally. Never hardcode "kr" at a call site. */
  currencySuffix: string;
  /** PRO price per interval, in major units. FREE is always zero. */
  pro: Record<BillingInterval, number>;
  /**
   * Preferred method first — it leads the checkout. Vipps in Norway and
   * Swish in Sweden are the owner's stated targets.
   */
  paymentMethods: PaymentMethod[];
}

export const COUNTRY_PRICING: Record<string, CountryPricing> = {
  Norway: {
    country: "Norway",
    currency: "NOK",
    currencySuffix: "kr",
    pro: { month: 99, year: 899 },
    paymentMethods: ["vipps", "card", "apple_pay", "google_pay"],
  },
  Sweden: {
    country: "Sweden",
    currency: "SEK",
    currencySuffix: "kr",
    pro: { month: 99, year: 899 },
    paymentMethods: ["swish", "card", "apple_pay", "google_pay"],
  },
};

/**
 * The country whose prices are shown when we do not know the user's.
 *
 * Norway, because it is the home market. A logged-out visitor sees Norwegian
 * pricing; a signed-in user always sees their own.
 */
export const DEFAULT_PRICING_COUNTRY = "Norway";

/** Pricing for a country, falling back to the default. Never throws. */
export function pricingFor(country?: string | null): CountryPricing {
  return (country && COUNTRY_PRICING[country]) || COUNTRY_PRICING[DEFAULT_PRICING_COUNTRY];
}

/**
 * A price formatted for display, e.g. "99 kr" or "899 kr".
 *
 * Deliberately takes the whole pricing object rather than a bare number, so a
 * caller cannot format a Norwegian amount with a Swedish suffix.
 */
export function formatPrice(amount: number, pricing: CountryPricing): string {
  // Both current currencies use a space as the thousands separator.
  const n = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${n} ${pricing.currencySuffix}`;
}

/** What PRO costs in a country, formatted, for a given interval. */
export function proPrice(country: string | null | undefined, interval: BillingInterval): string {
  const pricing = pricingFor(country);
  return formatPrice(pricing.pro[interval], pricing);
}

/**
 * The saving from paying annually, as a whole percentage.
 *
 * Shown on the pricing page so the annual option justifies itself rather than
 * relying on the reader doing the arithmetic.
 */
export function annualSavingPercent(pricing: CountryPricing): number {
  const monthlyTotal = pricing.pro.month * 12;
  if (monthlyTotal <= 0) return 0;
  return Math.round(((monthlyTotal - pricing.pro.year) / monthlyTotal) * 100);
}
