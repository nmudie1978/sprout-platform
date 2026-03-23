'use client';

import { useMemo } from 'react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode } from './shared-node';
import { OverlayBadges } from '../overlays/overlay-badges';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const NODE_SIZE = 40;
const H_SPACING = 180;
const HIGH_Y = 90;
const LOW_Y = 220;
const CARD_WIDTH = 150;
const AGE_MARKER_HEIGHT = 24;

function getCardStatus(itemId: string): string {
  try {
    const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
    return all[itemId]?.status || 'not_started';
  } catch {
    return 'not_started';
  }
}

export function ZigzagRenderer({ journey, onItemClick, overlayData, activeLayers, userAge }: RendererProps) {
  const items = journey.items;

  // Find the first item that isn't marked "done" in localStorage
  let currentItemIndex = -1;
  if (userAge != null && items.length > 0) {
    currentItemIndex = items.findIndex((item) => getCardStatus(item.id) !== 'done');
    if (currentItemIndex === -1) currentItemIndex = items.length - 1;
  }

  const positions = useMemo(
    () =>
      items.map((_, i) => ({
        x: i * H_SPACING + NODE_SIZE,
        y: i % 2 === 0 ? HIGH_Y : LOW_Y,
      })),
    [items]
  );

  const totalWidth = items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = LOW_Y + NODE_SIZE + 120;

  const polylinePoints = useMemo(
    () =>
      positions
        .map((p) => `${p.x + NODE_SIZE / 2},${p.y + NODE_SIZE / 2}`)
        .join(' '),
    [positions]
  );

  // Build gradient stops from each item's stage colour
  const gradientStops = useMemo(
    () =>
      items.map((item, i) => ({
        offset: items.length <= 1 ? '0%' : `${(i / (items.length - 1)) * 100}%`,
        color: STAGE_CONFIG[item.stage].color,
      })),
    [items]
  );

  return (
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
        </svg>

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
                {/* "YOU ARE HERE" marker for current item */}
                {isCurrent && isHigh && (
                  <div
                    className="flex flex-col items-center mb-1 animate-bounce-slow"
                    style={{ marginTop: -AGE_MARKER_HEIGHT - 36 }}
                  >
                    <span
                      className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white"
                      style={{
                        backgroundColor: stageColor,
                        boxShadow: `0 0 15px ${stageColor}, 0 0 30px ${stageColor}90, 0 0 60px ${stageColor}50, 0 0 100px ${stageColor}30`,
                        animation: 'glow-pulse 2s ease-in-out infinite',
                      }}
                    >
                      <span className="absolute -inset-1 rounded-full opacity-30 animate-ping" style={{ backgroundColor: stageColor }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse relative" />
                      You are here
                    </span>
                    {/* Downward arrow */}
                    <div
                      className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent mt-[-1px]"
                      style={{ borderTopColor: stageColor, filter: `drop-shadow(0 4px 8px ${stageColor}80)` }}
                    />
                  </div>
                )}
                {/* Age marker above node for high positions */}
                {isHigh && (
                  <div
                    className="flex justify-center mb-1"
                    style={{ marginTop: isCurrent ? 2 : -AGE_MARKER_HEIGHT - 4 }}
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
                  <div className="flex flex-col items-center mt-1">
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
                    {/* "YOU ARE HERE" marker for current low-position item */}
                    {isCurrent && (
                      <div className="flex flex-col items-center">
                        {/* Upward arrow */}
                        <div
                          className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent mb-[-1px]"
                          style={{ borderBottomColor: stageColor, filter: `drop-shadow(0 -4px 8px ${stageColor}80)` }}
                        />
                        <span
                          className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white"
                          style={{
                            backgroundColor: stageColor,
                            boxShadow: `0 0 15px ${stageColor}, 0 0 30px ${stageColor}90, 0 0 60px ${stageColor}50, 0 0 100px ${stageColor}30`,
                            animation: 'glow-pulse 2s ease-in-out infinite',
                          }}
                        >
                          <span className="absolute -inset-1 rounded-full opacity-30 animate-ping" style={{ backgroundColor: stageColor }} />
                          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse relative" />
                          You are here
                        </span>
                      </div>
                    )}
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
  const cardData = getCardStatus(item.id);
  const isDone = cardData === 'done';

  // Build tooltip text from saved data
  const savedData = (() => {
    try {
      const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
      return all[item.id] || null;
    } catch { return null; }
  })();

  const tooltipLines: string[] = [];
  if (savedData) {
    if (savedData.status && savedData.status !== 'not_started') {
      tooltipLines.push(`Status: ${savedData.status === 'done' ? '✓ Done' : '⏳ In Progress'}`);
    }
    if (savedData.notes) tooltipLines.push(`Notes: ${savedData.notes.slice(0, 80)}${savedData.notes.length > 80 ? '...' : ''}`);
    if (savedData.resourceLink) tooltipLines.push(`Resource: ${savedData.resourceLink.slice(0, 60)}`);
    if (savedData.confidence) tooltipLines.push(`Confidence: ${savedData.confidence === 'high' ? '😊 High' : savedData.confidence === 'medium' ? '😐 Medium' : '😟 Low'}`);
  }

  const hasTooltip = isDone && tooltipLines.length > 0;

  const card = (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border bg-card/80 backdrop-blur-sm p-2 my-2 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        isCurrent
          ? 'border-2 shadow-lg'
          : isDone
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-border/50'
      )}
      style={isCurrent ? { borderColor: stage.color, boxShadow: `0 0 16px ${stage.color}30` } : undefined}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight text-foreground">{item.title}</p>
          {item.subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">
              {item.subtitle}
            </p>
          )}
        </div>
        {isDone && <span className="text-emerald-500 text-[10px] shrink-0">✓</span>}
      </div>
    </button>
  );

  if (!hasTooltip) return card;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-xs space-y-1 p-3">
          {tooltipLines.map((line, i) => (
            <p key={i} className="text-[11px]">{line}</p>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
