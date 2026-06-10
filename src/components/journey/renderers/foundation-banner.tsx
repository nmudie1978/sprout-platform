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
import { EDUCATION_STAGE_CONFIG, type EducationContext } from '@/lib/education/types';
import { calculateSubjectAlignment } from '@/lib/education/alignment';
import type { JourneyItem } from '@/lib/journey/career-journey-types';

/** Stable ID — must match the id other surfaces check against. */
export const FOUNDATION_ITEM_ID = 'my-foundation';

/**
 * "What this involves" suggestions, tailored to the user's current stage.
 * Previously hardcoded to school language ("school subjects", "your
 * teachers"), which read wrong for university, college, and older users
 * who are out of formal education. Keyed by the Foundation stage.
 */
const FOUNDATION_MICRO_ACTIONS: Record<EducationContext['stage'], string[]> = {
  school: [
    'Identify which school subjects are most relevant to your goal',
    'Talk to your teachers about this career direction',
    'Research what grades are needed for the next step',
  ],
  university: [
    'Map which modules and projects connect to your goal',
    'Talk to a lecturer or the careers service about this direction',
    'Look for internships or placements that fit the next step',
  ],
  college: [
    'Identify which parts of your programme matter most for this goal',
    'Talk to your instructor or apprenticeship coordinator',
    'Research the qualification or fagbrev the next step needs',
  ],
  other: [
    'Identify what employers actually require to get in',
    'Build evidence of relevant skills — a portfolio or short courses',
    'Research the qualification or experience the next step needs',
  ],
};

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
    microActions: FOUNDATION_MICRO_ACTIONS[eduContext?.stage ?? 'school'],
  }), [eduContext, userAge, journeyStartAge]);

  return { eduContext, subjectHint, foundationItem };
}
