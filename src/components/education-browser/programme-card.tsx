'use client';

/**
 * Programme Card — compact tile for the carousel inside an
 * institution card. Shows the key facts at a glance. Clicking
 * opens the full detail sheet.
 */

import { Clock, GraduationCap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgrammeWithInstitution } from '@/lib/education';
import type { AlignmentResult } from '@/lib/education/programme-alignment';
import { AlignmentBadge } from './alignment-badge';

const TYPE_LABELS: Record<string, string> = {
  bachelor: 'Bachelor',
  master: 'Master',
  integrated: 'Integrated',
  vocational: 'Vocational',
  fagbrev: 'Fagbrev',
  phd: 'PhD',
  diploma: 'Diploma',
};

interface ProgrammeCardProps {
  programme: ProgrammeWithInstitution;
  alignment: AlignmentResult;
  onClick?: () => void;
}

export function ProgrammeCard({ programme: prog, alignment, onClick }: ProgrammeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col min-w-[220px] max-w-[260px] rounded-xl border border-border/40 bg-card/60',
        'p-3.5 text-left transition-all duration-150',
        'hover:border-teal-500/25 hover:bg-teal-500/[0.03] hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/40',
        'cursor-pointer shrink-0',
      )}
    >
      {/* Title + alignment */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-[12px] font-semibold text-foreground/85 leading-snug line-clamp-2 flex-1">
          {prog.englishName}
        </h4>
        <AlignmentBadge status={alignment.status} compact />
      </div>

      {/* Local name */}
      <p className="text-[10px] text-muted-foreground/70 mb-3 truncate">
        {prog.programme}
      </p>

      {/* Meta row */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/70">
        <span className="inline-flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          {TYPE_LABELS[prog.type] ?? prog.type}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {prog.duration}
        </span>
        {prog.languageOfInstruction && (
          <span className="inline-flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {prog.languageOfInstruction}
          </span>
        )}
      </div>
    </button>
  );
}
