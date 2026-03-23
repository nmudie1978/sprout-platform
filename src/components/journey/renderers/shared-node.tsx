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

interface SharedNodeProps {
  item: JourneyItem;
  onClick: () => void;
  size?: number;
}

export function SharedNode({ item, onClick, size = 40 }: SharedNodeProps) {
  const stage = STAGE_CONFIG[item.stage];
  const iconName = item.icon ?? stage.icon;
  const IconComponent = ICON_MAP[iconName] ?? ICON_MAP[stage.icon] ?? Sparkles;
  const iconSize = Math.round(size * 0.45);

  return (
    <div
      className="relative z-10 flex items-center justify-center rounded-full border-2 border-white shadow-md"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${stage.gradientFrom}, ${stage.gradientTo})`,
      }}
      aria-label={item.title}
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
