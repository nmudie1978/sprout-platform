'use client';

/**
 * Opportunity Matches — shows internships, traineeships, and
 * graduate programmes matched to the user's career as a detailed table.
 * Rows are clickable and link to the company's career page.
 */

import { useMemo } from 'react';
import { ExternalLink, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOpportunitiesForCareer, getTypeLabel, type OpportunityType } from '@/lib/opportunities';

interface OpportunityMatchesProps {
  careerId: string | null;
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  internship: 'text-teal-400 bg-teal-500/10',
  traineeship: 'text-blue-400 bg-blue-500/10',
  graduate: 'text-violet-400 bg-violet-500/10',
  apprenticeship: 'text-amber-400 bg-amber-500/10',
  volunteer: 'text-emerald-400 bg-emerald-500/10',
};

export function OpportunityMatches({ careerId }: OpportunityMatchesProps) {
  const opportunities = useMemo(
    () => (careerId ? getOpportunitiesForCareer(careerId) : []),
    [careerId],
  );

  if (opportunities.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          Live opportunities
        </h3>
        <span className="text-[9px] text-muted-foreground/50 ml-auto">
          {opportunities.length} match{opportunities.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="rounded-lg border border-border/30 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/20 bg-muted/10">
              <th className="px-3 py-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Company</th>
              <th className="px-3 py-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">Programme</th>
              <th className="px-3 py-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider hidden md:table-cell">Location</th>
              <th className="px-3 py-2 text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">Apply</th>
              <th className="px-3 py-2 w-8"><span className="sr-only">Link</span></th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr
                key={opp.id}
                className="border-b border-border/10 last:border-b-0 hover:bg-muted/15 transition-colors cursor-pointer group"
                onClick={() => opp.url && window.open(opp.url, '_blank', 'noopener,noreferrer')}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && opp.url) {
                    e.preventDefault();
                    window.open(opp.url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <td className="px-3 py-2.5">
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium whitespace-nowrap', TYPE_COLORS[opp.type])}>
                    {getTypeLabel(opp.type)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-[11px] font-medium text-foreground/90 whitespace-nowrap">{opp.company}</p>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <p className="text-[11px] text-foreground/75 leading-snug">{opp.title}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5 line-clamp-1 max-w-[280px]">{opp.description}</p>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">{opp.location}</span>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">{opp.applicationWindow}</span>
                </td>
                <td className="px-3 py-2.5">
                  {opp.url && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground/25 group-hover:text-primary/60 transition-colors" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center">
        Curated listings — check company career pages for current availability
      </p>
    </div>
  );
}
