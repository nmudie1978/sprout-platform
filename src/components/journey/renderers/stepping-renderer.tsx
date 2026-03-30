'use client';

import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode } from './shared-node';
import { OverlayBadges } from '../overlays/overlay-badges';

const NODE_SIZE = 40;
const ROW_HEIGHT = 90;
const LINE_X = NODE_SIZE / 2;

export function SteppingRenderer({ journey, onItemClick, overlayData, activeLayers, cardDataMap, onProgressCycle }: RendererProps) {
  const items = journey.items;
  const totalHeight = items.length * ROW_HEIGHT + NODE_SIZE;

  return (
    <div className="relative" style={{ minHeight: totalHeight }}>
      {/* Vertical connector line */}
      <svg
        className="absolute left-0 top-0 pointer-events-none"
        width={NODE_SIZE}
        height={totalHeight}
      >
        <defs>
          <linearGradient id="stepping-grad" x1="0" y1="0" x2="0" y2="1">
            {items.map((item, i) => (
              <stop
                key={i}
                offset={items.length <= 1 ? '0%' : `${(i / (items.length - 1)) * 100}%`}
                stopColor={STAGE_CONFIG[item.stage].color}
              />
            ))}
          </linearGradient>
        </defs>
        {/* Background track */}
        <line
          x1={LINE_X}
          y1={NODE_SIZE / 2}
          x2={LINE_X}
          y2={totalHeight - NODE_SIZE / 2}
          stroke="#e5e7eb"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Gradient track */}
        <line
          x1={LINE_X}
          y1={NODE_SIZE / 2}
          x2={LINE_X}
          y2={totalHeight - NODE_SIZE / 2}
          stroke="url(#stepping-grad)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>

      {/* Rows */}
      {items.map((item, i) => {
        const topOffset = i * ROW_HEIGHT;
        const ageLabel = item.endAge
          ? `Age ${item.startAge}–${item.endAge}`
          : `Age ${item.startAge}`;
        const stageColor = STAGE_CONFIG[item.stage].color;
        const isCurrent = i === 0;

        return (
          <div
            key={item.id}
            className="absolute flex items-start gap-3"
            style={{ top: topOffset, left: 0, right: 0 }}
          >
            {/* Node */}
            <div className="flex-shrink-0">
              <SharedNode
                item={item}
                onClick={() => onItemClick(item)}
                size={NODE_SIZE}
                progressStatus={cardDataMap?.[item.id]?.status}
                onProgressCycle={onProgressCycle ? () => onProgressCycle(item.id) : undefined}
              />
            </div>

            {/* Card */}
            <SteppingCard
              item={item}
              ageLabel={ageLabel}
              stageColor={stageColor}
              isCurrent={isCurrent}
              onClick={() => onItemClick(item)}
              overlayNodeData={overlayData?.[item.id]}
              activeLayers={activeLayers}
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
  stageColor,
  isCurrent,
  onClick,
  overlayNodeData,
  activeLayers,
}: {
  item: JourneyItem;
  ageLabel: string;
  stageColor: string;
  isCurrent: boolean;
  onClick: () => void;
  overlayNodeData?: NodeOverlayData;
  activeLayers?: Record<OverlayLayerId, boolean>;
}) {
  const stage = STAGE_CONFIG[item.stage];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 text-left rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm p-2.5 shadow-sm transition-all',
        'hover:shadow-md hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span
          className={cn(
            'inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
            stage.bgClass,
            stage.textClass
          )}
        >
          {stage.label}
        </span>
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
        {item.isMilestone && (
          <span className="flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[9px] font-medium" style={{ color: stage.color }}>
              Milestone
            </span>
          </span>
        )}
      </div>
      <p className="text-sm font-semibold leading-tight text-foreground">{item.title}</p>
      {item.subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {item.subtitle}
        </p>
      )}
      {activeLayers && (
        <OverlayBadges nodeData={overlayNodeData} activeLayers={activeLayers} />
      )}
    </button>
  );
}
