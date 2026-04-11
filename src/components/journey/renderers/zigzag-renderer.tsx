'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil, Banknote, Check, AlertTriangle } from 'lucide-react';
import { type JourneyItem } from '@/lib/journey/career-journey-types';
import { getAllCareers, getCareerById } from '@/lib/career-pathways';
import { classifyStepType, calculateSubjectAlignment, getCareerRequirements } from '@/lib/education/alignment';
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
  scenarioOverrides,
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

  // Earnings indicator — resolve career salary and find the first
  // "experience" step (where the user starts earning) and the last
  // "career" step (senior-level salary). Only shown if salary data exists.
  const earningsInfo = useMemo(() => {
    if (!careerTitle) return null;
    const slug = careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const career = getCareerById(slug) ?? getAllCareers().find(c => c.title === careerTitle);
    if (!career?.avgSalary) return null;

    // Parse salary range — e.g. "450,000 - 650,000 kr/year"
    const nums = career.avgSalary.match(/[\d,]+/g);
    if (!nums || nums.length < 1) return null;
    const low = nums[0].replace(/,/g, '');
    const high = nums.length >= 2 ? nums[nums.length - 1].replace(/,/g, '') : null;

    // Find first experience step and last career step indices
    let firstExpIdx = -1;
    let lastCareerIdx = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].stage === 'experience' && firstExpIdx === -1) firstExpIdx = i;
      if (items[i].stage === 'career') lastCareerIdx = i;
    }

    // Format compact salary — e.g. "~450k kr"
    const formatCompact = (n: string) => {
      const num = parseInt(n, 10);
      if (isNaN(num)) return n;
      return num >= 1000 ? `${Math.round(num / 1000)}k` : `${num}`;
    };

    return {
      firstExpIdx,
      lastCareerIdx,
      entryLabel: high ? `~${formatCompact(low)}–${formatCompact(high)} kr` : `~${formatCompact(low)} kr`,
      seniorLabel: high ? `~${formatCompact(high)}+ kr` : null,
    };
  }, [careerTitle, items]);

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

  // All steps are neutral — the roadmap is a story, not a checklist.
  // No completed/current/next/locked states.
  const stateFor = (_i: number): StepState => 'future';

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
            )}
            style={{ left: 12, top: HIGH_Y - 16 }}
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
              glowing={simActive && simulation!.currentStepIndex === -1}
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

            // Earnings hint — show on first experience step (start earning)
            // and last career step (senior salary).
            const stepEarnings =
              earningsInfo && i === earningsInfo.firstExpIdx
                ? earningsInfo.entryLabel
                : earningsInfo?.seniorLabel && i === earningsInfo.lastCareerIdx
                  ? earningsInfo.seniorLabel
                  : undefined;

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
                )}
                style={{ left: pos.x, top: pos.y }}
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
                    <ZigzagCard
                      item={item}
                      state={state}
                      onClick={() => onItemClick(item)}
                      glowing={isSimActive}
                      earningsHint={stepEarnings}
                      titleOverride={scenarioOverrides?.get(i)}
                    />
                  )}
                  <SharedNode
                    item={item}
                    onClick={() => onItemClick(item)}
                    size={NODE_SIZE}
                    stepState={state}
                  />
                  {isHigh && (
                    <ZigzagCard
                      item={item}
                      state={state}
                      onClick={() => onItemClick(item)}
                      glowing={isSimActive}
                      earningsHint={stepEarnings}
                      titleOverride={scenarioOverrides?.get(i)}
                    />
                  )}
                  {!isHigh && (
                    <div className="flex justify-center mt-1">
                      <AgePill label={ageLabel} />
                    </div>
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
  state: _state,
  onClick,
  glowing = false,
  earningsHint,
  titleOverride,
}: {
  item: JourneyItem;
  state: StepState;
  onClick: () => void;
  glowing?: boolean;
  earningsHint?: string;
  /** Scenario override — replaces the step title with a specific uni/employer variant */
  titleOverride?: string;
}) {
  const stepType = classifyStepType(item);
  const typeConfig = STEP_TYPE_CONFIG[stepType];

  const tooltipLines: string[] = [`${typeConfig.icon} ${typeConfig.label}`];
  if (item.subtitle) tooltipLines.push(item.subtitle);
  if (earningsHint) tooltipLines.push(`💰 ${earningsHint}`);

  const card = (
    <div className="w-full my-2">
      <button
        onClick={onClick}
        className={cn(
          'relative w-full min-h-[64px] rounded-lg border p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer',
          'hover:border-slate-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          glowing
            ? 'border-emerald-400/70 bg-card'
            : 'border-border bg-card/70',
        )}
        style={glowing ? { boxShadow: '0 0 12px rgba(16,185,129,0.5), 0 0 30px rgba(16,185,129,0.25)' } : undefined}
      >
        <p className="text-xs font-semibold leading-tight text-muted-foreground">
          {titleOverride ?? item.title}
        </p>
        {earningsHint && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-medium">
            <Banknote className="h-2.5 w-2.5" />
            {earningsHint}
          </span>
        )}
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
  /** True when this is the active step during voice simulation */
  glowing?: boolean;
}

