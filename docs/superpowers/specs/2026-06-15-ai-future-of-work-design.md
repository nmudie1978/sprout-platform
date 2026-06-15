# Insights — "AI & The Future of Work" Section

**Date:** 2026-06-15
**Status:** Approved (full spec provided by user). Built on `feat/ai-future-of-work`, NOT deployed.

## Goal
A compact, premium, calm section on `/insights` explaining how AI is reshaping
careers — framed as **enablement/transformation, not fear**. Short, visually
balanced, no walls of text; aggregated cards + modals for depth.

## Placement
Insert as **section 3**, between "What It Means for You (15–23)" and
"Skills That Matter" in `src/app/(dashboard)/insights/page.tsx`. Existing
sections unchanged.

## Architecture (matches existing insights patterns)
- **Component:** `src/components/insights/ai-future-of-work-section.tsx`
  — self-contained `"use client"`. Replicates the page's section anatomy: a
  `motion.section` → `rounded-card border-2 border-violet-500/20 dark:border-violet-500/30 bg-card p-3 sm:p-4` panel → header (color bar + centred icon chip + uppercase **FUTURE LENS** badge + title + subtitle), matching the local `SectionHeader` style (which isn't exported, so replicated, not imported — keeps the page edit to one line and avoids touching an actively-changing file).
  - **Accent:** violet (distinct from info/warning/primary sections).
  - **Icon:** `Cpu` (lucide).
- **Data:** `src/lib/insights/ai-future-of-work.ts` exports `aiFutureOfWork`
  (`header, cards, impactChips, modals, timeline`) — matches the `src/lib/insights/*`
  data convention; the component stays presentational (no hardcoded content arrays in JSX).
- **Modals:** existing `@/components/ui/dialog`.
- **i18n:** English, hardcoded (consistent with the sibling "Skills That Matter"
  section, which is also hardcoded English).

## Content (from the approved spec)
**Header** — title "AI & The Future of Work"; subtitle "How AI is changing
careers, creating new roles, and reshaping the skills young people will need.";
badge "FUTURE LENS".

**3 cards** (`grid-cols-1 sm:grid-cols-3`):
1. *How AI Changes Work* — automating routine tasks, speeding research,
   supporting decisions, new creative/technical tools. CTA **View examples**.
2. *Careers AI Is Creating* — new roles across engineering, product, safety,
   data, design, governance, business ops. CTA **Explore roles**.
3. *Human Skills Still Matter* — judgement, empathy, leadership, trust,
   communication, creativity, real-world problem solving. CTA **See skills**.

**Impact-at-a-glance row** — 4 subtle icon chips (not charts): Enhanced by AI
(`TrendingUp`), Changed by AI (`RefreshCw`), Created by AI (`Sparkles`),
Lower-risk human work (`ShieldCheck`).

**Mini timeline** (thin, understated, single row): 1950s AI research begins →
2010s deep learning accelerates → 2022 generative AI mainstream → 2025+ AI agents
reshape workflows.

**Modals:**
- *View examples* — 4 lines (designers / doctors / lawyers / teachers use AI).
- *Explore roles* — 4 clusters (Engineering; Product & Business; Safety &
  Governance; Creative & Human) with the listed roles as chips.
- *See skills* — 6 future-proof skills (critical thinking, communication, AI
  literacy, ethical judgement, creativity, problem solving).

## Responsiveness / a11y
3 cards side-by-side on `sm+`, stacked on mobile. Modals are the standard
Dialog (focus-trapped, ESC/overlay close, mobile-friendly). Chips/timeline wrap.
Icons in chips are decorative.

## Out of scope
- No new dependencies, no charts, no data-fetching (static curated content).
- No changes to other sections.

## Testing
Component render test: section title + 3 card titles + 4 impact chips render;
clicking "View examples" opens its modal with an example line. Keep suite green.

## Verification / rollout
Typecheck + lint + tests green; push `feat/ai-future-of-work` → Vercel **preview**
build (the real build gate). **No production deploy without explicit go-ahead.**
