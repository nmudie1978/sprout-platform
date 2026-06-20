# Bridge Routes Mindmap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a deterministic, calm "routes back into work" mindmap to the Clarity tab for users whose foundation stage is `other`, opened as a popup from the "Find your way in" bridge step.

**Architecture:** Pure TS engine (`buildBridgeMindmap`) over a curated branch catalogue + domain-adjacency map → a `BridgeMindmap` model → rendered as an SVG fan (desktop) or vertical accordion (mobile). Four new optional inputs persisted on `EducationContext`. No AI, no network, no new deps.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Vitest, Tailwind, lucide-react. Reuse SVG `<path>` bezier approach from `winding-road-renderer.tsx` (no graph lib).

---

## Order of build (risk-ascending)

Engine + preview first (zero production risk, fully testable), integration last (touches live journey flow).

---

### Task 1: Engine types + NAV gate (TDD)

**Files:**
- Create: `src/lib/journey/bridge-mindmap-types.ts`
- Create: `src/lib/journey/build-bridge-mindmap.ts`
- Create: `src/lib/journey/bridge-catalogue.ts`
- Create: `src/lib/journey/bridge-domain-adjacency.ts`
- Test: `src/lib/journey/__tests__/build-bridge-mindmap.test.ts`

- [ ] **Step 1 — Types.** In `bridge-mindmap-types.ts` define `TriedRoute`, `Blocker`, `BranchKind`, `BridgeInput`, `BridgeLeaf`, `BridgeBranch`, `BridgeMindmap` exactly as in the spec's Data model.
- [ ] **Step 2 — Catalogue.** In `bridge-catalogue.ts` export `buildCatalogueBranches(input): BridgeBranch[]` returning the 5 source branches (`anchor`, `workplace-nav`, `proof`, `training`, `network`) with curated leaves. NAV leaves carry `navFact: true` and a `nav.no` URL in `detail`. Leaves that correspond to a tried-route carry `mapsToTriedRoute`. `anchor` leaves come from `resolveAnchorRoles(previousOccupation, targetCareer)`.
- [ ] **Step 3 — Domain map.** In `bridge-domain-adjacency.ts` export `resolveAnchorRoles(previousOccupation, targetCareer): { title: string; leaves: {label,detail?}[] }`. ~15 curated entries (keyword contains-match, lowercased) incl. interior design → fit-out/FF&E/workplace-design coordinator. Generic fallback when no match or null occupation: title "Use the strengths you already have", 2 generic leaves.
- [ ] **Step 4 — Failing test (NAV gate).**
```ts
import { buildBridgeMindmap } from '../build-bridge-mindmap';
const base = { previousOccupation: 'Interior designer', targetCareer: 'Project Manager', withNav: true, triedRoutes: [], blocker: 'unknown-routes' as const };
it('includes workplace-nav branch only when withNav', () => {
  expect(buildBridgeMindmap(base).branches.some(b => b.kind === 'workplace-nav')).toBe(true);
  expect(buildBridgeMindmap({ ...base, withNav: false }).branches.some(b => b.kind === 'workplace-nav')).toBe(false);
});
it('nav leaves are factual with a nav.no pointer', () => {
  const nav = buildBridgeMindmap(base).branches.find(b => b.kind === 'workplace-nav')!;
  expect(nav.leaves.every(l => l.navFact)).toBe(true);
  expect(nav.leaves.some(l => (l.detail ?? '').includes('nav.no'))).toBe(true);
});
```
- [ ] **Step 5 — Implement `buildBridgeMindmap`.** Build catalogue branches, drop `workplace-nav` when `!withNav`, assemble `center` from `targetCareer`/`previousOccupation`. (Ordering/dedup added in later tasks.)
- [ ] **Step 6 — Run** `npm run test:run -- build-bridge-mindmap` → PASS.
- [ ] **Step 7 — Commit** (`feat(journey): bridge-mindmap engine + NAV gate`).

