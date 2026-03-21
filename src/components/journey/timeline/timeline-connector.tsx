'use client';

import { motion } from 'framer-motion';
import { STAGE_CONFIG, type JourneyStage } from '@/lib/journey/career-journey-types';
import {
  isMotionTrialEnabled,
  prefersReducedMotion,
  DURATION,
  PREMIUM_EASE,
} from '@/lib/motion';

interface TimelineConnectorProps {
  fromStage: JourneyStage;
  toStage: JourneyStage;
  isVertical: boolean;
  index: number;
}

export function TimelineConnector({
  fromStage,
  toStage,
  isVertical,
  index,
}: TimelineConnectorProps) {
  const fromColor = STAGE_CONFIG[fromStage].color;
  const toColor = STAGE_CONFIG[toStage].color;
  const shouldAnimate = isMotionTrialEnabled() && !prefersReducedMotion();

  const gradientId = `connector-grad-${index}`;
  const gradientDirection = isVertical
    ? { x1: '0', y1: '0', x2: '0', y2: '1' }
    : { x1: '0', y1: '0', x2: '1', y2: '0' };

  if (isVertical) {
    return (
      <motion.div
        className="flex items-center justify-center"
        style={{ width: 40, height: 24 }}
        initial={shouldAnimate ? { scaleY: 0 } : false}
        animate={{ scaleY: 1 }}
        transition={{
          duration: DURATION.standard,
          ease: PREMIUM_EASE as unknown as string,
          delay: shouldAnimate ? 0.05 * index : 0,
        }}
      >
        <svg width="4" height="24" className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} {...gradientDirection}>
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="4"
            height="24"
            rx="2"
            fill={`url(#${gradientId})`}
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center"
      style={{ height: 40, width: 32 }}
      initial={shouldAnimate ? { scaleX: 0 } : false}
      animate={{ scaleX: 1 }}
      transition={{
        duration: DURATION.standard,
        ease: PREMIUM_EASE as unknown as string,
        delay: shouldAnimate ? 0.05 * index : 0,
      }}
    >
      <svg width="32" height="4" className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} {...gradientDirection}>
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="32"
          height="4"
          rx="2"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </motion.div>
  );
}
