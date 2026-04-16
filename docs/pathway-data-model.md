# Career Pathway Data Model — Design Doc

**Status:** DRAFT — awaiting sign-off from product (Nicky) before implementation.
**Author:** Claude (session 2026-04-16)
**Triggers:** psychology coverage gap (wife's actual route invisible in current model); D-007 from QA report (matching engine monoculture); P-001/P-002 from perf report (data-shape contributes to client-bundle bloat).
**Related memories:** `project_pathway_data_model.md`, `project_roadmap_alternatives.md`, `project_nordic_data_pipeline.md`.

---

## 1. Goal

Replace the current `career → flat list of programmes` shape with a structure that can express the **multi-route, multi-stage, multi-country** career paths real people actually take. Make the platform back up its core pitch ("there's more than one way to reach a career") with data, not just words.

## 2. Non-goals

- Not changing the matching engine's user inputs (subjects, work styles, people prefs, interests). The engine still ranks careers; this rework changes what we render *after* a career is picked.
- Not building a content-management UI for routes (no admin tool yet — JSON-edited in source).
- Not adding international (non-Nordic) coverage as part of this rework. That's the `project_nordic_data_pipeline.md` initiative — separate scope.
- Not covering all 744 careers in `career-pathways.ts`. Scope is the ~40-50 academic-track careers (see §9). The ~700 long-tail careers stay on the existing `PathwayFallbackView`, which is more honest for them.

## 3. The problem in concrete terms

Today, `programmes.json` says: psychologist → 4 programmes (UiO, UiB, NTNU, UiT clinical profesjonsstudium, 6 years, ~150 places, 3000 applicants).

That's the **elite linear path**. The platform implicitly says "if you can't do this, you can't be a psychologist." Wrong.

Real paths users take include:
- **Counselling psychology / school counsellor**: bachelor in psy+pedagogikk → master in pedagogisk-psykologisk rådgiving (UiO/NTNU/UiB) → optional kandidat in DK
- **Lawyer abroad**: bachelor in jus or related (NO) → LLM at UK/US uni
- **Doctor abroad**: medicine in Hungary/Poland → HPR authorisation in NO
- **Teacher via PPU**: any bachelor → 1-year PPU (pedagogisk praktisk utdanning) → teaching credential
- **Engineer abroad**: bachelor in engineering (NO) → master at TU Delft / KTH
- **Statsautorisert revisor**: bachelor in econ → 5-year part-time post-bach study + experience

Every one of these is currently invisible. Users see one route, self-select out of careers they could pursue.

## 4. Proposed data model

### 4.1 Entities

```ts
// New: a named pathway from start to a career outcome.
interface Route {
  id: string;                    // e.g. "psychologist--clinical-elite"
  careerId: string;              // FK
  name: string;                  // e.g. "Clinical psychologist (profesjonsstudium)"
  shortName: string;             // e.g. "Clinical (elite)"
  summary: string;               // 1-2 sentences shown in route picker
  tags: RouteTag[];              // ["elite", "competitive", "norway-only"]
  isDefault: boolean;            // exactly one per career
  countryCode: string | null;    // primary country if route is geo-anchored, null if multi-country
  estimatedYears: number;        // total elapsed years for the route
  notes?: string;                // optional editorial commentary (e.g. "3000 applicants, 150 places")
  stages: Stage[];               // ordered
}

type RouteTag =
  | "elite"            // highly competitive entry
  | "common"           // most students take this
  | "lateral-entry"    // late switch from another field
  | "via-abroad"       // includes a non-Norwegian leg
  | "vocational"       // fagbrev / non-university
  | "self-taught"      // bootcamp, portfolio, OSS
  | "fast"             // shorter than the elite/default
  | "experimental";    // niche / less established

// New: an ordered step within a route.
interface Stage {
  id: string;                    // e.g. "psychologist--clinical-elite--bachelor"
  routeId: string;               // FK
  orderIndex: number;            // 0, 1, 2, ...
  kind: StageKind;               // "education" | "credential" | "experience" | "abroad-leg"
  title: string;                 // e.g. "Profesjonsstudium i psykologi"
  durationYears: number;         // 6, 5, 1, 2, etc.
  description: string;           // what happens in this stage, plain English
  programmeIds: string[];        // FK to existing programmes table; can be empty (e.g. "supervised practice")
  prerequisites?: string;        // e.g. "Strong gymnasieexamen, biology + maths"
  outcome?: string;              // e.g. "Authorisation as klinisk psykolog after 1y supervised practice"
}

type StageKind =
  | "education"        // university / vocational programme
  | "credential"       // exam, licence, registration
  | "experience"       // supervised practice, internship, work years
  | "abroad-leg"       // a stage taken in a different country
  | "lateral-entry";   // joining the field laterally

// Existing: Programme — unchanged in shape, but now referenced by Stage.
interface Programme {
  id: string;
  careerId: string;       // KEPT for backward compat; gradually deprecated in favour of stage.programmeIds
  institutionId: string;
  programme: string;
  englishName: string;
  url: string;
  type: string;
  duration: string;
  // ... existing fields unchanged
}
```

### 4.2 Relationships

```
Career (1) ──< Route (N) ──< Stage (N) ──< Programme (N, via programmeIds)
```

- Each career may have 0..N routes. Careers in §9 scope have 2-4 typically.
- Exactly one route per career has `isDefault: true`. The default is what we show first; alternatives appear in the route picker.
- Stages within a route are strictly ordered by `orderIndex`.
- Programmes can appear in multiple stages of multiple routes (e.g. "Bachelor in Psychology" appears in both the clinical-elite route's stage 1 AND the counselling-master route's stage 1).

### 4.3 Why this shape (and not alternatives considered)

- **Why not just add `routeName` to existing programmes?** Then a programme can only belong to one route. Programmes are reused across routes — a bachelor in psy is the foundation for both clinical and counselling.
- **Why not nest stages inline in the route record?** Stages are queryable on their own (e.g. "show me all 1-year credential stages") and may have their own UI in future ("here's everything you can do in the next 12 months"). Separate entity is cleaner.
- **Why keep `Programme.careerId`?** Backward compatibility during migration. Phase out once all UI consumers move to `getStagesByProgramme()`.

## 5. Migration strategy

### 5.1 Storage: JSON or DB tables?

**Recommendation: stay with JSON** for the rework. Reasons:
- Routes are slow-changing editorial content, not user data. A nightly redeploy is fine.
- The QA tooling (`scripts/qa-audit-data.ts`, `scripts/validate-programmes.ts`) all reads JSON.
- DB tables would force an admin UI, which is out of scope.
- Easy to migrate to DB later if a CMS is built.

Three new files alongside `programmes.json`:
- `src/lib/education/data/routes.json` — Route records
- `src/lib/education/data/stages.json` — Stage records
- (Programmes stay where they are.)

### 5.2 Auto-migration of existing data

A one-shot script `scripts/migrate-programmes-to-routes.ts` does:

1. For each unique `careerId` in `programmes.json`, generate one `Route` with `isDefault: true`, name `"Standard route"`, all existing programmes grouped into a single Stage with `kind: "education"`, `orderIndex: 0`.
2. Output to `routes.json` + `stages.json`.
3. Existing `programmes.json` is unchanged.

After the migration script runs, every career still renders *exactly* as today — single default route with one stage containing all its programmes. **No regressions.** Routes UI is hidden until at least 2 routes exist for the career.

### 5.3 Filling real routes

After migration, hand-edit `routes.json` + `stages.json` to add the alternative routes for each in-scope career. ~150-200 stages total, ~3-4 sessions of focused data work.

## 6. API layer changes

```ts
// Existing — unchanged signature, internally now reads via the default route's stage[0].programmeIds:
getProgrammesForCareer(careerId, options?): Programme[]

// New:
getRoutesForCareer(careerId): Route[]                    // ordered: default first, then by tag preference
getRouteById(routeId): Route | null
getStagesForRoute(routeId): Stage[]                      // ordered by orderIndex
getProgrammesForStage(stageId): Programme[]
getDefaultRoute(careerId): Route | null
hasMultipleRoutes(careerId): boolean                     // for "show route picker" UI gating
```

The matching engine consumes `Career` + `MatchProfile` and is unchanged. The Study Path / Roadmap UI is the consumer of the new API.

## 7. UI sketch

### 7.1 Study Path section (Understand tab)

Today: shows one Education Pathway table.

After: shows a **Route picker** above the table when `hasMultipleRoutes(careerId)`. Otherwise behaves exactly as today.

```
┌── Education Pathway ─────────────────────────────────────┐
│                                                          │
│  Route                                                   │
│  ┌─────────────┬─────────────┬─────────────┬──────────┐ │
│  │ ● Clinical  │ Counselling │ Via abroad  │ Lateral  │ │
│  │   (elite)   │   master    │             │  entry   │ │
│  └─────────────┴─────────────┴─────────────┴──────────┘ │
│                                                          │
│  Clinical psychologist — 6 years.                        │
│  3000 applicants, ~150 places. Highly competitive.       │
│                                                          │
│  Stage 1 — Profesjonsstudium i psykologi (6 years)       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Programme | Institution | Location | Duration ...│   │
│  │ Psykologi  UiO            Oslo       6 years     │   │
│  │ Psykologi  UiT            Tromsø     6 years     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Stage 2 — Supervised practice (1 year)                  │
│  Required for autorisasjon as klinisk psykolog.          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The roadmap (Clarity tab) gets the same route picker — switching route re-renders the timeline.

### 7.2 New components

- `RoutePicker` (`src/components/education-browser/route-picker.tsx`)
- `StageBlock` (`src/components/education-browser/stage-block.tsx`) — wraps a programmes table with a Stage header
- `EducationBrowser` updated to render multiple stages per route

## 8. Phased delivery

| Phase | What | Effort | Output |
|---|---|---|---|
| **1** (this doc) | Design + sign-off | 1 session | This doc + open questions answered |
| **2a** | Add Route + Stage to schema (TypeScript types only, no UI changes) | 1 session | Types + new JSON file shapes + auto-migration script |
| **2b** | New API layer (`getRoutesForCareer`, etc.) wraps existing JSON | 1 session | All existing tests still pass; route picker NOT yet shown |
| **3** | Route picker UI in Study Path + Roadmap | 1-2 sessions | Single-route careers behave as today; multi-route careers get picker |
| **4** | Data fill: add alternative routes for in-scope ~40 careers | 3-5 sessions | ~150 hand-curated stages |
| **5** | "Alternative routes" badge on Career Radar to flag careers with multiple routes | 1 session | Discoverability improvement |

Phases 2a → 3 ship as silent infra (no user-visible change). Phase 4 is where users start seeing the new content. Phase 5 is opt-in pre-discovery.

## 9. In-scope careers (candidate list — needs your sign-off)

Currently in `programmes.json` (43 careers). I propose splitting them by treatment:

**Get the multi-route treatment (24 academic-track careers)**:
- `doctor`, `dentist`, `nurse`, `psychologist`, `physiotherapist`, `veterinarian`
- `lawyer`, `accountant`, `economist`
- `software-developer`, `data-analyst`, `it-engineer`, `engineer`, `civil-engineer`, `mechanical-engineer`
- `architect`, `designer`
- `teacher`, `social-worker`
- `biologist`, `chemist`
- `airline-pilot`, `helicopter-pilot`
- `police-officer`, `firefighter`

**Stay on existing single-route shape (19 vocational careers)** — these already have one realistic route (fagbrev via vgs-no), no need for multi-route:
- `auto-mechanic`, `automation-technician`, `boilermaker`, `bricklayer`, `care-assistant`, `carpenter`, `chef`, `childcare-assistant`, `civil-works-foreman`, `cnc-machinist`, `dental-assistant`, `electrician`, `hairdresser`, `healthcare-worker`, `industrial-electrician`, `industrial-mechanic`, `painter-decorator`, `welder`
- (`firefighter` is borderline — has both Norges brannskole route and "deltidsbrannkonstabel" route; could go either way)

**Plus ~15 careers we should add but don't currently have** (driven by user feedback gaps):
- `counselling-psychologist`, `school-counsellor`, `pedagogical-psychologist` (the trigger case)
- `physician-assistant`, `paramedic`
- `journalist`, `copywriter`, `ux-designer`, `product-manager`
- `ai-engineer`, `ml-engineer`, `cybersecurity-analyst`
- `actuary`, `tax-adviser`
- `kindergarten-teacher`, `special-needs-teacher`

That's ~24 + ~15 = ~39-40 careers in scope for the multi-route treatment. The other ~700 careers in `career-pathways.ts` stay on `PathwayFallbackView`.

## 10. Open questions (need your call before Phase 2 begins)

1. **Storage:** confirm JSON over DB for now? (Recommendation: JSON.)
2. **Migration:** OK to ship the auto-migration silently in Phase 2a even before the route picker exists in Phase 3? (Recommendation: yes — guarantees zero regressions while plumbing lands.)
3. **Career list (§9):** is the 24-academic + 15-additional split right? Want to add or drop any?
4. **Route picker placement:** above the programmes table in Study Path AND above the roadmap in Clarity? (Recommendation: yes — same control, two surfaces, one selected route persisted in localStorage per career.)
5. **Disclaimer for the launch interim** (between launch and Phase 4 ship): do you want me to add a small "Showing the most common route — alternative routes coming soon" line to the affected careers' Study Path now, before the rework lands? (Recommendation: yes — keeps the "trust the data" promise honest.)
6. **Tag taxonomy** (§4.1 RouteTag): is the proposed 8-tag set right? Anything to add/remove? Editorial decisions like "elite vs common vs fast" set the tone of the picker.
7. **Sequence vs. launch:** do we hold launch for this (Option A in our chat), launch first then ship the rework (Option B), or run them in parallel? (My implicit assumption was B — confirm.)

## 11. What "done" looks like for each phase

- **Phase 1 (this doc):** Nicky says "yes" to §10 questions.
- **Phase 2a:** `routes.json` + `stages.json` exist with auto-migrated content; all existing tests pass; the route picker is NOT visible.
- **Phase 2b:** New API functions exported; matching engine + EducationBrowser still call the old `getProgrammesForCareer`; visible behaviour unchanged.
- **Phase 3:** Route picker renders for any career with `hasMultipleRoutes() === true`; single-route careers unchanged.
- **Phase 4:** ~40 careers have at least 2 routes, with ~150 stages total; QA audit passes; URL validator passes.
- **Phase 5:** Career Radar shows a small "multiple routes" badge.

## 12. What I need to NOT do

- Don't migrate existing programmes data into a destructive new shape. The migration is additive — `programmes.json` stays.
- Don't change the matching engine's input/output shape.
- Don't change the existing `PathwayFallbackView` for the ~700 long-tail careers.
- Don't fabricate alternative routes during data fill — every route must be backed by either a real programme catalog entry, a published government pathway document, or input from someone who took the path.

---

**Next step:** Nicky reviews §10 open questions and signs off (or pushes back). Once §10 is resolved, Phase 2a begins.
