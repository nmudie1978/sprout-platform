'use client';

/**
 * TraitScoreRow — one DNA trait: icon, label, a 10-dot score indicator, and a
 * short human-readable explanation. The "Option 1" dot layout from the spec.
 */

import {
  Cpu,
  Puzzle,
  Users,
  Palette,
  Crown,
  Bot,
  Banknote,
  Scale,
  GraduationCap,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CareerDNATrait, CareerDNATraitId } from '@/types/career-dna';

const TRAIT_ICON: Record<CareerDNATraitId, LucideIcon> = {
  'technical-depth': Cpu,
  'problem-solving': Puzzle,
  'people-interaction': Users,
  creativity: Palette,
  leadership: Crown,
  'ai-exposure': Bot,
  'income-potential': Banknote,
  'work-life-balance': Scale,
  'education-length': GraduationCap,
  independence: Compass,
};

export function TraitScoreRow({ trait }: { trait: CareerDNATrait }) {
  const Icon = TRAIT_ICON[trait.id];
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span
        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control"
        style={{ backgroundColor: `${trait.color}1A`, color: trait.color }}
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground/90">{trait.label}</span>
          {/* 10-dot score indicator */}
          <span
            className="flex shrink-0 items-center gap-[3px]"
            role="img"
            aria-label={`${trait.label}: ${trait.score} out of 10`}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={cn('h-1.5 w-1.5 rounded-pill transition-colors')}
                style={
                  i < trait.score
                    ? { backgroundColor: trait.color }
                    : { backgroundColor: 'currentColor', opacity: 0.14 }
                }
              />
            ))}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground/80">{trait.description}</p>
      </div>
    </div>
  );
}
