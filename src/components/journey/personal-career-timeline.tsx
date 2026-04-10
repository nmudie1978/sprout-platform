'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, AlertCircle, RefreshCw, Play, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { JourneyItem, Journey } from '@/lib/journey/career-journey-types';
import { generateFallbackTimeline, type EducationStage } from '@/lib/journey/generate-fallback-timeline';
import { sanitizeJourney } from '@/lib/journey/roadmap-rules';
import type { CardDataSummary } from './renderers/types';
import { ZigzagRenderer, RailRenderer, SteppingRenderer } from './renderers';
import { FOUNDATION_ITEM_ID } from './renderers/zigzag-renderer';
import { TimelineStyleSelector } from './timeline-style-selector';
import { TimelineDetailDialog, loadCardData, cycleProgress, isStepUnlocked, enforceProgressChain } from './timeline';
import { getCareerById, getAllCareers } from '@/lib/career-pathways';
import { useRoadmapCardData } from '@/hooks/use-roadmap-card-data';
import { useTimelineStyle } from '@/hooks/use-timeline-style';
import { markGrowActive } from '@/lib/journey/lens-progress';
import { useRoadmapSimulation, type SimulationControls as SimCtrl } from '@/hooks/use-roadmap-simulation';
import { SimulationControls } from './simulation';
import type { NarrationContext } from '@/lib/simulation/narration-generator';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface PersonalCareerTimelineProps {
  primaryGoalTitle: string | null;
  overrideJourney?: Journey | null;
  readOnly?: boolean;
  /**
   * Called once the timeline data loads, passing a `play` function that
   * the parent (Grow tab) can attach to a "Play Journey" button.
   */
  onSimulationReady?: (controls: { play: () => void }) => void;
}

const RENDERERS = {
  zigzag: ZigzagRenderer,
  rail: RailRenderer,
  stepping: SteppingRenderer,
} as const;