### Task 2: Blocker ordering + emphasis (TDD)

- [ ] **Step 1 — Failing tests.**
```ts
it('no-callbacks floats workplace-nav first + emphasises it', () => {
  const m = buildBridgeMindmap({ ...base, blocker: 'no-callbacks' });
  expect(m.branches[0].kind).toBe('workplace-nav');
  expect(m.branches[0].emphasis).toBe(true);
});
it('no-experience floats proof first', () => {
  expect(buildBridgeMindmap({ ...base, blocker: 'no-experience' }).branches[0].kind).toBe('proof');
});
it('unknown-routes emphasises nothing', () => {
  expect(buildBridgeMindmap({ ...base, blocker: 'unknown-routes' }).branches.every(b => !b.emphasis)).toBe(true);
});
it('emphasis falls through when target branch is gated out', () => {
  const m = buildBridgeMindmap({ ...base, withNav: false, blocker: 'no-callbacks' });
  expect(m.branches[0].kind).toBe('network'); // next in no-callbacks order
  expect(m.branches[0].emphasis).toBe(true);
});
```
- [ ] **Step 2 — Implement.** Define `BLOCKER_ORDER: Record<Blocker, BranchKind[]>` per spec. Sort present branches by that order (stable; unlisted kinds keep natural order after). Set `emphasis=true` on the first present branch for `no-callbacks`/`no-experience`; none for `unknown-routes`.
- [ ] **Step 3 — Run** tests → PASS. **Step 4 — Commit.**

### Task 3: Tried dedup + edge cases (TDD)

- [ ] **Step 1 — Failing tests.**
```ts
it('moves tried routes into a single greyed tried branch', () => {
  const m = buildBridgeMindmap({ ...base, triedRoutes: ['course','applications'] });
  const tried = m.branches.find(b => b.kind === 'tried')!;
  expect(tried.leaves).toHaveLength(2);
  expect(tried.leaves.every(l => l.state === 'tried')).toBe(true);
  // no untried leaf still carries a tried route
  const live = m.branches.filter(b => b.kind !== 'tried').flatMap(b => b.leaves);
  expect(live.some(l => l.mapsToTriedRoute && ['course','applications'].includes(l.mapsToTriedRoute))).toBe(false);
});
it('keeps every live branch non-empty even when all routes tried', () => {
  const all = ['course','applications','cv','networking','placement','freelancing'] as const;
  const m = buildBridgeMindmap({ ...base, triedRoutes: [...all] });
  expect(m.branches.filter(b => b.kind !== 'tried').every(b => b.leaves.length > 0)).toBe(true);
});
it('renders with null previousOccupation (generic anchor)', () => {
  const m = buildBridgeMindmap({ ...base, previousOccupation: null });
  expect(m.branches.find(b => b.kind === 'anchor')!.leaves.length).toBeGreaterThan(0);
});
```
- [ ] **Step 2 — Implement.** After ordering: collect tried-route leaves out of live branches; append one `tried` branch (`emphasis:false`, friendly labels per route, all `state:'tried'`). Ensure catalogue gives each live branch ≥1 non-route leaf so none empties. **Step 3 — Run → PASS. Step 4 — Commit.**

### Task 4: Domain-adjacency coverage test

- [ ] Test `src/lib/journey/__tests__/bridge-domain-adjacency.test.ts`: every map entry returns ≥2 leaves; unknown occupation + null both hit the generic fallback (non-empty, stable title). Run → PASS. Commit.

### Task 5: Layout function (TDD)

**Files:** Create `src/components/journey/bridge-mindmap-layout.ts`; Test `src/components/journey/__tests__/bridge-mindmap-layout.test.ts`.

