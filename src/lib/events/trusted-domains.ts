/**
 * TRUSTED DOMAINS FOR CAREER EVENTS
 *
 * Structural URL validation for career event registration links.
 * Mirrors the tier1-sources.ts pattern: constants, validation functions, explicit blocklist.
 *
 * RULES:
 * - All event URLs MUST be HTTPS
 * - All event URLs MUST be from a trusted domain or institutional TLD
 * - Eventbrite URLs MUST contain a numeric ticket ID (tickets-\d+ or biljetter-\d+)
 * - URL shorteners, social media, and Google Docs are explicitly blocked
 *
 * Pure structural validation — no network calls.
 */

import { isValidHttpsUrl } from "./verify-url";

// ============================================
// TRUSTED EVENT DOMAINS
// ============================================

export interface TrustedDomain {
  domain: string;
  name: string;
  variants?: string[];
  urlPattern?: RegExp;
}

export const TRUSTED_EVENT_DOMAINS: TrustedDomain[] = [
  {
    domain: "eventbrite.com",
    name: "Eventbrite",
    variants: ["eventbrite.es", "eventbrite.co.uk", "eventbrite.de", "eventbrite.fr", "eventbrite.nl", "eventbrite.se"],
    urlPattern: /eventbrite\.[a-z.]+\/e\/.+-(?:tickets|biljetter)-\d+/,
  },
  {
    domain: "europeanjobdays.eu",
    name: "EURES European Job Days",
  },
  {
    domain: "eesc.europa.eu",
    name: "European Economic and Social Committee",
  },
  {
    domain: "highnorthdialogue.no",
    name: "High North Dialogue",
  },
  {
    domain: "oslotechshow.com",
    name: "Oslo Tech Show",
  },
  {
    domain: "uio.no",
    name: "University of Oslo",
  },
  {
    domain: "itxbergen.no",
    name: "ITxBergen",
  },
  {
    domain: "oiw.no",
    name: "Oslo Innovation Week",
  },
  {
    domain: "kunskapframtid.se",
    name: "Kunskap & Framtid",
  },
  {
    domain: "meetup.com",
    name: "Meetup",
  },
  // Norwegian education fairs & career events
  {
    domain: "tautdanning.no",
    name: "Ta Utdanning (Education Fairs)",
  },
  {
    domain: "bi.no",
    name: "BI Norwegian Business School",
  },
  {
    domain: "karrieredagene.no",
    name: "Karrieredagene BI Oslo",
  },
  {
    domain: "kdntnu.no",
    name: "KarriereDagene NTNU",
  },
  {
    domain: "karrieredagen.no",
    name: "Karrieredagen Stavanger",
  },
  {
    domain: "springbrettet.org",
    name: "Springbrettet (Bergen Career Fair)",
  },
  {
    domain: "biso.no",
    name: "BISO (BI Student Organization)",
  },
  {
    domain: "oslostudenthub.no",
    name: "Oslo Student Hub",
  },
  {
    domain: "isfit.org",
    name: "ISFiT (Student Festival Trondheim)",
  },
  {
    domain: "arendalsuka.no",
    name: "Arendalsuka",
  },
  {
    domain: "oslo.kommune.no",
    name: "Oslo Kommune",
  },
  {
    domain: "digitallifenorway.org",
    name: "Digital Life Norway",
  },
  // Swedish career fairs
  {
    domain: "charm.se",
    name: "CHARM (Chalmers Career Fair)",
  },
  {
    domain: "armada.nu",
    name: "THS Armada (KTH Career Fair)",
  },
  // EU youth events
  {
    domain: "youth.europa.eu",
    name: "European Youth Portal",
  },
];

// ============================================
// INSTITUTIONAL TLD PATTERNS
// ============================================

/**
 * Trusted institutional TLDs — domains ending in these are allowed
 * even if not explicitly listed in TRUSTED_EVENT_DOMAINS.
 */
export const TRUSTED_TLD_PATTERNS: string[] = [
  ".edu",
  ".gov",
  ".ac.uk",
  ".ac.no",
  ".europa.eu",
];

// ============================================
// DISALLOWED URL PATTERNS
// ============================================

/**
 * RegExp patterns that catch URL shorteners, social media, and other
 * untrusted link sources. Any URL matching these is rejected.
 */
