'use client';

import { useMemo } from 'react';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { BookOpen, Check, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { useFoundationData, FOUNDATION_ITEM_ID } from './foundation-banner';

const NODE_SIZE = 40;
const H_SPACING = 200;
const CAREER_TRACK_Y = 40;
const CARD_WIDTH = 180;

export function RailRenderer({ journey, onItemClick, cardDataMap, onProgressCycle, careerTitle, userAge, readOnly, scenarioOverrides }: RendererProps) {
  const items = journey.items;
  const schoolTrack = journey.schoolTrack;
  const firstSchool = schoolTrack && schoolTrack.length > 0 ? schoolTrack[0] : null;

  const { foundationItem, subjectHint } = useFoundationData({
    careerTitle,
    userAge,
    journeyStartAge: journey.startAge,
    extraSubjects: firstSchool?.subjects,
  });
  const foundationStatus = cardDataMap?.[FOUNDATION_ITEM_ID]?.status;
  const foundationDone = foundationStatus === 'done';

  const youAreHereIndex = useMemo(() => {
    for (let i = 0; i < items.length; i++) {
      if (cardDataMap?.[items[i].id]?.status !== 'done') return i;
    }
    return items.length - 1;
  }, [cardDataMap, items]);

  const stateFor = (i: number): StepState => {
    const status = cardDataMap?.[items[i].id]?.status;
    if (status === 'done') return 'completed';
    if (i === youAreHereIndex) return 'current';
    if (i === youAreHereIndex + 1) return 'next';
    return 'future';
  };

  // Foundation occupies index 0 visually; real items shift by +1.
  const positions = useMemo(
    () => items.map((_, i) => ({ x: (i + 1) * H_SPACING + NODE_SIZE, y: CAREER_TRACK_Y })),
    [items]
  );
  const foundationPos = { x: NODE_SIZE, y: CAREER_TRACK_Y };

  const totalWidth = (items.length + 1) * H_SPACING + NODE_SIZE * 2;
  const totalHeight = CAREER_TRACK_Y + NODE_SIZE + 180;
  const careerLineY = CAREER_TRACK_Y + NODE_SIZE / 2;

  const foundationState: StepState = foundationDone ? 'completed' : 'current';

  // Alignment gate — sits on the rail immediately before the first
  // education step and signals whether the user's current school subjects
  // match the career's required subjects for that course. Only shows when
  // we have enough to judge: a career, a user, and ≥1 required subject.
  const educationIndex = useMemo(
    () => items.findIndex((it) => it.stage === 'education'),
    [items]
  );
  const alignmentGate = useMemo(() => {
    if (!subjectHint) return null;
    const matched = subjectHint.matchedKey.length;
    const missing = subjectHint.missingKey.length;
    const total = matched + missing;
    if (total === 0) return null;
    let level: 'aligned' | 'partial' | 'gap';
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

  return (
    <div className="pb-4 -mx-2 px-2">
      <div className="overflow-x-auto">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        <svg className="absolute inset-0 pointer-events-none" width={totalWidth} height={totalHeight}>
          <line
            x1={NODE_SIZE}
            y1={careerLineY}
            x2={totalWidth - NODE_SIZE}
            y2={careerLineY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>

        {/* Alignment gate — positioned on the rail immediately before the
            first education step (e.g. university course). Glows emerald
            when aligned, rose when any required subject is missing;
            native-title tooltip explains the state. */}
        {alignmentGate && educationIndex >= 0 && (() => {
          const eduPos = positions[educationIndex];
          const prevX = educationIndex === 0 ? foundationPos.x : positions[educationIndex - 1].x;
          const gateX = (prevX + eduPos.x) / 2 + NODE_SIZE / 2 - 12;
          return (
            <div
              className="absolute z-20"
              style={{ left: gateX, top: careerLineY - 12 }}
              title={alignmentGate.tooltip}
              aria-label={alignmentGate.tooltip}
            >
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center border-2 shadow-sm bg-background',
                  alignmentGate.level === 'aligned' &&
                    'border-emerald-500 text-emerald-500 animate-pulse',
                  alignmentGate.level === 'partial' &&
                    'border-rose-500 text-rose-500 animate-pulse',
                  alignmentGate.level === 'gap' &&
                    'border-rose-500 text-rose-500 animate-pulse',
                )}
              >
                {alignmentGate.level === 'aligned' ? (
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : alignmentGate.level === 'partial' ? (
                  <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </div>
            </div>
          );
        })()}

        {/* Foundation — rendered as inline step[0] for symmetry. */}
        <div className="absolute" style={{ left: foundationPos.x, top: foundationPos.y }}>
          <div className="flex flex-col items-center" style={{ width: CARD_WIDTH }}>
            <div className="flex justify-center mb-1" style={{ marginTop: -28 }}>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/15 text-teal-700 dark:text-teal-300">
                Now
              </span>
            </div>
            <SharedNode
              item={foundationItem}
              onClick={() => !readOnly && onItemClick(foundationItem)}
              size={NODE_SIZE}
              stepState={foundationState}
              progressStatus={foundationStatus}
              onProgressCycle={onProgressCycle && !readOnly ? () => onProgressCycle(FOUNDATION_ITEM_ID) : undefined}
            />
            <RailCard
              item={foundationItem}
              state={foundationState}
              onClick={() => !readOnly && onItemClick(foundationItem)}
            />
            {firstSchool && firstSchool.subjects.length > 0 && (
              <div className="mt-2 w-full">
                <CurrentSubjectBadge subjects={firstSchool.subjects} />
              </div>
            )}
          </div>
        </div>

        {items.map((item, i) => {
          const pos = positions[i];
          const ageLabel =
            item.endAge && item.endAge !== item.startAge
              ? `Age ${item.startAge}\u2013${item.endAge}`
              : `Age ${item.startAge}`;
          const state = stateFor(i);

          return (
            <div key={item.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
              <div className="flex flex-col items-center" style={{ width: CARD_WIDTH }}>
                <div className="flex justify-center mb-1" style={{ marginTop: -28 }}>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      state === 'current'
                        ? 'bg-card text-foreground ring-1 ring-border'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {ageLabel}
                  </span>
                </div>

                <SharedNode
                  item={item}
                  onClick={() => onItemClick(item)}
                  size={NODE_SIZE}
                  stepState={state}
                  progressStatus={cardDataMap?.[item.id]?.status}
                  onProgressCycle={onProgressCycle ? () => onProgressCycle(item.id) : undefined}
                />

                <RailCard
                  item={item}
                  state={state}
                  onClick={() => onItemClick(item)}
                  scenarioAnnotation={scenarioOverrides?.get(i)}
                />

              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function RailCard({
  item,
  state,
  onClick,
  scenarioAnnotation,
}: {
  item: JourneyItem;
  state: StepState;
  onClick: () => void;
  scenarioAnnotation?: string;
}) {
  const stateClasses: Record<StepState, string> = {
    completed: 'border-emerald-500/40 bg-emerald-500/[0.04]',
    current: 'border-amber-500/70 bg-card shadow-sm',
    next: 'border-border bg-card/70',
    future: 'border-border bg-card/70',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full min-h-[68px] mt-2 rounded-lg border p-2.5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer',
        'hover:border-amber-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        stateClasses[state]
      )}
    >
      {state === 'completed' && (
        <span className="absolute right-2 top-2 inline-flex items-center shrink-0 gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Check className="h-2 w-2" strokeWidth={4} />
          Done
        </span>
      )}
      <p
        className={cn(
          'text-xs font-semibold leading-tight',
          state === 'future' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {item.title}
      </p>
      {item.subtitle && (
        <p
          className={cn(
            'mt-0.5 text-[10px] leading-snug font-medium',
            state === 'future' ? 'text-muted-foreground/70' : 'text-foreground/65'
          )}
          title={item.description ?? undefined}
        >
          {item.subtitle}
        </p>
      )}
      {scenarioAnnotation && (
        <p className="mt-1 text-[10px] leading-snug text-violet-300/90 font-medium">
          {scenarioAnnotation}
        </p>
      )}
    </button>
  );
}

function CurrentSubjectBadge({ subjects }: { subjects: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        Current subjects
      </span>
      <span className="text-[10px] text-foreground/70 truncate">
        {subjects.join(' · ')}
      </span>
    </div>
  );
}
