/**
 * Endeavrly pricing model — indicative annual pricing, display only.
 *
 * IMPORTANT: Endeavrly does not process payments (see CLAUDE.md). Every tier
 * here is arranged directly with the team, so each CTA is an enquiry link —
 * never a checkout. Do not wire Stripe or any in-app payment flow to this.
 *
 * Prices are indicative ranges shared publicly to make the commercial model
 * legible to institutions; the final figure depends on volume, modules and
 * agreement length.
 *
 * Owner-set ceiling: no tier exceeds MAX_ANNUAL_PRICE_EUR per year. The tiers
 * are laddered so each still reads as a distinct step under that cap rather
 * than several tiers all bunched at the ceiling.
 */

export type PricingTier = {
  id: string;
  /** Tier name, e.g. "Education Plus". */
  name: string;
  /** Who the tier is for — the target customer. */
  audience: string;
  /** Indicative annual price, already formatted. */
  price: string;
  /** Suffix rendered small beside the price, e.g. "/year". */
  priceNote?: string;
  /** How the price is arrived at — the pricing basis. */
  basis: string;
  /** Core value, broken into scannable points. */
  features: string[];
  /** Optional badge rendered above the tier name. */
  badge?: string;
  /** Lifts the card with the primary accent. At most one per group. */
  featured?: boolean;
};

/**
 * Hard ceiling on any advertised annual price, in euros (owner-set,
 * 2026-08-28). Raising this is a commercial decision, not a formatting one.
 */
export const MAX_ANNUAL_PRICE_EUR = 100_000;

/** Enquiry address for institutional and family pricing conversations. */
export const PRICING_CONTACT_EMAIL = "hello@endeavrly.no";

/**
 * Builds the `mailto:` enquiry link for a tier, pre-filling the subject so
 * enquiries arrive already sorted by tier.
 */
export function pricingEnquiryHref(tierName: string): string {
  const subject = encodeURIComponent(`Endeavrly pricing enquiry — ${tierName}`);
  return `mailto:${PRICING_CONTACT_EMAIL}?subject=${subject}`;
}

/** Tiers sold to schools, public bodies and employers. */
export const ORGANISATION_TIERS: PricingTier[] = [
  {
    id: "pilot",
    name: "Pilot",
    audience: "School, municipality, NAV unit or career service",
    price: "€5K–€15K",
    basis: "Fixed-price pilot",
    features: [
      "Test Endeavrly with a defined user group",
      "Fixed scope and fixed price",
      "Full platform for the pilot cohort",
      "Findings shared at the end of the pilot",
    ],
  },
  {
    id: "education",
    name: "Education",
    audience: "An individual school or college",
    price: "€10K–€25K",
    priceNote: "/year",
    basis: "Institution + student volume",
    badge: "Most common",
    featured: true,
    features: [
      "Career discovery and exploration",
      "AI career guidance",
      "Student journeys and dashboards",
      "Cohort overview for staff",
    ],
  },
  {
    id: "education-plus",
    name: "Education Plus",
    audience: "Large schools, universities or education groups",
    price: "€25K–€50K",
    priceNote: "/year",
    basis: "Users + modules + locations",
    features: [
      "Everything in Education",
      "Advanced analytics",
      "Parent access",
      "Integrations",
      "Multi-cohort management",
    ],
  },
  {
    id: "public-sector",
    name: "Public Sector",
    audience: "Municipalities, counties and career centres",
    price: "€30K–€60K",
    priceNote: "/year",
    basis: "Population / users + functionality",
    features: [
      "Career intelligence for citizens",
      "Personalised pathways for young people",
      "Regional labour-market view",
      "Access across multiple sites",
    ],
  },
  {
    id: "public-enterprise",
    name: "Public Enterprise",
    audience: "NAV and major national or regional public organisations",
    price: "€60K–€100K",
    priceNote: "/year",
    basis: "Enterprise licence + implementation",
    features: [
      "Large-scale career intelligence",
      "Analytics and AI at national scale",
      "Custom integrations",
      "Implementation and onboarding support",
    ],
  },
  {
    id: "workforce",
    name: "Workforce",
    audience: "Large employers and industry organisations",
    price: "€25K–€60K",
    priceNote: "/year",
    basis: "Users / programmes",
    features: [
      "Graduate and apprenticeship programmes",
      "Early-career talent development",
      "Programme-level dashboards",
      "Cohort insights",
    ],
  },
];

/** The one tier bought directly by a household. */
export const FAMILY_TIERS: PricingTier[] = [
  {
    id: "family",
    name: "Family",
    audience: "Parents, directly",
    price: "€99–€199",
    priceNote: "/year",
    basis: "Per family",
    features: [
      "Personalised career guidance for one or more children",
      "The full journey — Discover, Understand, Clarity",
      "A roadmap and reflections for each child",
      "Arranged directly with us, cancel any time",
    ],
  },
];
