'use client';

/**
 * CareerDNASection — a subtle, premium trigger inside the Discover tab.
 *
 * Deliberately understated (a single clickable row, like the salary affordance)
 * rather than a dominating card. Opens the {@link CareerDNAModal} for the
 * career currently in context.
 */

import { useMemo, useState } from 'react';
import { Dna, ArrowRight } from 'lucide-react';
import type { Career } from '@/lib/career-pathways';
import { getCareerDNA } from '@/lib/career-dna';
import { DNAStrand } from './dna-strand';
import { CareerDNAModal } from './career-dna-modal';

export function CareerDNASection({
  career,
  variant = 'bar',
}: {
  career: Career | null;
  /** 'bar' = full-width premium row (default); 'card' = compact quick-insight
   *  card that fits a grid cell (used in the Discover insights row). */
  variant?: 'bar' | 'card';
}) {
  const [open, setOpen] = useState(false);
  const previewTraits = useMemo(
    () => (career ? getCareerDNA(career).traits : []),
    [career],
  );

  if (!career) return null;

  // Compact card — mirrors the sibling "Where you'll work" quick-insight card,
  // but clickable (opens the DNA modal). Used where TIMELINE used to sit.
  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="group flex h-full w-full flex-col rounded-card border border-border bg-card/50 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="mb-2 flex items-center gap-2">
            <Dna className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Career DNA</span>
          </span>
          <span className="text-xs leading-relaxed text-foreground/70">
            See what this career is made of — its traits, strengths, pressures, and working style.
          </span>
        </button>

        <CareerDNAModal career={career} open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group flex w-full items-center gap-4 rounded-card border border-border bg-card/50 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
          <Dna className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground/90">Career DNA</span>
          <span className="block text-xs leading-snug text-muted-foreground/75">
            See what this career is made of — its traits, strengths, pressures, and working style.
          </span>
        </span>

        {/* Mini strand preview — hidden on the narrowest screens to stay calm */}
        <span className="hidden w-28 shrink-0 sm:block" aria-hidden="true">
          <DNAStrand traits={previewTraits} compact />
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
          <span className="hidden md:inline">Explore Career DNA</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>

      <CareerDNAModal career={career} open={open} onOpenChange={setOpen} />
    </>
  );
}
