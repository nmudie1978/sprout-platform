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
export const FOUNDATION_MICRO_ACTIONS: Record<EducationContext['stage'], string[]> = {
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
  between: [
    'Identify what employers actually require to get in',
    'Map the transferable skills your past experience already gives you',
    'Build momentum with a short course or qualification the next step needs',
  ],
};

interface UseFoundationDataOptions {
  careerTitle?: string;
  userAge?: number;
  journeyStartAge: number;
}

export function useFoundationData({
  careerTitle,
  userAge,
  journeyStartAge,
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
    // ONLY the user's own subjects drive the alignment gate — never the
    // career's recommended subjects (those aren't the user's choices, so
    // aligning them against the career is meaningless and misleading).
    for (const s of eduContext?.currentSubjects || []) add(s);
    if (eduContext?.studyProgram) {
      for (const p of eduContext.studyProgram.split(/[,;/&+]+/)) add(p);
    }
    // No subjects entered → no alignment gate (nothing of the user's to align).
    if (subjects.length === 0) return null;
    return calculateSubjectAlignment(subjects, careerTitle);
  }, [eduContext, careerTitle, userAge]);

  const foundationItem: JourneyItem = useMemo(() => ({
    id: FOUNDATION_ITEM_ID,
    stage: 'foundation',
    title: 'Your Starting Point',
    subtitle: !eduContext
      ? 'Tap to add details'
      : eduContext.stage === 'other'
        ? (eduContext.currentRole
            ? `In work · ${eduContext.currentRole}${eduContext.schoolName ? ` at ${eduContext.schoolName}` : ''}`
            : (eduContext.schoolName ? `In work · ${eduContext.schoolName}` : 'In work'))
        : eduContext.stage === 'between'
          ? (eduContext.previousOccupation ? `Not working · was ${eduContext.previousOccupation}` : 'Not working right now')
          : `${EDUCATION_STAGE_CONFIG[eduContext.stage].label}${eduContext.schoolName ? ` · ${eduContext.schoolName}` : ''}`,
    startAge: userAge ?? journeyStartAge,
    isMilestone: false,
    icon: 'Target',
    description: !eduContext
      ? 'Where you are today. Tap to add details about your current situation.'
      : eduContext.stage === 'other'
        ? `${eduContext.currentRole ? `You work as ${eduContext.currentRole}${eduContext.schoolName ? ` at ${eduContext.schoolName}` : ''}. ` : "You're in work. "}Your roadmap builds from here toward your goal, using the experience you already bring.`
        : eduContext.stage === 'between'
          ? `You're not working right now${eduContext.previousOccupation ? `, after working as ${eduContext.previousOccupation}` : ''} — that's your starting point. Your roadmap builds from here toward your goal.`
          : `Your current education: ${EDUCATION_STAGE_CONFIG[eduContext.stage].label}.${eduContext.studyProgram ? ` Studying ${eduContext.studyProgram}.` : ''}${eduContext.expectedCompletion ? ` Finishing ${eduContext.expectedCompletion}.` : ''} This is your starting point — everything builds from here.`,
    microActions: FOUNDATION_MICRO_ACTIONS[eduContext?.stage ?? 'school'],
  }), [eduContext, userAge, journeyStartAge]);

  // The user's OWN subjects (what they've told us they study) — drives the
  // "Subjects" badge on the Starting Point card. Never the career's
  // recommended subjects.
  const foundationSubjects = eduContext?.currentSubjects ?? [];

  // "Not filled in yet" — drives the attention glow + guidance prompt on the
  // Starting Point card. Robust: an education context that carries only a
  // default stage (no school, no subjects, no programme) still counts as
  // EMPTY, because the user hasn't actually told us anything about their
  // starting point. Clears automatically once real details are saved.
  const foundationEmpty =
    !eduContext ||
    // "Not working right now" (between) is itself a complete, honest starting
    // point — selecting it means the user HAS told us their situation, so the
    // glow + "tap to add" prompt must clear (and the roadmap key flips so it
    // regenerates).
    (eduContext.stage !== 'between' &&
      !eduContext.schoolName?.trim() &&
      foundationSubjects.length === 0 &&
      !eduContext.studyProgram?.trim() &&
      // Working / career-changer users fill in their current role instead of
      // school details — that counts as "filled" too, so the glow + "tap to
      // add" prompt clears for them (was the bug: a saved role still read as
      // empty because only school fields were checked).
      !eduContext.currentRole?.trim() &&
      // Bridge-routes users may only fill "what did you do before" — that's
      // real starting-point info too.
      !eduContext.previousOccupation?.trim());

  return { eduContext, subjectHint, foundationItem, foundationEmpty, foundationSubjects };
}
