'use client';

/**
 * PrimaryGenes — the career's dominant character, as small chips.
 */

import { Dna } from 'lucide-react';

export function PrimaryGenes({ genes }: { genes: string[] }) {
  if (!genes.length) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Dna className="h-3.5 w-3.5 text-primary" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
          Primary Genes
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {genes.map((gene) => (
          <span
            key={gene}
            className="inline-flex items-center rounded-pill border border-primary/25 bg-primary/[0.06] px-2.5 py-1 text-xs font-medium text-foreground/85"
          >
            {gene}
          </span>
        ))}
      </div>
    </div>
  );
}
