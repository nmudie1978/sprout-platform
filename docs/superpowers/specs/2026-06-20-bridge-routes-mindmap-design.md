# Bridge Routes Mindmap — Design Spec

**Date:** 2026-06-20
**Status:** Approved (brainstorming complete); amended 2026-06-20 after source verification
**Surface:** My Journey → Clarity tab (career-changers / out-of-work users)

## Codebase reality corrections (supersede anything below that conflicts)

The initial exploration summary was partly inaccurate. Verified against source:

1. **No `between` stage exists.** `EducationStage = 'school' | 'college' | 'university' | 'other'` (defined in BOTH `src/lib/education/types.ts:10` and `src/lib/journey/generate-fallback-timeline.ts:24`). `other` already means "gap year / self-taught / **already working** / between things" (`generate-fallback-timeline.ts:532`). → **The feature keys on stage `other` only.** Drop all `between` references.
2. **No `currentRole`/occupation field exists** in the foundation/education context. → `previousOccupation` is a **newly collected input**, not a reused field. It is **optional** (generic `anchor` fallback when empty).
3. The bridge step is the first item of the `other` branch: `title: "Find your way in"`, `stage: 'experience'`, `icon: 'Briefcase'` (`generate-fallback-timeline.ts:534-550`). The "See your routes →" affordance attaches here.
4. Foundation context persists via `POST src/app/api/journey/education-context/route.ts` (allow-list of `stage` + sanitised string fields). New fields are added there + to the `EducationContext` interface.
5. CLAUDE.md age policy reverted to 15–30 during the session — does not affect this feature (foundation stages are not age-gated). Keep copy age-agnostic.

## Problem

When someone is **out of work** or **between jobs** — especially in a **career-switch** scenario with minimal experience in the target field — the paralysis is rarely "no options." It's:

1. They **can't see** the routes back into work.
2. They **can't tell which routes they've already exhausted**.
3. They don't know the **support levers that exist** (e.g. NAV's praksisplass / lønnstilskudd).

Today the Clarity roadmap already models this user (foundation stage `other`), but it produces a **single linear 5-step ladder** (`generate-fallback-timeline.ts` ~line 645): *Find your way in → Apply → First role → Certifications → Senior role.* One path, no alternatives, no sense of untried avenues.

A **mindmap** is the right shape for this: it branches the avenues, contrasts *untried* vs *already tried*, and surfaces support routes the user didn't know existed.

## Goal

Add a **supporting visual** in the Clarity tab — a popup mindmap of routes back into work — for users whose foundation stage is `other`. It must be **calm, accurate, privacy-minimal, and mobile-strong**, and must not replace or clutter the existing linear roadmap.

### Non-goals (YAGNI)

