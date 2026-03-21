'use client';

import { motion } from 'framer-motion';
import type { Journey, JourneyItem } from '@/lib/journey/career-journey-types';
import {
  isMotionTrialEnabled,
  prefersReducedMotion,
  DURATION,
  PREMIUM_EASE,
  STAGGER,
} from '@/lib/motion';
import { useTimelineLayout } from './use-timeline-layout';
import { TimelineNode } from './timeline-node';
import { TimelineCard } from './timeline-card';
import { TimelineConnector } from './timeline-connector';

interface JourneyTimelineProps {
  journey: Journey;
  onItemClick: (item: JourneyItem) => void;
}

export function JourneyTimeline({ journey, onItemClick }: JourneyTimelineProps) {
  const { isVertical } = useTimelineLayout();
  const shouldAnimate = isMotionTrialEnabled() && !prefersReducedMotion();

  const items = journey.items;

  if (isVertical) {
    return <VerticalTimeline items={items} onItemClick={onItemClick} shouldAnimate={shouldAnimate} />;
  }

  return <HorizontalTimeline items={items} onItemClick={onItemClick} shouldAnimate={shouldAnimate} />;
}

// ============================================
// VERTICAL LAYOUT (Mobile < 640px)
// ============================================

function VerticalTimeline({
  items,
  onItemClick,
  shouldAnimate,
}: {
  items: JourneyItem[];
  onItemClick: (item: JourneyItem) => void;
  shouldAnimate: boolean;
}) {
  return (
    <div className="relative pl-6">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className="relative flex items-start gap-3 pb-6 last:pb-0"
          initial={shouldAnimate ? { opacity: 0, x: -12 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: DURATION.standard,
            ease: PREMIUM_EASE as unknown as string,
            delay: shouldAnimate ? STAGGER.standard * i : 0,
          }}
        >
          {/* Vertical rail */}
          {i < items.length - 1 && (
            <div className="absolute left-[14px] top-[44px] bottom-0 w-[3px]">
              <TimelineConnector
                fromStage={item.stage}
                toStage={items[i + 1].stage}
                isVertical
                index={i}
              />
            </div>
          )}

          {/* Node */}
          <div className="flex-shrink-0 relative z-10">
            <TimelineNode item={item} onClick={() => onItemClick(item)} />
          </div>

          {/* Card */}
          <div className="flex-1 min-w-0 pt-0.5">
            <TimelineCard item={item} onClick={() => onItemClick(item)} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// HORIZONTAL LAYOUT (Desktop ≥ 640px)
// ============================================

function HorizontalTimeline({
  items,
  onItemClick,
  shouldAnimate,
}: {
  items: JourneyItem[];
  onItemClick: (item: JourneyItem) => void;
  shouldAnimate: boolean;
}) {
  return (
    <div className="overflow-x-auto scroll-smooth pb-4 -mx-2 px-2">
      <div className="inline-flex items-start gap-0 min-w-max">
        {items.map((item, i) => {
          const isEven = i % 2 === 0;

          return (
            <motion.div
              key={item.id}
              className="flex items-center"
              initial={shouldAnimate ? { opacity: 0, y: isEven ? -12 : 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: DURATION.standard,
                ease: PREMIUM_EASE as unknown as string,
                delay: shouldAnimate ? STAGGER.standard * i : 0,
              }}
            >
              {/* Item column */}
              <div className="flex flex-col items-center" style={{ width: 168 }}>
                {/* Top card (even items) */}
                {isEven ? (
                  <div className="w-full px-1 mb-3">
                    <TimelineCard item={item} onClick={() => onItemClick(item)} />
                  </div>
                ) : (
                  <div className="w-full px-1 mb-3" style={{ visibility: 'hidden' }}>
                    <TimelineCard item={item} onClick={() => onItemClick(item)} />
                  </div>
                )}

                {/* Node */}
                <TimelineNode item={item} onClick={() => onItemClick(item)} />

                {/* Bottom card (odd items) */}
                {!isEven ? (
                  <div className="w-full px-1 mt-3">
                    <TimelineCard item={item} onClick={() => onItemClick(item)} />
                  </div>
                ) : (
                  <div className="w-full px-1 mt-3" style={{ visibility: 'hidden' }}>
                    <TimelineCard item={item} onClick={() => onItemClick(item)} />
                  </div>
                )}
              </div>

              {/* Connector to next item */}
              {i < items.length - 1 && (
                <TimelineConnector
                  fromStage={item.stage}
                  toStage={items[i + 1].stage}
                  isVertical={false}
                  index={i}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
