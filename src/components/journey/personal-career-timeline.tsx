'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_CONFIG, STAGE_ORDER, type JourneyItem } from '@/lib/journey/career-journey-types';
import type { Journey } from '@/lib/journey/career-journey-types';
import { ZigzagRenderer } from './renderers';
import { TimelineDetailDialog } from './timeline';
import { LayersControl } from './overlays/layers-control';
import { NodeDetailPanel } from './overlays/node-detail-panel';
import { useOverlayState } from '@/hooks/use-overlay-state';

interface PersonalCareerTimelineProps {
  primaryGoalTitle: string | null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function PersonalCareerTimeline({ primaryGoalTitle }: PersonalCareerTimelineProps) {
  const [selectedItem, setSelectedItem] = useState<JourneyItem | null>(null);

  const goalId = primaryGoalTitle ? slugify(primaryGoalTitle) : undefined;
  const {
    activeLayers,
    nodeAnnotations,
    toggleLayer,
    updateNodeAnnotation,
    getNodeData,
    hasAnyActiveLayer,
  } = useOverlayState(goalId);

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
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  // Empty state: no primary goal set
  if (!primaryGoalTitle) {
    return (
      <section className="mt-10">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Set your primary goal to see your career timeline
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Your personalised career roadmap will appear here once you choose a direction.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating your career timeline...</span>
            </div>
            <Skeleton className="h-[340px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section className="mt-10">
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive/60 mb-3" />
            <p className="text-sm font-medium text-destructive/80">
              {error instanceof Error ? error.message : 'Failed to generate timeline'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please try again later or check your connection.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const journey = data?.journey;
  if (!journey) return null;

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">
            Your Path to {journey.career}
          </h2>
        </div>
        {data?.cached && (
          <span className="text-[10px] text-muted-foreground/60">Cached</span>
        )}
      </div>

      {/* Stage legend + layers control */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {STAGE_ORDER.map((stage) => {
          const config = STAGE_CONFIG[stage];
          return (
            <div key={stage} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className={cn('text-xs font-medium', config.textClass)}>
                {config.label}
              </span>
            </div>
          );
        })}
        <div className="ml-auto">
          <LayersControl activeLayers={activeLayers} onToggle={toggleLayer} />
        </div>
      </div>

      {/* Zigzag renderer */}
      <div className="overflow-x-auto">
        <ZigzagRenderer
          journey={journey}
          onItemClick={(item) => setSelectedItem(item)}
          overlayData={nodeAnnotations}
          activeLayers={activeLayers}
        />
      </div>

      {/* Detail dialog — default when no layers active */}
      {!hasAnyActiveLayer && (
        <TimelineDetailDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
        />
      )}

      {/* Overlay detail panel — when any layer is active */}
      {hasAnyActiveLayer && (
        <NodeDetailPanel
          item={selectedItem}
          nodeData={selectedItem ? (getNodeData(selectedItem.id) ?? {}) : {}}
          activeLayers={activeLayers}
          onUpdate={(partial) => {
            if (selectedItem) {
              updateNodeAnnotation(selectedItem.id, partial);
            }
          }}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
        />
      )}
    </section>
  );
}
