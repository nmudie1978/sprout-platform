# Locale-aware Discover videos

**Date:** 2026-06-03
**Status:** Approved (conversational), ready to implement

## Problem

The Discover phase shows a "Day in the life" YouTube video sourced from a **live
search** (`/api/youtube-search`), keyed only by the English career title. The
query is hardcoded English (`day in the life {career}`) and the endpoint sends
`relevanceLanguage=en` with an English-only relevance filter. So a user in Spain
gets English videos even though their career description, salary, and education
path are already localized to Spanish. Videos are the one un-localized surface.

## Signal

Video language follows **`YouthProfile.country`** (owner decision), not the UI
locale. **Spain-only pilot:** Spain → Spanish; everything else (including
Norway) → English (today's behaviour, unchanged). Norway is deliberately left on
English for now because it's the platform default country — localizing it would
change videos for the bulk of existing users. Enabling Norway later is a one-line
map entry.

## Design

### New shared module — `src/lib/video-locale.ts`
Single source of truth, importable by client + server:
```
videoSearchLocale(country) -> { lang, region, phrase }
  Spain   -> { lang: "es", region: "ES", phrase: "un día en la vida de" }
  Norway  -> { lang: "no", region: "NO", phrase: "en dag i livet som" }
  default -> { lang: "en", region: undefined, phrase: "day in the life" }
buildDayInLifeQuery(career, country) -> `${phrase} ${career}`
```
Region code reuses `countryToCode()` from `src/lib/countries.ts`.

### Client — `useYouTubeVideo` (my-journey/page.tsx)
- Read the user's country via the existing `['profile-country']` query (React
  Query dedupes — no extra request).
- Call `/api/youtube-search?career={title}&country={country}` (was: `?q=`).
- Include `country` in the query key so results cache per-country.
- Gate `enabled` on the country query having settled, to avoid a wasted English
  fetch (and English→localized flash) on first load.

### Server — `/api/youtube-search`
- Accept `career` + `country` (new). Keep `q` accepted as a legacy/back-compat
  English path (currently only the journey page calls this route).
- Resolve `{ lang, region, phrase }` from country via the shared module; build
  the localized query.
- Call YouTube with `relevanceLanguage={lang}` and `regionCode={region}` (region
  omitted when undefined) — replaces the hardcoded `relevanceLanguage=en`.
- **Locale-aware relevance filter:** keep the strict English title-token filter
  for `lang === "en"`; **relax for non-English** (the English career token won't
  appear in Spanish/Norwegian titles, so the strict filter would reject
  everything). Non-English trusts `relevanceLanguage` + `regionCode`.
- **English fallback:** if the localized search returns zero videos and
  `lang !== "en"`, fall back to the English search so a localized user never sees
  *fewer* videos than today.
- **Cache key includes lang** (`yt2:{lang}:{query}`) so languages don't clobber.
  Localized hits cache 7 days; an English-fallback result caches 1 day (shorter,
  so newly-indexed local content is picked up sooner).

### Known limitation (flagged, non-blocking)
The career *name* in the query stays canonical English (the localization layer
has no Spanish career name — title is universal). `relevanceLanguage=es` +
`regionCode=ES` still bias results to Spanish content; non-cognate careers
(Nurse→enfermero) would be sharper with translated names — a clean follow-up.

## Scope / non-goals
- In: the Discover video (`/api/youtube-search`) + the shared module + client.
- Out: the `career-videos` sibling route (orphan — called nowhere). No schema
  changes. No curated video library. No Spanish career-name translation (future).
