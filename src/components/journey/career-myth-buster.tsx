'use client';

/**
 * Career Myth Buster — renders in the Understand tab.
 * Shows common misconceptions + evidence-based corrections.
 */

import { useMemo, useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMythsForCareer, type CareerMyth } from '@/lib/career-myths';

interface CareerMythBusterProps {
  careerId: string | null;
}

function MythCard({ myth, index }: { myth: CareerMyth; index: number }) {
  const [expanded, setExpanded] = useState(index === 0); // first one open

  return (
    <div className="rounded-lg border border-border/30 bg-card/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="text-red-400/80 text-[11px] font-bold uppercase tracking-wider mt-0.5 shrink-0">
          Myth
        </span>
        <span className="text-[12px] text-foreground/85 font-medium leading-snug flex-1">
          {myth.claim}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
        )}
      </button>
      {expanded && (
        <div className="px-3.5 pb-3 pt-0">
          <div className="flex items-start gap-3">
            <span className="text-emerald-400/80 text-[11px] font-bold uppercase tracking-wider mt-0.5 shrink-0">
              Reality
            </span>
            <p className="text-[11px] text-foreground/75 leading-relaxed flex-1">
              {myth.reality}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CareerMythBuster({ careerId }: CareerMythBusterProps) {
  const myths = useMemo(() => (careerId ? getMythsForCareer(careerId) : []), [careerId]);

  if (myths.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          Common misconceptions
        </h3>
      </div>
      <div className="space-y-2">
        {myths.map((myth, i) => (
          <MythCard key={i} myth={myth} index={i} />
        ))}
      </div>
    </div>
  );
}
