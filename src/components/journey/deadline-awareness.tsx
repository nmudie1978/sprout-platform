'use client';

/**
 * Deadline Awareness — shows upcoming application deadlines
 * relevant to the user's career choice. Clarity tab.
 */

import { useMemo } from 'react';
import { Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDeadlinesForCareer, type Deadline } from '@/lib/application-deadlines';

interface DeadlineAwarenessProps {
  careerId: string | null;
}

function urgencyColor(months: number): string {
  if (months <= 2) return 'text-red-400 border-red-500/30 bg-red-500/[0.06]';
  if (months <= 4) return 'text-amber-400 border-amber-500/30 bg-amber-500/[0.06]';
  return 'text-muted-foreground/70 border-border/30 bg-card/40';
}

function urgencyLabel(months: number): string {
  if (months <= 1) return 'This month';
  if (months <= 2) return 'Coming soon';
  return `In ~${months} months`;
}

export function DeadlineAwareness({ careerId }: DeadlineAwarenessProps) {
  const deadlines = useMemo(
    () => (careerId ? getDeadlinesForCareer(careerId).slice(0, 4) : []),
    [careerId],
  );

  if (deadlines.length === 0) return null;

  const hasUrgent = deadlines.some((d) => d.monthIndex <= 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          Key dates to know
        </h3>
        {hasUrgent && (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-red-400 font-medium">
            <AlertCircle className="h-2.5 w-2.5" />
            Upcoming deadline
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {deadlines.map((d) => {
          const colors = urgencyColor(d.monthIndex);
          return (
            <div
              key={d.title}
              className={cn('rounded-lg border px-2.5 py-2 text-center', colors)}
            >
              <p className="text-[10px] font-medium leading-snug line-clamp-1">
                {d.title}
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                {d.when}
              </p>
              <p className="text-[8px] font-medium mt-1">
                {urgencyLabel(d.monthIndex)}
              </p>
              {d.url && (
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[8px] text-muted-foreground/40 hover:text-primary transition-colors mt-1">
                  <ExternalLink className="h-2.5 w-2.5" />
                  <span>Details</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
