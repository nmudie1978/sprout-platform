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
 * The UI locale a country should default to. Only Spain currently diverges
 * from the platform default (en-GB). Norway intentionally stays en-GB unless
 * the user picks Norsk — see CLAUDE.md / existing locale behaviour.
 */
export function defaultLocaleForCountry(name?: string | null): string | null {
  return name === "Spain" ? "es" : null;
}
