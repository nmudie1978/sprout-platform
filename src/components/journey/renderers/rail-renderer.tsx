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
const H_SPACING = 170;
const CAREER_TRACK_Y = 40;
const SCHOOL_TRACK_Y = 260;
const CARD_WIDTH = 150;
const MERGE_DOT_SIZE = 6;

export function RailRenderer({ journey, onItemClick, overlayData, activeLayers }: RendererProps) {
  const items = journey.items;
  const schoolTrack = journey.schoolTrack;
  const hasSchoolTrack = schoolTrack && schoolTrack.length > 0;

  const positions = useMemo(
    () => items.map((_, i) => ({ x: i * H_SPACING + NODE_SIZE, y: CAREER_TRACK_Y })),
    [items]
  );

  const totalWidth = items.length * H_SPACING + NODE_SIZE * 2;
  const totalHeight = hasSchoolTrack ? SCHOOL_TRACK_Y + 120 : CAREER_TRACK_Y + NODE_SIZE + 160;

  const gradientStops = useMemo(
    () =>
      items.map((item, i) => ({
        offset: items.length <= 1 ? '0%' : `${(i / (items.length - 1)) * 100}%`,
        color: STAGE_CONFIG[item.stage].color,
      })),
    [items]
  );

  const careerLineY = CAREER_TRACK_Y + NODE_SIZE / 2;
  const schoolLineY = SCHOOL_TRACK_Y + 12;

  // Map school track items to their aligned career stage positions
  const schoolPositions = useMemo(() => {
    if (!schoolTrack) return [];
    return schoolTrack.map((st) => {
      // Find the first career item with matching stage
      const careerIdx = items.findIndex((item) => item.stage === st.stage);
      const x = careerIdx >= 0 ? careerIdx * H_SPACING + NODE_SIZE : 0;
      return { x, y: SCHOOL_TRACK_Y };
    });
  }, [items, schoolTrack]);

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

          {/* Career track */}
          <line x1={NODE_SIZE} y1={careerLineY} x2={totalWidth - NODE_SIZE} y2={careerLineY}
            stroke="#e5e7eb" strokeWidth={3} strokeLinecap="round" />
          <line x1={NODE_SIZE} y1={careerLineY} x2={totalWidth - NODE_SIZE} y2={careerLineY}
            stroke="url(#rail-grad)" strokeWidth={3} strokeLinecap="round" />

          {/* School track line + merge connectors */}
          {hasSchoolTrack && (
            <>
              {/* School track line */}
              <line
                x1={schoolPositions[0]?.x ?? NODE_SIZE}
                y1={schoolLineY}
                x2={schoolPositions[schoolPositions.length - 1]?.x
                  ? schoolPositions[schoolPositions.length - 1].x + CARD_WIDTH
                  : totalWidth - NODE_SIZE}
                y2={schoolLineY}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="6 4"
                opacity={0.4}
              />

              {/* Vertical connectors from career nodes to school cards */}
              {schoolPositions.map((sp, i) => (
                <g key={`conn-${i}`}>
                  <line
                    x1={sp.x + CARD_WIDTH / 2}
                    y1={careerLineY + NODE_SIZE / 2 + 80}
                    x2={sp.x + CARD_WIDTH / 2}
                    y2={schoolLineY}
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.25}
                  />
                  {/* Merge dot */}
                  <circle
                    cx={sp.x + CARD_WIDTH / 2}
                    cy={schoolLineY}
                    r={MERGE_DOT_SIZE / 2}
                    fill="#8b5cf6"
                    opacity={0.5}
                  />
                </g>
              ))}
            </>
          )}
        </svg>

        {/* Track labels */}
        {hasSchoolTrack && (
          <>
            <div
              className="absolute text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60"
              style={{ left: 0, top: careerLineY - 28 }}
            >
              Career Path
            </div>
            <div
              className="absolute flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-purple-400/60"
              style={{ left: 0, top: schoolLineY - 18 }}
            >
              <BookOpen className="h-3 w-3" />
              School & Learning
            </div>
          </>
        )}

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

                <SharedNode item={item} onClick={() => onItemClick(item)} size={NODE_SIZE} />

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

        {/* School track cards */}
        {hasSchoolTrack && schoolTrack.map((st, i) => {
          const pos = schoolPositions[i];
          if (!pos) return null;

          return (
            <div key={st.id} className="absolute" style={{ left: pos.x, top: pos.y }}>
              <SchoolCard item={st} />
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

// ── School Track Card ────────────────────────────────────────────────

function SchoolCard({ item }: { item: SchoolTrackItem }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm p-2 shadow-sm',
      )}
      style={{ width: CARD_WIDTH }}
    >
      <div className="flex items-center gap-1 mb-1">
        <BookOpen className="h-3 w-3 text-purple-400" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-purple-400">
          Subjects
        </span>
      </div>
      <p className="text-[11px] font-medium leading-tight text-foreground">{item.title}</p>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {item.subjects.map((subject) => (
          <span
            key={subject}
            className="inline-block rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-medium text-purple-300"
          >
            {subject}
          </span>
        ))}
      </div>
      {item.personalLearning && (
        <p className="text-[9px] text-muted-foreground mt-1.5 leading-snug italic">
          {item.personalLearning}
        </p>
      )}
    </div>
  );
}
