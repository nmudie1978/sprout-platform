'use client';

import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';

interface TimelineCardProps {
  item: JourneyItem;
  onClick: () => void;
}

export function TimelineCard({ item, onClick }: TimelineCardProps) {
  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}–${item.endAge}`
    : `Age ${item.startAge}`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-3 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
      aria-label={`${item.title} — click for details`}
    >
      {/* Stage + Age Row */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cn(
            'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            stage.bgClass,
            stage.textClass
          )}
        >
          {stage.label}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">
          {ageLabel}
        </span>
      </div>

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

      {/* Milestone indicator */}
      {item.isMilestone && (
        <div className="mt-1.5 flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-[10px] font-medium" style={{ color: stage.color }}>
            Milestone
          </span>
        </div>
      )}
    </button>
  );
}
