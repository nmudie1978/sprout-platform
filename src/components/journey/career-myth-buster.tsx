'use client';

/**
 * Career Myth Buster — renders in the Understand tab.
 * Shows common misconceptions as a table with myth/reality columns.
 */

import { useMemo } from 'react';
import { getMythsForCareer } from '@/lib/career-myths';

interface CareerMythBusterProps {
  careerId: string | null;
}

export function CareerMythBuster({ careerId }: CareerMythBusterProps) {
  const myths = useMemo(() => (careerId ? getMythsForCareer(careerId) : []), [careerId]);

  if (myths.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/20 bg-muted/10">
            <th className="px-3 py-2 text-[9px] font-semibold text-red-400/70 uppercase tracking-wider w-1/2">Myth</th>
            <th className="px-3 py-2 text-[9px] font-semibold text-emerald-400/70 uppercase tracking-wider w-1/2">Reality</th>
          </tr>
        </thead>
        <tbody>
          {myths.map((myth, i) => (
            <tr key={i} className="border-b border-border/10 last:border-b-0">
              <td className="px-3 py-3 align-top">
                <p className="text-[11px] font-medium text-foreground/80 leading-snug">
                  &ldquo;{myth.claim}&rdquo;
                </p>
              </td>
              <td className="px-3 py-3 align-top bg-emerald-500/[0.02]">
                <p className="text-[10px] text-foreground/65 leading-relaxed">
                  {myth.reality}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
