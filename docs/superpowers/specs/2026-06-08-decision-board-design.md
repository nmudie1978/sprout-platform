# Decision Board — design spec

Date: 2026-06-08
Status: Approved design, pre-implementation

## Problem

The dashboard and My Library present an **inventory of activity** (explored
journeys, saved careers, interest ★ ratings, saved resources, reflections)
but never **synthesise** it into a decision. For a product whose promise is
clarity and direction, nothing answers the user's real question after
exploring several careers: *"…so which one?"*

## Goal

A **Decision Board**: a ranked, interactive "league table" of the careers the
user has explored, that turns scattered exploration into a clear, personal
standing — *"of the N careers you've explored, you're leaning X"* — and lets
the user shape that standing themselves.

## Placement / IA

- New **first tab** in My Library, reached at `/library?tab=decision`.
- **Replaces the existing "Compared" tab.** The old localStorage 2-up compare
  (`ComparedTab` + `CompareModal`) is superseded. `CompareModal` stays in the
  codebase; a "compare these two side by side" action from the board is a
  later (v2) enhancement, not v1.
- Tab order becomes: **Decision Board · Exploring · Saved careers · Reflections**
  (driven by `LIBRARY_TABS`).

## What populates it

- **Explored journeys only** — the careers in "My Explored Journeys"
  (`JourneyGoalData` rows that pass `isJourneySnapshotWorthy`). These are the
  careers the user has actually engaged with.
- Saved-but-unexplored careers (hearted curiosities) are **not** board entries
  in v1 (adding them is a v2 enhancement). Keeping the board to explored
  careers keeps each entry meaningful and the "it builds up as you explore"
  story true.

## Ranking logic

- **Default (auto) order**: by the user's **★ interest rating** (desc), with
  **journey progress** breaking ties (Complete > Clarity > Understand >
  Discover). Transparent — no hidden/blended score. Unrated careers sort
  below rated ones, progress breaking ties among them. Final tiebreak when
  both interest and progress are equal: most-recently-updated journey first.
- **Manual order wins**: once the user reorders (drag or arrows), their
  explicit order is stored and used instead of the auto order. A
  **"Reset to suggested"** action returns to auto order (clears manual order).
- **"Out of the running"** entries are excluded from the main standings and
  shown in a dimmed relegation zone; they do not get a rank number.

## The board UI

Ranked standings, top-3 on a podium, calm/premium aesthetic (consistent with
the existing dashboard/journey design language — no new design system).

```
┌────────────────────────────────────────────────────────────────────┐
│  You've explored 4 careers — you're leaning  💰 Financial Advisor    │
│  (highest interest · journey complete)                               │
├────────────────────────────────────────────────────────────────────┤
│ 🥇 1  💰 Financial Advisor   ★★★★★  ✓ Complete  650k–1M   ⌃ ⌄  ⠿ 📝 │
│ 🥈 2  🔗 Integration Arch.   ★★★☆☆  ✓ Complete  700–900k  ⌃ ⌄  ⠿    │
│ 🥉 3  ✈️ EFL Teacher          ─      ◐ Discover  400–500k  ⌃ ⌄  ⠿    │
│ ───────────────────  Out of the running  ───────────────────         │
│    🧪 Biomedical Scientist (dimmed)                            ↩      │
└────────────────────────────────────────────────────────────────────┘
```

- **Headline "lean" line**: synthesis at the top — *"you're leaning X"* — with
  a short reason (e.g. "highest interest · journey complete"). Computed from
  the current #1.
- **Columns (compact row)**: rank · career (emoji + name) · interest ★ · stage
  badge (D/U/C/Complete) · salary range · 📝 indicator when reflections exist.
- **Expandable row** (the deeper compare): the career's "Reality" one-liner,
  study/route summary, and the user's own reflections for that career. Pulled
  from the existing career catalogue + reflections data; no new content.
- **Top-3 podium styling** (medals, subtle accent) for "sexy" without
  gamifying a score. Smooth reorder transition.

## Interactions

- **Reorder**: drag handle **and** up/down arrow buttons per row (arrows are
  clearer on mobile and keyboard-accessible). Either action sets manual order.
- **Out of the running**: relegate a career to the dimmed zone (the "tag"
  mechanic — promotion/relegation gives the league-table feel). One tap (`↩`)
  to bring it back into the standings.
- **Reset to suggested**: clears manual order, returns to auto ranking.

## Data model + persistence

Server-backed so it persists cross-device and the dashboard can read the
current #1.

- Add a **nullable JSON column** `decisionBoard Json?` to `YouthProfile`:
  `{ order: string[], ruledOut: string[] }` where strings are career ids
  (slugs). `order` is the user's manual ordering (empty/absent ⇒ use auto
  order); `ruledOut` is the relegated set.
- **Additive migration** (new nullable column) — flagged for the prod
  `migrate deploy`, consistent with prior migrations.
- **API**: `GET /api/journey/decision-board` (returns `{ order, ruledOut }`)
  and `PUT /api/journey/decision-board` (persists them). Reuses the
  session-auth + `withDbRetry` patterns from `/api/goals`.

## Ranking + assembly (client)

A pure helper, `buildDecisionBoard(entries, interestLevels, board)`, takes the
explored-journey entries + interest map + persisted `{order, ruledOut}` and
returns the ordered, ranked rows (+ the relegated set + the "lean" summary).
Pure and unit-testable, mirroring `buildExploringGroups`.

## Dashboard entry point

A compact **"Where you're leaning"** card near "My Explored Journeys":

```
WHERE YOU'RE LEANING                          See the board →
💰 Financial Advisor  ★★★★★  ✓ Complete
You've explored 4 careers — see how they stack up.
```

- Reads the board's current #1 (manual order if set, else auto).
- Links to `/library?tab=decision`.
- Empty state (fewer than 2 explored careers): a gentle "explore a couple of
  careers and they'll start stacking up here" rather than an empty card.

## Scope

**In (v1):**
- Decision Board as the first My Library tab (replacing Compared).
- Auto-rank (interest ★ → progress tiebreak) + manual reorder (drag + arrows).
- "Out of the running" relegation + "Reset to suggested".
- Top-3 podium, lean headline, expandable rows (reality + study + reflections).
- Server persistence (`decisionBoard` JSON + API) and additive migration.
- Dashboard "Where you're leaning" teaser card.

**Out (later / v2):**
- Blended numeric "Fit" score.
- Adding non-explored saved careers to the board.
- 2-up side-by-side compare (reuse `CompareModal`).
- Export/share, reflection sentiment analysis.

## Testing

- Unit-test `buildDecisionBoard` (auto order, manual override, tie-breaks,
  ruled-out exclusion, lean summary).
- Unit-test the API route shape (auth required; round-trips `{order, ruledOut}`).
- Verify the My Library tab order + dashboard teaser render with and without
  explored careers (empty states).

## Risks / notes

- **Comparison framing vs CLAUDE.md "no youth comparison systems":** that rule
  targets *social* comparison (leaderboards vs other people, follower counts).
  This board compares the user's **own** explored careers privately — aligned
  with "clarity," not social scoring. We deliberately avoid a numeric score on
  each career to stay clear of gamification.
- **Parallel-agent churn:** `library/page.tsx` and `dashboard/page.tsx` are
  actively edited; implement off the latest `origin/main` and reconcile at
  merge.
