'use client';

/**
 * FoundationBanner — compact "Your Starting Point" card rendered at
 * the start of the rail and stepping roadmap views.
 *
 * The zigzag renderer has its own heavier FoundationCard wired into
 * its SVG connectors, but rail + stepping had no foundation surface
 * at all — the "Your Starting Point" title was only visible on
 * zigzag. This component gives the other two layouts the same
 * foundation entry point in a form that fits their denser, linear
 * shape.
 *
 * Self-contained: fetches educationContext, derives a foundationItem,
 * and forwards clicks to the renderer's onItemClick so the same
 * Foundation dialog opens regardless of layout.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EDUCATION_STAGE_CONFIG, type EducationContext } from '@/lib/education/types';
import { calculateSubjectAlignment } from '@/lib/education/alignment';
import type { JourneyItem } from '@/lib/journey/career-journey-types';
import type { CardDataSummary } from './types';

/** Stable ID shared with zigzag so the same foundation dialog logic works. */
export const FOUNDATION_ITEM_ID = 'my-foundation';

interface FoundationBannerProps {
  careerTitle?: string;
  userAge?: number;
  cardDataMap?: Record<string, CardDataSummary> | null;
  onItemClick: (item: JourneyItem) => void;
  journeyStartAge: number;
  /** Read-only on reference routes — greyed out and non-interactive. */
  disabled?: boolean;
  className?: string;
}