function FoundationCard({
  eduContext,
  subjectHint,
  isCurrent,
  status,
  careerTitle,
  onOpen,
  disabled = false,
  glowing = false,
}: FoundationCardProps) {
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

  // Career requirements from the structured data source.
  const requirements = careerTitle ? getCareerRequirements(careerTitle) : null;

  // Short insight statement — exploratory, not judgemental.
  const alignmentStatement: string = (() => {
    const career = careerTitle || 'this path';
    if (!eduContext || allSubjects.length === 0) {
      return `Add your subjects to see what ${career} typically requires.`;
    }
    if (requirements) {
      return `Check your programme's entry requirements in the Understand tab to see how your subjects line up with ${career}.`;
    }
    return `Use Study Paths in the Understand tab to explore what ${career} typically requires.`;
  })();

  // Grade guidance from career-requirements.json
  const gradeHint = requirements?.schoolSubjects?.minimumGrade ?? null;
  const competitiveness = requirements?.universityPath?.competitiveness ?? null;

  return (
    <button
      onClick={disabled ? undefined : onOpen}
      disabled={disabled}
      aria-label={disabled ? 'Foundation (reference route — read only)' : 'Open foundation details'}
      aria-disabled={disabled || undefined}
      className={cn(
        'group w-[280px] rounded-2xl text-left transition-all overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        glowing
          ? 'border-2 border-emerald-400/70 opacity-100'
          : disabled
            ? 'opacity-40 grayscale cursor-not-allowed border border-border/60 select-none pointer-events-none'
            : 'border border-border/50 hover:border-teal-500/50 cursor-pointer shadow-lg'
      )}
      style={glowing
        ? { boxShadow: '0 0 12px rgba(16,185,129,0.5), 0 0 30px rgba(16,185,129,0.25)' }
        : { boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(20,184,166,0.08)' }
      }
    >
      {/* ── Header band — gradient accent ───────────────────────── */}
      <div className="relative bg-gradient-to-r from-teal-600/20 via-teal-500/10 to-transparent px-4 pt-3 pb-2.5">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <span className="text-[11px]">📍</span>
            </div>
            <p className="text-[13px] font-bold tracking-tight text-foreground">
              Your Starting Point
            </p>
          </div>
          {!disabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-muted-foreground/60 group-hover:text-teal-300 group-hover:bg-teal-500/10 transition-colors">
              <Pencil className="h-2.5 w-2.5" />
              <span className="text-[9px] font-medium">Edit</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Data section ────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-card">
        {eduContext ? (
          <div className="space-y-2.5">
            {/* Info grid — icon-led rows */}
            <div className="grid grid-cols-2 gap-2">
              <InfoRow
                icon={eduContext.stage === 'university' ? '🎓' : eduContext.stage === 'college' ? '🏛️' : '🏫'}
                label={EDUCATION_STAGE_CONFIG[eduContext.stage].label}
                value={eduContext.schoolName || EDUCATION_STAGE_CONFIG[eduContext.stage].label}
              />
              {eduContext.expectedCompletion && (
                <InfoRow icon="📅" label="Finishes" value={eduContext.expectedCompletion} />
              )}
              {eduContext.studyProgram && (
                <InfoRow icon="📘" label="Track" value={eduContext.studyProgram} span />
              )}
            </div>

            {/* Subject chips — colour-coded alignment */}
            {visibleSubjects.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Your subjects</p>
                <div className="flex flex-wrap gap-1">
                  {visibleSubjects.map((s) => {
                    const isMatched = subjectHint?.matchedKey.some(
                      (m) => m.toLowerCase() === s.toLowerCase()
                    );
                    return (
                      <span
                        key={s}
                        className={cn(
                          'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium border',
                          isMatched
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                            : 'bg-muted/30 text-foreground/75 border-border/40',
                        )}
                        title={isMatched ? '✓ Aligns with this career' : undefined}
                      >
                        {isMatched && <Check className="h-2 w-2 mr-0.5 text-emerald-400" strokeWidth={3} />}
                        {s}
                      </span>
                    );
                  })}
                  {extraSubjectCount > 0 && (
                    <span className="text-[9px] text-muted-foreground/50 self-center ml-0.5">+{extraSubjectCount}</span>
                  )}
                </div>
              </div>
            )}

            {/* Missing subjects — compact amber hints */}
            {subjectHint && subjectHint.missingKey.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {subjectHint.missingKey.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/8 text-amber-300/80 border border-amber-500/20"
                    title={`Consider adding ${s}`}
                  >
                    <AlertTriangle className="h-2 w-2 mr-0.5" strokeWidth={2.5} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[11px] text-muted-foreground/70 mb-1">Tap to add your school & subjects</p>
            <p className="text-[9px] text-muted-foreground/50">This helps us show alignment with your career path</p>
          </div>
        )}
      </div>

      {/* ── Alignment insight — bottom accent bar ───────────────── */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-sky-500/[0.08] to-transparent border-t border-sky-500/10 rounded-b-2xl">
        <p className="text-[10px] leading-snug text-foreground/80">
          {alignmentStatement}
        </p>
        {gradeHint && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-[9px] leading-snug text-muted-foreground/70 cursor-help underline decoration-dotted underline-offset-2">
                  Your grades matter for this path
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
                <p className="font-medium mb-1">Karakterpoeng (grade points)</p>
                <p>Your average grades are converted into points for university admission via Samordna opptak. Higher grades = more points. Competitive programmes have a cutoff (poenggrense).</p>
                {gradeHint && <p className="mt-1.5 text-muted-foreground">{gradeHint}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {competitiveness && (
          <p className="text-[9px] leading-snug text-muted-foreground/70">
            {competitiveness}
          </p>
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

/** Compact icon-led data row for the Foundation card */
function InfoRow({ icon, label, value, span }: { icon: string; label: string; value: string; span?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1.5 min-w-0', span && 'col-span-2')}>
      <span className="text-[10px] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-wider text-muted-foreground/55 leading-none">{label}</p>
        <p className="text-[10px] font-medium text-foreground/85 truncate leading-tight">{value}</p>
      </div>
    </div>
  );
}