export function PersonalCareerTimeline({ primaryGoalTitle, overrideJourney, readOnly = false, onSimulationReady }: PersonalCareerTimelineProps) {
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const { style, setStyle } = useTimelineStyle();
  const roadmapRef = useRef<HTMLDivElement>(null);
  const goalId = primaryGoalTitle ? slugify(primaryGoalTitle) : undefined;
  useRoadmapCardData(goalId);

  // Foundation card data — persisted at profile level (survives goal changes)
  const [foundationCardData, setFoundationCardData] = useState<Record<string, unknown> | null>(null);
  const foundationSyncRef = useRef<NodeJS.Timeout | null>(null);

  // Load foundation data from DB on mount
  useEffect(() => {
    fetch('/api/journey/foundation-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.foundationCardData) {
          setFoundationCardData(data.foundationCardData as Record<string, unknown>);
          // Also write to localStorage so TimelineDetailDialog can read it
          try {
            const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
            all[FOUNDATION_ITEM_ID] = data.foundationCardData;
            localStorage.setItem('roadmap-card-data', JSON.stringify(all));
          } catch { /* silent */ }
        }
      })
      .catch(() => { /* silent */ });
  }, []);

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
    educationContext: { stage?: EducationStage; expectedCompletion?: string } | null;
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
    queryKey: ['personal-career-timeline', primaryGoalTitle, educationStage ?? 'default', foundationComplete ? 'done' : 'open'],
    queryFn: async () => {
      const res = await fetch('/api/journey/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: primaryGoalTitle, educationStage, foundationComplete }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate timeline' }));
        throw new Error(err.error || 'Failed to generate timeline');
      }

      return res.json();
    },
    enabled: !!primaryGoalTitle,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    // Show fallback roadmap instantly while AI version loads
    placeholderData: fallbackJourney ? { journey: fallbackJourney, cached: false } : undefined,
  });

  const rawJourney = overrideJourney ?? data?.journey ?? null;

  // Apply the shared roadmap rules engine — strips career name,
  // duration phrases, restated foundation steps, and forces verb-led
  // titles in one pass. See src/lib/journey/roadmap-rules.ts.
  const journey = useMemo<Journey | null>(
    () => (rawJourney ? sanitizeJourney(rawJourney) : null),
    [rawJourney]
  );

  const careerName = journey?.career ?? '';

  // ── Voice-guided simulation ───────────────────────────────────────
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
  }, [journey, primaryGoalTitle, profileData, userAge, educationContextData]);

  const [simState, simControls] = useRoadmapSimulation(journey, narrationCtx);

  // Foundation gate — the user must fill in their starting point before
  // the voice-guided simulation is available. Without foundation data the
  // narration can't be personalised (school, subjects, finish year).
  const hasFoundation = !!educationContextData?.educationContext?.stage;

  const guardedPlay = useCallback(() => {
    if (!hasFoundation) {
      toast.info('Fill in your starting point first', {
        description: 'Tap "Your Foundation" on the roadmap to add your school, subjects, and finish year — then you can play your journey.',
      });
      return;
    }
    simControls.play();
  }, [hasFoundation, simControls]);

  // Expose play function to parent (Grow tab's "Play Journey" button).
  // Use a ref for the callback to avoid re-triggering when the parent
  // passes an inline arrow (new reference every render).
  const onSimReadyRef = useRef(onSimulationReady);
  onSimReadyRef.current = onSimulationReady;
  useEffect(() => {
    if (onSimReadyRef.current && journey) {
      onSimReadyRef.current({ play: guardedPlay });
    }
  }, [journey, guardedPlay]);

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
      toast.error('Complete the previous step first');
      return;
    }
    cycleProgress(itemId);
    // Whenever the user actively cycles a step we mark Grow as
    // "active" for the current career — this is the per-career signal
    // the dashboard reads instead of scanning the global
    // roadmap-card-data blob (which leaks across goals).
    if (loadCardData(itemId).status === 'done') {
      markGrowActive(primaryGoalTitle);
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
      toast.error('Failed to export roadmap');
    }
  }, [careerName]);

  if (!primaryGoalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
        <Target className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
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
  const Renderer = RENDERERS[style] || ZigzagRenderer;

  // Timeline summary
  const firstAge = journey.startAge;
  const lastAge = journey.items.length > 0
    ? Math.max(...journey.items.map((i) => i.endAge ?? i.startAge))
    : firstAge;
  const spanYears = lastAge - firstAge;

  // Education track label — detect what kind of education path
  const eduStages = journey.items.filter((i) => i.stage === 'education');
  const eduLabel = eduStages.some((i) => i.title.toLowerCase().includes('university') || i.title.toLowerCase().includes('degree'))
    ? 'University'
    : eduStages.some((i) => i.title.toLowerCase().includes('apprentice'))
      ? 'Apprenticeship'
      : 'Education';

  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="text-[11px] text-muted-foreground/75 hover:text-foreground/80 transition-colors group flex items-center gap-1.5"
        >
          {spanYears > 0 && (
            <>
              <FileText className="h-3 w-3 text-muted-foreground/40 group-hover:text-foreground/60 shrink-0" />
              <span>
                <span className="font-semibold text-foreground/85 group-hover:text-foreground">Total roadmap:</span> ~{spanYears} year{spanYears !== 1 ? 's' : ''} · Age {firstAge}–{lastAge}
                {eduStages.length > 0 && <> · {eduLabel} track</>}
              </span>
            </>
          )}
          {isPreliminary && (
            <span className="ml-2 inline-flex items-center gap-1 text-foreground/55">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="text-[10px]">Personalising...</span>
            </span>
          )}
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
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                  : "bg-muted/30 border-border/40 text-muted-foreground/60 hover:bg-muted/40"
              )}
              title={hasFoundation ? "Play a voice-guided narration of your roadmap" : "Fill in your starting point first to unlock Play"}
            >
              <Play className="h-3 w-3" />
              Play
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
          simulation={
            simState.isPlaying || simState.isPaused
              ? {
                  isPlaying: simState.isPlaying,
                  currentStepIndex: simState.currentStepIndex,
                  progress: simState.narrationProgress,
                }
              : undefined
          }
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
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 border-b border-border/20">
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
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{item.subtitle}</p>
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
        <div className="px-5 py-3 border-t border-border/20 bg-muted/[0.04] flex items-center justify-between text-[10px] text-muted-foreground/50">
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
