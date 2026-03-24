'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, AlertCircle, RefreshCw } from 'lucide-react';
import type { JourneyItem, Journey } from '@/lib/journey/career-journey-types';
import { ZigzagRenderer, RailRenderer, SteppingRenderer } from './renderers';
import { TimelineStyleSelector } from './timeline-style-selector';
import { TimelineDetailDialog } from './timeline';
import { useRoadmapCardData } from '@/hooks/use-roadmap-card-data';
import { useTimelineStyle } from '@/hooks/use-timeline-style';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface PersonalCareerTimelineProps {
  primaryGoalTitle: string | null;
}

const RENDERERS = {
  zigzag: ZigzagRenderer,
  rail: RailRenderer,
  stepping: SteppingRenderer,
} as const;

export function PersonalCareerTimeline({ primaryGoalTitle }: PersonalCareerTimelineProps) {
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const { style, setStyle } = useTimelineStyle();
  const goalId = primaryGoalTitle ? slugify(primaryGoalTitle) : undefined;
  useRoadmapCardData(goalId);

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

  const journey = data?.journey;
  if (!journey) return null;

  const Renderer = RENDERERS[style] || ZigzagRenderer;

  return (
    <div>
      {/* Header row: title + style selector */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground/50">
          Your Path to {journey.career}
        </p>
        <TimelineStyleSelector value={style} onChange={setStyle} />
      </div>

      {/* Roadmap */}
      <Renderer
        key={`${style}-${saveVersion}`}
        journey={journey}
        onItemClick={(item) => setSelectedItem(item)}
        overlayData={{}}
        activeLayers={{ progress: false, reflections: false, resources: false, confidence: false }}
        userAge={journey.startAge}
      />

      {/* Card detail popup */}
      <TimelineDetailDialog
        item={selectedItem}
        allItems={journey.items}
        open={!!selectedItem}
        onSaved={() => setSaveVersion((v) => v + 1)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
      />
    </div>
  );
}
