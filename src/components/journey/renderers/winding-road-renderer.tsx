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

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { type JourneyItem, STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode, type StepState } from './shared-node';
import { useRoadmapModel } from './shared-roadmap';
import {
  BookOpen,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  Briefcase,
} from 'lucide-react';

const NODE_SIZE = 40;
const H_SPACING = 212;
const MARGIN_X = 88;
const LOW_Y = 196; // node sits low → card above
const HIGH_Y = 116; // node sits high → card below
const CARD_WIDTH = 176;
// Canvas height is cropped to the content. Cards + nodes hug the top of the
// rail, so a single fixed height left a tall empty band below it (most visible
// inline). The lowest content is a high-node card (~bottom 240); a forked
// role-evolution coda drops its lowest branch card lower (~bottom 300), so that
// shape gets a taller canvas. Both include a small safety margin.
const CANVAS_H = 360; // forked role-evolution coda (the tallest shape)
const CANVAS_H_COMPACT = 300; // linear / no coda — crops the empty band below
// Role-evolution coda — a calm continuation of the road into core → senior.
const CODA_Y = 156; // fixed mid-height so the branch fan is predictable
const CODA_CARD_W = 150;
const CODA_FAN = 96; // vertical gap between fanned branch nodes

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
  const { onItemClick, onProgressCycle, readOnly, cardDataMap, fitToWidth } = props;
  const {
    items,
    foundationItem,
    foundationStatus,
    foundationState,
    foundationEmpty,
    foundationSubjects,
    columns,
    educationIndex,
    alignmentGate,
    FOUNDATION_ITEM_ID,
  } = useRoadmapModel(props);

  // Node 0 = foundation, nodes 1..N = COLUMNS (a concurrent group is one stop,
  // which also condenses the road). Even index sits low (card above), odd index
  // sits high (card below) → the road weaves.
  const nodeCount = columns.length + 1;
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

  // ── Role-evolution coda geometry ─────────────────────────────────────
  // Continues the road past the last milestone into the core role, then either
  // forks (specialisms / tracks / grows-into) or runs to a single senior node.
  const tail = props.evolutionTail ?? null;
  const lastPoint = points[points.length - 1];
  const coda = useMemo(() => {
    if (!tail || !lastPoint) return null;
    const coreX = lastPoint.x + H_SPACING;
    const corePt: Pt = { x: coreX, y: CODA_Y };
    const connect = buildRoadPath([lastPoint, corePt]);
    if (tail.forked) {
      const forkX = coreX + Math.round(H_SPACING * 0.5);
      const branchX = coreX + H_SPACING + 24;
      const n = tail.branches.length;
      const branchPts = tail.branches.map((branch, i) => ({
        x: branchX,
        y: CODA_Y + (i - (n - 1) / 2) * CODA_FAN,
        branch,
      }));
      const branchPaths = branchPts.map((bp) =>
        buildRoadPath([corePt, { x: forkX, y: CODA_Y }, { x: bp.x, y: bp.y }]),
      );
      const rightEdge = branchX + NODE_SIZE / 2 + CODA_CARD_W + 28;
      return { forked: true as const, corePt, forkX, connect, branchPts, branchPaths, rightEdge };
    }
    const seniorX = coreX + H_SPACING;
    const seniorPt = { x: seniorX, y: CODA_Y, branch: tail.branches[0] };
    const seniorPath = buildRoadPath([corePt, { x: seniorX, y: CODA_Y }]);
    const rightEdge = seniorX + CODA_CARD_W / 2 + MARGIN_X;
    return { forked: false as const, corePt, connect, seniorPt, seniorPath, rightEdge };
  }, [tail, lastPoint]);

  const canvasWidth = coda ? Math.max(totalWidth, coda.rightEdge) : totalWidth;
  // Only the forked coda needs the taller canvas; every other shape uses the
  // compact height so the rail doesn't carry a big empty band beneath it.
  const canvasHeight = coda?.forked ? CANVAS_H : CANVAS_H_COMPACT;

  // Fit-to-width — in the fullscreen overlay the whole road should fit one
  // screen rather than scroll sideways. Measure the available width and scale
  // the fixed-width canvas down to fit (never up, so short roadmaps stay 1×).
  const fitRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const measureFit = useCallback(() => {
    const el = fitRef.current;
    if (!el) return;
    const avail = el.clientWidth;
    setFitScale(avail > 0 ? Math.min(1, avail / canvasWidth) : 1);
  }, [canvasWidth]);
  useEffect(() => {
    if (!fitToWidth) return;
    measureFit();
    const el = fitRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToWidth, measureFit]);

  return (
    <div className="-mx-2 px-2 pb-4">
      <div ref={fitRef} className={fitToWidth ? undefined : 'overflow-x-auto'}>
        <div style={fitToWidth ? { width: canvasWidth * fitScale, height: canvasHeight * fitScale } : undefined}>
        <div
          className="relative"
          style={
            fitToWidth
              ? { width: canvasWidth, height: canvasHeight, transform: `scale(${fitScale})`, transformOrigin: 'top left' }
              : { width: canvasWidth, height: canvasHeight }
          }
        >
          <svg
            className="pointer-events-none absolute inset-0"
            width={canvasWidth}
            height={canvasHeight}
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
                <path d="M0 0 L9 4.5 L0 9 z" className="fill-teal-500 dark:fill-slate-600" />
              </marker>
            </defs>
            {/* road body */}
            <path
              d={roadPath}
              fill="none"
              className="stroke-teal-300 dark:stroke-slate-800"
              strokeWidth={30}
              strokeLinecap="round"
            />
            {/* dashed centre line + arrowhead */}
            <path
              d={roadPath}
              fill="none"
              className="stroke-teal-500 dark:stroke-slate-600"
              strokeWidth={2.5}
              strokeDasharray="9 12"
              strokeLinecap="round"
              markerEnd={coda ? undefined : 'url(#wr-arrow)'}
            />

            {/* ── Role-evolution coda roads ─────────────────────────── */}
            {coda && (
              <>
                {/* connector: last milestone → core role */}
                <path d={coda.connect} fill="none" className="stroke-teal-300 dark:stroke-slate-800" strokeWidth={30} strokeLinecap="round" />
                <path d={coda.connect} fill="none" className="stroke-teal-500 dark:stroke-slate-600" strokeWidth={2.5} strokeDasharray="9 12" strokeLinecap="round" />
                {coda.forked ? (
                  coda.branchPaths.map((d, i) => (
                    <g key={i}>
                      <path d={d} fill="none" className="stroke-teal-300 dark:stroke-slate-800" strokeWidth={26} strokeLinecap="round" />
                      <path d={d} fill="none" className="stroke-teal-500 dark:stroke-slate-600" strokeWidth={2.5} strokeDasharray="9 12" strokeLinecap="round" markerEnd="url(#wr-arrow)" />
                    </g>
                  ))
                ) : (
                  <>
                    <path d={coda.seniorPath} fill="none" className="stroke-teal-300 dark:stroke-slate-800" strokeWidth={30} strokeLinecap="round" />
                    <path d={coda.seniorPath} fill="none" className="stroke-teal-500 dark:stroke-slate-600" strokeWidth={2.5} strokeDasharray="9 12" strokeLinecap="round" markerEnd="url(#wr-arrow)" />
                  </>
                )}
              </>
            )}
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
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background shadow-sm',
                    alignmentGate.level === 'aligned'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-rose-500 text-rose-500',
                    // Pulse only on a clear misalignment (e.g. a study programme
                    // that doesn't lead to the chosen career) to draw the eye;
                    // aligned / partial states stay calm and steady.
                    alignmentGate.level === 'gap' && 'animate-pulse',
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
            glow={foundationEmpty}
            onClick={() => !readOnly && onItemClick(foundationItem)}
            onProgressCycle={
              onProgressCycle && !readOnly ? () => onProgressCycle(FOUNDATION_ITEM_ID) : undefined
            }
            subjects={foundationSubjects}
          />

          {/* Journey columns — one stop per column (a concurrent group is one
              stop, with its parallel partners listed inside the card). */}
          {columns.map((column, ci) => {
            const step = column[0];
            const point = points[ci + 1];
            const cardAbove = (ci + 1) % 2 === 0;
            const concurrentWith = column.slice(1).map((c) => c.item.title);
            return (
              <RoadStop
                key={step.item.id}
                point={point}
                item={step.item}
                state={step.state}
                progressStatus={cardDataMap?.[step.item.id]?.status}
                ageLabel={step.ageLabel}
                scenarioAnnotation={step.scenarioAnnotation}
                concurrentWith={concurrentWith}
                cardAbove={cardAbove}
                onClick={() => onItemClick(step.item)}
                onProgressCycle={
                  onProgressCycle ? () => onProgressCycle(step.item.id) : undefined
                }
              />
            );
          })}

          {/* ── Role-evolution coda: core → (decision) → senior ─────── */}
          {coda && (
            <>
              {/* CORE role — card above the node */}
              <EvoStop point={coda.corePt} cardPlacement="above">
                <EvoCard tag="Core role" title={tail!.core.title} approxAge={tail!.core.approxAge} />
              </EvoStop>

              {coda.forked ? (
                <>
                  {/* decision marker at the fork */}
                  <DecisionMarker x={coda.forkX} y={CODA_Y} />
                  {coda.branchPts.map((bp) => (
                    <EvoStop key={bp.branch.title} point={bp} cardPlacement="right">
                      <EvoCard
                        tag="Grows into"
                        title={bp.branch.title}
                        approxAge={bp.branch.approxAge}
                        subLabel={bp.branch.trackLabel}
                      />
                    </EvoStop>
                  ))}
                </>
              ) : (
                <EvoStop point={coda.seniorPt} cardPlacement="above">
                  <EvoCard
                    tag="Grows into"
                    title={coda.seniorPt.branch.title}
                    approxAge={coda.seniorPt.branch.approxAge}
                  />
                </EvoStop>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

/** A non-interactive node on the evolution coda, with its card placed above the
 * node or to its right (used for the fanned branch nodes). */
function EvoStop({
  point,
  cardPlacement,
  children,
}: {
  point: Pt;
  cardPlacement: 'above' | 'right';
  children: ReactNode;
}) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: point.x, top: point.y }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-background text-slate-400 shadow-sm dark:border-slate-600 dark:text-slate-500">
        <Briefcase className="h-4 w-4" />
      </div>
      {cardPlacement === 'above' ? (
        <div
          className="absolute bottom-[calc(50%+14px)] left-1/2 flex -translate-x-1/2 flex-col items-center"
          style={{ width: CODA_CARD_W }}
        >
          {children}
          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-600" />
        </div>
      ) : (
        <div
          className="absolute left-[calc(50%+24px)] top-1/2 -translate-y-1/2"
          style={{ width: CODA_CARD_W }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** The "where the path opens up" decision diamond. */
function DecisionMarker({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
      title="Where the path opens up — choose a direction"
      aria-label="Decision point — the role branches here"
    >
      <div className="h-4 w-4 rotate-45 rounded-[3px] border-2 border-amber-500 bg-background shadow-sm dark:bg-card" />
    </div>
  );
}

/** A calm coda card — stage tag + real role title + approximate age. */
function EvoCard({
  tag,
  title,
  approxAge,
  subLabel,
}: {
  tag: string;
  title: string;
  approxAge: number;
  subLabel?: string;
}) {
  return (
    <div
      className="w-full rounded-xl border border-dashed border-slate-300 bg-card/60 p-2.5 text-center dark:border-slate-600"
      style={{ borderTopWidth: 3, borderTopColor: 'rgb(148 163 184)' }}
    >
      <div className="flex items-center justify-center gap-1">
        <TrendingUp className="h-2.5 w-2.5 text-slate-400" />
        <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</span>
        <span className="text-[10px] font-medium text-muted-foreground">· ~age {approxAge}</span>
      </div>
      <p className="mt-1 text-xs font-semibold leading-tight text-foreground/85">{title}</p>
      {subLabel && (
        <p className="mt-0.5 text-[10px] font-medium leading-snug text-muted-foreground/80">{subLabel}</p>
      )}
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
  glow,
  onClick,
  onProgressCycle,
  subjects,
  concurrentWith,
}: {
  point: Pt;
  item: JourneyItem;
  state: StepState;
  progressStatus?: 'not_started' | 'in_progress' | 'done';
  ageLabel?: string;
  scenarioAnnotation?: string;
  cardAbove: boolean;
  isFoundation?: boolean;
  glow?: boolean;
  onClick: () => void;
  onProgressCycle?: () => void;
  subjects?: string[];
  concurrentWith?: string[];
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
          glow={glow}
          concurrentWith={concurrentWith}
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
  glow,
  concurrentWith,
  onClick,
}: {
  item: JourneyItem;
  state: StepState;
  accent: string;
  ageLabel?: string;
  scenarioAnnotation?: string;
  isFoundation?: boolean;
  glow?: boolean;
  concurrentWith?: string[];
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
        glow && 'foundation-attn-glow',
      )}
      style={{ borderTopWidth: 3, borderTopColor: accent }}
    >
      {/* Age pill + Done — only on real journey steps. The foundation card
          drops the "Now" / "You" badges (it's clearly the starting point). */}
      {!isFoundation && (
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
              state === 'completed'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {ageLabel}
          </span>
          {state === 'completed' && (
            <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Check className="h-2 w-2" strokeWidth={4} /> Done
            </span>
          )}
        </div>
      )}
      <p
        className={cn(
          'text-xs font-semibold leading-tight',
          isFoundation ? '' : 'mt-1.5',
          state === 'future' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {item.title}
      </p>
      {isFoundation && glow ? (
        // Empty foundation — guidance prompt (the card also glows). Disappears
        // automatically once the user saves their details (glow → false).
        <p className="mt-1 text-[10px] font-medium leading-snug text-teal-600 dark:text-teal-300">
          Tap to add your starting point — it tailors your whole roadmap.
        </p>
      ) : item.subtitle ? (
        <p
          className={cn(
            'mt-0.5 text-[10px] font-medium leading-snug',
            state === 'future' ? 'text-muted-foreground/70' : 'text-foreground/65',
          )}
          title={item.description ?? undefined}
        >
          {item.subtitle}
        </p>
      ) : null}
      {concurrentWith && concurrentWith.length > 0 && (
        <p className="mt-1.5 rounded-md bg-teal-500/10 px-1.5 py-1 text-[9.5px] font-medium leading-snug text-teal-600 dark:text-teal-300">
          <span className="font-semibold uppercase tracking-wide">At the same time:</span>{' '}
          {concurrentWith.join(' · ')}
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