- [ ] `layoutMindmap(model, { width, height })` → `{ center, branches: {x,y,w,h, leaves:{x,y,w,h}[] }[], edges: {d:string}[] }`. Center left-middle; branches evenly distributed in a vertical column at mid-x; leaves to the right of each branch. Bezier `d` strings centre→branch and branch→leaf (mirror the mockup).
- [ ] Tests: deterministic output for fixed input; no two branch boxes overlap vertically; all nodes within `[0,width]×[0,height]`. Run → PASS. Commit.

### Task 6: BridgeRoutesMindmap component

**Files:** Create `src/components/journey/bridge-routes-mindmap.tsx`.

- [ ] Props `{ model: BridgeMindmap; open: boolean; onClose: () => void }`. Use existing Dialog primitive (match `timeline-detail-dialog.tsx` import). Desktop (`md:` up): SVG fan via `layoutMindmap`, teal styling per mockup (untried = teal outline; nav = teal fill + glow + NAV badge; tried = greyed + line-through). Mobile: vertical accordion of branches (emphasised branch open by default), leaves expand `detail` on tap. No checkboxes. Lazy-load with `next/dynamic` where imported. (No test; verified via preview.) Commit.

### Task 7: Dev preview + screenshot verify

**Files:** Create `src/app/dev/bridge-mindmap/page.tsx` (match an existing `src/app/dev/*` page's structure; mark noindex).

- [ ] Render 2 personas inline (career-changer Interior→PM with NAV + some tried; out-of-work generic, no NAV) using `buildBridgeMindmap` + the component shown open. Then verify with headless Chrome screenshot at desktop (1280) + mobile (390) widths per `reference_headless_chrome_ui_verify`. Fix visual issues. Commit.

### Task 8: Persist 4 new inputs

**Files:** Modify `src/lib/education/types.ts`, `src/app/api/journey/education-context/route.ts`.

- [ ] Add optional `previousOccupation?: string`, `withNav?: boolean`, `triedRoutes?: string[]`, `blocker?: Blocker` to `EducationContext`. In the route's POST: read from body, sanitise (`str(previousOccupation,80)`, boolean coerce, filter `triedRoutes` to the 6 known values, validate `blocker` against the 3 known values), persist into the stored object; return them on GET. Keep all optional/back-compatible. Add a route-shape unit test if a sibling test exists; else a small `education-context` sanitiser test. Run typecheck + tests. Commit.

### Task 9: Foundation modal inputs (stage `other` only)

**Files:** Modify the foundation edit modal (locate: `grep -rln "studyProgram" src/components`).

- [ ] When `stage === 'other'`, render: previous-occupation text input, "Working with NAV?" toggle, tried-routes chip multiselect, blocker single-select. Wire to the same save path that posts to `education-context`. Hide for other stages. Manual + typecheck. Commit.

### Task 10: "See your routes →" affordance

**Files:** Modify the bridge-step renderer (the `other`-branch "Find your way in" card; find where `JourneyItem` cards render the step in `personal-career-timeline.tsx` / renderers).

- [ ] On the `other`-branch experience step whose title is "Find your way in", add a quiet "See your routes →" button that builds the model from the stored EducationContext fields (+ career goal) and opens `BridgeRoutesMindmap`. Only when `stage === 'other'`. Manual + screenshot. Commit.

---

## Self-review

- **Spec coverage:** inputs (T8/T9), engine + NAV gate + ordering + dedup (T1–3), domain map (T3/T4), layout (T5), responsive component (T6), preview/verify (T7), affordance (T10). ✅
- **Type consistency:** `BridgeInput/BridgeBranch/BridgeLeaf/BridgeMindmap` defined once in `bridge-mindmap-types.ts`, imported everywhere. `Blocker` reused by EducationContext. ✅
- **No placeholders:** test code shown for engine tasks; UI tasks specify exact files + verification method. ✅
- **Risk:** T1–T7 are isolated (new files + dev page) → safe autonomous build. T8–T10 touch live flow → verify each file before editing; if an attachment point is ambiguous, implement the safe part and document the rest rather than guess.
