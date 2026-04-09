'use client';

import { useMemo } from 'react';
import { type JourneyItem, type SchoolTrackItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { BookOpen, Check } from 'lucide-react';

const NODE_SIZE = 40;
const H_SPACING = 200;
const CAREER_TRACK_Y = 40;
const CARD_WIDTH = 180;

export function RailRenderer({ journey, onItemClick, cardDataMap, onProgressCycle }: RendererProps) {
  const items = journey.items;
  const schoolTrack = journey.schoolTrack;
  const firstSchool = schoolTrack && schoolTrack.length > 0 ? schoolTrack[0] : null;

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

  const positions = useMemo(
    () => items.map((_, i) => ({ x: i * H_SPACING + NODE_SIZE, y: CAREER_TRACK_Y })),
    [items]
  );

  const totalWidth = items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = CAREER_TRACK_Y + NODE_SIZE + 180;
  const careerLineY = CAREER_TRACK_Y + NODE_SIZE / 2;

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
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

                <RailCard item={item} state={state} onClick={() => onItemClick(item)} />

                {i === 0 && firstSchool && (
                  <div className="mt-2 w-full">
                    <SchoolBadge item={firstSchool} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RailCard({
  item,
  state,
  onClick,
}: {
  item: JourneyItem;
  state: StepState;
  onClick: () => void;
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
        'w-full text-left rounded-lg border p-2.5 mt-2 transition-colors cursor-pointer',
        'hover:border-amber-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        stateClasses[state]
      )}
    >
      <div className="flex items-center justify-end gap-1 mb-1 min-h-[12px]">
        {state === 'completed' ? (
          <span className="inline-flex items-center shrink-0 gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Check className="h-2 w-2" strokeWidth={4} />
            Done
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          'text-xs font-semibold leading-tight',
          state === 'future' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {item.title}
      </p>
    </button>
  );
}

function SchoolBadge({ item }: { item: SchoolTrackItem }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-2">
      <div className="flex items-center gap-1.5 mb-1">
        <BookOpen className="h-3 w-3 text-muted-foreground" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Starting subjects
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {item.subjects.map((subject) => (
          <span
            key={subject}
            className="inline-block rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-foreground/80"
          >
            {subject}
          </span>
        ))}
      </div>
    </div>
  );
}
