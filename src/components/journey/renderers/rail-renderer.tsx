'use client';

import { useMemo } from 'react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode } from './shared-node';
import { OverlayBadges } from '../overlays/overlay-badges';

const NODE_SIZE = 40;
const H_SPACING = 170;
const TRACK_Y = 40;
const CARD_WIDTH = 150;

export function RailRenderer({ journey, onItemClick, overlayData, activeLayers }: RendererProps) {
  const items = journey.items;

  const positions = useMemo(
    () => items.map((_, i) => ({ x: i * H_SPACING + NODE_SIZE, y: TRACK_Y })),
    [items]
  );

  const totalWidth = items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = TRACK_Y + NODE_SIZE + 160;

  const gradientStops = useMemo(
    () =>
      items.map((item, i) => ({
        offset: items.length <= 1 ? '0%' : `${(i / (items.length - 1)) * 100}%`,
        color: STAGE_CONFIG[item.stage].color,
      })),
    [items]
  );

  const lineY = TRACK_Y + NODE_SIZE / 2;

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        {/* SVG horizontal line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalWidth}
          height={totalHeight}
        >
          <defs>
            <linearGradient id="rail-grad" x1="0" y1="0" x2="1" y2="0">
              {gradientStops.map((stop, i) => (
                <stop key={i} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
          {/* Background track */}
          <line
            x1={NODE_SIZE}
            y1={lineY}
            x2={totalWidth - NODE_SIZE}
            y2={lineY}
            stroke="#e5e7eb"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Gradient track */}
          <line
            x1={NODE_SIZE}
            y1={lineY}
            x2={totalWidth - NODE_SIZE}
            y2={lineY}
            stroke="url(#rail-grad)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>

        {/* Nodes + cards */}
        {items.map((item, i) => {
          const pos = positions[i];
          const ageLabel = item.endAge
            ? `Age ${item.startAge}–${item.endAge}`
            : `Age ${item.startAge}`;
          const stageColor = STAGE_CONFIG[item.stage].color;
          const isCurrent = i === 0;

          return (
            <div
              key={item.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
            >
              <div className="flex flex-col items-center" style={{ width: CARD_WIDTH }}>
                {/* Age marker above node */}
                <div className="flex justify-center mb-1" style={{ marginTop: -28 }}>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      isCurrent ? 'ring-1' : 'bg-muted text-muted-foreground'
                    )}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: `${stageColor}20`,
                            color: stageColor,
                            boxShadow: `0 0 0 1px ${stageColor}40`,
                          }
                        : undefined
                    }
                  >
                    {ageLabel}
                  </span>
                </div>

                <SharedNode item={item} onClick={() => onItemClick(item)} size={NODE_SIZE} />

                {/* Card below */}
                <RailCard
                  item={item}
                  onClick={() => onItemClick(item)}
                  overlayNodeData={overlayData?.[item.id]}
                  activeLayers={activeLayers}
                />
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
  onClick,
  overlayNodeData,
  activeLayers,
}: {
  item: JourneyItem;
  onClick: () => void;
  overlayNodeData?: NodeOverlayData;
  activeLayers?: Record<OverlayLayerId, boolean>;
}) {
  const stage = STAGE_CONFIG[item.stage];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm p-2 mt-2 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span
          className={cn(
            'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
            stage.bgClass,
            stage.textClass
          )}
        >
          {stage.label}
        </span>
      </div>
      <p className="text-xs font-semibold leading-tight text-foreground">{item.title}</p>
      {item.subtitle && (
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">
          {item.subtitle}
        </p>
      )}
      {item.isMilestone && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-[9px] font-medium" style={{ color: stage.color }}>
            Milestone
          </span>
        </div>
      )}
      {activeLayers && (
        <OverlayBadges nodeData={overlayNodeData} activeLayers={activeLayers} />
      )}
    </button>
  );
}
