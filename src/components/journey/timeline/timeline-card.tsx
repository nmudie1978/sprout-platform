'use client';

import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';

interface TimelineCardProps {
  item: JourneyItem;
  onClick: () => void;
}

export function TimelineCard({ item, onClick }: TimelineCardProps) {
  const stage = STAGE_CONFIG[item.stage];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
      style={{ borderLeftColor: stage.color, borderLeftWidth: 3 }}
      aria-label={`${item.title} — click for details`}
    >
      {/* Title */}
      <p className="text-sm font-semibold leading-tight text-foreground">
        {item.title}
      </p>

      {/* Subtitle */}
      {item.subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {item.subtitle}
        </p>
      )}
    </button>
  );
}
