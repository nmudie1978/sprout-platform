/**
 * Countries a user can select at signup.
 *
 * The platform's *tailored* content (education routes, salaries,
 * programmes, language) is rolled out country by country — Norway is fully
 * supported today; Spain is the first pilot. Capturing the user's country
 * here is the foundation for that localisation: it is stored on
 * YouthProfile.country and read by country-aware surfaces as they land.
 *
 * Storing a country does NOT yet change content for non-Norway users.
 */
export interface Country {
  /** ISO 3166-1 alpha-2 */
  code: string;
  name: string;
}

export const SUPPORTED_COUNTRIES: Country[] = [
  { code: "NO", name: "Norway" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "RS", name: "Serbia" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
];

export const DEFAULT_COUNTRY = "Norway";

/**
 * Countries a NEW account may be created for.
 *
 * Two separate reasons a country belongs here, and both must hold:
 *   1. we have localised it end-to-end — education routes, salaries,
 *      programmes, and critically crisis info, since serving Norwegian
 *      emergency numbers to a young person elsewhere is a safeguarding
 *      failure, not a content gap;
 *   2. we intend to take signups from it commercially.
 *
 * NORWAY ONLY for the commercial launch (owner decision, 2026-09-03).
 * Spain, Sweden and Denmark were previously offered and have been withdrawn
 * from signup — the deliberate choice is to launch in one market rather than
 * acquire users we are not yet ready to serve or support.
 *
 * This gates SIGNUP only. Existing accounts in withdrawn countries keep their
 * stored country and continue to sign in and use the product normally —
 * nothing here revokes anyone's access.
 *
 * To open a market: add it back to this list (it must already be in
 * SUPPORTED_COUNTRIES) and update the expectation in
 * src/lib/__tests__/countries.test.ts. The signup picker and the server-side
 * guard in /api/auth/signup both read this list, so that is the only change
 * needed.
 */
export const LAUNCHED_COUNTRIES: Country[] = SUPPORTED_COUNTRIES.filter(
  (c) => c.name === "Norway",
);

/** True only for countries open to new signups. Server-side gate + picker. */
export function isLaunchedCountry(name?: string | null): boolean {
  return !!name && LAUNCHED_COUNTRIES.some((c) => c.name === name);
}

/**
 * Resolve arbitrary caller input to a canonical country NAME, or null.
 *
 * Accepts either the display name ("Norway") or the ISO code ("NO"), because
 * both shapes reach the signup endpoint — the picker posts names, but callers
 * and older payloads post codes, and a market gate that 400s on a legitimate
 * signup because of a format mismatch is worse than no gate at all.
 *
 * Returns null for anything unrecognised, which the gate treats as a refusal.
 * That is deliberately stricter than normaliseCountry, whose job is to pick a
 * safe storage value rather than to decide whether someone may register.
 */
export function resolveCountryInput(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const byName = SUPPORTED_COUNTRIES.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byName) return byName.name;
  const byCode = SUPPORTED_COUNTRIES.find(
    (c) => c.code.toLowerCase() === trimmed.toLowerCase(),
  );
  return byCode ? byCode.name : null;
}

/** Message shown when someone tries to register from a closed market. */
export const COUNTRY_NOT_LAUNCHED_MESSAGE =
  `Endeavrly is currently open to people based in ${LAUNCHED_COUNTRIES.map((c) => c.name).join(", ")}. We're opening up to more countries soon.`;

const COUNTRY_NAMES = new Set(SUPPORTED_COUNTRIES.map((c) => c.name));

/** Normalise an arbitrary input to a supported country name, or the default. */
export function normaliseCountry(input: unknown): string {
  return typeof input === "string" && COUNTRY_NAMES.has(input)
    ? input
    : DEFAULT_COUNTRY;
}

/** Country display name → ISO 3166-1 alpha-2 code (or null if unsupported). */
export function countryToCode(name?: string | null): string | null {
  return SUPPORTED_COUNTRIES.find((c) => c.name === name)?.code ?? null;
}

/**
 * The UI locale a country should default to. Spain → Spanish, Sweden →
 * Swedish, Denmark → Danish. Norway intentionally stays en-GB unless the user
 * picks Norsk — see CLAUDE.md / existing locale behaviour. (AI chat output
 * still stays English per the english-only policy; this only sets the UI.)
 */
export function defaultLocaleForCountry(name?: string | null): string | null {
  switch (name) {
    case "Spain":
      return "es";
    case "Sweden":
      return "sv";
    case "Denmark":
      return "da";
    default:
      return null;
  }
}