export const DISALLOWED_URL_PATTERNS: RegExp[] = [
  // URL shorteners
  /bit\.ly/i,
  /tinyurl\.com/i,
  /t\.co\//i,
  /goo\.gl/i,
  /ow\.ly/i,
  /is\.gd/i,
  /buff\.ly/i,
  /short\.io/i,

  // Social media
  /facebook\.com/i,
  /instagram\.com/i,
  /twitter\.com/i,
  /x\.com\//i,
  /tiktok\.com/i,
  /linkedin\.com/i,
  /reddit\.com/i,

  // Google Docs / Sheets / Forms
  /docs\.google\.com/i,
  /sheets\.google\.com/i,
  /forms\.google\.com/i,
  /drive\.google\.com/i,
];

// ============================================
// VALIDATION RESULT TYPE
// ============================================

export interface EventUrlValidationResult {
  valid: boolean;
  domain: string | null;
  errors: string[];
  warnings: string[];
}

// ============================================
// EVENTBRITE-SPECIFIC VALIDATION
// ============================================

/**
 * Validates that an Eventbrite URL contains a numeric ticket ID.
 *
 * Valid examples:
 *   https://www.eventbrite.es/e/london-tech-job-fair-2026-tickets-1286011839029
 *   https://www.eventbrite.com/e/apex-meet-ups-biljetter-1857644638119
 *
 * Invalid (fabricated slug without ticket ID):
 *   https://www.eventbrite.com/e/oslo-student-career-day-2026
 */
export function isValidEventbriteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Must be an Eventbrite hostname
    if (!hostname.includes("eventbrite")) {
      return false;
    }

    // Path must contain tickets-<digits> or biljetter-<digits>
    const path = parsed.pathname.toLowerCase();
    return /(?:tickets|biljetter)-\d+/.test(path);
  } catch {
    return false;
  }
}

// ============================================
// DOMAIN MATCHING HELPERS
// ============================================

function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith("." + domain);
}

function isTrustedDomain(hostname: string): { trusted: boolean; name: string | null } {
  // Check explicit domains and their variants
  for (const entry of TRUSTED_EVENT_DOMAINS) {
    if (hostnameMatchesDomain(hostname, entry.domain)) {
      return { trusted: true, name: entry.name };
    }
    if (entry.variants) {
      for (const variant of entry.variants) {
        if (hostnameMatchesDomain(hostname, variant)) {
          return { trusted: true, name: entry.name };
        }
      }
    }
  }

  // Check institutional TLD patterns
  for (const tld of TRUSTED_TLD_PATTERNS) {
    if (hostname.endsWith(tld)) {
      return { trusted: true, name: `Institutional (${tld})` };
    }
  }

  return { trusted: false, name: null };
}

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

/**
 * Validate a career event URL against structural rules.
 *
 * Checks:
 * 1. HTTPS protocol
 * 2. Trusted domain or institutional TLD
 * 3. No disallowed URL patterns (shorteners, social media, etc.)
 * 4. Eventbrite-specific: must have numeric ticket ID
 *
 * No network calls — pure structural validation.
 */
export function validateEventUrl(url: string): EventUrlValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. HTTPS check
  if (!isValidHttpsUrl(url)) {
    return {
      valid: false,
      domain: null,
      errors: ["URL must use HTTPS protocol"],
      warnings,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      valid: false,
      domain: null,
      errors: ["Invalid URL format"],
      warnings,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Disallowed pattern check
  for (const pattern of DISALLOWED_URL_PATTERNS) {
    if (pattern.test(url)) {
      errors.push(`URL matches disallowed pattern: ${pattern.source}`);
    }
  }

  // 3. Trusted domain check
  const { trusted, name } = isTrustedDomain(hostname);
  if (!trusted) {
    errors.push(
      `Domain "${hostname}" is not in the trusted domains list. ` +
      `Add it to TRUSTED_EVENT_DOMAINS or use an institutional TLD (${TRUSTED_TLD_PATTERNS.join(", ")})`
    );
  }

  // 4. Eventbrite-specific: require ticket ID
  if (hostname.includes("eventbrite") && !isValidEventbriteUrl(url)) {
    errors.push(
      "Eventbrite URL must contain a numeric ticket ID (e.g. tickets-1234567890). " +
      "Fabricated slugs without ticket IDs are rejected."
    );
  }

  return {
    valid: errors.length === 0,
    domain: name,
    errors,
    warnings,
  };
}
