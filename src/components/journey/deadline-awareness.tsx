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

function urgencyTone(months: number): { text: string; dot: string; row: string } {
  if (months <= 2) return { text: 'text-red-400', dot: 'bg-red-400', row: 'bg-red-500/[0.04]' };
  if (months <= 4) return { text: 'text-amber-400', dot: 'bg-amber-400', row: '' };
  return { text: 'text-muted-foreground/60', dot: 'bg-muted-foreground/30', row: '' };
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

      <div className="overflow-hidden rounded-lg border border-border/40">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border/40 bg-card/40 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
              <th className="px-3 py-1.5 font-medium">Date</th>
              <th className="px-3 py-1.5 font-medium">Event</th>
              <th className="px-3 py-1.5 font-medium whitespace-nowrap">When</th>
              <th className="px-3 py-1.5 font-medium text-right sr-only sm:not-sr-only">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {deadlines.map((d) => {
              const tone = urgencyTone(d.monthIndex);
              return (
                <tr
                  key={d.title}
                  className={cn(
                    'border-b border-border/20 last:border-0 transition-colors hover:bg-card/40',
                    tone.row,
                  )}
                >
                  <td className="px-3 py-2 text-[11px] font-medium text-foreground/80 whitespace-nowrap tabular-nums">
                    {d.when}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-foreground/70">
                    {d.title}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-medium', tone.text)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', tone.dot)} />
                      {urgencyLabel(d.monthIndex)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        <span>Details</span>
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
