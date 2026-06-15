'use client';

/**
 * Winding Road renderer — the default Clarity-tab roadmap.
 *
 * A road snakes left→right with a milestone card planted on each bend,
 * alternating above / below the road, and an arrowhead at the destination.
 * Foundation ("Your Starting Point") is the first stop. Text-light: each card
 * shows title + subtitle + age; the full detail (how-to, resources, notes)
 * opens in the detail dialog on tap. Theme-aware, scrolls on mobile.
 *
 * Wired to real journey data via {@link useRoadmapModel}, so it keeps every
 * existing feature: click-to-detail, progress states, "you are here",
 * subject-alignment gate, year stamps, scenario overrides and read-only mode.
 */

import { useMemo } from 'react';
import { type JourneyItem, STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { useRoadmapModel } from './shared-roadmap';
import {
  BookOpen,
  Check,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

const NODE_SIZE = 40;
const H_SPACING = 212;
const MARGIN_X = 88;
const LOW_Y = 196; // node sits low → card above
const HIGH_Y = 116; // node sits high → card below
const CARD_WIDTH = 176;
const CANVAS_H = 432;

interface Pt {
  x: number;
  y: number;
}

/** Smooth S-curve road through alternating-height node points. */
function buildRoadPath(points: Pt[]): string {
  if (points.length < 2) return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function WindingRoadRenderer(props: RendererProps) {
  const { onItemClick, onProgressCycle, readOnly, cardDataMap } = props;
  const {
    items,
    firstSchool,
    foundationItem,
    foundationStatus,
    foundationState,
    computedSteps,
    educationIndex,
    alignmentGate,
    FOUNDATION_ITEM_ID,
  } = useRoadmapModel(props);

  // Node 0 = foundation, nodes 1..N = items. Even index sits low (card above),
  // odd index sits high (card below) → the road weaves.
  const nodeCount = items.length + 1;
  const points: Pt[] = useMemo(
    () =>
      Array.from({ length: nodeCount }, (_, i) => ({
        x: MARGIN_X + i * H_SPACING,
        y: i % 2 === 0 ? LOW_Y : HIGH_Y,
      })),
    [nodeCount],
  );

  const totalWidth = MARGIN_X * 2 + (nodeCount - 1) * H_SPACING;
  const roadPath = buildRoadPath(points);

  return (
    <div className="-mx-2 px-2 pb-4">
      <div className="overflow-x-auto">
        <div className="relative" style={{ width: totalWidth, height: CANVAS_H }}>
          <svg
            className="pointer-events-none absolute inset-0"
            width={totalWidth}
            height={CANVAS_H}
            aria-hidden
          >
            <defs>
              <marker
                id="wr-arrow"
                markerWidth="9"
                markerHeight="9"
                refX="5"
                refY="4.5"
                orient="auto"
              >
                <path d="M0 0 L9 4.5 L0 9 z" className="fill-slate-300 dark:fill-slate-600" />
              </marker>
            </defs>
            {/* road body */}
            <path
              d={roadPath}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={30}
              strokeLinecap="round"
            />
            {/* dashed centre line + arrowhead */}
            <path
              d={roadPath}
              fill="none"
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={2.5}
              strokeDasharray="9 12"
              strokeLinecap="round"
              markerEnd="url(#wr-arrow)"
            />
          </svg>

          {/* Alignment gate — on the road just before the first education step. */}
          {alignmentGate && educationIndex >= 0 && (() => {
            const eduPoint = points[educationIndex + 1]; // +1: foundation offset
            const prevPoint = points[educationIndex];
            const gx = (prevPoint.x + eduPoint.x) / 2;
            const gy = (prevPoint.y + eduPoint.y) / 2;
            return (
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: gx, top: gy }}
                title={alignmentGate.tooltip}
                aria-label={alignmentGate.tooltip}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background shadow-sm animate-pulse',
                    alignmentGate.level === 'aligned'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-rose-500 text-rose-500',
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

          {/* Foundation — node 0 */}
          <RoadStop
            point={points[0]}
            item={foundationItem}
            state={foundationState}
            progressStatus={foundationStatus}
            cardAbove
            isFoundation
            onClick={() => !readOnly && onItemClick(foundationItem)}
            onProgressCycle={
              onProgressCycle && !readOnly ? () => onProgressCycle(FOUNDATION_ITEM_ID) : undefined
            }
            subjects={firstSchool?.subjects}
          />

          {/* Journey items */}
          {computedSteps.map((step) => {
            const point = points[step.index + 1];
            const cardAbove = (step.index + 1) % 2 === 0;
            return (
              <RoadStop
                key={step.item.id}
                point={point}
                item={step.item}
                state={step.state}
                progressStatus={cardDataMap?.[step.item.id]?.status}
                ageLabel={step.ageLabel}
                scenarioAnnotation={step.scenarioAnnotation}
                cardAbove={cardAbove}
                onClick={() => onItemClick(step.item)}
                onProgressCycle={
                  onProgressCycle ? () => onProgressCycle(step.item.id) : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoadStop({
  point,
  item,
  state,
  progressStatus,
  ageLabel,
  scenarioAnnotation,
  cardAbove,
  isFoundation,
  onClick,
  onProgressCycle,
  subjects,
}: {
  point: Pt;
  item: JourneyItem;
  state: StepState;
  progressStatus?: 'not_started' | 'in_progress' | 'done';
  ageLabel?: string;
  scenarioAnnotation?: string;
  cardAbove: boolean;
  isFoundation?: boolean;
  onClick: () => void;
  onProgressCycle?: () => void;
  subjects?: string[];
}) {
  const accent = STAGE_CONFIG[item.stage].color;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: point.x, top: point.y }}
    >
      {/* node on the road */}
      <SharedNode
        item={item}
        onClick={onClick}
        size={NODE_SIZE}
        stepState={state}
        progressStatus={progressStatus}
        onProgressCycle={onProgressCycle}
      />

      {/* pole + card, above or below the node */}
      <div
        className={cn(
          'absolute left-1/2 flex -translate-x-1/2 flex-col items-center',
          cardAbove ? 'bottom-[calc(50%+14px)]' : 'top-[calc(50%+14px)]',
        )}
        style={{ width: CARD_WIDTH }}
      >
        {!cardAbove && <span className="h-3.5 w-px" style={{ background: accent }} />}
        <RoadCard
          item={item}
          state={state}
          accent={accent}
          ageLabel={ageLabel}
          scenarioAnnotation={scenarioAnnotation}
          isFoundation={isFoundation}
          onClick={onClick}
        />
        {isFoundation && subjects && subjects.length > 0 && (
          <div className="mt-1.5 w-full">
            <CurrentSubjectBadge subjects={subjects} />
          </div>
        )}
        {cardAbove && <span className="h-3.5 w-px" style={{ background: accent }} />}
      </div>
    </div>
  );
}

function RoadCard({
  item,
  state,
  accent,
  ageLabel,
  scenarioAnnotation,
  isFoundation,
  onClick,
}: {
  item: JourneyItem;
  state: StepState;
  accent: string;
  ageLabel?: string;
  scenarioAnnotation?: string;
  isFoundation?: boolean;
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
        'relative w-full rounded-xl border bg-card p-2.5 text-center transition-colors',
        'hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        stateClasses[state],
      )}
      style={{ borderTopWidth: 3, borderTopColor: accent }}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
            isFoundation
              ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
              : state === 'completed'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {isFoundation ? 'Now' : ageLabel}
        </span>
        {state === 'completed' && !isFoundation && (
          <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Check className="h-2 w-2" strokeWidth={4} /> Done
          </span>
        )}
        {isFoundation && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
            <MapPin className="h-2.5 w-2.5" /> You
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-1.5 text-xs font-semibold leading-tight',
          state === 'future' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {item.title}
      </p>
      {item.subtitle && (
        <p
          className={cn(
            'mt-0.5 text-[10px] font-medium leading-snug',
            state === 'future' ? 'text-muted-foreground/70' : 'text-foreground/65',
          )}
          title={item.description ?? undefined}
        >
          {item.subtitle}
        </p>
      )}
      {scenarioAnnotation && (
        <p className="mt-1 text-[10px] font-medium leading-snug text-violet-500 dark:text-violet-300/90">
          {scenarioAnnotation}
        </p>
      )}
    </button>
  );
}

function CurrentSubjectBadge({ subjects }: { subjects: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        Subjects
      </span>
      <span className="truncate text-[10px] text-foreground/70">{subjects.join(' · ')}</span>
    </div>
  );
}
