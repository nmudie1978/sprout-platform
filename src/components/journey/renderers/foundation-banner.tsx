'use client';

/**
 * Foundation data hook — shared by rail + stepping renderers.
 *
 * The foundation is rendered INLINE as step[0] in each renderer (same
 * age pill + SharedNode + step-box card as every other step), so the
 * "Your Starting Point" reads as the first step on the track with the
 * same visual shape as "Apply for university studies" etc.
 *
 * Rich data (school, subjects, alignment) is surfaced in the detail
 * dialog on click; the inline card stays compact to preserve symmetry.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EDUCATION_STAGE_CONFIG, type EducationContext } from '@/lib/education/types';
import { calculateSubjectAlignment } from '@/lib/education/alignment';
import type { JourneyItem } from '@/lib/journey/career-journey-types';

/** Stable ID — must match the id other surfaces check against. */
export const FOUNDATION_ITEM_ID = 'my-foundation';

type SubjectHint = { matchedKey: string[]; missingKey: string[] } | null | undefined;

export interface AlignmentGate {
  level: 'aligned' | 'partial' | 'gap';
  tooltip: string;
}

/**
 * Derive the subject-alignment gate (aligned / partial / gap) from a
 * subjectHint. Shared by the rail + stepping renderers so the alarm reads
 * identically in both modes. Returns null when there's nothing to judge.
 */
export function useAlignmentGate(subjectHint: SubjectHint): AlignmentGate | null {
  return useMemo(() => {
    if (!subjectHint) return null;
    const matched = subjectHint.matchedKey.length;
    const missing = subjectHint.missingKey.length;
    const total = matched + missing;
    if (total === 0) return null;
    let level: AlignmentGate['level'];
    if (missing === 0) level = 'aligned';
    else if (matched === 0) level = 'gap';
    else level = 'partial';
    const tooltip =
      level === 'aligned'
        ? `Subjects aligned: ${subjectHint.matchedKey.join(', ')}. You meet the core requirements for this path.`
        : level === 'partial'
          ? `Gap: you still need ${subjectHint.missingKey.join(', ')}. Aligned so far: ${subjectHint.matchedKey.join(', ')}.`
          : `No required subjects yet. You'll need ${subjectHint.missingKey.join(', ')} to qualify for this path.`;
    return { level, tooltip };
  }, [subjectHint]);
}

/**
 * The subject-gap alarm badge — a 24px circle with a shield/alert icon.
 * Positioning is the caller's responsibility (rail places it on the
 * horizontal rail; stepping overlays it on the Now node).
 */
export function AlignmentGateBadge({ gate }: { gate: AlignmentGate }) {
  return (
    <div
      className={cn(
        'h-6 w-6 rounded-full flex items-center justify-center border-2 shadow-sm bg-background animate-pulse',
        gate.level === 'aligned'
          ? 'border-emerald-500 text-emerald-500'
          : 'border-rose-500 text-rose-500',
      )}
      title={gate.tooltip}
      aria-label={gate.tooltip}
    >
      {gate.level === 'aligned' ? (
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : gate.level === 'partial' ? (
        <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
      )}
    </div>
  );
}

interface UseFoundationDataOptions {
  careerTitle?: string;
  userAge?: number;
  journeyStartAge: number;
  /**
   * Extra subjects to consider alongside the profile's education
   * context — typically `journey.schoolTrack[0].subjects`. We merge
   * them in so the alignment gate matches the subjects visibly
   * displayed on the Starting Point card.
   */
  extraSubjects?: string[];
}

export function useFoundationData({
  careerTitle,
  userAge,
  journeyStartAge,
  extraSubjects,
}: UseFoundationDataOptions) {
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
    if (!careerTitle) return null;
    if (userAge != null && userAge >= 18) return null;
    const subjects: string[] = [];
    const add = (s: string) => {
      const trimmed = s.trim();
      if (trimmed.length < 2) return;
      if (subjects.some((ex) => ex.toLowerCase() === trimmed.toLowerCase())) return;
      subjects.push(trimmed);
    };
    for (const s of eduContext?.currentSubjects || []) add(s);
    if (eduContext?.studyProgram) {
      for (const p of eduContext.studyProgram.split(/[,;/&+]+/)) add(p);
    }
    for (const s of extraSubjects || []) add(s);
    if (subjects.length === 0 && !eduContext) return null;
    return calculateSubjectAlignment(subjects, careerTitle);
  }, [eduContext, careerTitle, userAge, extraSubjects]);

  const foundationItem: JourneyItem = useMemo(() => ({
    id: FOUNDATION_ITEM_ID,
    stage: 'foundation',
    title: 'Your Starting Point',
    subtitle: eduContext
      ? `${EDUCATION_STAGE_CONFIG[eduContext.stage].label}${eduContext.schoolName ? ` · ${eduContext.schoolName}` : ''}`
      : 'Tap to add details',
    startAge: userAge ?? journeyStartAge,
    isMilestone: false,
    icon: 'Target',
    description: eduContext
      ? `Your current education: ${EDUCATION_STAGE_CONFIG[eduContext.stage].label}.${eduContext.studyProgram ? ` Studying ${eduContext.studyProgram}.` : ''}${eduContext.expectedCompletion ? ` Finishing ${eduContext.expectedCompletion}.` : ''} This is your starting point — everything builds from here.`
      : 'Where you are today. Tap to add details about your current situation.',
    microActions: [
      'Identify which school subjects are most relevant to your goal',
      'Talk to your teachers about this career direction',
      'Research what grades are needed for the next step',
    ],
  }), [eduContext, userAge, journeyStartAge]);

  return { eduContext, subjectHint, foundationItem };
}
