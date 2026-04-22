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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {deadlines.map((d) => {
          const colors = urgencyColor(d.monthIndex);
          return (
            <div
              key={d.title}
              className={cn('rounded-lg border px-3 py-2.5', colors)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium leading-snug truncate">
                    {d.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {d.when} · {urgencyLabel(d.monthIndex)}
                  </p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <ExternalLink className="h-3 w-3 text-muted-foreground/40 hover:text-primary transition-colors" />
                  </a>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground/55 mt-1.5 leading-relaxed line-clamp-2">
                {d.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
