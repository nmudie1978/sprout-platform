/**
 * Per-jurisdiction legal facts, for the terms, privacy, disclaimer and
 * cookies pages.
 *
 * WHY THIS EXISTS
 * ---------------
 * Those four pages hardcoded Norwegian law, Oslo jurisdiction, Datatilsynet
 * and Forbrukerrådet. Correct for Norway; asserted to every Swedish user too.
 * This module makes the jurisdiction a value rather than prose, so counsel's
 * answer becomes a data edit instead of a hunt through JSX.
 *
 * THE `reviewed` FLAG IS THE POINT
 * --------------------------------
 * A jurisdiction only takes effect once a lawyer has signed it off. Anything
 * with `reviewed: false` falls back to Norway — the copy that has actually
 * been through review — so drafting a jurisdiction here CANNOT silently put
 * unreviewed legal claims in front of users. Flipping the flag is a
 * deliberate act with a name and a date attached.
 *
 * See docs/superpowers/specs/2026-09-06-sweden-legal-brief.md for the
 * questions counsel needs to answer before Sweden can be flipped.
 */

export interface Jurisdiction {
  /** Country name, matching YouthProfile.country. */
  country: string;
  /** "Norwegian law" — reads after "permitted by ...". */
  governingLaw: string;
  /** "the courts of Oslo, Norway" — reads after "exclusive jurisdiction of ...". */
  courts: string;
  /** The national data-protection statute supplementing GDPR. */
  dataProtectionAct: string;
  supervisoryAuthority: { name: string; short: string; url: string };
  consumerBody: { name: string; native?: string };
  /** Postal identity of the controller. */
  controllerAddress: string;
  /** Emergency numbers, most important first. */
  emergency: string;
  /**
   * Whether a lawyer has approved this jurisdiction's copy. False means the
   * entry is a DRAFT and the platform serves Norway's terms instead.
   */
  reviewed: boolean;
  /** Who approved it and when — required whenever reviewed is true. */
  reviewNote?: string;
}

const NORWAY: Jurisdiction = {
  country: "Norway",
  governingLaw: "Norwegian law",
  courts: "the courts of Oslo, Norway",
  dataProtectionAct: "the Norwegian Personal Data Act (Personopplysningsloven)",
  supervisoryAuthority: {
    name: "The Norwegian Data Protection Authority (Datatilsynet)",
    short: "Datatilsynet",
    url: "https://www.datatilsynet.no",
  },
  consumerBody: { name: "the Norwegian Consumer Council", native: "Forbrukerrådet" },
  controllerAddress: "Endeavrly AS, Oslo, Norway",
  emergency: "112 (police), 113 (ambulance), 110 (fire)",
  reviewed: true,
  reviewNote:
    "The existing published copy, in force since the Norway-first launch. Not re-reviewed as part of this change — it is reproduced verbatim.",
};

/**
 * DRAFT — not in force. Every field below is our best understanding, not
 * advice, and `reviewed: false` means Swedish users are still served Norway's
 * terms. Do not flip that flag without a written answer to the brief; the
 * open questions include whether Norwegian law and Oslo jurisdiction can bind
 * a Swedish consumer at all, and whether Endeavrly AS needs a Swedish
 * establishment or representative.
 */
const SWEDEN_DRAFT: Jurisdiction = {
  country: "Sweden",
  governingLaw: "Swedish law",
  courts: "the courts of Stockholm, Sweden",
  dataProtectionAct: "the Swedish Data Protection Act (Dataskyddslagen, 2018:218)",
  supervisoryAuthority: {
    name: "The Swedish Authority for Privacy Protection (Integritetsskyddsmyndigheten)",
    short: "IMY",
    url: "https://www.imy.se",
  },
  consumerBody: {
    name: "the Swedish National Board for Consumer Disputes",
    native: "Allmänna reklamationsnämnden (ARN)",
  },
  controllerAddress: "Endeavrly AS, Oslo, Norway",
  emergency: "112 (all emergencies)",
  reviewed: false,
};

const REGISTRY: Record<string, Jurisdiction> = {
  Norway: NORWAY,
  Sweden: SWEDEN_DRAFT,
};

/**
 * The jurisdiction whose terms a user is served.
 *
 * Falls back to Norway for an unknown country OR an unreviewed draft. That
 * fallback is deliberate: showing someone another country's reviewed terms is
 * a known, disclosed position, whereas showing them unreviewed copy invented
 * by engineers is not.
 */
export function jurisdictionFor(country?: string | null): Jurisdiction {
  const j = country ? REGISTRY[country] : undefined;
  return j?.reviewed ? j : NORWAY;
}

/** Every jurisdiction still awaiting sign-off. Surfaced in the admin view. */
export function unreviewedJurisdictions(): Jurisdiction[] {
  return Object.values(REGISTRY).filter((j) => !j.reviewed);
}
