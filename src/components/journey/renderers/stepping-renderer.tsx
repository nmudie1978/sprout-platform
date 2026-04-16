'use client';

import { useMemo } from 'react';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { Check } from 'lucide-react';
import { useFoundationData, FOUNDATION_ITEM_ID } from './foundation-banner';

const NODE_SIZE = 40;
const ROW_HEIGHT = 90;
const LINE_X = NODE_SIZE / 2;

export function SteppingRenderer({ journey, onItemClick, cardDataMap, onProgressCycle, careerTitle, userAge, readOnly, scenarioOverrides, showYears, birthYear }: RendererProps) {
  const items = journey.items;
  const totalHeight = (items.length + 1) * ROW_HEIGHT + NODE_SIZE;

  const { foundationItem } = useFoundationData({
    careerTitle,
    userAge,
    journeyStartAge: journey.startAge,
  });
  const foundationStatus = cardDataMap?.[FOUNDATION_ITEM_ID]?.status;
  const foundationDone = foundationStatus === 'done';
  const foundationState: StepState = foundationDone ? 'completed' : 'current';

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

  return (
    <div className="relative" style={{ minHeight: totalHeight }}>
      <svg
        className="absolute left-0 top-0 pointer-events-none"
        width={NODE_SIZE}
        height={totalHeight}
      >
        <line
          x1={LINE_X}
          y1={NODE_SIZE / 2}
          x2={LINE_X}
          y2={totalHeight - NODE_SIZE / 2}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* Foundation — rendered as inline step[0] for symmetry. */}
      <div
        className="absolute flex items-start gap-3"
        style={{ top: 0, left: 0, right: 0 }}
      >
        <div className="flex-shrink-0">
          <SharedNode
            item={foundationItem}
            onClick={() => !readOnly && onItemClick(foundationItem)}
            size={NODE_SIZE}
            stepState={foundationState}
            progressStatus={foundationStatus}
            onProgressCycle={onProgressCycle && !readOnly ? () => onProgressCycle(FOUNDATION_ITEM_ID) : undefined}
          />
        </div>
        <SteppingCard
          item={foundationItem}
          ageLabel="Now"
          state={foundationState}
          onClick={() => !readOnly && onItemClick(foundationItem)}
        />
      </div>

      {items.map((item, i) => {
        const topOffset = (i + 1) * ROW_HEIGHT;
        // When "Show years" is on we render only the calendar year
        // range — stacking "Age 23–27 · 2032–2036" into the pill was
        // overflowing the card's top corner and read as messy. Years
        // are the more useful anchor anyway (they map to real dates).
        // When "Show years" is off we keep the age range as the label.
        const showingYears = showYears && birthYear != null;
        const hasRange = !!item.endAge && item.endAge !== item.startAge;
        const ageLabel = showingYears
          ? hasRange
            ? `${birthYear + item.startAge}–${birthYear + item.endAge!}`
            : `${birthYear + item.startAge}`
          : hasRange
            ? `Age ${item.startAge}–${item.endAge!}`
            : `Age ${item.startAge}`;
        const state = stateFor(i);

        return (
          <div
            key={item.id}
            className="absolute flex items-start gap-3"
            style={{ top: topOffset, left: 0, right: 0 }}
          >
            <div className="flex-shrink-0">
              <SharedNode
                item={item}
                onClick={() => onItemClick(item)}
                size={NODE_SIZE}
                stepState={state}
                progressStatus={cardDataMap?.[item.id]?.status}
                onProgressCycle={onProgressCycle ? () => onProgressCycle(item.id) : undefined}
              />
            </div>

            <SteppingCard
              item={item}
              ageLabel={ageLabel}
              state={state}
              onClick={() => onItemClick(item)}
              scenarioAnnotation={scenarioOverrides?.get(i)}
            />
          </div>
        );
      })}
    </div>
  );
}

function SteppingCard({
  item,
  ageLabel,
  state,
  onClick,
  scenarioAnnotation,
}: {
  item: JourneyItem;
  ageLabel: string;
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
        'relative flex-1 min-h-[80px] rounded-lg border p-2.5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer',
        'hover:border-amber-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        stateClasses[state]
      )}
    >
      {/* Age pill in top-left, Done badge in top-right — both
          absolutely positioned so the title sits visually centred
          regardless of which corners are populated. */}
      <span
        className={cn(
          'absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
          state === 'current'
            ? 'bg-card text-foreground ring-1 ring-border'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {ageLabel}
      </span>
      {state === 'completed' && (
        <span className="absolute right-2 top-2 inline-flex items-center shrink-0 gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Check className="h-2 w-2" strokeWidth={4} />
          Done
        </span>
      )}
      <p
        className={cn(
          'text-sm font-semibold leading-tight mt-3',
          state === 'future' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {item.title}
      </p>
      {item.subtitle && (
        <p
          className={cn(
            'mt-0.5 text-[11px] leading-snug font-medium',
            state === 'future' ? 'text-muted-foreground/70' : 'text-foreground/65'
          )}
          title={item.description ?? undefined}
        >
          {item.subtitle}
        </p>
      )}
      {scenarioAnnotation && (
        <p className="mt-1 text-[11px] leading-snug text-violet-300/90 font-medium">
          {scenarioAnnotation}
        </p>
      )}
    </button>
  );
}
