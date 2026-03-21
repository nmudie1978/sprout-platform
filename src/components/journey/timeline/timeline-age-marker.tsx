'use client';

import { cn } from '@/lib/utils';

interface TimelineAgeMarkerProps {
  age: number;
  isCurrent: boolean;
}

export function TimelineAgeMarker({ age, isCurrent }: TimelineAgeMarkerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        isCurrent
          ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300/50 shadow-sm'
          : 'bg-muted text-muted-foreground'
      )}
    >
      Age {age}
    </span>
  );
}
