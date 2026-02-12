/**
 * Domain Allowlist for Insights Pool
 *
 * Only content from these trusted domains can enter the verified pool.
 * Organized by category — extends the existing Tier-1 source list.
 */

interface AllowedDomain {
  domain: string;
  category: string;
}

export const ALLOWED_DOMAINS: AllowedDomain[] = [
  // Research & IGOs
  { domain: "weforum.org", category: "research" },
  { domain: "oecd.org", category: "research" },
  { domain: "worldbank.org", category: "research" },
  { domain: "ilo.org", category: "research" },
  { domain: "unesco.org", category: "research" },
  { domain: "who.int", category: "research" },
  { domain: "unicef.org", category: "research" },
  { domain: "eurostat.ec.europa.eu", category: "research" },
  { domain: "wipo.int", category: "research" },
  { domain: "undp.org", category: "research" },

  // Government
  { domain: ".gov", category: "government" },
  { domain: ".gov.uk", category: "government" },
  { domain: ".gov.no", category: "government" },
  { domain: "europa.eu", category: "government" },

  // Educational
  { domain: ".edu", category: "education" },
  { domain: ".ac.uk", category: "education" },
  { domain: "mit.edu", category: "education" },
  { domain: "harvard.edu", category: "education" },
  { domain: "ox.ac.uk", category: "education" },
  { domain: "cam.ac.uk", category: "education" },
  { domain: "stanford.edu", category: "education" },

  // Consulting
  { domain: "mckinsey.com", category: "consulting" },
  { domain: "bcg.com", category: "consulting" },
  { domain: "deloitte.com", category: "consulting" },
  { domain: "pwc.com", category: "consulting" },
  { domain: "accenture.com", category: "consulting" },

  // Video platforms
  { domain: "youtube.com", category: "video" },
  { domain: "youtu.be", category: "video" },
  { domain: "vimeo.com", category: "video" },
  { domain: "ted.com", category: "video" },

  // Data & visualization
  { domain: "visualcapitalist.com", category: "data" },
  { domain: "ourworldindata.org", category: "data" },
  { domain: "statista.com", category: "data" },

  // Youth employment / career-specific
  { domain: "fundforyouthemployment.nl", category: "youth" },
  { domain: "youthemployment.org.uk", category: "youth" },
];

/**
 * Check if a domain is on the allowlist.
 * Supports suffix matching for TLD-based entries (.gov, .edu, .ac.uk).
 */
export function isAllowedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  return ALLOWED_DOMAINS.some(({ domain: allowed }) => {
    if (allowed.startsWith(".")) {
      return d.endsWith(allowed) || d === allowed.slice(1);
    }
    return d === allowed || d.endsWith(`.${allowed}`);
  });
}

/** Get the category for a domain, or null if not on allowlist */
export function getDomainCategory(domain: string): string | null {
  const d = domain.toLowerCase();
  const entry = ALLOWED_DOMAINS.find(({ domain: allowed }) => {
    if (allowed.startsWith(".")) {
      return d.endsWith(allowed) || d === allowed.slice(1);
    }
    return d === allowed || d.endsWith(`.${allowed}`);
  });
  return entry?.category ?? null;
}
