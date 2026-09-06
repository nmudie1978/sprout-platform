# Swedish Named Programmes — source spiked, mapping not started

**Date:** 2026-09-06
**Status:** data source found and verified working. The careerId → programme
mapping is NOT built, and deliberately so — see "Why this stopped here".

**Goal:** give the highest-traffic Swedish careers a NAMED programme and
institution ("civilingenjör i datateknik at KTH") rather than the structural
route they currently carry ("Gymnasiets högskoleförberedande program följt av
kandidatexamen").

---

## The source: Susa-navet (Skolverket)

Verified live on 2026-09-06. Open, unauthenticated, JSON, updated daily.

- **Base URL:** `https://api.skolverket.se/susa-navet/emil3`
- **OpenAPI spec:** `https://api.skolverket.se/susa-navet/susa-navet-emil3.yaml`
  (note: NOT at `/v3/api-docs`, which 404s — the spec path is given by
  `/susa-navet/v3/api-docs/swagger-config`)
- **Endpoints:** `/educationInfos`, `/educationEvents`, `/educationProviders`,
  `/api-info`
- **Filter:** `?schoolType=<code>&page=&size=`

School types relevant here: **HS** (högskola), **YH** (yrkeshögskola — the
`fagskole` equivalent), **GY** (gymnasieskola), **FHS** (folkhögskola),
**NY** (nationell yrkesutbildning).

### What a record contains

```
id, status, content: {
  code, title.strings[{lang,value}], description.strings[...],
  degrees[{strings[...]}],          // e.g. "Polisexamen"
  extent: { length, unit.code },    // e.g. 5 semesters
  url.urls[{lang,value}],           // official page — usable as a source
  subjects[{ code, type: "C_Subject_SUN" }]   // SUN classification
}
```

The `url` field matters: it gives every programme a citable official source,
so mapped programmes could be `tier: "verified"` rather than estimated.

### Scale — this is the problem

| schoolType | totalElements |
|---|---|
| HS (higher education) | **62,575** |
| YH (vocational higher) | 1,343 |

62,575 is overwhelmingly individual **courses**, not programmes. Selecting the
programmes out of that set is the first real task, probably via the `degrees`
field (a programme awards a degree; a standalone course does not).

---

## Why this stopped here

The mapping is a classification-bridging problem of the same shape as the
STYRK→SSYK salary crosswalk, and that one taught an expensive lesson: a
plausible-looking automatic match produced a trainee doctor's salary labelled
as a specialist's, and only a label-agreement rule plus human review caught it.

Mapping 1,615 careers into 62,575 education records via SUN codes will
generate the same class of near-miss — a career matched to a superficially
similar programme. Rushing it produces confident, wrong advice about what a
15-year-old should study, which is worse than the honest structural route
they get today.

The structural routes already shipped mean there is **no coverage gap** while
this waits: every Swedish career has a truthful education path, marked
"Est.". Named programmes are a quality upgrade on a working surface, not a
missing feature.

---

## Approach when it is picked up

1. **Filter to programmes.** Pull all `schoolType=HS` and `schoolType=YH`
   records, keep those awarding a degree (`content.degrees` non-empty). Cache
   to `src/lib/country-packs/sv/programmes.generated.json`. Expect this to cut
   62,575 to a few thousand.
2. **Bridge on SUN codes.** `content.subjects[].code` is a SUN classification
   code. Build careerId → SUN the way `scb-salary-mapping.ts` was built, and
   apply the same rule that saved the salary data: **accept a match only when
   the labels agree as well as the codes**, and route everything else to a
   review file for a human.
3. **Scope to the top ~200 careers** by actual page views rather than guessing
   which matter. The long tail keeps its structural route.
4. **Mark them verified**, sourced to `content.url`, and let
   `validate-country-packs.ts` police the links — but fix the soft-404 gap
   first (an institution page that 200s with a "not found" body would pass).
5. **Regression-test the collisions** the way `scb-salary-mapping.test.ts`
   pins the doctor and restaurant-manager cases.

## Prerequisite

Fix the soft-404 blind spot in `scripts/validate-country-packs.ts` before
adding thousands of university URLs — antagning.se demonstrated the failure
mode (HTTP 200 with a "Sidan kan inte hittas" body).
