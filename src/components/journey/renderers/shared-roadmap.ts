'use client';

/**
 * Shared model for the horizontal roadmap renderers (Winding Road + Stepping
 * Stones). Centralises the logic both views need so they stay in lockstep:
 *   • the inline foundation step ("Your Starting Point" / Now)
 *   • the "you are here" index (first not-yet-done item)
 *   • per-step visual state + age/year label
 *   • the subject-alignment gate (matched vs missing subjects)
 *
 * Design note on "current": the foundation is the user's genuine current
 * position, so only it carries the amber `current` emphasis. Journey items are
 * all upcoming — the first not-done one gets the lighter `next` treatment, the
 * rest `future`. This matches the most recent timeline design intent (a
 * years-away step should never be flagged as "current").
 */

import { useMemo } from 'react';
import type { JourneyItem } from '@/lib/journey/career-journey-types';
import type { RendererProps } from './types';
import type { StepState } from './shared-node';
import { useFoundationData, FOUNDATION_ITEM_ID } from './foundation-banner';
import { programmeCareerFit } from '@/lib/education/programme-fit';

export interface ComputedStep {
  item: JourneyItem;
  /** index into journey.items */
  index: number;
  state: StepState;
  ageLabel: string;
  scenarioAnnotation?: string;
}

export interface AlignmentGate {
  level: 'aligned' | 'partial' | 'gap';
  tooltip: string;
}

export function useRoadmapModel(props: RendererProps) {
  const {
    journey,
    cardDataMap,
    careerTitle,
    userAge,
    scenarioOverrides,
    showYears,
    birthYear,
  } = props;

  const items = journey.items;
  const schoolTrack = journey.schoolTrack;
  const firstSchool = schoolTrack && schoolTrack.length > 0 ? schoolTrack[0] : null;

  const { eduContext, foundationItem, subjectHint, foundationEmpty, foundationSubjects } = useFoundationData({
    careerTitle,
    userAge,
    journeyStartAge: journey.startAge,
  });
  const foundationStatus = cardDataMap?.[FOUNDATION_ITEM_ID]?.status;
  const foundationState: StepState = foundationStatus === 'done' ? 'completed' : 'current';

  const youAreHereIndex = useMemo(() => {
    for (let i = 0; i < items.length; i++) {
      if (cardDataMap?.[items[i].id]?.status !== 'done') return i;
    }
    return items.length - 1;
  }, [cardDataMap, items]);

  const computedSteps: ComputedStep[] = useMemo(() => {
    const ageLabelFor = (item: JourneyItem): string => {
      const hasRange = !!item.endAge && item.endAge !== item.startAge;
      const showingYears = showYears && birthYear != null;
      if (showingYears) {
        return hasRange
          ? `${birthYear! + item.startAge}–${birthYear! + item.endAge!}`
          : `${birthYear! + item.startAge}`;
      }
      return hasRange ? `Age ${item.startAge}–${item.endAge!}` : `Age ${item.startAge}`;
    };
    return items.map((item, i) => {
      const status = cardDataMap?.[item.id]?.status;
      let state: StepState;
      if (status === 'done') state = 'completed';
      else if (i === youAreHereIndex) state = 'next';
      else state = 'future';
      return {
        item,
        index: i,
        state,
        ageLabel: ageLabelFor(item),
        scenarioAnnotation: scenarioOverrides?.get(i),
      };
    });
  }, [items, cardDataMap, youAreHereIndex, scenarioOverrides, showYears, birthYear]);

  const educationIndex = useMemo(
    () => items.findIndex((it) => it.stage === 'education'),
    [items],
  );

  const alignmentGate: AlignmentGate | null = useMemo(() => {
    // No fit/alarm badge for the "Working" (other) or "Not working right now"
    // (between) starting points — there's no study programme to check against,
    // so a guardrail there is irrelevant and reads as noise.
    if (eduContext?.stage === 'between' || eduContext?.stage === 'other') return null;

    // 1. School-stage / under-18: subject-alignment gate (existing behaviour).
    if (subjectHint) {
      const matched = subjectHint.matchedKey.length;
      const missing = subjectHint.missingKey.length;
      if (matched + missing > 0) {
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
      }
    }

    // 2. University / college: quiet "check this fits" badge when the named
    // study programme doesn't naturally lead to the chosen career. Calm,
    // non-blocking; stays silent unless we're confident it's a mismatch.
    const stage = eduContext?.stage;
    if ((stage === 'university' || stage === 'college') && eduContext?.studyProgram && careerTitle) {
      if (programmeCareerFit(eduContext.studyProgram, careerTitle) === 'mismatch') {
        return {
          level: 'gap',
          tooltip: `A ${eduContext.studyProgram} programme doesn't usually lead straight into ${careerTitle}. That's okay — changing direction is normal, and usually means a conversion course or postgraduate step. Worth checking this path fits.`,
        };
      }
    }
    return null;
  }, [subjectHint, eduContext, careerTitle]);

  return {
    items,
    firstSchool,
    foundationItem,
    foundationStatus,
    foundationState,
    foundationEmpty,
    foundationSubjects,
    youAreHereIndex,
    computedSteps,
    educationIndex,
    alignmentGate,
    FOUNDATION_ITEM_ID,
  };
}
