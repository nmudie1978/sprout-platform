# Geography Careers Expansion (+61) — Design

**Date:** 2026-06-18
**Branch:** `feat/geography-careers`
**Owner-approved scope:** add ALL 61 audited gaps; AI-era roles cross-linked to the `/insights` AI surface; distribute into existing categories (no new category group).

## Problem

Geography is one of the most common school subjects, but the catalogue (1,372
careers) has almost no geography-grad destinations. A coverage audit of a
~90-role list found 21 already present, 8 close duplicates, and **61 genuine
gaps** — concentrated in GIS/mapping (zero specialist roles today), climate &
weather (no meteorologist/climatologist at all), urban planning/policy, and the
emerging geospatial-AI cluster. "What can I do with geography?" is exactly the
confusion Endeavrly exists to reduce.

## Scope

Add 61 new careers (catalogue 1,372 → 1,433). No new category group — each
career slots into the best existing category array in
`src/lib/career-pathways.ts`.

### Cluster → category mapping

| Source cluster | Target category | n |
|---|---|---|
| Mapping & GIS — GIS Analyst, GIS Developer, Geospatial Analyst, Spatial Data Analyst, Cartographer, Remote Sensing Specialist, Geomatics Specialist, Mapping Technician, Hydrographer | `TECHNOLOGY_IT` | 9 |
| Tech & Data — Geospatial Data Scientist, Location Intelligence Analyst, Satellite Data Analyst, Earth Observation Specialist, Drone Mapping Specialist, GIS Manager | `TECHNOLOGY_IT` | 6 |
| Emerging AI-era — Geospatial AI Engineer, Climate Data Scientist, Satellite Analytics Specialist, Digital Twin Specialist, Smart City Planner, Earth Observation Scientist, Autonomous Mapping Systems Engineer, Environmental Intelligence Analyst | `ARTIFICIAL_INTELLIGENCE` | 8 |
| Atmospheric science — Meteorologist, Climatologist, Weather Forecaster | `TECHNOLOGY_IT` | 3 |
| Environment science — Ecologist, Climate Change Analyst, Natural Resource Manager | `HEALTHCARE_LIFE_SCIENCES` | 3 |
| Environment/risk consulting — Environmental Consultant, Sustainability Consultant, Environmental Planner, Climate Risk Analyst, Environmental Risk Consultant | `BUSINESS_MANAGEMENT` | 5 |
| Planning — Town Planner, Regional Planner, Transport Planner, Infrastructure Planner, Land Use Planner, Development Planner, Housing Policy Officer | `PUBLIC_SERVICE_SAFETY` | 7 |
| Government — Policy Analyst, Emergency Management Officer, Civil Service Officer, Border & Migration Analyst, Disaster Risk Specialist, Local Government Officer | `PUBLIC_SERVICE_SAFETY` | 6 |
| Business/consulting — Sustainability Manager, ESG Consultant, Market Location Analyst, Business Intelligence Analyst | `BUSINESS_MANAGEMENT` | 4 |
| Supply chain — Supply Chain Analyst, Logistics Planner | `LOGISTICS_TRANSPORT` | 2 |
| International/human geography — International Development Officer, Humanitarian Aid Worker, NGO Programme Manager (→ `SOCIAL_CARE_COMMUNITY`); Population Analyst, Demographer, Social Researcher (→ `BUSINESS_MANAGEMENT`) | mixed | 6 |
| Education & research — Research Scientist (geo/earth-science framed), Field Researcher | `EDUCATION_TRAINING` | 2 |

**Total: 61.**

> Implementation note: the three atmospheric-science roles (Meteorologist,
> Climatologist, Weather Forecaster) were placed in `TECHNOLOGY_IT` rather than
> `HEALTHCARE_LIFE_SCIENCES`. In the life-sciences bucket the matching engine
> treated them as biology/health-people affinities, so they ranked top for a
> "psychology/helping-people" persona (caught by the adversarial smell-test).
> `TECHNOLOGY_IT` groups them coherently with the earth-observation/geospatial
> cluster (all earth-data work) and fixes the mis-match.

### Near-twin handling

