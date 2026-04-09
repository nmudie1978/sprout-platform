'use client';

import { memo } from 'react';
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
  Check,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';

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

export type StepState = 'completed' | 'current' | 'next' | 'future';

interface SharedNodeProps {
  item: JourneyItem;
  onClick: () => void;
  onProgressCycle?: () => void;
  progressStatus?: 'not_started' | 'in_progress' | 'done';
  size?: number;
  /** Authoritative visual state. If omitted, falls back to progressStatus. */
  stepState?: StepState;
  /** True when an earlier step isn't done — can't mark progress yet. */
  locked?: boolean;
}

/**
 * Single source of truth for step visual state.
 * Pure neutrals + one accent (slate=current, emerald=completed).
 * No gradients, no glow, no stage colours leaking into the node.
 */
export const SharedNode = memo(function SharedNode({
  item,
  onClick,
  progressStatus,
  size = 40,
  stepState,
  locked,
}: SharedNodeProps) {
  const stage = STAGE_CONFIG[item.stage];
  const iconName = item.icon ?? stage.icon;
  const IconComponent = ICON_MAP[iconName] ?? ICON_MAP[stage.icon] ?? Sparkles;
  const iconSize = Math.round(size * 0.42);

  // Resolve effective state. Explicit stepState wins; otherwise fall back to
  // progress (so callers that haven't migrated still get a reasonable look).
  const effective: StepState =
    stepState ??
    (progressStatus === 'done' ? 'completed' : 'future');

  // State-driven classes — pure neutrals + a single accent per state.
  // Disciplined palette: emerald = done, neutral = everything else.
  // Amber lives only on the current step's CARD border + NOW badge —
  // not on the node circle. The node uses a slightly stronger neutral
  // border so it still reads as part of the current group, but doesn't
  // add to the amber footprint.
  const stateClasses: Record<StepState, string> = {
    completed: 'bg-emerald-500 border-emerald-500 text-white',
    current:
      'bg-card border-slate-400 text-slate-700 dark:border-slate-400 dark:text-slate-200',
    next:
      'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500',
    future:
      'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500',
  };

  const ContentIcon =
    effective === 'completed' ? Check : locked ? Lock : IconComponent;

  return (
    <div
      className={cn(
        'relative z-10 flex items-center justify-center rounded-full border-2 shadow-sm transition-colors pointer-events-none',
        stateClasses[effective]
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <ContentIcon
        style={{ width: iconSize, height: iconSize }}
        strokeWidth={effective === 'completed' ? 3 : 2}
      />
    </div>
  );
});
