'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import type { EducationContext } from '@/lib/education/types';
import { EDUCATION_STAGE_CONFIG } from '@/lib/education/types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode } from './shared-node';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const NODE_SIZE = 40;
const H_SPACING = 180;
const HIGH_Y = 90;
const LOW_Y = 220;
const CARD_WIDTH = 150;
const AGE_MARKER_HEIGHT = 24;
const SCHOOL_NODE_WIDTH = 140;

export function ZigzagRenderer({ journey, onItemClick, overlayData, activeLayers, userAge }: RendererProps) {
  const items = journey.items;

  // Fetch education context for the school node
  const { data: eduData } = useQuery<{ educationContext: EducationContext | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const eduContext = eduData?.educationContext;

  // Find current item based on user age — used for active highlighting
  let currentItemIndex = -1;
  if (userAge != null && items.length > 0) {
    currentItemIndex = items.findIndex((item) => item.startAge >= userAge);
    if (currentItemIndex === -1) currentItemIndex = items.length - 1;
  }

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
      <p className="text-[10px] text-muted-foreground/30 mb-2 px-1">
        Tap any step to explore details and add notes
      </p>

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

        {/* ── School Foundation Node ──────────────────────── */}
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
          <div className="w-[160px] rounded-xl border border-teal-500/30 bg-card/80 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs">🎓</span>
              <span className="text-[9px] font-bold text-teal-500/80 uppercase tracking-wider">
                Your Foundation
              </span>
            </div>
            {eduContext ? (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground/90">
                  {EDUCATION_STAGE_CONFIG[eduContext.stage].label}
                </p>
                {eduContext.schoolName && (
                  <p className="text-[10px] text-foreground/70">{eduContext.schoolName}</p>
                )}
                {eduContext.studyProgram && (
                  <p className="text-[10px] text-foreground/70">{eduContext.studyProgram}</p>
                )}
                {eduContext.expectedCompletion && (
                  <p className="text-[10px] text-foreground/70">Finishing {eduContext.expectedCompletion}</p>
                )}
                {eduContext.currentSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {eduContext.currentSubjects.map((s) => (
                      <span key={s} className="inline-flex rounded px-1 py-0.5 text-[7px] font-medium bg-teal-500/10 text-teal-500/80">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-foreground/50 leading-snug">
                Where you are today
              </p>
            )}
          </div>
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
                  />
                )}
                <SharedNode
                  item={item}
                  onClick={() => onItemClick(item)}
                  size={isCurrent ? NODE_SIZE + 6 : NODE_SIZE}
                />
                {/* Card below node for high positions */}
                {isHigh && (
                  <ZigzagCard
                    item={item}
                    onClick={() => onItemClick(item)}
                    overlayNodeData={overlayData?.[item.id]}
                    activeLayers={activeLayers}
                    isCurrent={isCurrent}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </TooltipProvider>
  );
}

function ZigzagCard({
  item,
  onClick,
  overlayNodeData,
  activeLayers,
  isCurrent,
}: {
  item: JourneyItem;
  onClick: () => void;
  overlayNodeData?: NodeOverlayData;
  activeLayers?: Record<OverlayLayerId, boolean>;
  isCurrent?: boolean;
}) {
  const stage = STAGE_CONFIG[item.stage];
  const stepType = classifyStepType(item);
  const typeConfig = STEP_TYPE_CONFIG[stepType];

  // Build tooltip text
  const savedData = (() => {
    try {
      const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
      return all[item.id] || null;
    } catch { return null; }
  })();

  const tooltipLines: string[] = [`${typeConfig.icon} ${typeConfig.label}`];
  if (item.subtitle) tooltipLines.push(item.subtitle);
  if (savedData) {
    if (savedData.notes) tooltipLines.push(`Notes: ${savedData.notes.slice(0, 80)}${savedData.notes.length > 80 ? '...' : ''}`);
    if (savedData.resourceLink) tooltipLines.push(`Resource: ${savedData.resourceLink.slice(0, 60)}`);
    if (savedData.confidence) tooltipLines.push(`Confidence: ${savedData.confidence === 'high' ? '😊 High' : savedData.confidence === 'medium' ? '😐 Medium' : '😟 Low'}`);
  }
  const hasTooltip = tooltipLines.length > 0;

  const card = (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border backdrop-blur-sm p-2 my-2 transition-all',
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
          {/* Step type indicator */}
          <span className="text-[9px] text-muted-foreground/40 leading-none">
            {typeConfig.icon}
          </span>
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
