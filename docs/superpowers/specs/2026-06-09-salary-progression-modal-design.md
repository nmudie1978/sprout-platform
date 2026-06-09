# Salary Progression Modal — Design

**Date:** 2026-06-09
**Status:** Approved (owner approved all sections)
**Branch:** `feat/salary-progression-modal`

## Problem

The Discover-tab salary card + "See full progression →" link **already open a
popup** (`showSalaryPopup`). Inside, `SalaryProgressionChart` renders a recharts
**bar** chart — but only for the **~14 careers** with hand-curated data in
`salary-progression.ts`. For every other career (~98%) it returns `null`, so the
popup opens **essentially empty**. That is why progression feels absent for most
careers (including the one in the owner's screenshot).

Owner wants: salary growth (entry → senior → lead) shown as a **line graph** in
that popup, available for **all careers**.

(NOTE: there is no separate inline chart in the Understand tab —
`SalaryProgressionChart` is used *only* inside this popup. The fix is to upgrade
the popup's contents + make the data universal.)

## Decisions (from brainstorm)

| Question | Decision |
|----------|----------|
| Coverage | **Synthesize** a progression from each career's typical range, labelled "Estimated"; curated data wins where it exists |
| Chart | **Line + shaded range band** (avg line, min–max band per level) |
| Trigger / surface | **Upgrade the existing popup** — the salary card + link already open it; swap its bar chart for the new line+band chart fed by universal data |
| Country | Keep the existing `showsSalaryProgression(country)` gate (Norway today) |

## Section 1 — Synthesis model

Treat each career's typical `avgSalary` range as the **mid-career
("Established") band** and scale to four levels by multiplying *both* ends:

| Level | Years | Multiplier |
|-------|-------|-----------|
| Entry level | 0–2 | ×0.80 |
| Established | 3–6 | ×1.00 |
| Senior | 7–12 | ×1.28 |
| Lead / Principal | 12+ | ×1.55 |

- Round each value to the nearest 10k.
- ~+55–95% entry→lead — a believable generic curve. Careers with unusual shapes
  (medicine, law, teaching) are the curated ones; **curated always wins**,
  synthesis is the fallback only.
- **Curated → `estimated: false`** (keeps its real source note). **Synthesized →
  `estimated: true`** with a "based on this career's typical range" note.
- **Parsing `avgSalary`:** extract the two numbers (values are like
  `"560,000 - 760,000 kr/year"`). Normalize to thousands (kK). A single-value
  salary becomes the Established midpoint with a ±10% band. If salary is
  unparseable *and* there is no curated data → return `null` (link/modal simply
  don't show — graceful, rare).
- No dated statistics introduced (synthesis is a transform; research-recency CI
  guard unaffected).

## Section 2 — Data API (`src/lib/salary-progression.ts`)

- Add `estimated?: boolean` to `SalaryProgression`.
- `buildSalaryProgression(career: { id: string; avgSalary?: string })`:
  returns curated (`estimated: false`) when `getSalaryProgression(career.id)`
  hits; else synthesizes from `career.avgSalary` (`estimated: true`); else `null`.
- Keep `getSalaryProgression(careerId)` untouched (backward-compat); the builder
  wraps it.
- Helpers extracted and unit-tested: `parseSalaryRangeK(s)` →
  `{ minK, maxK } | null`, and `synthesizeProgression({minK,maxK})` → steps.

## Section 3 — Modal (`src/components/journey/salary-progression-modal.tsx`)

- `Dialog` (existing `@/components/ui/dialog`), title "How pay grows — {career}".
- **Line + shaded range band** via recharts `ComposedChart`: an `Area` per level
  showing the min–max band (array dataKey `[min,max]`) + a `Line` for the
  typical (avg) value across Entry → Lead, plus the national-median
  `ReferenceLine`.
- Header shows an "Estimated — based on typical range" chip when
  `estimated`; curated shows its source note.
- Reuses the existing chart's formatter (`formatSalary`) and dark tooltip
  styling for visual consistency. The new chart lives alongside the existing
  `SalaryChart` in `salary-progression.tsx` (exporting/importing the shared
  `formatSalary`) to avoid duplication.

## Section 4 — Wiring (`src/app/(dashboard)/my-journey/page.tsx`)

- The popup already exists (`showSalaryPopup`, opened by the salary card + the
  "See full progression →" link). Swap its body: replace
  `<SalaryProgressionChart careerId=… />` (line ~921) with the new line+band
  chart fed by `buildSalaryProgression(career)` (passes the career object so
  synthesis can read `avgSalary`).
- Keep the existing `showsSalaryProgression(country)` gate.
- The old `SalaryProgressionChart`/`SalaryChart` bar component is left in place
  (still exports the shared `formatSalary`); remove its import from page.tsx if
  it becomes unused.

## Section 5 — Testing

`src/lib/__tests__/salary-progression.test.ts`:
- `parseSalaryRangeK` parses real `avgSalary` strings (comma thousands, "kr/year"
  suffix, en-dash/hyphen); single value → null-range handled by builder.
- Synthesized steps **strictly increase** (entry < established < senior < lead on
  both min and max); values rounded to 10k.
- `buildSalaryProgression` returns `estimated: false` for a curated career
  (`doctor`) and `estimated: true` for an uncurated one with a parseable range.
- Unparseable salary + no curated → `null`.
- Single-value salary → ±10% Established band.

## Compliance / risk

- No payments, no jobs-marketplace, no schema/DB change, no new route.
- Trust: synthesized numbers are clearly labelled "Estimated"; curated data is
  preferred. Calm framing fits the platform's accuracy/trust principle.
- Blast radius: salary card behaviour changes (navigate → modal) and the
  Understand inline chart is removed; data layer is additive.
