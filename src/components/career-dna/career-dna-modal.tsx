'use client';

/**
 * CareerDNAModal — the full Career DNA profile for a career.
 *
 * Built on the shared Radix Dialog, so it gets a proper dialog role, focus
 * trap, Escape-to-close, overlay-click-to-close and an accessible title for
 * free. Two-column on desktop (traits + genes/snapshot), stacked on mobile.
 */

import { useMemo } from 'react';
import { Dna, GitCompare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Career } from '@/lib/career-pathways';
import { getCareerDNA } from '@/lib/career-dna';
import { DNAStrand } from './dna-strand';
import { TraitScoreRow } from './trait-score-row';
import { PrimaryGenes } from './primary-genes';
import { CareerSnapshot } from './career-snapshot';

type CareerDNAModalProps = {
  career: Career | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CareerDNAModal({ career, open, onOpenChange }: CareerDNAModalProps) {
  const profile = useMemo(() => (career ? getCareerDNA(career) : null), [career]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {profile && (
          <div className="flex min-w-0 flex-col gap-4">
            <DialogHeader className="min-w-0">
              <div className="flex items-center gap-1.5 text-primary">
                <Dna className="h-4 w-4" />
                <DialogTitle className="text-sm font-bold uppercase tracking-wider text-primary">
                  Career DNA
                </DialogTitle>
              </div>
              <p className="text-xl font-semibold text-foreground">{profile.careerTitle}</p>
              <DialogDescription className="text-sm text-muted-foreground/80">
                {profile.subtitle}
              </DialogDescription>
            </DialogHeader>

            {/* DNA strand */}
            <div className="min-w-0 rounded-card border border-border/50 bg-muted/10 px-3 py-3">
              <DNAStrand traits={profile.traits} />
            </div>

            {/* Body */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-3">
              {/* Traits */}
              <div className="min-w-0 lg:col-span-2">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                  DNA Traits
                </h4>
                <div className="divide-y divide-border/40">
                  {profile.traits.map((trait) => (
                    <TraitScoreRow key={trait.id} trait={trait} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="min-w-0 space-y-6 lg:border-l lg:border-border/40 lg:pl-6">
                <PrimaryGenes genes={profile.primaryGenes} />
                <CareerSnapshot snapshot={profile.snapshot} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs italic text-muted-foreground/70">
                Career DNA shows what a career is made of — not who you are.
              </p>
              <button
                type="button"
                disabled
                title="Comparing careers is coming soon"
                aria-disabled="true"
                className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-control border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground/45"
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare careers
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
