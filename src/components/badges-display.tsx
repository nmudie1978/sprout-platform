"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BadgeType } from "@prisma/client";

// Badge definitions with emoji, label, and description
const BADGE_DEFINITIONS: Record<BadgeType, { emoji: string; label: string; description: string; color: string }> = {
  FIRST_JOB: {
    emoji: "🎉",
    label: "First Job",
    description: "Completed your first job",
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
    description: "Received a perfect 5-star rating",
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
    description: "Respond to applications within 1 hour",
    color: "from-yellow-500 to-orange-500",
  },
  RELIABLE: {
    emoji: "🛡️",
    label: "Reliable",
    description: "Achieved 90%+ reliability score",
    color: "from-blue-500 to-indigo-500",
  },
  SUPER_RELIABLE: {
    emoji: "💯",
    label: "Super Reliable",
    description: "Perfect 100% reliability score",
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
    description: "Completed 5+ jobs in one category",
    color: "from-emerald-500 to-green-500",
  },
  MULTI_TALENTED: {
    emoji: "🎨",
    label: "Multi-Talented",
    description: "Completed jobs in 3+ categories",
    color: "from-pink-500 to-rose-500",
  },
  FIRST_REVIEW: {
    emoji: "📝",
    label: "First Review",
    description: "Received your first review",
    color: "from-teal-500 to-cyan-500",
  },
  HIGHLY_RATED: {
    emoji: "🌈",
    label: "Highly Rated",
    description: "Average rating above 4.5 stars",
    color: "from-violet-500 to-purple-500",
  },
};

// All possible badges for showing locked ones
const ALL_BADGE_TYPES: BadgeType[] = [
  "FIRST_JOB",
  "FIVE_JOBS",
  "TEN_JOBS",
  "TWENTY_FIVE_JOBS",
  "FIFTY_JOBS",
  "FIVE_STAR_RATING",
  "FIRST_REVIEW",
  "HIGHLY_RATED",
  "RELIABLE",
  "SUPER_RELIABLE",
  "MULTI_TALENTED",
  "CATEGORY_MASTER",
];

interface BadgesDisplayProps {
  showLocked?: boolean; // Show locked badges or only earned ones
  compact?: boolean; // Compact mode for dashboard
}

export function BadgesDisplay({ showLocked = false, compact = false }: BadgesDisplayProps) {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["my-badges"],
    queryFn: async () => {
      const response = await fetch("/api/badges");
      if (!response.ok) throw new Error("Failed to fetch badges");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedTypes = new Set(badges.map((b: any) => b.type as BadgeType));
  const earnedBadges = badges.map((b: any) => ({
    ...b,
    ...BADGE_DEFINITIONS[b.type as BadgeType],
  }));

  // For compact mode, just show earned badges
  if (compact) {
    if (earnedBadges.length === 0) {
      return null; // Don't show anything if no badges in compact mode
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5" />
          <CardHeader className="relative pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Achievements</CardTitle>
                <CardDescription>{earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''} earned</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {earnedBadges.slice(0, 6).map((badge: any, index: number) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl cursor-pointer shadow-lg hover:scale-110 transition-transform`}
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
                {earnedBadges.length > 6 && (
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-sm font-medium">
                    +{earnedBadges.length - 6}
                  </div>
                )}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Full display mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>
                {earnedBadges.length} of {ALL_BADGE_TYPES.length} badges earned
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <TooltipProvider>
              {ALL_BADGE_TYPES.map((type, index) => {
                const def = BADGE_DEFINITIONS[type];
                const earned = earnedTypes.has(type);
                const badge = badges.find((b: any) => b.type === type);

                return (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          earned
                            ? `bg-gradient-to-br ${def.color} text-white shadow-lg hover:scale-105`
                            : "bg-muted/50 text-muted-foreground opacity-50 hover:opacity-70"
                        }`}
                      >
                        <span className="text-2xl">
                          {earned ? def.emoji : <Lock className="h-5 w-5" />}
                        </span>
                        <span className="text-[10px] font-medium text-center px-1 leading-tight">
                          {def.label}
                        </span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center max-w-[150px]">
                        <p className="font-semibold">{def.label}</p>
                        <p className="text-xs text-muted-foreground">{def.description}</p>
                        {earned && badge && (
                          <p className="text-xs text-green-500 mt-1">
                            Earned {formatDate(badge.earnedAt)}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
