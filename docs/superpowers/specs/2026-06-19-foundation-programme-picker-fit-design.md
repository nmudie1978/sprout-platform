# Foundation: Study-Programme picker + programme↔career fit flag — Design

**Date:** 2026-06-19
**Branch:** `feat/foundation-programme-picker-fit`

## Problem

On the My Journey → Clarity "Your Starting Point" foundation modal, the
university (and college) stage shows a **school-subjects picker** ("Your
Subjects": Physics, Biology…). For someone who has told us they're *at
university studying robotics*, school subjects are the wrong mental model —
redundant, school-portal-ish, and (owner-confirmed) not necessary. The
free-text "Study Programme" box is also inert: nothing downstream consumes it
beyond display, so it's decorative.

Owner asks: (1) make the programme input *useful*, ideally a dropdown like the
Career Radar "already studying" field; (2) when the programme clearly doesn't
lead to the chosen career (Robotics programme → Psychologist goal), the roadmap
should **honestly flag** that on re-generation.

## Decisions (owner)

- **Study Programme → type-ahead picker** reusing the `FIELD_OPTIONS` source
  behind Radar's degree picker (#433). Resolving the programme to a known field
  makes the fit check deterministic, not fuzzy. Custom free-text still allowed.
- **Drop the school-subjects picker for university + college.** Keep it for the
  school stage (where subjects are the right input).
- **No separate "modules" field** — the structured programme picker is enough.
- **Fit flag = quiet badge only.** A small caution badge with a tooltip on the
  foundation card; non-blocking; default-silent when unsure.
- **Scope: university + college** (both have a study programme).

## What subjects/programme actually drive today (verified)

- `currentSubjects` and `studyProgram` do **NOT** feed roadmap timeline
  generation. Subjects power a foundation-card subject-alignment badge — which
  is already **null for users 18+** (`foundation-banner.tsx:84`) — and Study-Path
  alignment in the Understand tab.
- So removing the subject picker at university stage has **no effect on the
  roadmap** and no effect on the badge for 18+ users.

## Design

### 1. Programme picker component

New `src/components/journey/timeline/programme-picker.tsx` — a small controlled
type-ahead:
- `searchFields(query)` (from `@/lib/discover/field-options`) for suggestions
  (top 8); selecting sets the value to the field's canonical `label`.
- Free typing is preserved (custom programmes allowed). Click-outside closes.
- Matches the dialog's existing input styling.

In `timeline-detail-dialog.tsx`: replace the free-text Study-Programme `<input>`
(lines 611–616) with `<ProgrammePicker value={studyProgram} onChange={v => { setStudyProgram(v); setDirty(true); }} />`.
No schema change — `studyProgram` stays a string (now usually a canonical field
label); programme→discipline is resolved at read time.

### 2. Hide subjects for university + college

In `timeline-detail-dialog.tsx`, gate the "Your Subjects" block (lines 666–758)
on `eduStage === 'school'` instead of the current
`eduStage !== 'other' && eduStage !== 'between'`. School keeps the picker;
college/university lose it. Previously-saved subjects remain in the DB and are
still loaded into state, so save is non-destructive (no data loss).

### 3. Programme↔career fit helper

New `src/lib/education/programme-fit.ts`:

```
resolveProgrammeField(text): FieldOption | null   // exact label, then exact alias; else null
programmeCareerFit(programme, careerIdOrTitle): 'fit' | 'mismatch' | 'unknown'
```

Algorithm (conservative — minimise false positives):
1. Resolve programme → `FieldOption`. If none → `unknown` (silent).
2. `reachable = getCareersForField(field.id)`; resolve career via
   `resolveCareer()` to a catalogue id. If the career is reachable → `fit`.
3. Compute the programme's discipline set: synthetic field → the disciplines of
   its curated `careerIds` (via `getDisciplineForCareer`); discipline-backed
   field → `[field.id]`.
4. `careerDiscipline = getDisciplineForCareer(career)`. If unknown → `unknown`.
5. If the career's discipline is **not** in the programme's discipline set →
   `mismatch`; else `fit`.

So Robotics→Psychologist = `mismatch`; Robotics→Data Scientist / Robotics
Engineer = `fit`; unrecognised programme = `unknown` (silent).

### 4. Surface the badge (reuse existing slot)

The foundation card already renders an `AlignmentGate` badge (rose `AlertCircle`
for non-aligned) driven by `subjectHint`, which is null for 18+ users. In
`shared-roadmap.ts`, extend the `alignmentGate` memo: if there's no
subject-based gate **and** the user's stage is university/college **and**
`programmeCareerFit(studyProgram, careerTitle) === 'mismatch'`, return:

```
{ level: 'gap', tooltip: `A ${studyProgram} programme doesn't usually lead
straight into ${careerTitle}. That's okay — changing direction is normal, and
usually means a conversion course or postgraduate step. Worth checking this fits.` }
```

This reuses the existing badge UI (no renderer changes; shows on the winding-road
roadmap, same as today's subject badge). `useFoundationData` already returns
`eduContext`; `shared-roadmap.ts` will destructure it.

## Out of scope

- No roadmap step insertion / "bridge step" (owner chose badge-only).
- No DB schema change.
- Stepping-stones renderer parity for the badge (it doesn't render the existing
  subject badge either — unchanged).

## Verification

- New unit test `programme-fit.test.ts`: mismatch (robotics→psychologist), fit
  (robotics→robotics-engineer, psychology→psychologist), unknown (gibberish
  programme; missing inputs).
- `tsc` (source) clean · full `vitest` suite green · `eslint` clean.
- Optional headless render check of the foundation modal via a `/dev` page.