export function FoundationBanner({
  careerTitle,
  userAge,
  cardDataMap,
  onItemClick,
  journeyStartAge,
  disabled = false,
  className,
}: FoundationBannerProps) {
  const { data: eduData } = useQuery<{ educationContext: EducationContext | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const eduContext = eduData?.educationContext;

  const subjectHint = useMemo(() => {
    if (!eduContext || !careerTitle) return null;
    if (userAge != null && userAge >= 18) return null;
    const subjects = [...(eduContext.currentSubjects || [])];
    if (eduContext.studyProgram) {
      for (const p of eduContext.studyProgram
        .split(/[,;/&+]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)) {
        if (!subjects.some((ex) => ex.toLowerCase() === p.toLowerCase())) subjects.push(p);
      }
    }
    return calculateSubjectAlignment(subjects, careerTitle);
  }, [eduContext, careerTitle, userAge]);

  const allSubjects: string[] = (() => {
    if (!eduContext) return [];
    const out = [...(eduContext.currentSubjects || [])];
    if (eduContext.studyProgram) {
      for (const p of eduContext.studyProgram
        .split(/[,;/&+]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)) {
        if (!out.some((ex) => ex.toLowerCase() === p.toLowerCase())) out.push(p);
      }
    }
    return out;
  })();
  const visibleSubjects = allSubjects.slice(0, 4);
  const extraSubjectCount = Math.max(0, allSubjects.length - visibleSubjects.length);

  const status = cardDataMap?.[FOUNDATION_ITEM_ID]?.status;
  const isDone = status === 'done';

  const handleOpen = () => {
    if (disabled) return;
    const foundationItem: JourneyItem = {
      id: FOUNDATION_ITEM_ID,
      stage: 'foundation',
      title: 'Your Foundation',
      subtitle: eduContext
        ? `${EDUCATION_STAGE_CONFIG[eduContext.stage].label}${eduContext.schoolName ? ` · ${eduContext.schoolName}` : ''}`
        : 'Where you are today',
      startAge: userAge ?? journeyStartAge,
      isMilestone: false,
      icon: 'Sparkles',
      description: eduContext
        ? `Your current education: ${EDUCATION_STAGE_CONFIG[eduContext.stage].label}.${eduContext.studyProgram ? ` Studying ${eduContext.studyProgram}.` : ''}${eduContext.expectedCompletion ? ` Finishing ${eduContext.expectedCompletion}.` : ''} This is your starting point — everything builds from here.`
        : 'Where you are today. Tap to add details about your current situation.',
      microActions: [
        'Identify which school subjects are most relevant to your goal',
        'Talk to your teachers about this career direction',
        'Research what grades are needed for the next step',
      ],
    };
    onItemClick(foundationItem);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={disabled}
      aria-label={disabled ? 'Foundation (reference route — read only)' : 'Open foundation details'}
      className={cn(
        'group w-full rounded-xl border text-left overflow-hidden transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled
          ? 'opacity-40 grayscale cursor-not-allowed border-border/60 select-none pointer-events-none'
          : 'border-teal-500/40 hover:border-teal-400/70 cursor-pointer shadow-sm',
        className,
      )}
    >
      {/* Header band */}
      <div className="relative bg-gradient-to-r from-teal-600/20 via-teal-500/10 to-transparent px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded-md bg-teal-500/20 flex items-center justify-center shrink-0">
              <span className="text-[10px]" aria-hidden>📍</span>
            </div>
            <p className="text-[12px] font-bold tracking-tight text-foreground truncate">
              Your Starting Point
            </p>
            {userAge != null && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0 text-[9px] font-medium text-muted-foreground shrink-0">
                Age {userAge}
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-500 shrink-0">
                <Check className="h-2.5 w-2.5" strokeWidth={4} />
                Done
              </span>
            )}
          </div>
          {!disabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-muted-foreground/60 group-hover:text-teal-300 group-hover:bg-teal-500/10 transition-colors shrink-0">
              <Pencil className="h-2.5 w-2.5" />
              <span className="text-[9px] font-medium hidden sm:inline">Edit</span>
            </span>
          )}
        </div>
      </div>

      {/* Data row */}
      <div className="px-3 py-2 bg-card/60">
        {eduContext ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/80">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>
                {eduContext.stage === 'university' ? '🎓' : eduContext.stage === 'college' ? '🏛️' : '🏫'}
              </span>
              <span className="font-medium">
                {eduContext.schoolName || EDUCATION_STAGE_CONFIG[eduContext.stage].label}
              </span>
            </span>
            {eduContext.studyProgram && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span aria-hidden>📘</span>
                <span className="truncate max-w-[200px]">{eduContext.studyProgram}</span>
              </span>
            )}
            {eduContext.expectedCompletion && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span aria-hidden>📅</span>
                Finishes {eduContext.expectedCompletion}
              </span>
            )}
            {visibleSubjects.length > 0 && (
              <span className="flex flex-wrap items-center gap-1">
                {visibleSubjects.map((s) => {
                  const isMatched = subjectHint?.matchedKey.some(
                    (m) => m.toLowerCase() === s.toLowerCase(),
                  );
                  return (
                    <span
                      key={s}
                      className={cn(
                        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium border',
                        isMatched
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                          : 'bg-muted/30 text-foreground/75 border-border/40',
                      )}
                      title={isMatched ? '✓ Aligns with this career' : undefined}
                    >
                      {isMatched && (
                        <Check className="h-2 w-2 mr-0.5 text-emerald-400" strokeWidth={3} />
                      )}
                      {s}
                    </span>
                  );
                })}
                {extraSubjectCount > 0 && (
                  <span className="text-[9px] text-muted-foreground/50 ml-0.5">+{extraSubjectCount}</span>
                )}
              </span>
            )}
            {subjectHint && subjectHint.missingKey.length > 0 && (
              <span className="flex flex-wrap items-center gap-1">
                {subjectHint.missingKey.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/8 text-amber-300/80 border border-amber-500/20"
                    title={`Consider adding ${s}`}
                  >
                    <AlertTriangle className="h-2 w-2 mr-0.5" strokeWidth={2.5} />
                    {s}
                  </span>
                ))}
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground/70">
            Tap to add your school &amp; subjects — this helps us align your roadmap.
          </div>
        )}
      </div>
    </button>
  );
}
