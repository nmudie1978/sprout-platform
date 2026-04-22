'use client';

/**
 * Opportunity Matches — shows internships, traineeships, and
 * graduate programmes matched to the user's career. Clarity tab.
 */

import { useMemo } from 'react';
import { MapPin, ExternalLink, Briefcase, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOpportunitiesForCareer, getTypeLabel, type Opportunity, type OpportunityType } from '@/lib/opportunities';

interface OpportunityMatchesProps {
  careerId: string | null;
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  internship: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  traineeship: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  graduate: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  apprenticeship: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  volunteer: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
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
          Opportunities for you
        </h3>
        <span className="text-[9px] text-muted-foreground/50 ml-auto">
          {opportunities.length} match{opportunities.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {opportunities.map((opp) => (
          <a
            key={opp.id}
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border/30 bg-card/40 px-3.5 py-3 hover:border-border/50 hover:bg-card/60 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium', TYPE_COLORS[opp.type])}>
                    {getTypeLabel(opp.type)}
                  </span>
                  <span className="text-[11px] font-medium text-foreground/90 truncate">
                    {opp.company}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-foreground/85 leading-snug">
                  {opp.title}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
            </div>
            <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {opp.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                Apply: {opp.applicationWindow}
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center">
        Curated listings — check company career pages for current availability
      </p>
    </div>
  );
}
