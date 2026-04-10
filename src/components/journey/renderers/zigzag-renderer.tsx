'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Check, Pencil, AlertTriangle } from 'lucide-react';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType, calculateSubjectAlignment } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import type { EducationContext } from '@/lib/education/types';
import { EDUCATION_STAGE_CONFIG } from '@/lib/education/types';
import { cn } from '@/lib/utils';
import type { RendererProps, CardDataSummary } from './types';
import { SharedNode, type StepState } from './shared-node';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

const NODE_SIZE = 40;
const H_SPACING = 180;
const HIGH_Y = 90;
const LOW_Y = 220;
const CARD_WIDTH = 150;
const AGE_MARKER_HEIGHT = 24;
const SCHOOL_NODE_WIDTH = 290;

/** Stable ID for the "Your Foundation" synthetic item — persists across goal changes */
export const FOUNDATION_ITEM_ID = 'my-foundation';

export function ZigzagRenderer({
  journey,
  onItemClick,
  userAge,
  cardDataMap,
  onProgressCycle,
  careerTitle,
  readOnly = false,
  simulation,
}: RendererProps) {
  const simActive = simulation?.isPlaying ?? false;
  // Filter out duplicated foundation
  const items = useMemo(
    () =>
      journey.items.filter(
        (item, i) =>
          !(
            i === 0 &&
            item.stage === 'foundation' &&
            item.title.toLowerCase().includes('your foundation')
          )
      ),
    [journey.items]
  );

  // Education context for the foundation card
  const { data: eduData } = useQuery<{ educationContext: EducationContext | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });
  const eduContext = eduData?.educationContext;

  // Subject hint — only for under-18s. We pull the user's known subjects
  // from the saved education context (currentSubjects + anything they
  // typed into studyProgram) and surface what's matched / still needed
  // for their chosen career. Quietly skipped if we don't have a mapping
  // for the career or the user is 18+.
  const subjectHint = useMemo(() => {
    if (!eduContext || !careerTitle) return null;
    if (userAge != null && userAge >= 18) return null;
    const subjects = [...(eduContext.currentSubjects || [])];
    if (eduContext.studyProgram) {
      const parsed = eduContext.studyProgram
        .split(/[,;/&+]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1);
      for (const p of parsed) {
        if (!subjects.some((ex) => ex.toLowerCase() === p.toLowerCase())) subjects.push(p);
      }
    }
    const a = calculateSubjectAlignment(subjects, careerTitle);
    if (a.alignment === 'unknown' && a.missingKey.length === 0) return null;
    return a;
  }, [eduContext, careerTitle, userAge]);

  // "You are here" derived from progress: first non-done step
  const derivedYouAreHereIndex = useMemo(() => {
    const foundationDone = cardDataMap?.[FOUNDATION_ITEM_ID]?.status === 'done';
    if (!foundationDone) return -1;
    for (let i = 0; i < items.length; i++) {
      const s = cardDataMap?.[items[i].id]?.status;
      if (s !== 'done') return i;
    }
    return items.length - 1;
  }, [cardDataMap, items]);

  const [manualYouAreHereIndex, setManualYouAreHereIndex] = useState<number | null>(null);
  const youAreHereIndex = manualYouAreHereIndex ?? derivedYouAreHereIndex;
  const youAreHereStatus =
    youAreHereIndex === -1
      ? cardDataMap?.[FOUNDATION_ITEM_ID]?.status
      : cardDataMap?.[items[youAreHereIndex]?.id]?.status;
  const canGoBack = youAreHereIndex > -1;
  const canGoForward = youAreHereStatus === 'done' && youAreHereIndex < items.length - 1;

  /** Compute step state for an index. Single source of truth. */
  const stateFor = (i: number): StepState => {
    const status = cardDataMap?.[items[i].id]?.status;
    if (status === 'done') return 'completed';
    if (i === youAreHereIndex) return 'current';
    if (i === youAreHereIndex + 1) return 'next';
    return 'future';
  };

  /** Sequential gating — locked until every earlier step is done. */
  const isLocked = (i: number): boolean => {
    for (let j = 0; j < i; j++) {
      if (cardDataMap?.[items[j].id]?.status !== 'done') return true;
    }
    return false;
  };

  // Layout
  const schoolNodeOffset = SCHOOL_NODE_WIDTH + 40;
  const positions = useMemo(
    () =>
      items.map((_, i) => ({
        x: schoolNodeOffset + i * H_SPACING + NODE_SIZE,
        y: i % 2 === 0 ? HIGH_Y : LOW_Y,
      })),
    [items, schoolNodeOffset]
  );

  const totalWidth = schoolNodeOffset + items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = LOW_Y + NODE_SIZE + 120;

  // Start the connector flush against the right edge of the Foundation
  // card (left:12 + width:280) at the same vertical centre as the first
  // step node, so the line visibly emerges from the card and joins step 1.
  const FOUNDATION_CARD_LEFT = 12;
  const FOUNDATION_CARD_WIDTH = 280;
  const schoolConnectionPoint = `${FOUNDATION_CARD_LEFT + FOUNDATION_CARD_WIDTH},${HIGH_Y + NODE_SIZE / 2}`;
  const polylinePoints = useMemo(
    () =>
      [
        schoolConnectionPoint,
        ...positions.map((p) => `${p.x + NODE_SIZE / 2},${p.y + NODE_SIZE / 2}`),
      ].join(' '),
    [positions, schoolConnectionPoint]
  );

  const foundationStatus = cardDataMap?.[FOUNDATION_ITEM_ID]?.status;
  const isFoundationCurrent = youAreHereIndex === -1;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
          {/* Connector line — calm neutral stroke with a slow opacity
              pulse so the path feels "alive" without becoming flashy.
              motion-safe so reduced-motion users get a static line. */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalWidth}
            height={totalHeight}
          >
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700 motion-safe:animate-[roadmap-line-pulse_6s_ease-in-out_infinite]"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* ── Foundation anchor card ─────────────────────────────────
              On reference routes the card is rendered greyed-out and
              non-interactive — the user's foundation only belongs to
              "Your route", so on alt routes it's a disabled visual. */}
          <div
            className={cn(
              'absolute transition-all duration-700 ease-out',
              simActive && simulation!.currentStepIndex !== -1 ? 'opacity-20' : '',
              simActive && simulation!.currentStepIndex === -1 && 'z-20 scale-105',
            )}
            style={{
              left: 12,
              top: HIGH_Y - 16,
              ...(simActive && simulation!.currentStepIndex === -1
                ? { filter: 'drop-shadow(0 0 12px rgba(20,184,166,0.5)) drop-shadow(0 0 30px rgba(20,184,166,0.2))' }
                : {}),
            }}
          >
            {userAge && (
              <div
                className="flex justify-center mb-1.5"
                style={{ marginTop: -AGE_MARKER_HEIGHT - 4 }}
              >
                <AgePill label={`Age ${userAge}`} active={isFoundationCurrent} />
              </div>
            )}
            <FoundationCard
              eduContext={eduContext}
              subjectHint={subjectHint}
              isCurrent={isFoundationCurrent && !readOnly}
              status={foundationStatus}
              careerTitle={careerTitle}
              disabled={readOnly}
              onOpen={() => {
                const foundationItem: JourneyItem = {
                  id: FOUNDATION_ITEM_ID,
                  stage: 'foundation',
                  title: 'Your Foundation',
                  subtitle: eduContext
                    ? `${EDUCATION_STAGE_CONFIG[eduContext.stage].label}${eduContext.schoolName ? ` · ${eduContext.schoolName}` : ''}`
                    : 'Where you are today',
                  startAge: userAge ?? journey.startAge,
                  isMilestone: false,
                  icon: 'Sparkles',
                  description: eduContext
                    ? `Your current education: ${EDUCATION_STAGE_CONFIG[eduContext.stage].label}.${eduContext.studyProgram ? ` Studying ${eduContext.studyProgram}.` : ''}${eduContext.expectedCompletion ? ` Finishing ${eduContext.expectedCompletion}.` : ''} This is your starting point — everything builds from here.`
                    : 'Where you are today. Tap to add details about your current situation.',
                  microActions: [
                    'Identify which school subjects are most relevant to your goal',
                    'Talk to your teachers about this career direction',
                    'Research what grades are needed for the next step',
                  ],
                };
                onItemClick(foundationItem);
              }}
            />
            {isFoundationCurrent && !readOnly && (
              <YouAreHerePill
                canGoForward={canGoForward}
                onForward={() => setManualYouAreHereIndex(youAreHereIndex + 1)}
              />
            )}
          </div>

          {/* ── Step nodes + cards ───────────────────────────────────── */}
          {items.map((item, i) => {
            const pos = positions[i];
            const isHigh = i % 2 === 0;
            const ageLabel =
              item.endAge && item.endAge !== item.startAge
                ? `Age ${item.startAge}–${item.endAge}`
                : `Age ${item.startAge}`;
            const state = stateFor(i);

            // Simulation focus: active step glows + scales, adjacent
            // steps are dimmed, distant steps are very dim.
            const isSimActive = simActive && simulation!.currentStepIndex === i;
            const simOpacity = simActive
              ? isSimActive
                ? 'opacity-100'
                : Math.abs(simulation!.currentStepIndex - i) === 1
                  ? 'opacity-40'
                  : 'opacity-15'
              : '';

            return (
              <div
                key={item.id}
                className={cn(
                  'absolute transition-all duration-700 ease-out',
                  simOpacity,
                  isSimActive && 'z-20 scale-105',
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                  ...(isSimActive
                    ? {
                        filter: 'drop-shadow(0 0 12px rgba(20,184,166,0.5)) drop-shadow(0 0 30px rgba(20,184,166,0.2))',
                      }
                    : {}),
                }}
              >
                <div
                  className="flex flex-col items-center"
                  style={{ width: CARD_WIDTH }}
                >
                  {isHigh && (
                    <div
                      className="flex justify-center mb-1"
                      style={{ marginTop: -AGE_MARKER_HEIGHT - 4 }}
                    >
                      <AgePill label={ageLabel} active={state === 'current'} />
                    </div>
                  )}
                  {!isHigh && (
                    <CardWithBackArrow
                      showBack={state === 'current' && canGoBack && !readOnly}
                      onBack={() => setManualYouAreHereIndex(youAreHereIndex - 1)}
                    >
                      <ZigzagCard
                        item={item}
                        state={state}
                        onClick={() => onItemClick(item)}
                        cardData={cardDataMap?.[item.id]}
                      />
                    </CardWithBackArrow>
                  )}
                  <SharedNode
                    item={item}
                    onClick={() => onItemClick(item)}
                    size={NODE_SIZE}
                    stepState={state}
                    locked={state === 'future' && isLocked(i)}
                    progressStatus={cardDataMap?.[item.id]?.status}
                    onProgressCycle={
                      readOnly || !onProgressCycle ? undefined : () => onProgressCycle(item.id)
                    }
                  />
                  {isHigh && (
                    <CardWithBackArrow
                      showBack={state === 'current' && canGoBack && !readOnly}
                      onBack={() => setManualYouAreHereIndex(youAreHereIndex - 1)}
                    >
                      <ZigzagCard
                        item={item}
                        state={state}
                        onClick={() => onItemClick(item)}
                        cardData={cardDataMap?.[item.id]}
                      />
                    </CardWithBackArrow>
                  )}
                  {!isHigh && (
                    <div className="flex justify-center mt-1">
                      <AgePill label={ageLabel} active={state === 'current'} />
                    </div>
                  )}
                  {state === 'current' && !readOnly && (
                    <YouAreHerePill
                      canGoForward={canGoForward}
                      onForward={() => setManualYouAreHereIndex(youAreHereIndex + 1)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Subtle building blocks ────────────────────────────────────────────

function AgePill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        active
          ? 'bg-card text-foreground ring-1 ring-border'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {label}
    </span>
  );
}

function YouAreHerePill({
  canGoForward,
  onForward,
}: {
  canGoForward: boolean;
  onForward: () => void;
}) {
  return (
    <div className="flex justify-center mt-2">
      {/* "You are here" uses sky/blue — distinct from the amber
          current-step accent so they can't be confused. The BACK
          control lives next to the step card itself (see
          CardWithBackArrow); only forward stays inline here. */}
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/50 text-[9px] font-semibold uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        You are here
        {canGoForward && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onForward();
            }}
            aria-label="Move you are here forward one step"
            className="inline-flex items-center hover:text-sky-900 dark:hover:text-sky-100 transition-colors"
          >
            <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
      </span>
    </div>
  );
}

/**
 * Wraps a step card with an optional left-side back chevron used to
 * re-anchor "you are here" one step earlier. Only rendered for the
 * current step when `showBack` is true. The chevron sits flush
 * against the card's left edge so it visually belongs to the box,
 * not to the "You are here" pill below it.
 */
function CardWithBackArrow({
  showBack,
  onBack,
  children,
}: {
  showBack: boolean;
  onBack: () => void;
  children: React.ReactNode;
}) {
  if (!showBack) return <>{children}</>;
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        aria-label="Move you are here back one step"
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-5 w-5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/50 hover:bg-sky-500/20 hover:text-sky-900 dark:hover:text-sky-100 transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}

// ── Standardised step card ────────────────────────────────────────────

function ZigzagCard({
  item,
  state,
  onClick,
  cardData,
}: {
  item: JourneyItem;
  state: StepState;
  onClick: () => void;
  cardData?: CardDataSummary;
}) {
  const stepType = classifyStepType(item);
  const typeConfig = STEP_TYPE_CONFIG[stepType];

  const tooltipLines: string[] = [`${typeConfig.icon} ${typeConfig.label}`];
  if (item.subtitle) tooltipLines.push(item.subtitle);
  if (cardData?.stickyNote) tooltipLines.push(`📌 ${cardData.stickyNote}`);

  // State-driven shell — `current` gets a thin amber border only; no
  // amber background tint. The card stays the same colour as every
  // other card so the surface stays calm. Only the small NOW badge
  // (solid amber) marks the current step beyond the border.
  const stateClasses: Record<StepState, string> = {
    completed: 'border-emerald-500/40 bg-emerald-500/[0.04]',
    current: 'border-amber-500/70 bg-card shadow-sm',
    next: 'border-border bg-card/70',
    future: 'border-border bg-card/70',
  };

  const card = (
    <div className="w-full my-2">
      <button
        onClick={onClick}
        className={cn(
          // Fixed min-height + flex column lets the title sit in the
          // visual centre of the box regardless of how many lines it
          // wraps to. The Done badge / sticky-note overlay sits in
          // the top-right corner so the title can always start from
          // a clean centre.
          'relative w-full min-h-[64px] rounded-lg border p-2 flex flex-col items-center justify-center text-center transition-colors cursor-pointer',
          'hover:border-slate-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          stateClasses[state]
        )}
      >
        {(state === 'completed' || cardData?.hasStickyNote) && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
            {state === 'completed' && (
              <span className="inline-flex items-center shrink-0 gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Check className="h-2 w-2" strokeWidth={4} />
                Done
              </span>
            )}
            {cardData?.hasStickyNote && (
              <span className="text-[8px] shrink-0" title={cardData.stickyNote}>
                📌
              </span>
            )}
          </div>
        )}
        <p
          className={cn(
            'text-xs font-semibold leading-tight',
            state === 'future' ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {item.title}
        </p>
      </button>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px] text-xs space-y-1 p-3">
        {tooltipLines.map((line, i) => (
          <p key={i} className="text-[11px]">
            {line}
          </p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Foundation diagnostic card ────────────────────────────────────────
//
// Premium "starting point" card. Three zones, top to bottom:
//
//   1. HEADER       FOUNDATION eyebrow · "Your Starting Point" · status pill
//   2. FOUNDATION   School / program / finish year / subjects pills
//   3. ALIGNMENT    Short read-out + ✔ aligns / ⚠ missing + suggested action
//
// Status is derived from `subjectHint.alignment`:
//   strong   → "Aligned"            (emerald)
//   partial  → "Partially aligned"  (amber)
//   missing  → "Needs attention"    (rose, restrained)
//   unknown  → "Add subjects"       (neutral)
//
// The card is one button — clicking anywhere (or the inline Edit) opens
// the existing detail dialog where the user updates school + subjects;
// alignment recalculates on the next render.

type AlignmentStatusKey = 'strong' | 'partial' | 'missing' | 'unknown';

const ALIGNMENT_BADGE: Record<
  AlignmentStatusKey,
  { label: string; cls: string; dot: string }
> = {
  strong: {
    label: 'Aligned',
    cls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  partial: {
    label: 'Partially aligned',
    cls: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  missing: {
    label: 'Needs attention',
    cls: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 ring-rose-500/30',
    dot: 'bg-rose-500',
  },
  unknown: {
    label: 'Add subjects',
    cls: 'text-muted-foreground bg-muted ring-border',
    dot: 'bg-muted-foreground/50',
  },
};

interface FoundationCardProps {
  eduContext: EducationContext | null | undefined;
  subjectHint:
    | { alignment: AlignmentStatusKey; matchedKey: string[]; missingKey: string[] }
    | null;
  isCurrent: boolean;
  status: string | undefined;
  careerTitle?: string;
  onOpen: () => void;
  /**
   * Disabled / reference mode. The card stays visible but is greyed
   * out and non-interactive: no click, no hover lift, no Edit
   * affordance. Used when the user is viewing an alternative route
   * from another user — only "Your route" enables the foundation.
   */
  disabled?: boolean;
}

function FoundationCard({
  eduContext,
  subjectHint,
  isCurrent,
  status,
  careerTitle,
  onOpen,
  disabled = false,
}: FoundationCardProps) {
  const alignmentKey: AlignmentStatusKey = subjectHint?.alignment ?? 'unknown';
  const badge = ALIGNMENT_BADGE[alignmentKey];

  // Pull subjects to show. Combine the structured currentSubjects list
  // with anything the user typed into studyProgram so the foundation
  // matches what powers the alignment calc.
  const allSubjects: string[] = (() => {
    if (!eduContext) return [];
    const out = [...(eduContext.currentSubjects || [])];
    if (eduContext.studyProgram) {
      for (const p of eduContext.studyProgram
        .split(/[,;/&+]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)) {
        if (!out.some((ex) => ex.toLowerCase() === p.toLowerCase())) out.push(p);
      }
    }
    return out;
  })();
  const visibleSubjects = allSubjects.slice(0, 4);
  const extraSubjectCount = Math.max(0, allSubjects.length - visibleSubjects.length);

  // Short alignment statement, dynamic on the chosen career.
  const alignmentStatement: string = (() => {
    const career = careerTitle || 'this path';
    if (!subjectHint || alignmentKey === 'unknown') {
      return `Add the subjects you're taking now to see how they line up with ${career}.`;
    }
    if (alignmentKey === 'strong') {
      return `Your current subjects fully support the ${career} path.`;
    }
    if (alignmentKey === 'partial') {
      const miss = subjectHint.missingKey[0];
      return `Your current subjects partially support this path${miss ? `. ${miss} is missing.` : '.'}`;
    }
    const miss = subjectHint.missingKey.slice(0, 2).join(' and ');
    return `Your current subjects don't yet match this path${miss ? `. ${miss} would help most.` : '.'}`;
  })();

  return (
    <button
      onClick={disabled ? undefined : onOpen}
      disabled={disabled}
      aria-label={disabled ? 'Foundation (reference route — read only)' : 'Open foundation details'}
      aria-disabled={disabled || undefined}
      className={cn(
        'group w-[280px] rounded-2xl border bg-card text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled
          ? 'opacity-40 grayscale cursor-not-allowed border-border/60 select-none pointer-events-none'
          : 'hover:border-amber-400/60 cursor-pointer',
        !disabled && (isCurrent
          ? 'border-amber-500/60 shadow-sm'
          : status === 'done'
            ? 'border-emerald-500/30'
            : 'border-border')
      )}
    >
      {/* ── 1. HEADER ─────────────────────────────────────────────── */}
      <div className="relative px-4 pt-3.5 pb-3 border-b border-border/60">
        {!disabled && (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 text-muted-foreground/60 group-hover:text-foreground transition-colors"
            aria-hidden
          >
            <Pencil className="h-2.5 w-2.5" />
            <span className="text-[9px] font-medium uppercase tracking-wider">Edit</span>
          </span>
        )}
        <p className="text-[14px] font-semibold leading-tight text-foreground text-center mb-1">
          Your Starting Point
        </p>
        {/* Status pill — centred under the title so it never collides
            with the absolutely-positioned Edit affordance in the
            top-right. When the foundation is marked done, the pill
            replaces the alignment badge with a green DONE state. */}
        <div className="flex items-center justify-center gap-2">
          {status === 'done' ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 ring-emerald-500/30"
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              Done
            </span>
          ) : alignmentKey !== 'missing' ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0',
                badge.cls
              )}
            >
              <span className={cn('h-1 w-1 rounded-full', badge.dot)} />
              {badge.label}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── 2. FOUNDATION DATA ───────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2 border-b border-border/60 bg-muted/[0.04]">
        {eduContext ? (
          <>
            <FoundationRow
              label="School"
              value={eduContext.schoolName || EDUCATION_STAGE_CONFIG[eduContext.stage].label}
            />
            {eduContext.studyProgram && (
              <FoundationRow label="Track" value={eduContext.studyProgram} />
            )}
            {eduContext.expectedCompletion && (
              <FoundationRow label="Finishes" value={eduContext.expectedCompletion} />
            )}
            {visibleSubjects.length > 0 && (
              <div className="pt-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Current subjects
                </p>
                <div className="flex flex-wrap gap-1">
                  {visibleSubjects.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/85 ring-1 ring-inset ring-border/60"
                    >
                      {s}
                    </span>
                  ))}
                  {extraSubjectCount > 0 && (
                    <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      +{extraSubjectCount} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground leading-snug">
            Add your school, program and current subjects to anchor your roadmap.
          </p>
        )}
      </div>

      {/* ── 3. ALIGNMENT INSIGHT ───────────────────────────────────
          Distinct shade — slightly tinted teal/sky background plus an
          inset top border so it stands out from the foundation-data
          zone above and reads as the "brain" of the card. */}
      <div className="px-4 py-3 bg-sky-500/[0.06] dark:bg-sky-500/[0.05] border-t border-sky-500/15 rounded-b-2xl">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
          Alignment with {careerTitle || 'your path'}
        </p>
        <p className="text-[11px] leading-snug text-foreground/90">
          {alignmentStatement}
        </p>

        {(subjectHint && (subjectHint.matchedKey.length > 0 || subjectHint.missingKey.length > 0)) && (
          <ul className="mt-2 space-y-1">
            {subjectHint.matchedKey.slice(0, 2).map((s) => (
              <li
                key={`a-${s}`}
                className="flex items-center gap-1.5 text-[10px] text-foreground/85"
              >
                <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
                <span>{s} aligns</span>
              </li>
            ))}
            {subjectHint.missingKey.slice(0, 2).map((s) => (
              <li
                key={`m-${s}`}
                className="flex items-center gap-1.5 text-[10px] text-foreground/85"
              >
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" strokeWidth={2.5} />
                <span>{s} missing</span>
              </li>
            ))}
          </ul>
        )}

      </div>
    </button>
  );
}

function FoundationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="font-medium text-foreground text-right truncate">{value}</span>
    </div>
  );
}
