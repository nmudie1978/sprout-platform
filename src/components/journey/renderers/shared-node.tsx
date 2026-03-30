'use client';

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
  Gamepad2,
  ChefHat,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';

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
  Gamepad2,
  ChefHat,
  UtensilsCrossed,
};

const PROGRESS_RING_COLORS = {
  not_started: 'transparent',
  in_progress: '#f59e0b',
  done: '#22c55e',
} as const;

interface SharedNodeProps {
  item: JourneyItem;
  onClick: () => void;
  onProgressCycle?: () => void;
  progressStatus?: 'not_started' | 'in_progress' | 'done';
  size?: number;
}

export function SharedNode({ item, onClick, onProgressCycle, progressStatus, size = 40 }: SharedNodeProps) {
  const stage = STAGE_CONFIG[item.stage];
  const iconName = item.icon ?? stage.icon;
  const IconComponent = ICON_MAP[iconName] ?? ICON_MAP[stage.icon] ?? Sparkles;
  const iconSize = Math.round(size * 0.45);
  const ringColor = progressStatus ? PROGRESS_RING_COLORS[progressStatus] : 'transparent';
  const showRing = progressStatus && progressStatus !== 'not_started';

  return (
    <div
      className="relative z-10 flex items-center justify-center rounded-full border-2 border-white shadow-md cursor-pointer"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${stage.gradientFrom}, ${stage.gradientTo})`,
        boxShadow: showRing
          ? `0 0 0 3px ${ringColor}, 0 1px 3px rgba(0,0,0,0.1)`
          : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease',
      }}
      onClick={(e) => {
        if (onProgressCycle) {
          e.stopPropagation();
          onProgressCycle();
        }
      }}
      aria-label={`${item.title}${progressStatus ? ` — ${progressStatus.replace('_', ' ')}` : ''}`}
    >
      <IconComponent
        className="text-white"
        style={{ width: iconSize, height: iconSize }}
      />
      {item.isMilestone && (
        <span
          className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
          style={{ backgroundColor: stage.color }}
        />
      )}
    </div>
  );
}
