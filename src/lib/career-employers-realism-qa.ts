/**
 * Career-employer REALISM overrides — the 12 failures the semantic-QA agent
 * confirmed on 2026-08-28 (`--target=employers --source=fallback`).
 *
 * Every one came from a career sitting at the EDGE of its category and
 * inheriting that category's generic list. The category lists themselves are
 * fine for their mainstream — a teacher really does work for Oslo kommune, a
 * receptionist really does work for Scandic — so they are left alone. Only the
 * edge cases are overridden here.
 *
 * `careersUrl` is deliberately OMITTED on entries whose careers page could not
 * be verified. The field is optional, and an unverified URL is worse than none:
 * a dead or wrong link is exactly the kind of "looks authoritative, isn't"
 * failure this audit exists to remove.
 */
import type { Employer } from "./career-employers";

/** Cinemas — the HOSPITALITY_TOURISM fallback offered hotels and an airline. */
const CINEMAS: Employer[] = [
  { name: "Nordisk Film Kino", industry: "Cinema", size: "1,000+" },
  { name: "Odeon Kino", industry: "Cinema", size: "500+" },
  { name: "Bergen Kino", industry: "Cinema", size: "200+" },
];

/** Amusement parks — seasonal, and a real first job for a lot of teenagers. */
const PARKS: Employer[] = [
  { name: "TusenFryd", industry: "Amusement Park", size: "1,000+ (seasonal)" },
  { name: "Kongeparken", industry: "Amusement Park", size: "300+ (seasonal)" },
  { name: "Hunderfossen Eventyrpark", industry: "Theme Park", size: "300+ (seasonal)" },
  { name: "Bø Sommarland", industry: "Water Park", size: "300+ (seasonal)" },
];

/** Fuel-station and car-care chains, where Norwegian car washes actually sit. */
const CAR_CARE: Employer[] = [
  { name: "Circle K Norge", industry: "Fuel & Car Care", size: "2,000+" },
  { name: "Uno-X", industry: "Fuel & Car Care", size: "500+" },
  { name: "YX Norge", industry: "Fuel & Car Care", size: "1,000+" },
  { name: "Best Stasjon", industry: "Fuel & Car Care", size: "500+" },
];

/** Youth and outdoor organisations that actually run residential camps. */
const CAMPS: Employer[] = [
  { name: "Norges KFUK-KFUM", industry: "Youth Organisation", size: "500+" },
  { name: "4H Norge", industry: "Youth Organisation", size: "200+" },
  { name: "Røde Kors (Ferie for alle)", industry: "Humanitarian", size: "1,000+" },
  { name: "Den Norske Turistforening (DNT)", industry: "Outdoor Organisation", size: "1,000+" },
];

/** Barnehage operators — public and the large private chains. */
const EARLY_YEARS: Employer[] = [
  { name: "Oslo kommune (barnehager)", industry: "Municipal Early Years", size: "50,000+" },
  { name: "Læringsverkstedet", industry: "Private Barnehage Chain", size: "8,000+" },
  { name: "Espira", industry: "Private Barnehage Chain", size: "3,000+" },
  { name: "FUS barnehager (Trygge Barnehager)", industry: "Private Barnehage Chain", size: "3,000+" },
];

/**
 * Norway's actual intelligence and security services. The PUBLIC_SERVICE_SAFETY
 * fallback offered NAV and Skatteetaten, which do not do this work at all.
 */
const INTELLIGENCE: Employer[] = [
  { name: "Politiets sikkerhetstjeneste (PST)", industry: "Security Service", size: "1,000+" },
  { name: "Etterretningstjenesten", industry: "Military Intelligence", size: "1,000+" },
  { name: "Nasjonal sikkerhetsmyndighet (NSM)", industry: "National Security Authority", size: "500+" },
  { name: "Forsvaret", industry: "Armed Forces", size: "20,000+" },
];

/**
 * NAV case work is delivered through joint state/municipal NAV offices, so the
 * kommune entries are correct — but Politiet and Skatteetaten never employ it.
 */
const NAV_OFFICES: Employer[] = [
  { name: "NAV", industry: "Government / Welfare", size: "20,000+", careersUrl: "https://www.nav.no/jobb-i-nav" },
  { name: "Oslo kommune", industry: "Municipal (NAV-kontor)", size: "50,000+", careersUrl: "https://www.oslo.kommune.no/jobb/" },
  { name: "Bergen kommune", industry: "Municipal (NAV-kontor)", size: "17,000+" },
  { name: "Trondheim kommune", industry: "Municipal (NAV-kontor)", size: "13,000+" },
];

/** Ticketing sits with venues and promoters, not with a sport federation. */
const TICKETING: Employer[] = [
  { name: "Ticketmaster Norge", industry: "Ticketing", size: "200+" },
  { name: "Oslo Spektrum", industry: "Arena & Events", size: "200+" },
  { name: "Telenor Arena", industry: "Arena & Events", size: "200+" },
  { name: "Live Nation Norway", industry: "Live Events", size: "200+" },
];

export const REALISM_EMPLOYERS_QA: Record<string, Employer[]> = {
  "cinema-attendant": CINEMAS,
  "amusement-park-worker": PARKS,
  "car-wash-attendant": CAR_CARE,
  "camp-counsellor": CAMPS,
  "early-childhood-educator": EARLY_YEARS,
  "counter-intelligence-officer": INTELLIGENCE,
  "nav-case-worker": NAV_OFFICES,
  "ticketing-manager": TICKETING,
};

/**
 * Careers with NO conventional employer.
 *
 * These are sponsorship- or prize-funded independents. The SPORT_FITNESS
 * fallback offered them SATS and Norges Fotballforbund, which is not a weak
 * answer but a wrong one — the football federation does not hire wingsuit
 * pilots. Showing nothing is the honest result, and `hasCareerEmployers()`
 * then hides the "Where you'd work" section entirely rather than filling it
 * with fiction.
 */
export const NO_CONVENTIONAL_EMPLOYER = new Set<string>([
  "base-jumper",
  "wingsuit-pilot",
  "skateboarder-pro",
  "motocross-rider",
]);