Town Planner, GIS Manager, and Spatial Data Analyst sit close to existing or
sibling cards (Urban Planner, GIS Analyst, Geospatial Analyst). Owner asked for
all 61, so they stay — but each gets a **distinct focus** in title/description
so they are not literal duplicates:
- Town Planner = local statutory development control & planning applications
  (vs Urban Planner = city-scale strategy).
- GIS Manager = leads a GIS team/data programme (vs GIS Analyst = hands-on).
- Spatial Data Analyst = data-pipeline/analytics framing (vs Geospatial Analyst
  = applied spatial analysis for a domain).

Every new `id` is unique and checked against the 21 already-present and 8
close-duplicate ids so nothing collides.

## Per-career data

Each entry matches the existing `Career` shape exactly:
`id` (unique kebab-case), `title`, `emoji`, one-sentence `description`,
`keySkills` (5), `dailyTasks` (5), `growthOutlook` (`high`|`medium`|`stable`),
`entryLevel` (bool), `workSetting`, `peopleIntensity`, `sector`
(`public`|`private`|`mixed`), `educationPath`, `educationRoute`, `avgSalary`.

- **Salaries:** NOK ranges, **flagged UNVERIFIED** in the PR/memory. Real
  figures come later via the SSB/freshness pipeline. No verified claims.
- **educationRoute:** `university` for most (planning, science, GIS, policy,
  data); `certification`/vocational for field/technician-tier roles (Mapping
  Technician, Drone Mapping Specialist) where appropriate.
- **growthOutlook:** must be one of high/medium/stable (no "low").

## Curated employers

New file `src/lib/career-employers-realism-geography.ts` exporting
`REALISM_EMPLOYERS_GEO: Record<string, Employer[]>` (6 real, Norway-first
employers per career; shape `{ name, industry, size }`). Wired into
`src/lib/career-employers.ts`:
- added to the `getTopEmployers()` `??` resolution chain;
- added to the `hasRealEmployers`-style coverage chain.

Indicative employers: Kartverket, Norkart, Geodata AS, Esri, Asplan Viak
(GIS/geo); Meteorologisk institutt (MET Norway), NVE, Cicero (climate/weather);
Multiconsult, Norconsult, Miljødirektoratet (environment); Oslo kommune,
Statens vegvesen, DSB (planning/government); Røde Kors, Flyktninghjelpen (NRC),
Norad (NGO/development); Kongsberg Satellite Services (KSAT), Planet
(geospatial-AI).

## Career DNA

`deriveCareerDNA()` covers the whole catalogue automatically, so all 61 get DNA
traits with no extra work. `DNA_TRAIT_OVERRIDES` added only where the
deterministic derivation is visibly wrong (optional polish, non-blocking).

## AI cross-link

Add one cluster to `roles.clusters` in `src/lib/insights/ai-future-of-work.ts`:

```
{ label: "Geospatial & climate AI", roles: [
  { label: "Geospatial AI Engineer", careerId: "geospatial-ai-engineer" },
  ... 8 total ... ] }
```

Surfaces the 8 AI-era roles on the `/insights` "Careers AI is creating" modal,
deep-linking each to `/careers?open=<id>`.

## Verification

- `career-data-integrity` test stays green: unique ids, kebab-case, all required
  fields present and correctly typed, valid growthOutlook/sector, no empty
  category. (No hardcoded total-count assertion exists — only a `>500` floor.)
- `career-employers` test stays green.
- `tsc --noEmit`, full `vitest` run, `eslint` — all must pass.
- Data-only change; no headless render required (optional spot-check of 2–3 via
  `/careers?open=<id>`).

## Build approach

Generate entries cluster-by-cluster (gen + parallel-agent pattern from prior
expansions), assemble deterministically into the correct category arrays (only
the orchestrator edits `career-pathways.ts`, avoiding file conflicts), wire
employers + AI cluster, then a single integrity/typecheck/lint gate.

## Out of scope

- No new category group (browse/radar/test wiring untouched).
- No verified salary research this round (pipeline follow-up).
- No new radar preset for geography (could be a follow-up).
