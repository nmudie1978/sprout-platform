'use client';

import { useMemo } from 'react';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { Check, Banknote } from 'lucide-react';
import { getAllCareers, getCareerById } from '@/lib/career-pathways';

const NODE_SIZE = 40;
const ROW_HEIGHT = 90;
const LINE_X = NODE_SIZE / 2;

export function SteppingRenderer({ journey, onItemClick, cardDataMap, onProgressCycle, careerTitle }: RendererProps) {
  const items = journey.items;
  const totalHeight = items.length * ROW_HEIGHT + NODE_SIZE;

  // Earnings indicator
  const earningsInfo = useMemo(() => {
    if (!careerTitle) return null;
    const slug = careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const career = getCareerById(slug) ?? getAllCareers().find(c => c.title === careerTitle);
    if (!career?.avgSalary) return null;
    const nums = career.avgSalary.match(/[\d,]+/g);
    if (!nums || nums.length < 1) return null;
    const low = nums[0].replace(/,/g, '');
    const high = nums.length >= 2 ? nums[nums.length - 1].replace(/,/g, '') : null;
    let firstExpIdx = -1;
    let lastCareerIdx = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].stage === 'experience' && firstExpIdx === -1) firstExpIdx = i;
      if (items[i].stage === 'career') lastCareerIdx = i;
    }
    const fmt = (n: string) => { const v = parseInt(n, 10); return isNaN(v) ? n : v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`; };
    return {
      firstExpIdx,
      lastCareerIdx,
      entryLabel: high ? `~${fmt(low)}–${fmt(high)} kr` : `~${fmt(low)} kr`,
      seniorLabel: high ? `~${fmt(high)}+ kr` : null,
    };
  }, [careerTitle, items]);

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

      {items.map((item, i) => {
        const topOffset = i * ROW_HEIGHT;
        const ageLabel =
          item.endAge && item.endAge !== item.startAge
            ? `Age ${item.startAge}–${item.endAge}`
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
              earningsHint={
                earningsInfo && i === earningsInfo.firstExpIdx
                  ? earningsInfo.entryLabel
                  : earningsInfo?.seniorLabel && i === earningsInfo.lastCareerIdx
                    ? earningsInfo.seniorLabel
                    : undefined
              }
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
  earningsHint,
}: {
  item: JourneyItem;
  ageLabel: string;
  state: StepState;
  onClick: () => void;
  earningsHint?: string;
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
      {earningsHint && (
        <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-medium">
          <Banknote className="h-2.5 w-2.5" />
          {earningsHint}
        </span>
      )}
    </button>
  );
}
