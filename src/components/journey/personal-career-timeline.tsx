'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { JourneyItem, Journey } from '@/lib/journey/career-journey-types';
import type { CardDataSummary } from './renderers/types';
import { ZigzagRenderer, RailRenderer, SteppingRenderer } from './renderers';
import { FOUNDATION_ITEM_ID } from './renderers/zigzag-renderer';
import { TimelineStyleSelector } from './timeline-style-selector';
import { TimelineDetailDialog, loadCardData, cycleProgress } from './timeline';
import { useRoadmapCardData } from '@/hooks/use-roadmap-card-data';
import { useTimelineStyle } from '@/hooks/use-timeline-style';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface PersonalCareerTimelineProps {
  primaryGoalTitle: string | null;
  overrideJourney?: Journey | null;
}

const RENDERERS = {
  zigzag: ZigzagRenderer,
  rail: RailRenderer,
  stepping: SteppingRenderer,
} as const;

export function PersonalCareerTimeline({ primaryGoalTitle, overrideJourney }: PersonalCareerTimelineProps) {
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

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ journey: Journey; cached: boolean }>({
    queryKey: ['personal-career-timeline', primaryGoalTitle],
    queryFn: async () => {
      const res = await fetch('/api/journey/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: primaryGoalTitle }),
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
  });

  const journey = overrideJourney ?? data?.journey ?? null;
  const careerName = journey?.career ?? '';

  // Build per-node card data summaries for visual indicators on the roadmap
  const cardDataMap = useMemo<Record<string, CardDataSummary>>(() => {
    if (!journey) return {};
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
    cycleProgress(itemId);
    setSaveVersion((v) => v + 1);
    if (itemId === FOUNDATION_ITEM_ID) {
      syncFoundationToDb();
    }
  }, [syncFoundationToDb]);

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

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs">
          <span className="text-muted-foreground/50">Your Path to </span>
          <span className="font-medium text-foreground/70">{journey.career}</span>
          {spanYears > 0 && (
            <span className="text-muted-foreground/30 ml-2">
              ~{spanYears} year{spanYears !== 1 ? 's' : ''} · Age {firstAge}–{lastAge}
              {eduStages.length > 0 && <> · {eduLabel} track</>}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            title="Download roadmap as image"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <TimelineStyleSelector value={style} onChange={setStyle} />
        </div>
      </div>

      {/* Roadmap */}
      <div ref={roadmapRef}>
        <Renderer
          key={`${style}-${saveVersion}`}
          journey={journey}
          onItemClick={(item) => setSelectedItem(item)}
          overlayData={{}}
          activeLayers={{ progress: false, reflections: false, resources: false, confidence: false }}
          userAge={journey.startAge}
          cardDataMap={cardDataMap}
          onProgressCycle={handleProgressCycle}
        />
      </div>

      {/* Card detail popup */}
      <TimelineDetailDialog
        item={selectedItem}
        allItems={journey.items}
        open={!!selectedItem}
        onSaved={() => {
          setSaveVersion((v) => v + 1);
          // If saving foundation data, sync to profile-level DB storage
          if (selectedItem?.id === FOUNDATION_ITEM_ID) {
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
