"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BadgeType } from "@prisma/client";

// Badge definitions with emoji, label, and description
const BADGE_DEFINITIONS: Record<BadgeType, { emoji: string; label: string; description: string; color: string }> = {
  FIRST_JOB: {
    emoji: "🎉",
    label: "First Job",
    description: "Completed first job",
    color: "from-purple-500 to-pink-500",
  },
  FIVE_JOBS: {
    emoji: "🌟",
    label: "Rising Star",
    description: "Completed 5 jobs",
    color: "from-blue-500 to-cyan-500",
  },
  TEN_JOBS: {
    emoji: "🔥",
    label: "On Fire",
    description: "Completed 10 jobs",
    color: "from-orange-500 to-red-500",
  },
  TWENTY_FIVE_JOBS: {
    emoji: "💎",
    label: "Diamond Worker",
    description: "Completed 25 jobs",
    color: "from-cyan-500 to-blue-500",
  },
  FIFTY_JOBS: {
    emoji: "👑",
    label: "Legend",
    description: "Completed 50 jobs",
    color: "from-amber-500 to-yellow-500",
  },
  FIVE_STAR_RATING: {
    emoji: "⭐",
    label: "Five Star",
    description: "Perfect 5-star rating",
    color: "from-yellow-500 to-amber-500",
  },
  RATING_STREAK: {
    emoji: "🎯",
    label: "Streak Master",
    description: "3 consecutive 5-star ratings",
    color: "from-green-500 to-emerald-500",
  },
  QUICK_RESPONDER: {
    emoji: "⚡",
    label: "Quick Responder",
    description: "Responds within 1 hour",
    color: "from-yellow-500 to-orange-500",
  },
  RELIABLE: {
    emoji: "🛡️",
    label: "Reliable",
    description: "90%+ reliability score",
    color: "from-blue-500 to-indigo-500",
  },
  SUPER_RELIABLE: {
    emoji: "💯",
    label: "Super Reliable",
    description: "100% reliability score",
    color: "from-indigo-500 to-purple-500",
  },
  EARLY_BIRD: {
    emoji: "🐦",
    label: "Early Bird",
    description: "Joined in the first month",
    color: "from-sky-500 to-blue-500",
  },
  CATEGORY_MASTER: {
    emoji: "🏆",
    label: "Category Master",
    description: "5+ jobs in one category",
    color: "from-emerald-500 to-green-500",
  },
  MULTI_TALENTED: {
    emoji: "🎨",
    label: "Multi-Talented",
    description: "Jobs in 3+ categories",
    color: "from-pink-500 to-rose-500",
  },
  FIRST_REVIEW: {
    emoji: "📝",
    label: "First Review",
    description: "Received first review",
    color: "from-teal-500 to-cyan-500",
  },
  HIGHLY_RATED: {
    emoji: "🌈",
    label: "Highly Rated",
    description: "Average rating above 4.5",
    color: "from-violet-500 to-purple-500",
  },
};

interface BadgeData {
  id: string;
  type: BadgeType;
  earnedAt: string | Date;
}

interface UserBadgesDisplayProps {
  badges: BadgeData[];
  variant?: "inline" | "compact" | "full";
  maxDisplay?: number;
  showTitle?: boolean;
  className?: string;
}

/**
 * Displays badges for any user (not just current user)
 *
 * Variants:
 * - inline: Just the badge icons in a row (for applicant lists)
 * - compact: Card with small icons (for profile sidebars)
 * - full: Full card with all details (for profile pages)
 */
export function UserBadgesDisplay({
  badges,
  variant = "compact",
  maxDisplay = 8,
  showTitle = true,
  className = "",
}: UserBadgesDisplayProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const enrichedBadges = badges.map((badge) => ({
    ...badge,
    ...BADGE_DEFINITIONS[badge.type],
  }));

  // Inline variant - just icons
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        <TooltipProvider>
          {enrichedBadges.slice(0, maxDisplay).map((badge, index) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`h-6 w-6 rounded-md bg-gradient-to-br ${badge.color} flex items-center justify-center text-xs cursor-pointer shadow-sm hover:scale-110 transition-transform`}
                >
                  {badge.emoji}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {badges.length > maxDisplay && (
            <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium">
              +{badges.length - maxDisplay}
            </div>
          )}
        </TooltipProvider>
      </div>
    );
  }

  // Compact variant - small card
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="border overflow-hidden">
          <CardContent className="p-3">
            {showTitle && (
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Achievements</span>
                <span className="text-xs text-muted-foreground">({badges.length})</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <TooltipProvider>
                {enrichedBadges.slice(0, maxDisplay).map((badge, index) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`h-8 w-8 rounded-lg bg-gradient-to-br ${badge.color} flex items-center justify-center text-base cursor-pointer shadow hover:scale-110 transition-transform`}
                      >
                        {badge.emoji}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-semibold">{badge.label}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {badges.length > maxDisplay && (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium">
                    +{badges.length - maxDisplay}
                  </div>
                )}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Full variant - detailed card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Achievement Badges</CardTitle>
              <CardDescription>
                {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            <TooltipProvider>
              {enrichedBadges.map((badge, index) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`aspect-square rounded-xl bg-gradient-to-br ${badge.color} flex flex-col items-center justify-center gap-1 cursor-pointer shadow-lg hover:scale-105 transition-all text-white`}
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <span className="text-[9px] font-medium text-center px-1 leading-tight opacity-90">
                        {badge.label}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center max-w-[150px]">
                      <p className="font-semibold">{badge.label}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      <p className="text-xs text-green-500 mt-1">
                        Earned {formatDate(badge.earnedAt)}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
