'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, AlertCircle, RefreshCw, Play, FileText, X, Shuffle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { JourneyItem, Journey } from '@/lib/journey/career-journey-types';
import { STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import { generateFallbackTimeline, type EducationStage } from '@/lib/journey/generate-fallback-timeline';
import { sanitizeJourney } from '@/lib/journey/roadmap-rules';
import { deriveRoleEvolutionTail } from '@/lib/journey/role-evolution-tail';
import type { CardDataSummary } from './renderers/types';
import { WindingRoadRenderer, SteppingStonesRenderer } from './renderers';
import { FOUNDATION_ITEM_ID } from './renderers/foundation-banner';
import { TimelineStyleSelector } from './timeline-style-selector';
import { TimelineDetailDialog, loadCardData, cycleProgress, isStepUnlocked, enforceProgressChain } from './timeline';
import { useCareerCatalog } from '@/hooks/use-career-catalog';
import { useRoadmapCardData } from '@/hooks/use-roadmap-card-data';
import { useTimelineStyle } from '@/hooks/use-timeline-style';
import { markClarityActive } from '@/lib/journey/lens-progress';
import { useRoadmapSimulation, type SimulationControls as SimCtrl } from '@/hooks/use-roadmap-simulation';
import { SimulationControls } from './simulation';
import type { NarrationContext } from '@/lib/simulation/narration-generator';
import { generateScenarios, buildScenarioOverlay, type Scenario } from '@/lib/simulation/scenario-engine';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface PersonalCareerTimelineProps {
  primaryGoalTitle: string | null;
  overrideJourney?: Journey | null;
  readOnly?: boolean;
  /**
   * Called once the timeline data loads, passing a `play` function that
   * the parent (Clarity tab) can attach to a "Play Journey" button.
   */
  onSimulationReady?: (controls: { play: () => void }) => void;
  /**
   * When true, the roadmap renderer scales to fit the available width instead
   * of scrolling sideways. Set by the fullscreen overlay so the whole road
   * fits one screen.
   */
  fitToWidth?: boolean;
}

const RENDERERS = {
  winding: WindingRoadRenderer,
  'stepping-stones': SteppingStonesRenderer,
} as const;

export function PersonalCareerTimeline({ primaryGoalTitle, overrideJourney, readOnly = false, onSimulationReady, fitToWidth }: PersonalCareerTimelineProps) {
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  // Report dialog open state — declared with the other top-level hooks so it
  // is never called after one of this component's early returns below.
  const [reportOpen, setReportOpen] = useState(false);
  // Quick aggregated milestone view — a lightweight "when do I hit each step"
  // popup, distinct from the full PDF-style report.
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { style, setStyle } = useTimelineStyle();
  // "Show years" toggle — persists across sessions via localStorage so
  // users who prefer calendar-year stamps on every step don't have to
  // re-toggle on each visit. Hydrated in an effect (not the useState
  // initializer) so SSR + iOS Safari private tabs (where localStorage
  // access throws) don't crash the render.
  const [showYears, setShowYears] = useState<boolean>(false);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem('journey-show-years') === '1') {
        setShowYears(true);
      }
    } catch { /* private-tab / quota — fall back to default */ }
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('journey-show-years', showYears ? '1' : '0');
      }
    } catch { /* private-tab / quota — silently skip persistence */ }
  }, [showYears]);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const goalId = primaryGoalTitle ? slugify(primaryGoalTitle) : undefined;
  useRoadmapCardData(goalId);

  // Foundation card data — persisted at profile level (survives goal
  // changes). Source of truth is `/api/journey/foundation-data` which
  // reads/writes `youthProfile.foundationCardData`. The timeline
  // mirrors it into localStorage under `roadmap-card-data[my-foundation]`
  // so the Foundation card render path (`cardDataMap` useMemo below)
  // can read it synchronously via `loadCardData(FOUNDATION_ITEM_ID)`.
  const foundationSyncRef = useRef<NodeJS.Timeout | null>(null);

  // Load foundation data from DB on mount AND on goal change. Two
  // important pieces here:
  //
  // 1. Dependency on `primaryGoalTitle` — when the user switches
  //    career, `useRoadmapCardData` hydrates per-goal card data in
  //    parallel and may leave a stale or missing foundation slot in
  //    localStorage. Re-fetching the profile-level source here on
  //    goal change guarantees the freshest value wins regardless of
  //    race ordering.
  //
  // 2. `setSaveVersion` bump after the fetch resolves — the display
  //    path (`cardDataMap` useMemo, line ~298) is keyed on
  //    `[journey, saveVersion]`, so without a version bump the memo
  //    never recomputes after the async fetch completes and the
  //    Foundation card renders with stale/empty localStorage values
  //    until the user interacts with something else. Bumping
  //    saveVersion forces `cardDataMap` to re-read localStorage and
  //    the Foundation card shows the freshly hydrated data
  //    immediately. This is the fix for the "foundation data missing
  //    until I save" bug on career switch.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/journey/foundation-data')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.foundationCardData) {
          try {
            const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
            all[FOUNDATION_ITEM_ID] = data.foundationCardData;
            localStorage.setItem('roadmap-card-data', JSON.stringify(all));
          } catch { /* silent */ }
          // Force the cardDataMap useMemo to recompute so the card
          // picks up the fresh localStorage values without requiring
          // the user to interact with the roadmap first.
          setSaveVersion((v) => v + 1);
        }
      })
      .catch(() => { /* silent */ });
    return () => {
      cancelled = true;
    };
  }, [primaryGoalTitle]);

  // Sync foundation data to DB (debounced)
  const syncFoundationToDb = useCallback(() => {
    if (foundationSyncRef.current) clearTimeout(foundationSyncRef.current);
    foundationSyncRef.current = setTimeout(() => {
      try {
        const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
        const fData = all[FOUNDATION_ITEM_ID];
        if (fData) {
          fetch('/api/journey/foundation-data', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foundationCardData: fData }),
          }).catch(() => { /* silent */ });
        }
      } catch { /* silent */ }
    }, 2000);
  }, []);

  // Education stage drives roadmap branching — read it from the saved
  // education context so the whole timeline (foundation + downstream
  // steps) stays in sync with what the user has told us about where
  // they actually are.
  const { data: educationContextData } = useQuery<{
    educationContext: { stage?: EducationStage; expectedCompletion?: string; currentRole?: string } | null;
  }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const educationStage: EducationStage | undefined =
    educationContextData?.educationContext?.stage;
  const expectedCompletion: string | undefined =
    educationContextData?.educationContext?.expectedCompletion;
  const currentRole: string | undefined =
    educationContextData?.educationContext?.currentRole;

  // The user's age — needed by the client-side fallback so it renders
  // an accurate placeholder roadmap while the AI version loads. Without
  // this, the placeholder defaults to age 16 and an 18-year-old briefly
  // sees a roadmap labelled "Age 16" before it snaps to the real one.
  const { data: profileData } = useQuery<{
    displayName?: string | null;
    user?: { dateOfBirth?: string | null } | null;
  }>({
    queryKey: ['profile-dob'],
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return {};
      return res.json();
    },
    // Short stale window so renaming in /profile reflects in the
    // roadmap header on the very next mount / focus, instead of
    // waiting up to 30 minutes for the cached payload to expire.
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const userAge: number | undefined = useMemo(() => {
    const dob = profileData?.user?.dateOfBirth;
    if (!dob) return undefined;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }, [profileData]);

  // Foundation completion status — drives whether we drop the leading
  // education steps. Recomputes on every saveVersion bump so toggling
  // Complete on the Foundation card cleanly re-renders the roadmap.
  const foundationComplete = useMemo(() => {
    return loadCardData(FOUNDATION_ITEM_ID).status === 'done';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion]);

  // Generate a client-side fallback so the roadmap renders instantly
  const fallbackJourney = useMemo(
    () => primaryGoalTitle ? generateFallbackTimeline(primaryGoalTitle, userAge, educationStage, foundationComplete, expectedCompletion) : null,
    [primaryGoalTitle, userAge, educationStage, foundationComplete, expectedCompletion]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<{ journey: Journey; cached: boolean }>({
    // Stage + foundation completion are part of the key so changing
    // either cleanly invalidates the previous timeline rather than
    // showing a stale "Complete Videregående" step to a university
    // graduate (or "Continue studying" to someone who marked their
    // Foundation as Complete).
    queryKey: ['personal-career-timeline', primaryGoalTitle, educationStage ?? 'default', foundationComplete ? 'done' : 'open', expectedCompletion ?? 'none', currentRole ?? 'no-role'],
    queryFn: async () => {
      const res = await fetch('/api/journey/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: primaryGoalTitle, educationStage, foundationComplete, expectedCompletion, currentRole }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate timeline' }));
        throw new Error(err.error || 'Failed to generate timeline');
      }

      return res.json();
    },
    // Gate on having education context + user age loaded so the query
    // fires with the correct key (including finish year). Without this,
    // the query fires with 'none' as the finish-year key, the result
    // arrives un-anchored, and briefly overwrites the correctly-anchored
    // fallback before the education context resolves and triggers a
    // second query — visible as a "flash" of wrong ages.
    enabled: !!primaryGoalTitle && educationContextData !== undefined && userAge !== undefined,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    // Show fallback roadmap instantly while AI version loads
    placeholderData: fallbackJourney ? { journey: fallbackJourney, cached: false } : undefined,
  });

  const rawJourney = overrideJourney ?? data?.journey ?? null;

  // Apply the shared roadmap rules engine — strips career name,
  // duration phrases, restated foundation steps, forces verb-led
  // titles, AND anchors the timeline to the user's stated finish year.
  // See src/lib/journey/roadmap-rules.ts.
  //
  // Passing the foundation context lets the sanitiser shift the first
  // post-foundation step (and everything after) to the user's age at
  // their expectedCompletion year. Without this, AI-generated timelines
  // that ignore the prompt's "anchor to finish year" instruction would
  // leak through unchanged — which is exactly what was happening when a
  // user set finish year to 2034 and saw university still starting at
  // their current age.
  const journey = useMemo<Journey | null>(
    () =>
      rawJourney
        ? sanitizeJourney(rawJourney, {
            currentAge: userAge,
            currentYear: new Date().getFullYear(),
            expectedFinishYear: expectedCompletion,
          })
        : null,
    [rawJourney, userAge, expectedCompletion]
  );

  const careerName = journey?.career ?? '';

  // ── Voice-guided simulation ───────────────────────────────────────
  // Catalog fetched async (from the cached /api/careers/catalog) instead of a
  // static import, so the ~740KB CAREER_PATHWAYS constant stays out of the
  // /my-journey + /dashboard client bundles. Returns empty until loaded; the
  // only use here is an optional salary lookup, so it degrades gracefully.
  const { getCareerById, getAllCareers } = useCareerCatalog();

  const narrationCtx = useMemo<NarrationContext | null>(() => {
    if (!journey || !primaryGoalTitle) return null;
    return {
      journey,
      userName: profileData?.displayName ?? undefined,
      userAge,
      education: educationContextData?.educationContext
        ? {
            stage: educationContextData.educationContext.stage,
            schoolName: (educationContextData.educationContext as Record<string, unknown>).schoolName as string | undefined,
            studyProgram: (educationContextData.educationContext as Record<string, unknown>).studyProgram as string | undefined,
            expectedCompletion: educationContextData.educationContext.expectedCompletion,
            currentSubjects: (educationContextData.educationContext as Record<string, unknown>).currentSubjects as string[] | undefined,
          }
        : null,
      careerTitle: primaryGoalTitle,
      salaryRange: (() => {
        const slug = primaryGoalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const career = getCareerById(slug) ?? getAllCareers().find(c => c.title === primaryGoalTitle);
        return career?.avgSalary;
      })(),
    };
  }, [journey, primaryGoalTitle, profileData, userAge, educationContextData, getCareerById, getAllCareers]);

  // ── Role-evolution coda ───────────────────────────────────────────
  // Deterministic "how the role grows from here" tail, derived purely from
  // bundled progression data (no fetch). The career id is the goal title's
  // slug (career ids ARE title slugs), refined via the catalog when loaded.
  // entry-role age = the roadmap's end age (its last milestone), which the
  // coda grows from. Null for careers with no progression data → no coda.
  const evolutionTail = useMemo(() => {
    if (!journey || !primaryGoalTitle) return null;
    const slug = primaryGoalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const careerId =
      getCareerById(slug)?.id ??
      getAllCareers().find((c) => c.title === primaryGoalTitle)?.id ??
      slug;
    const entryRoleAge =
      journey.items.length > 0
        ? Math.max(...journey.items.map((i) => i.endAge ?? i.startAge))
        : journey.startAge;
    return deriveRoleEvolutionTail(careerId, entryRoleAge);
  }, [journey, primaryGoalTitle, getCareerById, getAllCareers]);

  const [simState, simControls] = useRoadmapSimulation(journey, narrationCtx);

  // Foundation gate — the user must fill in their starting point before
  // the voice-guided simulation is available. Without foundation data the
  // narration can't be personalised (school, subjects, finish year).
  const hasFoundation = !!educationContextData?.educationContext?.stage;

  // Starting-point guidance gate. Until the user tells us where they are
  // today, the roadmap runs on defaults and doesn't re-tailor to them —
  // which isn't obvious. Show a calm callout (only once the context query
  // has resolved, so it never flashes during load, and only when there's
  // a goal to build a roadmap from). It auto-hides the moment the user
  // saves their starting point (the dialog invalidates education-context).
  const startingPointEmpty =
    !readOnly && !!primaryGoalTitle && educationContextData !== undefined && !hasFoundation;

  const guardedPlay = useCallback(() => {
    if (!hasFoundation) {
      toast({
        title: 'Fill in your starting point first',
        description: 'Tap "Your Foundation" on the roadmap to add your school, subjects, and finish year — then you can play your journey.',
      });
      return;
    }
    simControls.play();
  }, [hasFoundation, simControls]);

  // Expose play function to parent (Clarity tab's "Play Journey" button).
  // Use a ref for the callback to avoid re-triggering when the parent
  // passes an inline arrow (new reference every render).
  const onSimReadyRef = useRef(onSimulationReady);
  onSimReadyRef.current = onSimulationReady;
  useEffect(() => {
    if (onSimReadyRef.current && journey) {
      onSimReadyRef.current({ play: guardedPlay });
    }
  }, [journey, guardedPlay]);

  // ── Scenario toggle (university + employer path variations) ────────
  const scenarios = useMemo<Scenario[]>(() => {
    if (!primaryGoalTitle) return [];
    const slug = primaryGoalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return generateScenarios(slug, primaryGoalTitle);
  }, [primaryGoalTitle]);

  const [scenarioIndex, setScenarioIndex] = useState<number | null>(null);

  const activeScenario = scenarioIndex !== null ? scenarios[scenarioIndex] ?? null : null;
  const scenarioOverlay = useMemo(() => {
    if (!activeScenario || !journey) return null;
    return buildScenarioOverlay(journey.items, activeScenario);
  }, [activeScenario, journey]);

  const cycleScenario = useCallback(() => {
    if (scenarios.length === 0) return;
    setScenarioIndex((prev) => {
      if (prev === null) return 0;
      const next = prev + 1;
      return next >= scenarios.length ? null : next;
    });
  }, [scenarios.length]);

  // Build per-node card data summaries for visual indicators on the roadmap
  const cardDataMap = useMemo<Record<string, CardDataSummary>>(() => {
    if (!journey) return {};
    // Defensive: repair any inconsistent chain (e.g. step 3 done while
    // step 2 isn't) before reading. Catches stale state from older
    // builds and from the manual back-anchor.
    enforceProgressChain(journey.items.map((i) => i.id));
    const map: Record<string, CardDataSummary> = {};
    for (const item of journey.items) {
      const d = loadCardData(item.id);
      map[item.id] = {
        status: d.status || 'not_started',
        stickyNote: d.stickyNote,
        hasStickyNote: Boolean(d.stickyNote),
        hasNotes: Boolean(d.notes),
      };
    }
    // Include foundation card data
    const fd = loadCardData(FOUNDATION_ITEM_ID);
    map[FOUNDATION_ITEM_ID] = {
      status: fd.status || 'not_started',
      stickyNote: fd.stickyNote,
      hasStickyNote: Boolean(fd.stickyNote),
      hasNotes: Boolean(fd.notes),
    };
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey, saveVersion]);

  const handleProgressCycle = useCallback((itemId: string) => {
    if (readOnly) return; // reference routes never save user state
    const orderedIds = (journey?.items ?? []).map(it => it.id);
    if (!isStepUnlocked(itemId, orderedIds)) {
      toast({ title: 'Complete the previous step first', variant: "destructive" });
      return;
    }
    cycleProgress(itemId);
    // Whenever the user actively cycles a step we mark Clarity as
    // "active" for the current career — this is the per-career signal
    // the dashboard reads instead of scanning the global
    // roadmap-card-data blob (which leaks across goals).
    if (loadCardData(itemId).status === 'done') {
      markClarityActive(primaryGoalTitle);
    }
    // Cascade-fix: a later step can never stay done while an earlier
    // one is incomplete. If the user just demoted a step from done,
    // every later done step gets reset to not_started.
    enforceProgressChain(orderedIds);
    setSaveVersion((v) => v + 1);
    if (itemId === FOUNDATION_ITEM_ID) {
      syncFoundationToDb();
    }
  }, [syncFoundationToDb, journey, readOnly, primaryGoalTitle]);

  // Export as image — must be declared before any early returns
  const handleExport = useCallback(async () => {
    if (!roadmapRef.current || !careerName) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(roadmapRef.current, {
        backgroundColor: '#0f1117',
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `roadmap-${careerName.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    } catch {
      toast({ title: 'Failed to export roadmap', variant: "destructive" });
    }
  }, [careerName]);

  if (!primaryGoalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
        <Target className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          Set your primary goal to see your career roadmap
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Generating your roadmap...</span>
        </div>
        <Skeleton className="h-[340px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/20 p-6 text-center">
        <AlertCircle className="h-6 w-6 mx-auto text-red-400/60 mb-2" />
        <p className="text-sm text-red-400/80">
          {error instanceof Error ? error.message : 'Failed to generate roadmap'}
        </p>
      </div>
    );
  }

  if (!journey) return null;

  // Show "personalising" when we're displaying fallback while AI version loads
  const isPreliminary = isFetching && !data?.cached;
  const Renderer = RENDERERS[style] || WindingRoadRenderer;

  // Timeline summary
  const firstAge = journey.startAge;
  const lastAge = journey.items.length > 0
    ? Math.max(...journey.items.map((i) => i.endAge ?? i.startAge))
    : firstAge;
  const spanYears = lastAge - firstAge;

  // For a return-to-work ('between') or career-change ('other') starting
  // point, the number that matters is "how long until I'm (back) in a role
  // in this field" — not the full age span out to a senior position. A
  // 12-year "Age 21–33" headline reads wrong for someone who just wants
  // back into work. Measure instead to the first work milestone (the first
  // experience/career step), falling back to the full span otherwise.
  // `EducationStage` is typed without 'between' (a runtime-only value the
  // Foundation editor saves for "Not in work"), so compare as string.
  const stageStr = educationStage as string | undefined;
  const isReturnToWork = stageStr === 'between' || stageStr === 'other';
  const firstWorkAge = (() => {
    const work = journey.items.filter((i) => i.stage === 'experience' || i.stage === 'career');
    return (work.find((i) => i.isMilestone) ?? work[0])?.startAge;
  })();
  const transitionYears =
    isReturnToWork && firstWorkAge != null ? Math.max(1, firstWorkAge - firstAge) : null;
  const transitionLabel =
    stageStr === 'between' ? 'Time to get back into work' : 'Time to transition';

  // Education track label — detect what kind of education path
  const eduStages = journey.items.filter((i) => i.stage === 'education');
  const eduLabel = eduStages.some((i) => i.title.toLowerCase().includes('university') || i.title.toLowerCase().includes('degree'))
    ? 'University'
    : eduStages.some((i) => i.title.toLowerCase().includes('apprentice'))
      ? 'Apprenticeship'
      : 'Education';

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setSummaryOpen(true)}
          title="See your roadmap at a glance"
          className="text-[11px] text-muted-foreground/75 hover:text-foreground/80 transition-colors group flex items-center gap-1.5"
        >
          {transitionYears != null ? (
            <>
              <FileText className="h-3 w-3 text-muted-foreground/65 group-hover:text-foreground/60 shrink-0" />
              <span>
                <span className="font-semibold text-foreground/85 group-hover:text-foreground">{transitionLabel}:</span> ~{transitionYears} year{transitionYears !== 1 ? 's' : ''}
              </span>
            </>
          ) : spanYears > 0 ? (
            <>
              <FileText className="h-3 w-3 text-muted-foreground/65 group-hover:text-foreground/60 shrink-0" />
              <span>
                <span className="font-semibold text-foreground/85 group-hover:text-foreground">Total roadmap:</span> ~{spanYears} year{spanYears !== 1 ? 's' : ''} · Age {firstAge}–{lastAge}
              </span>
            </>
          ) : null}
        </button>
        <div className="flex items-center gap-2">
          {/* Play Journey — inline play button. Gated on foundation:
              if the user hasn't filled in their starting point the button
              still shows but triggers a toast guiding them to do so. */}
          {!simState.isPlaying && !simState.isPaused && (
            <button
              onClick={guardedPlay}
              disabled={!journey}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors disabled:opacity-30",
                hasFoundation
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/25"
                  : "bg-muted/30 border-border/40 text-muted-foreground/60 hover:bg-muted/40"
              )}
              title={hasFoundation ? "Play a voice-guided narration of your roadmap" : "Fill in your starting point first to unlock Play"}
            >
              <Play className="h-3 w-3" />
              Play
            </button>
          )}
          {/* Scenario toggle — cycles through uni+employer path variations */}
          {scenarios.length > 0 && (
            <button
              onClick={cycleScenario}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors',
                activeScenario
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25'
                  : 'bg-muted/20 border-border/40 text-muted-foreground/60 hover:bg-muted/30',
              )}
              title={activeScenario
                ? `Showing: ${activeScenario.label}\n${activeScenario.university.name} (${activeScenario.university.city}) → ${activeScenario.employer.name} (${activeScenario.employer.city})\n\nClick to see the next scenario`
                : 'Toggle through different university and employer path scenarios.\nEach click shows a different combination of where you could study and where you could work.'
              }
            >
              <Shuffle className="h-3 w-3" />
              {activeScenario ? activeScenario.label : 'Scenarios'}
            </button>
          )}
          {/* Years toggle — flips every step's label between
              "Age 17" and "Age 17 · 2026". Only useful when we
              actually know userAge (otherwise there's no birth year
              to compute from), so the control hides itself otherwise. */}
          {userAge != null && (
            <button
              type="button"
              onClick={() => setShowYears((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors',
                showYears
                  ? 'bg-teal-500/15 border-teal-500/30 text-teal-300 hover:bg-teal-500/25'
                  : 'bg-muted/20 border-border/40 text-muted-foreground/70 hover:bg-muted/30',
              )}
              title={showYears ? 'Hide calendar years on each step' : 'Show calendar years next to each step age'}
              aria-pressed={showYears}
            >
              {showYears ? 'Years on' : 'Show years'}
            </button>
          )}
          <TimelineStyleSelector value={style} onChange={setStyle} />
        </div>
      </div>

      {/* Roadmap report dialog */}
      {reportOpen && (
        <RoadmapReportDialog
          journey={journey}
          careerTitle={primaryGoalTitle}
          firstAge={firstAge}
          lastAge={lastAge}
          spanYears={spanYears}
          eduLabel={eduLabel}
          onClose={() => setReportOpen(false)}
        />
      )}

      {/* Roadmap summary — an elegant "at a glance" vertical timeline of every
          milestone and the age you reach it. Quick, scannable; the full report
          is one tap deeper. */}
      {summaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSummaryOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Roadmap summary"
        >
          <div
            className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-violet-400 to-amber-400" />

            <button
              type="button"
              onClick={() => setSummaryOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-4 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-5 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Your roadmap at a glance
              </p>
              {primaryGoalTitle && (
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  Becoming a {primaryGoalTitle}
                </h3>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <FileText className="h-3 w-3" />
                ~{spanYears} year{spanYears !== 1 ? 's' : ''} · Age {firstAge}–{lastAge}
              </div>
            </div>

            {/* Vertical milestone timeline */}
            <div className="max-h-[52vh] overflow-y-auto px-6 pb-2">
              <ol className="relative ml-1 space-y-4 border-l border-border/40 pl-5">
                {[...journey.items]
                  .sort((a, b) => a.startAge - b.startAge)
                  .map((it, i) => {
                    const cfg = STAGE_CONFIG[it.stage];
                    const ageLabel =
                      it.endAge && it.endAge > it.startAge
                        ? `Age ${it.startAge}–${it.endAge}`
                        : `Age ${it.startAge}`;
                    return (
                      <li key={`${it.id}-${i}`} className="relative">
                        {/* node */}
                        <span
                          className="absolute -left-[27px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-card"
                          style={{
                            background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                          }}
                        />
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-semibold leading-snug text-foreground/90">
                            {it.title}
                          </p>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ color: cfg.color, backgroundColor: `${cfg.color}1f` }}
                          >
                            {ageLabel}
                          </span>
                        </div>
                        {it.subtitle && (
                          <p className="mt-0.5 text-xs leading-snug text-muted-foreground/75">
                            {it.subtitle}
                          </p>
                        )}
                      </li>
                    );
                  })}
              </ol>
            </div>

            {/* Footer → full report */}
            <div className="flex items-center justify-end border-t border-border/40 px-6 py-3">
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  setReportOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View full report
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personalising banner — a clear, centred cue that the roadmap is being
          recalculated for the user (e.g. right after they save their starting
          point). Shown while the AI-personalised version loads over the
          instantly-rendered fallback, and disappears on its own once ready. */}
      {isPreliminary && (
        <div className="mb-3 flex justify-center">
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Personalising your roadmap…
          </div>
        </div>
      )}

      {/* Starting-point guidance — calm, actionable callout shown only
          when the user hasn't filled in their starting point yet. Makes
          it obvious that this step comes first and that completing it
          re-tailors the roadmap. Tapping it opens the same Foundation
          editor as the "Your Starting Point" step; it disappears on save. */}
      {startingPointEmpty && (
        <button
          type="button"
          onClick={() =>
            setSelectedItem({
              id: FOUNDATION_ITEM_ID,
              stage: 'foundation',
              title: 'Your Starting Point',
              startAge: userAge ?? journey.startAge,
              isMilestone: false,
              icon: 'Target',
            })
          }
          className="group mb-3 flex w-full items-center gap-3 rounded-card border border-teal-500/30 bg-teal-500/[0.07] px-4 py-3 text-left transition-colors hover:border-teal-500/50 hover:bg-teal-500/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-500/30 animate-pulse">
            <Target className="h-4 w-4 text-teal-500" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Start here — add your starting point
            </span>
            <span className="block text-xs text-muted-foreground/80 leading-snug">
              Tell us where you are today (school, studies or work) and we&rsquo;ll tailor this roadmap to you.
            </span>
          </span>
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-300">
            Add details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </button>
      )}

      {/* Roadmap */}
      <div ref={roadmapRef}>
        <Renderer
          key={`${style}-${saveVersion}`}
          journey={journey}
          onItemClick={simState.isPlaying ? () => {} : (item) => setSelectedItem(item)}
          overlayData={{}}
          activeLayers={{ progress: false, reflections: false, resources: false, confidence: false }}
          userAge={journey.startAge}
          cardDataMap={cardDataMap}
          onProgressCycle={handleProgressCycle}
          careerTitle={primaryGoalTitle ?? undefined}
          readOnly={readOnly || simState.isPlaying}
          fitToWidth={fitToWidth}
          showYears={showYears}
          birthYear={userAge != null ? new Date().getFullYear() - userAge : undefined}
          simulation={
            simState.isPlaying || simState.isPaused
              ? {
                  isPlaying: simState.isPlaying,
                  currentStepIndex: simState.currentStepIndex,
                  progress: simState.narrationProgress,
                }
              : undefined
          }
          scenarioOverrides={scenarioOverlay?.stepOverrides}
          evolutionTail={readOnly || simState.isPlaying ? null : evolutionTail}
        />
      </div>

      {/* Simulation controls — sticky bar at the bottom during playback */}
      {(simState.isPlaying || simState.isPaused || simState.isCompleted) && (
        <SimulationControls state={simState} controls={simControls} />
      )}

      {/* Card detail popup */}
      <TimelineDetailDialog
        item={selectedItem}
        allItems={journey.items}
        careerTitle={primaryGoalTitle ?? undefined}
        open={!!selectedItem}
        onSaved={() => {
          setSaveVersion((v) => v + 1);
          // If saving foundation data, sync to profile-level DB storage
          if (!readOnly && selectedItem?.id === FOUNDATION_ITEM_ID) {
            syncFoundationToDb();
          }
        }}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      />
    </div>
  );
}

// ── Roadmap Report Dialog ─────────────────────────────────────────────────────

const STAGE_STYLES: Record<string, { label: string; dot: string }> = {
  foundation: { label: 'Foundation', dot: 'bg-amber-400' },
  education:  { label: 'Education',  dot: 'bg-blue-400' },
  experience: { label: 'Experience', dot: 'bg-emerald-400' },
  career:     { label: 'Career',     dot: 'bg-violet-400' },
};

function RoadmapReportDialog({
  journey,
  careerTitle,
  firstAge,
  lastAge,
  spanYears,
  eduLabel,
  onClose,
}: {
  journey: Journey;
  careerTitle: string | null;
  firstAge: number;
  lastAge: number;
  spanYears: number;
  eduLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div>
            <h2 className="text-sm font-bold text-foreground/90">Roadmap Summary</h2>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {careerTitle && <>{careerTitle} · </>}~{spanYears} years · Age {firstAge}–{lastAge} · {eduLabel} track
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 border-b border-border/20">
                <th className="px-5 py-2 w-[4.5rem]">Age</th>
                <th className="px-2 py-2">Step</th>
                <th className="px-5 py-2 w-24 text-right">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/15">
              {journey.items.map((item, i) => {
                const stageStyle = STAGE_STYLES[item.stage] ?? STAGE_STYLES.career;
                const ageLabel = item.endAge && item.endAge !== item.startAge
                  ? `${item.startAge}–${item.endAge}`
                  : `${item.startAge}`;
                return (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-2.5 text-[11px] text-muted-foreground/70 tabular-nums font-medium">
                      {ageLabel}
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="text-xs font-medium text-foreground/85">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.subtitle}</p>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full', stageStyle.dot)} />
                        <span className="text-[10px] text-muted-foreground/55">{stageStyle.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-5 py-3 border-t border-border/20 bg-muted/[0.04] flex items-center justify-between text-[10px] text-muted-foreground/70">
          <span>{journey.items.length} steps</span>
          <span>
            {journey.items.filter((i) => i.stage === 'education').length} education ·{' '}
            {journey.items.filter((i) => i.stage === 'experience').length} experience ·{' '}
            {journey.items.filter((i) => i.stage === 'career').length} career
          </span>
        </div>
      </div>
    </div>
  );
}
