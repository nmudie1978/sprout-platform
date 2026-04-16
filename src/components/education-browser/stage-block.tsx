'use client';

/**
 * StageBlock — Phase 3.5 of the pathway data model rework.
 *
 * Renders a single stage of a route as a self-contained card:
 * kind icon → title + duration → optional description → optional
 * programmes mini-list → optional outcome line. Stages without
 * programmes (credential / experience) render the descriptive
 * content only — no empty table.
 *
 * Visually distinct from the single-route flat table so users can
 * tell at a glance "this is a multi-step route" vs "this is a
 * single-route programme list".
 */

import {
  GraduationCap,
  Award,
  Briefcase,
  Plane,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInstitutionById } from '@/lib/education';
import type { Stage, StageKind } from '@/lib/education/route-types';
import type { ProgrammeWithInstitution } from '@/lib/education';

interface StageBlockProps {
  stage: Stage;
  /** Pre-resolved programmes for this stage (caller resolves so the
   *  same broken-URL filter applies as elsewhere in the page). */
  programmes: ProgrammeWithInstitution[];
  /** 1-indexed step number shown in the stage header. */
  stepNumber: number;
  /** True when this is the final stage of the route — used to skip
   *  the connector line below. */
  isLast: boolean;
}

const KIND_META: Record<StageKind, { icon: typeof GraduationCap; label: string; color: string }> = {
  education: {
    icon: GraduationCap,
    label: 'Education',
    color: 'text-teal-300',
  },
  credential: {
    icon: Award,
    label: 'Credential',
    color: 'text-amber-300',
  },
  experience: {
    icon: Briefcase,
    label: 'Experience',
    color: 'text-blue-300',
  },
  'abroad-leg': {
    icon: Plane,
    label: 'Abroad',
    color: 'text-purple-300',
  },
  'lateral-entry': {
    icon: ArrowRightLeft,
    label: 'Lateral entry',
    color: 'text-rose-300',
  },
};

const COUNTRY_FLAG: Record<string, string> = {
  NO: '🇳🇴',
  SE: '🇸🇪',
  DK: '🇩🇰',
  FI: '🇫🇮',
  IS: '🇮🇸',
};

function formatDuration(years: number): string {
  if (years <= 0) return '';
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (Number.isInteger(years)) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} years`;
}

export function StageBlock({ stage, programmes, stepNumber, isLast }: StageBlockProps) {
  const meta = KIND_META[stage.kind];
  const Icon = meta.icon;
  const duration = formatDuration(stage.durationYears);

  return (
    <div className="relative">
      {/* Vertical connector line — visually links one stage to the next. */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-[15px] top-9 bottom-[-12px] w-px bg-border/30"
        />
      )}

      <div className="flex gap-3">
        {/* ── Icon column ────────────────────────────────────────── */}
        <div className="shrink-0">
          <div
            className={cn(
              'h-8 w-8 rounded-full border border-border/40 bg-card/60 flex items-center justify-center',
              meta.color,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* ── Content column ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 pb-4">
          {/* Header: step number + kind + duration */}
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/65 mb-1">
            <span>Step {stepNumber}</span>
            <span aria-hidden="true">·</span>
            <span className={meta.color}>{meta.label}</span>
            {duration && (
              <>
                <span aria-hidden="true">·</span>
                <span>{duration}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h4 className="text-[13px] font-semibold text-foreground/90 leading-snug mb-1.5">
            {stage.title}
          </h4>

          {/* Description (skip when empty — auto-migrated default
              stages have empty strings). */}
          {stage.description && (
            <p className="text-[12px] text-foreground/75 leading-relaxed mb-2.5">
              {stage.description}
            </p>
          )}

          {/* Prerequisites (rare but supported in the schema). */}
          {stage.prerequisites && (
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-2">
              <span className="font-medium text-foreground/70">Requires: </span>
              {stage.prerequisites}
            </p>
          )}

          {/* Programmes mini-list — only when this stage references
              programmes. Visually lighter than the single-route flat
              table so the stage stays the dominant unit. */}
          {programmes.length > 0 && (
            <div className="rounded-md border border-border/30 bg-background/30 overflow-hidden">
              {programmes.map((prog, idx) => {
                const inst = getInstitutionById(prog.institutionId);
                const flag = inst?.country ? COUNTRY_FLAG[inst.country] : null;
                return (
                  <a
                    key={prog.id}
                    href={prog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-card/60 transition-colors',
                      idx > 0 && 'border-t border-border/20',
                    )}
                  >
                    {flag && <span aria-hidden="true">{flag}</span>}
                    <span className="text-foreground/85 font-medium truncate">
                      {prog.englishName || prog.programme}
                    </span>
                    <span className="text-muted-foreground/60 shrink-0">
                      {inst?.name ?? prog.institution}
                    </span>
                    <span className="ml-auto text-primary/80 inline-flex items-center text-[10px] font-medium shrink-0">
                      Visit
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Outcome — shown when present, framed as the result of
              completing this stage. */}
          {stage.outcome && (
            <p className="mt-2.5 text-[11px] text-muted-foreground/85 leading-relaxed">
              <span className="text-emerald-400/80">→</span> <span className="italic">{stage.outcome}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
