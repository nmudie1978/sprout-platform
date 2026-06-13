import { countryToCode } from "@/lib/countries";

/**
 * Locale parameters for the Discover "Day in the life" YouTube search.
 *
 * Video language follows the user's `YouthProfile.country` (owner decision) —
 * NOT the UI locale. Spain → Spanish, Norway → Norwegian, everything else
 * (unlocalised / unknown / missing) → English, which is the historical
 * behaviour. This is the single source of truth shared by the client hook and
 * the /api/youtube-search route so the query phrase, `relevanceLanguage`,
 * `regionCode`, and cache key all stay in agreement.
 */

export interface VideoSearchLocale {
  /** YouTube `relevanceLanguage` (ISO 639-1). "en" is the neutral default. */
  lang: string;
  /** YouTube `regionCode` (ISO 3166-1 alpha-2), or undefined for no bias. */
  region: string | undefined;
  /** Localized "day in the life of a …" lead-in for the search query. */
  phrase: string;
}

const ENGLISH: VideoSearchLocale = {
  lang: "en",
  region: undefined,
  phrase: "day in the life",
};

/**
 * Per-country search language + phrasing. Keyed by `YouthProfile.country`
 * display name (same keys as the country-context registry). Only countries
 * with genuine local-language video coverage are listed; anything absent
 * falls back to English.
 *
 * Scoped to Spain for now (the localization pilot). Norway intentionally stays
 * on English here — the platform default country is Norway, so localizing it
 * would change videos for the bulk of existing users; revisit when Norwegian
 * video coverage is validated. Add `Norway: { lang: "no", phrase: "en dag i
 * livet som" }` to enable it.
 */
const BY_COUNTRY: Record<string, Pick<VideoSearchLocale, "lang" | "phrase">> = {
  Spain: { lang: "es", phrase: "un día en la vida de" },
};

/** Resolve the video search locale for a country (defaults to English). */
export function videoSearchLocale(country?: string | null): VideoSearchLocale {
  const entry = country ? BY_COUNTRY[country] : undefined;
  if (!entry) return ENGLISH;
  return {
    lang: entry.lang,
    region: countryToCode(country) ?? undefined,
    phrase: entry.phrase,
  };
}

/** Build the localized "day in the life {career}" search query for a country. */
export function buildDayInLifeQuery(career: string, country?: string | null): string {
  const { phrase } = videoSearchLocale(country);
  return `${phrase} ${career}`.trim();
}

/** The always-English query, used as the fallback when localized search is empty. */
export function buildEnglishDayInLifeQuery(career: string): string {
  return `${ENGLISH.phrase} ${career}`.trim();
}

/**
 * Normalise spelling so the (English) relevance filter matches videos
 * regardless of British/American spelling. Most YouTube career content uses
 * American spelling ("Program Manager"), while our catalogue uses British
 * ("Programme Manager") — without this, a British career title's tokens never
 * match the American-spelled video titles.
 */
export function normaliseCareerSpelling(s: string): string {
  // Preserve the original capitalisation ("Programme" → "Program",
  // "programme" → "program") so display/query casing stays natural.
  return s.replace(/\bprogramme\b/gi, (m) =>
    m[0] === m[0].toUpperCase() ? "Program" : "program",
  );
}

/**
 * An English "what does a {career} do" query. The day-in-the-life search biases
 * YouTube toward vlogs; this surfaces the explainer format ("what does a X do",
 * "what is the role of a X", "X responsibilities") which is often the better
 * intro for a young person — especially for office/managerial roles that have
 * few day-in-the-life vlogs.
 */
export function buildEnglishExplainerQuery(career: string): string {
  return `what does a ${normaliseCareerSpelling(career)} do`.trim();
}

/**
 * A broader version of a niche/qualified career title, used ONLY as a
 * last-resort fallback when the specific title finds no videos. Strips a single
 * leading qualifier ("IT Programme Manager" → "Program Manager") and normalises
 * spelling. Returns null when there's nothing to broaden.
 */
const LEADING_QUALIFIERS = new Set([
  "it", "senior", "junior", "lead", "principal", "chief", "head",
  "assistant", "associate", "trainee", "global", "regional", "deputy",
]);
export function broadenCareer(career: string): string | null {
  const norm = normaliseCareerSpelling(career).trim().replace(/\s+/g, " ");
  const words = norm.split(" ");
  if (words.length >= 3 && LEADING_QUALIFIERS.has(words[0].toLowerCase())) {
    return words.slice(1).join(" ");
  }
  // Spelling-only broadening (e.g. "Programme Manager" → "Program Manager")
  // still counts as a distinct query worth trying.
  if (norm.toLowerCase() !== career.trim().toLowerCase()) return norm;
  return null;
}
