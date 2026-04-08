'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import type { EducationContext } from '@/lib/education/types';
import { EDUCATION_STAGE_CONFIG, ALIGNMENT_CONFIG } from '@/lib/education/types';
import { calculateSubjectAlignment } from '@/lib/education/alignment';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps, CardDataSummary } from './types';
import { SharedNode } from './shared-node';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const NODE_SIZE = 40;
const H_SPACING = 180;
const HIGH_Y = 90;
const LOW_Y = 220;
const CARD_WIDTH = 150;
const AGE_MARKER_HEIGHT = 24;
const SCHOOL_NODE_WIDTH = 190;

/** Stable ID for the "Your Foundation" synthetic item — persists across goal changes */
export const FOUNDATION_ITEM_ID = 'my-foundation';

export function ZigzagRenderer({ journey, onItemClick, overlayData, activeLayers, userAge, cardDataMap, onProgressCycle, careerTitle }: RendererProps) {
  // Filter out the first foundation item if it duplicates the hardcoded school node
  const items = useMemo(
    () => journey.items.filter(
      (item, i) => !(i === 0 && item.stage === 'foundation' && item.title.toLowerCase().includes('your foundation'))
    ),
    [journey.items]
  );

  // Fetch education context for the school node
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

  // Collect all known subjects — from currentSubjects + parse studyProgram as a fallback
  const allSubjects = useMemo(() => {
    if (!eduContext) return [];
    const subjects = [...(eduContext.currentSubjects || [])];
    // If the user put subjects in the programme field (common), parse them too
    if (eduContext.studyProgram) {
      const parsed = eduContext.studyProgram
        .split(/[,;/&+]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && !subjects.some((ex) => ex.toLowerCase() === s.toLowerCase()));
      subjects.push(...parsed);
    }
    return subjects;
  }, [eduContext]);

  // Compute subject alignment against the career
  const alignment = useMemo(() => {
    if (!allSubjects.length || !careerTitle) return null;
    return calculateSubjectAlignment(allSubjects, careerTitle);
  }, [allSubjects, careerTitle]);

  // Find current item based on user age — used for active highlighting
  let currentItemIndex = -1;
  if (userAge != null && items.length > 0) {
    currentItemIndex = items.findIndex((item) => item.startAge >= userAge);
    if (currentItemIndex === -1) currentItemIndex = items.length - 1;
  }

  // "You are here" position — first non-done step (or foundation if nothing done)
  const derivedYouAreHereIndex = useMemo(() => {
    // Check foundation first
    const foundationDone = cardDataMap?.[FOUNDATION_ITEM_ID]?.status === 'done';
    if (!foundationDone) return -1; // -1 = foundation
    // Find first non-done step
    for (let i = 0; i < items.length; i++) {
      const s = cardDataMap?.[items[i].id]?.status;
      if (s !== 'done') return i;
    }
    return items.length - 1; // all done — show at last
  }, [cardDataMap, items]);

  // User can manually re-anchor "You are here" backward; forward only when current is done.
  const [manualYouAreHereIndex, setManualYouAreHereIndex] = useState<number | null>(null);
  const youAreHereIndex = manualYouAreHereIndex ?? derivedYouAreHereIndex;
  const youAreHereStatus = youAreHereIndex === -1
    ? cardDataMap?.[FOUNDATION_ITEM_ID]?.status
    : cardDataMap?.[items[youAreHereIndex]?.id]?.status;
  const canGoBack = youAreHereIndex > -1;
  const canGoForward = youAreHereStatus === 'done' && youAreHereIndex < items.length - 1;
  const handleYouAreHereBack = () => setManualYouAreHereIndex(youAreHereIndex - 1);
  const handleYouAreHereForward = () => setManualYouAreHereIndex(youAreHereIndex + 1);

  // School node offset — adds space before the first real item
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

  // Polyline includes the school node connection point
  const schoolConnectionPoint = `${schoolNodeOffset - 20},${HIGH_Y + NODE_SIZE / 2}`;
  const polylinePoints = useMemo(
    () =>
      [schoolConnectionPoint, ...positions.map((p) => `${p.x + NODE_SIZE / 2},${p.y + NODE_SIZE / 2}`)].join(' '),
    [positions, schoolConnectionPoint]
  );

  // SVG path for animateMotion (M + L commands)
  const motionPath = useMemo(() => {
    const pts = polylinePoints.split(' ');
    return `M${pts[0]}` + pts.slice(1).map((p) => ` L${p}`).join('');
  }, [polylinePoints]);

  // Build gradient stops from each item's stage colour
  const gradientStops = useMemo(
    () => {
      const allStops = [
        { offset: '0%', color: '#6b8f7b' }, // muted green for school node
        ...items.map((item, i) => ({
          offset: `${((i + 1) / items.length) * 100}%`,
          color: STAGE_CONFIG[item.stage].color,
        })),
      ];
      return allStops;
    },
    [items]
  );

  return (
    <TooltipProvider delayDuration={300}>
    <div className="overflow-x-auto pb-4 -mx-2 px-2">

      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        {/* SVG polyline connector */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalWidth}
          height={totalHeight}
        >
          <defs>
            <linearGradient id="zigzag-grad" x1="0" y1="0" x2="1" y2="0">
              {gradientStops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
          {/* Background track */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Gradient path */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="url(#zigzag-grad)"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Travelling pulse */}
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <circle r="4" fill="rgba(20, 184, 166, 0.8)" filter="url(#pulse-glow)">
            <animateMotion dur="8s" repeatCount="indefinite" path={motionPath} />
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* ── School Foundation Node (clickable) ──────────────────────── */}
        <div
          className="absolute"
          style={{ left: 12, top: HIGH_Y - 16 }}
        >
          {/* Age pill — above the card, matching other roadmap nodes */}
          {userAge && (
            <div className="flex justify-center mb-1.5" style={{ marginTop: -AGE_MARKER_HEIGHT - 4 }}>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/15 text-teal-500 ring-2 ring-teal-500/40">
                Age {userAge}
              </span>
            </div>
          )}
          <button
            onClick={() => {
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
            className="w-[210px] rounded-xl border bg-card p-3.5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-teal-500/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* Header row — single calm label, status as a tiny dot */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🎓</span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Foundation
                </span>
              </div>
              {cardDataMap?.[FOUNDATION_ITEM_ID]?.status === 'done' && (
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" title="Complete" />
              )}
              {cardDataMap?.[FOUNDATION_ITEM_ID]?.status === 'in_progress' && (
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400/40" title="In progress" />
              )}
            </div>
            {eduContext ? (
              <div className="space-y-3">
                {/* Stat rows — label/value with consistent neutral typography */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-[10px]">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="text-foreground font-medium truncate">{EDUCATION_STAGE_CONFIG[eduContext.stage].label}</span>
                  </div>
                  {eduContext.schoolName && (
                    <div className="flex items-baseline justify-between gap-2 text-[10px]">
                      <span className="text-muted-foreground">School</span>
                      <span className="text-foreground font-medium truncate">{eduContext.schoolName}</span>
                    </div>
                  )}
                  {eduContext.studyProgram && (
                    <div className="flex items-baseline justify-between gap-2 text-[10px]">
                      <span className="text-muted-foreground">Track</span>
                      <span className="text-foreground font-medium truncate">{eduContext.studyProgram}</span>
                    </div>
                  )}
                  {eduContext.expectedCompletion && (
                    <div className="flex items-baseline justify-between gap-2 text-[10px]">
                      <span className="text-muted-foreground">Finish</span>
                      <span className="text-foreground font-medium">{eduContext.expectedCompletion}</span>
                    </div>
                  )}
                </div>

                {/* Subjects — single accent system: teal for matched, neutral for the rest */}
                {allSubjects.length > 0 && (
                  <div className="pt-2.5 border-t border-border/40">
                    <div className="flex flex-wrap gap-1">
                      {allSubjects.map((s) => {
                        const isMatched = alignment?.matchedKey.some(
                          (k) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())
                        );
                        return (
                          <span
                            key={s}
                            className={cn(
                              'inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-medium leading-tight',
                              alignment && isMatched
                                ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 ring-1 ring-inset ring-teal-500/30'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Alignment message — unified calm style, no colour rainbow */}
                {alignment && alignment.alignment !== 'unknown' && (
                  <div className="pt-2.5 border-t border-border/40">
                    <div className="flex items-start gap-1.5">
                      <span
                        className={cn(
                          'h-1 w-1 rounded-full mt-[5px] shrink-0',
                          alignment.alignment === 'strong'
                            ? 'bg-teal-400'
                            : 'bg-muted-foreground/50'
                        )}
                      />
                      <p className="text-[9px] text-muted-foreground leading-snug">
                        {alignment.alignment === 'strong'
                          ? "You're on the right track"
                          : alignment.alignment === 'partial'
                            ? `Nearly there — consider ${alignment.missingKey.join(', ')}`
                            : `Consider adding ${alignment.missingKey.join(', ')}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground leading-snug">
                Tap to add your school &amp; subjects
              </p>
            )}
          </button>
          {/* Status pills — always below the card so "You are here" never sits above it */}
          {youAreHereIndex === -1 && (
            <YouAreHerePill
              canGoBack={false}
              canGoForward={canGoForward}
              onBack={handleYouAreHereBack}
              onForward={handleYouAreHereForward}
            />
          )}
          {cardDataMap?.[FOUNDATION_ITEM_ID]?.status === 'done' && youAreHereIndex !== -1 && <CompletePill />}
        </div>

        {/* Positioned nodes + cards + age markers */}
        {items.map((item, i) => {
          const pos = positions[i];
          const isHigh = i % 2 === 0;
          const ageLabel = item.endAge
            ? `Age ${item.startAge}–${item.endAge}`
            : `Age ${item.startAge}`;
          const stageColor = STAGE_CONFIG[item.stage].color;
          const isCurrent = i === currentItemIndex;

          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              <div className="flex flex-col items-center" style={{ width: CARD_WIDTH }}>
                {/* Age marker above node for high positions */}
                {isHigh && (
                  <div
                    className="flex justify-center mb-1"
                    style={{ marginTop: -AGE_MARKER_HEIGHT - 4 }}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        isCurrent
                          ? 'ring-2 font-semibold'
                          : 'bg-muted text-muted-foreground'
                      )}
                      style={
                        isCurrent
                          ? {
                              backgroundColor: `${stageColor}20`,
                              color: stageColor,
                              boxShadow: `0 0 0 2px ${stageColor}60`,
                            }
                          : undefined
                      }
                    >
                      {ageLabel}
                    </span>
                  </div>
                )}
                {/* Card above node for low positions */}
                {!isHigh && (
                  <ZigzagCard
                    item={item}
                    onClick={() => onItemClick(item)}
                    overlayNodeData={overlayData?.[item.id]}
                    activeLayers={activeLayers}
                    isCurrent={isCurrent}
                    cardData={cardDataMap?.[item.id]}
                  />
                )}
                <SharedNode
                  item={item}
                  onClick={() => onItemClick(item)}
                  size={isCurrent ? NODE_SIZE + 6 : NODE_SIZE}
                  progressStatus={cardDataMap?.[item.id]?.status}
                  onProgressCycle={onProgressCycle ? () => onProgressCycle(item.id) : undefined}
                />
                {/* Card below node for high positions */}
                {isHigh && (
                  <ZigzagCard
                    item={item}
                    onClick={() => onItemClick(item)}
                    overlayNodeData={overlayData?.[item.id]}
                    activeLayers={activeLayers}
                    isCurrent={isCurrent}
                    cardData={cardDataMap?.[item.id]}
                  />
                )}
                {/* Age marker below card for low positions */}
                {!isHigh && (
                  <div className="flex justify-center mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        isCurrent
                          ? 'ring-2 font-semibold'
                          : 'bg-muted text-muted-foreground'
                      )}
                      style={
                        isCurrent
                          ? {
                              backgroundColor: `${stageColor}20`,
                              color: stageColor,
                              boxShadow: `0 0 0 2px ${stageColor}60`,
                            }
                          : undefined
                      }
                    >
                      {ageLabel}
                    </span>
                  </div>
                )}
                {/* Status pill — always rendered as the bottom-most element of
                    the column so it never appears above the card or node,
                    regardless of whether the card sits high or low. */}
                {youAreHereIndex === i && (
                  <YouAreHerePill
                    canGoBack={canGoBack}
                    canGoForward={canGoForward}
                    onBack={handleYouAreHereBack}
                    onForward={handleYouAreHereForward}
                  />
                )}
                {cardDataMap?.[item.id]?.status === 'done' && youAreHereIndex !== i && (
                  <CompletePill />
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

function YouAreHerePill({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      {canGoBack ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          aria-label="Move back to previous step"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-400/60 hover:bg-fuchsia-500/30 transition shadow-[0_0_8px_rgba(217,70,239,0.4)]"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      ) : (
        <span className="h-5 w-5" />
      )}
      {/* You-are-here pill — fuchsia/pink to stand out from the teal palette,
          with a steady glow + pulsing inner dot so it's instantly noticed. */}
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gradient-to-r from-fuchsia-500/25 to-pink-500/25 ring-1 ring-fuchsia-400/70 shadow-[0_0_14px_rgba(217,70,239,0.5)] motion-safe:animate-[here-pulse_2.4s_ease-in-out_infinite]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-fuchsia-300 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300" />
        </span>
        <span className="text-[10px] font-bold text-fuchsia-100 uppercase tracking-wider">You are here</span>
      </span>
      {canGoForward ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onForward();
          }}
          aria-label="Move forward to next step"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-400/60 hover:bg-fuchsia-500/30 transition shadow-[0_0_8px_rgba(217,70,239,0.4)]"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      ) : (
        <span className="h-5 w-5" />
      )}
    </div>
  );
}

function CompletePill() {
  return (
    <div className="flex justify-center mt-2">
      {/* Complete pill — bright emerald with a soft glow so finished steps
          read as definitively done at a glance. */}
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gradient-to-r from-emerald-500/30 to-emerald-400/25 ring-1 ring-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.45)]">
        <Check className="h-3 w-3 text-emerald-200" strokeWidth={3.5} />
        <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Complete</span>
      </span>
    </div>
  );
}

function ZigzagCard({
  item,
  onClick,
  overlayNodeData,
  activeLayers,
  isCurrent,
  cardData,
}: {
  item: JourneyItem;
  onClick: () => void;
  overlayNodeData?: NodeOverlayData;
  activeLayers?: Record<OverlayLayerId, boolean>;
  isCurrent?: boolean;
  cardData?: CardDataSummary;
}) {
  const stage = STAGE_CONFIG[item.stage];
  const stepType = classifyStepType(item);
  const typeConfig = STEP_TYPE_CONFIG[stepType];

  const tooltipLines: string[] = [`${typeConfig.icon} ${typeConfig.label}`];
  if (item.subtitle) tooltipLines.push(item.subtitle);
  if (cardData?.stickyNote) tooltipLines.push(`📌 ${cardData.stickyNote}`);
  const hasTooltip = tooltipLines.length > 0;

  const statusDot = cardData?.status === 'done'
    ? 'bg-emerald-500'
    : cardData?.status === 'in_progress'
      ? 'bg-amber-500'
      : null;

  const card = (
    <div className="w-full my-2">
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border backdrop-blur-sm p-2 transition-all',
        'hover:shadow-md hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        isCurrent
          ? 'border-2 shadow-lg bg-card/80'
          : 'border-border/50 bg-card/80 shadow-sm'
      )}
      style={
        isCurrent
          ? { borderColor: stage.color, boxShadow: `0 0 16px ${stage.color}30` }
          : undefined
      }
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground/40 leading-none">
              {typeConfig.icon}
            </span>
            {statusDot && (
              <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} />
            )}
            {cardData?.hasStickyNote && (
              <span className="text-[8px]" title={cardData.stickyNote}>📌</span>
            )}
          </div>
          <p className="text-xs font-semibold leading-tight text-foreground">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="text-[10px] mt-0.5 leading-snug truncate text-muted-foreground">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    </button>
    </div>
  );

  if (!hasTooltip) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px] text-xs space-y-1 p-3">
        {tooltipLines.map((line, i) => (
          <p key={i} className="text-[11px]">{line}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
