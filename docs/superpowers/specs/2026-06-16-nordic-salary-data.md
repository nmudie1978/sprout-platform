# Nordic salary + education data (Sweden & Denmark) — first batch

**Date:** 2026-06-16
**Status:** Shipped. First seed batch; expand iteratively.

Populates the (previously empty) Sweden/Denmark career-localization layer with
real, **cited** monthly salary ranges and local education paths for a seed set
of high-traffic careers. Closes the most-noticeable gap from the SE/DK launch
(#359), where every career showed "not yet tailored" for salary.

## Scope

22 careers per country (`src/lib/career-localization/sv.ts`, `da.ts`):
software-developer, registered-nurse, electrician, plumber, carpenter, doctor,
solicitor, accountant, psychologist, police-officer, chef, hairdresser,
data-analyst, civil-engineer, graphic-designer, marketing-manager, dentist,
pharmacist, social-worker, journalist, architect, preschool-teacher.

Each entry: a localized `description` + `salary` (gross monthly range) +
`educationPath`, both `Cited<{value, source}>`. Careers NOT in the seed still
degrade gracefully (`isLocalized: false`).

## Sourcing & verification

- **Sweden:** SCB register data via allaloner.se, union surveys
  (sverigesingenjörer), and lönestatistik portals; education from official
  programme / study-guide pages. Salary = monthly "kr/mån".
- **Denmark:** mostly loen.dk (Danmarks Statistik LONS20, P25–P75); education
  from official institution pages. Salary = monthly "kr/md.".
- Researched by parallel agents under a strict "fetch the source, cite the exact
  URL, omit if unsourced — never invent" rule. A sample of URLs was
  independently re-fetched and confirmed to contain the cited figures
  (jobbland, allaloner, sverigesingenjörer, loen.dk/advokat, dagensnyt,
  workplacedenmark all verified).
- A data-integrity test (`nordic-data-integrity.test.ts`) enforces: every
  `careerId` exists in the catalog, every `source` is a real (non-placeholder,
  http) URL, and ≥20 careers are seeded per country.

## Caveats (PENDING OWNER REVIEW — same bar as es.ts)

- Figures are AI-researched from cited sources; spot-checked, not exhaustively
  audited. Worth an owner pass before heavy in-region marketing.
- **SE `doctor`:** salary held back (source could not be confirmed) — education
  path kept; card shows no salary.
- **DK `electrician`/`plumber`:** monthly figures are derived from published
  hourly rates (workplacedenmark.dk / Danmarks Statistik) — labelled "afledt af
  timeløn" and approximate.
- Ranges mix interquartile (P25–P75) and typical bands depending on the source.

## Next

- Expand beyond the 22-career seed (the catalogue is ~1,200 careers).
- Promote sources to official statistics agencies (SCB Lönesök / Danmarks
  Statistik) where a salary-portal stand-in was used.
- Remaining SE/DK follow-ons from #359: employer lists (4), universities/
  programmes/events (3), localised insights RSS (8), legal/GDPR (7).
