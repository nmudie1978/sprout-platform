'use client';

/**
 * Institution Card — shows an institution with a horizontal
 * scrollable programme carousel inside it. Clicking a programme
 * opens its detail sheet.
 */

import { useState, useRef } from 'react';
import {
  Building2,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Institution, ProgrammeWithInstitution } from '@/lib/education';
import { ProgrammeCard } from './programme-card';
import { ProgrammeDetailSheet } from './programme-detail-sheet';
import type { AlignmentResult } from '@/lib/education/programme-alignment';
import { AlignmentBadge } from './alignment-badge';

const COUNTRY_FLAGS: Record<string, string> = {
  NO: '🇳🇴',
  SE: '🇸🇪',
  DK: '🇩🇰',
  FI: '🇫🇮',
  IS: '🇮🇸',
};

interface InstitutionCardProps {
  institution: Institution;
  programmes: ProgrammeWithInstitution[];
  alignments: Map<string, AlignmentResult>;
  routeNote?: string;
}

export function InstitutionCard({
  institution: inst,
  programmes,
  alignments,
  routeNote,
}: InstitutionCardProps) {
  const [selectedProg, setSelectedProg] = useState<ProgrammeWithInstitution | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Summary alignment — best alignment across all programmes
  const bestAlignment = programmes.reduce<AlignmentResult['status']>(
    (best, prog) => {
      const a = alignments.get(prog.id);
      if (!a) return best;
      if (a.status === 'aligned') return 'aligned';
      if (a.status === 'partial' && best !== 'aligned') return 'partial';
      return best;
    },
    'unknown',
  );

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <>
      <div className="rounded-2xl border border-border/50 bg-card/70 hover:border-teal-500/40 transition-all duration-200 overflow-hidden flex flex-col shadow-sm">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[13px] font-semibold text-foreground/85 truncate">
                  {inst.name}
                </h3>
                <span className="text-[12px] shrink-0">{COUNTRY_FLAGS[inst.country] ?? ''}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {inst.city}
                </span>
                <span>&middot;</span>
                <span>{programmes.length} programme{programmes.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AlignmentBadge status={bestAlignment} compact />
              <a
                href={inst.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/25 hover:text-teal-400 transition-colors p-1"
                title="Visit website"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Programme carousel ──────────────────────────────────── */}
        <div className="relative px-4 pb-4 flex-1">
          {programmes.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scroll('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/80 border border-border/20 flex items-center justify-center text-muted-foreground/65 hover:text-foreground/60 hover:border-border/40 transition-all shadow-sm backdrop-blur-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/80 border border-border/20 flex items-center justify-center text-muted-foreground/65 hover:text-foreground/60 hover:border-border/40 transition-all shadow-sm backdrop-blur-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className={cn(
              'flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth',
              programmes.length > 1 && 'px-1',
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {programmes.map((prog) => (
              <ProgrammeCard
                key={prog.id}
                programme={prog}
                alignment={alignments.get(prog.id) ?? { status: 'unknown', reason: '', matchedSubjects: [], missingSubjects: [] }}
                onClick={() => setSelectedProg(prog)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail sheet */}
      <ProgrammeDetailSheet
        programme={selectedProg}
        alignment={selectedProg ? alignments.get(selectedProg.id) ?? null : null}
        routeNote={routeNote}
        open={!!selectedProg}
        onClose={() => setSelectedProg(null)}
      />
    </>
  );
}
