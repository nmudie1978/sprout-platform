'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  GraduationCap,
  Briefcase,
  Target,
  Sparkles,
  Code,
  Award,
  Stethoscope,
  Hammer,
  Wrench,
  Lightbulb,
  Users,
  Building,
  Rocket,
  PenTool,
  Heart,
  Zap,
  BookOpen,
  Globe,
  Monitor,
  type LucideIcon,
} from 'lucide-react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import {
  isMotionTrialEnabled,
  prefersReducedMotion,
  microTransition,
} from '@/lib/motion';

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  GraduationCap,
  Briefcase,
  Target,
  Sparkles,
  Code,
  Award,
  Stethoscope,
  Hammer,
  Wrench,
  Lightbulb,
  Users,
  Building,
  Rocket,
  PenTool,
  Heart,
  Zap,
  BookOpen,
  Globe,
  Monitor,
};

interface TimelineNodeProps {
  item: JourneyItem;
  onClick: () => void;
}

export function TimelineNode({ item, onClick }: TimelineNodeProps) {
  const stage = STAGE_CONFIG[item.stage];
  const iconName = item.icon ?? stage.icon;
  const IconComponent = ICON_MAP[iconName] ?? ICON_MAP[stage.icon] ?? Sparkles;

  const shouldAnimate = isMotionTrialEnabled() && !prefersReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        background: `linear-gradient(135deg, ${stage.gradientFrom}, ${stage.gradientTo})`,
      }}
      whileHover={
        shouldAnimate
          ? {
              scale: 1.15,
              boxShadow: `0 0 16px ${stage.color}66`,
            }
          : undefined
      }
      whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
      transition={microTransition}
      aria-label={`${item.title} — click for details`}
    >
      <IconComponent className="h-4.5 w-4.5 text-white" />
      {item.isMilestone && (
        <span
          className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
          style={{ backgroundColor: stage.color }}
        />
      )}
    </motion.button>
  );
}
