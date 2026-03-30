'use client';

import { useMemo } from 'react';
import { STAGE_CONFIG, type JourneyItem, type SchoolTrackItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { SharedNode } from './shared-node';
import { OverlayBadges } from '../overlays/overlay-badges';
import { BookOpen } from 'lucide-react';

const NODE_SIZE = 40;
const H_SPACING = 200;
const CAREER_TRACK_Y = 40;
const CARD_WIDTH = 180;

export function RailRenderer({ journey, onItemClick, overlayData, activeLayers, cardDataMap, onProgressCycle }: RendererProps) {
  const items = journey.items;
  const schoolTrack = journey.schoolTrack;
  const firstSchool = schoolTrack && schoolTrack.length > 0 ? schoolTrack[0] : null;

  const positions = useMemo(
    () => items.map((_, i) => ({ x: i * H_SPACING + NODE_SIZE, y: CAREER_TRACK_Y })),
    [items]
  );

  const totalWidth = items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = CAREER_TRACK_Y + NODE_SIZE + 180;

  const gradientStops = useMemo(
    () =>
      items.map((item, i) => ({
        offset: items.length <= 1 ? '0%' : `${(i / (items.length - 1)) * 100}%`,
        color: STAGE_CONFIG[item.stage].color,
      })),
    [items]
  );

  const careerLineY = CAREER_TRACK_Y + NODE_SIZE / 2;

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
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

          {/* Career track line */}
          <line x1={NODE_SIZE} y1={careerLineY} x2={totalWidth - NODE_SIZE} y2={careerLineY}
            stroke="#e5e7eb" strokeWidth={3} strokeLinecap="round" />
          <line x1={NODE_SIZE} y1={careerLineY} x2={totalWidth - NODE_SIZE} y2={careerLineY}
            stroke="url(#rail-grad)" strokeWidth={3} strokeLinecap="round" />
        </svg>

        {/* Career nodes + cards */}
        {items.map((item, i) => {
          const pos = positions[i];
          const ageLabel = item.endAge
            ? `Age ${item.startAge}\u2013${item.endAge}`
            : `Age ${item.startAge}`;
          const stageColor = STAGE_CONFIG[item.stage].color;
          const isCurrent = i === 0;

          return (
            <div key={item.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
              <div className="flex flex-col items-center" style={{ width: CARD_WIDTH }}>
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

                <SharedNode
                  item={item}
                  onClick={() => onItemClick(item)}
                  size={NODE_SIZE}
                  progressStatus={cardDataMap?.[item.id]?.status}
                  onProgressCycle={onProgressCycle ? () => onProgressCycle(item.id) : undefined}
                />

                <RailCard
                  item={item}
                  onClick={() => onItemClick(item)}
                  overlayNodeData={overlayData?.[item.id]}
                  activeLayers={activeLayers}
                />

                {/* School info — only on the first card */}
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

// ── Career Card ──────────────────────────────────────────────────────

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
        'w-full text-left rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm p-2.5 mt-2 shadow-sm transition-all',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
    >
      <div className="flex items-center gap-1 mb-1">
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
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
          {item.subtitle}
        </p>
      )}
      {item.isMilestone && (
        <div className="mt-1 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-[9px] font-medium" style={{ color: stage.color }}>Milestone</span>
        </div>
      )}
      {activeLayers && (
        <OverlayBadges nodeData={overlayNodeData} activeLayers={activeLayers} />
      )}
    </button>
  );
}

// ── School Badge (compact, shown once at the start) ─────────────────

function SchoolBadge({ item }: { item: SchoolTrackItem }) {
  return (
    <div className="rounded-lg border border-teal-500/20 bg-teal-500/[0.04] p-2">
      <div className="flex items-center gap-1.5 mb-1">
        <BookOpen className="h-3 w-3 text-teal-400/70" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-teal-400/70">
          Starting subjects
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {item.subjects.map((subject) => (
          <span
            key={subject}
            className="inline-block rounded-full bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-medium text-teal-300"
          >
            {subject}
          </span>
        ))}
      </div>
    </div>
  );
}