- Not for school/college/university users.
- Not a job board / not job listings (no openings, no applications — stays advice/direction per `<removed_features_strict>`).
- No AI generation in v1 (see Decision: deterministic engine).
- No gamification, no checkboxes-as-progress, no free-text intake.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Generation | **Deterministic rules engine** (v1) | NAV facts must be accurate for a vulnerable jobseeker — an AI must never invent a scheme. The avenue set is finite and curatable. Instant, free, fully testable. Hybrid AI-enriched `anchor` leaves noted as a future Phase 2. |
| Tried display | **Single "Already tried" branch** | Keeps untried branches clean and encouraging (what's *new*); avoids showing a route twice. |
| Surface | **Popup from the bridge step** | Clarity stays calm by default; the mindmap sits behind a quiet "See your routes →" affordance. |
| Responsive | **SVG fan (desktop/tablet) + vertical accordion (mobile)** | One model, two renderers. A horizontal mindmap is unusable at 375px; honours the strong-mobile-UX principle. |

## Inputs

Collected in the **existing foundation edit modal**, shown only for the `other` stage. Persisted with the existing education-context record via `POST /api/journey/education-context`. All low-sensitivity; no free-text, no sensitive categories (privacy-by-design).

**Reused (already captured):**
- `targetCareer` ← the journey goal (e.g. "Project Manager") — the centre of the map.

**New (four fields, shown only for stage `other`):**
- `previousOccupation: string | null` — "What did you do before?" (optional free-ish text, sanitised, ≤80 chars). Anchors the `anchor` branch; generic fallback when empty.
- `withNav: boolean` — "Are you working with NAV right now?" Gates the NAV branch.
- `triedRoutes: string[]` — multi-select chips: `course · applications · cv · networking · placement · freelancing`. Powers tried/untried.
- `blocker: 'no-experience' | 'no-callbacks' | 'unknown-routes'` — "What's the main thing blocking you?" Orders the branches.

(Privacy note: `previousOccupation` is a short occupation label, not sensitive profiling. Optional.)

## Data model

```ts
type TriedRoute = 'course' | 'applications' | 'cv' | 'networking' | 'placement' | 'freelancing';
type Blocker = 'no-experience' | 'no-callbacks' | 'unknown-routes';
type BranchKind = 'anchor' | 'workplace-nav' | 'proof' | 'training' | 'network' | 'tried';

interface BridgeInput {
  previousOccupation: string | null;   // newly collected, optional
  targetCareer: string;
  withNav: boolean;
  triedRoutes: TriedRoute[];
  blocker: Blocker;
}

interface BridgeLeaf {
  id: string;
  label: string;
  detail?: string;                     // "what this is / how to start" — expanded on tap
  state: 'untried' | 'tried';
  navFact?: boolean;                   // NAV leaf → factual treatment + nav.no pointer
  mapsToTriedRoute?: TriedRoute;       // if this route is in triedRoutes, leaf moves to `tried` branch
}

interface BridgeBranch {
  id: string;
  kind: BranchKind;
  title: string;
  emphasis: boolean;                   // blocker-driven subtle highlight
  leaves: BridgeLeaf[];
}

interface BridgeMindmap {
  center: { targetCareer: string; previousOccupation: string | null };
  branches: BridgeBranch[];
}
```

## Engine

Pure function, beside the existing fallback generator:

```ts
// src/lib/journey/build-bridge-mindmap.ts
export function buildBridgeMindmap(input: BridgeInput): BridgeMindmap
```

### Branch catalogue (content core)

| kind | title | example untried leaves |
|---|---|---|
| `anchor` | "Use your {previousOccupation} background" | adjacent roles a half-step from the old field (from domain-adjacency map) |
| `workplace-nav` | "Get into a workplace" *(only if `withNav`)* | Praksisplass, Lønnstilskudd, AMO course — **hard-coded NAV facts** (`navFact: true`) |
| `proof` | "Build proof you can do the job" | run one real project pro-bono, reframe freelance as the target role, build a portfolio |
| `training` | "Targeted upskilling — not another full course" | close one specific named gap; certification ladder if target is a certification-route career |
| `network` | "Go through people" | reconnect ex-colleagues/suppliers, temp/recruitment agencies, informational chats |
| `tried` | "Already tried" | assembled from `triedRoutes`, all `state: 'tried'`, greyed |

### Transforms (applied in order)

1. **NAV gate** — include the `workplace-nav` branch only if `withNav === true`. Its leaves carry `navFact: true`, accurate descriptions, and a `nav.no` pointer (never an invented scheme).
2. **Blocker ordering + emphasis** — sort branches so the blocker-matching branch is first and `emphasis: true` (calm highlight, not loud). The rest follow a stable natural order.
   - `no-callbacks` → `workplace-nav` (if present) → `network` → `anchor` → `proof` → `training`
   - `no-experience` → `proof` → `workplace-nav` → `anchor` → `network` → `training`
   - `unknown-routes` → natural order (`anchor` → `workplace-nav` → `proof` → `network` → `training`), **no** branch emphasised (all equally new).
   - When the emphasised branch is gated out (e.g. `no-callbacks` but `withNav` false), emphasis falls to the next branch in that blocker's order.
3. **Tried dedup** — any leaf whose `mapsToTriedRoute` is in `triedRoutes` is removed from its home branch and represented **once** in the single `tried` branch (one leaf per tried route, with a friendly label). The `tried` branch is appended last and is never emphasised.

### Domain-adjacency map (authored content)

`src/lib/journey/bridge-domain-adjacency.ts` — a curated map of ~15–20 common previous fields → bridge-role suggestions for the `anchor` branch. Generic fallback ("roles that build on your experience") when the occupation isn't matched. Keyword-normalised lookup (lowercase, contains-match on key terms).

### Edge cases

- `previousOccupation` null/empty (common) → `anchor` title becomes "Use the strengths you already have" with generic leaves; map still renders.
- `withNav` false → no NAV branch; `proof`/`network` lead depending on blocker.
- All routes tried → branches keep their **non-route** leaves (most leaves have no `mapsToTriedRoute`), so nothing renders empty; the `tried` branch holds all six.
- Certification-route target career → `training` branch includes a short cert-ladder leaf (reuse existing `careerRoute` signal).

## UI & rendering

- **Component:** `BridgeRoutesMindmap` (popup/dialog) + pure `layoutMindmap(model, viewport)` that computes node/edge positions.
- **Trigger:** in the Clarity roadmap, when stage is `other`, the existing "Find your way in" bridge step gains a quiet **"See your routes →"** affordance that opens the popup. No new route; lazy-loaded like other renderers.
- **Desktop/tablet:** left→right SVG fan (centre → branches → leaves), reusing the SVG `<path>` bezier approach from `winding-road-renderer.tsx` (no graph library). Untried leaves = teal outline; NAV leaves = teal fill + glow + `NAV` badge; tried leaves = greyed, struck through.
- **Mobile:** same `BridgeMindmap` model renders as a **vertical accordion** — each branch a collapsible section, leaves inside. Emphasised branch expanded by default.
- **Interaction:** leaves are *explore*, not checkboxes. Tapping expands `detail`. NAV leaves show factual detail + a real `nav.no` pointer. A small "update my answers" link re-opens the foundation inputs to refresh the map.
- **Inputs UI:** extend the existing foundation edit modal with the four new fields (previous occupation · NAV toggle · tried chips · blocker), shown only for `other`.

## Testing

- **Unit** (`build-bridge-mindmap.test.ts`): NAV gate on/off · each of the 3 blocker orderings + emphasis flag (including emphasis-fallback when gated out) · tried dedup · empty `previousOccupation` · all-routes-tried (branches still populated) · certification-route training leaf.
- **Coverage** (`bridge-domain-adjacency-coverage.test.ts`): every catalogue entry resolves; fallback path returns non-empty (mirrors existing `discipline-map-coverage` test pattern).
- **Layout** (`layout-mindmap.test.ts`): deterministic positions, no node overlap, fan within viewport bounds.
- **Preview:** `/dev/bridge-mindmap` page rendering sample data (career-changer + out-of-work personas), verified via headless-Chrome screenshot (established UI-verify workflow). Desktop + mobile widths.
- No e2e for v1.

## Files

**New**
- `src/lib/journey/build-bridge-mindmap.ts` — engine + types
- `src/lib/journey/bridge-domain-adjacency.ts` — authored domain map
- `src/lib/journey/bridge-catalogue.ts` — branch/leaf catalogue + NAV facts
- `src/components/journey/bridge-routes-mindmap.tsx` — popup + responsive renderers
- `src/components/journey/bridge-mindmap-layout.ts` — pure layout function
- `src/app/dev/bridge-mindmap/page.tsx` — preview (dev pages live under `src/app/dev`, not a route group)
- tests as above

**Modified**
- `src/lib/education/types.ts` — add `previousOccupation`, `withNav`, `triedRoutes`, `blocker` to the `EducationContext` interface
- the foundation edit modal (locate via `studyProgram` input) — collect the 4 new fields, shown only for stage `other`
- the Clarity roadmap bridge-step renderer — add the "See your routes →" affordance on the `other`-branch "Find your way in" item
- `src/app/api/journey/education-context/route.ts` — accept/persist + return the 4 new fields (extend allow-list + sanitisation)

(Note: `EducationStage` is duplicated in `education/types.ts` and `generate-fallback-timeline.ts` — leave as-is; this feature reads `stage`, it doesn't change the union.)
- the Clarity roadmap bridge-step renderer — add the "See your routes →" affordance
- `/api/journey/foundation-data` (+ persistence) — accept/return the 3 new fields

## Future (Phase 2, not in scope)

- Hybrid AI enrichment of `anchor` adjacent-role leaves only (NAV facts stay hard-coded).
- "Aggregate hiring-demand" signal (from official ATS / NAV open API) as a calm context badge on a branch — separate spec; must stay aggregate, never job listings.
