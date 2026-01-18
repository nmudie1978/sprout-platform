"use client";

import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Banknote,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sparkles,
} from "lucide-react";
import type { Career } from "@/lib/career-pathways";
import { CareerRealityCheck } from "./career-reality-check";

interface CareerCardProps {
  career: Career;
  compact?: boolean;
  matchScore?: number;
  showExpandButton?: boolean;
  showRealityCheck?: boolean;
}

const growthConfig = {
  high: {
    icon: TrendingUp,
    label: "High Growth",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  medium: {
    icon: Minus,
    label: "Moderate Growth",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  stable: {
    icon: TrendingDown,
    label: "Stable",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
};

export const CareerCard = memo(function CareerCard({
  career,
  compact = false,
  matchScore,
  showExpandButton = true,
  showRealityCheck = false,
}: CareerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;

  if (compact) {
    return (
      <Card className="overflow-hidden border-2 hover:border-purple-500/30 transition-colors">
        <CardContent className="p-0">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{career.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{career.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {career.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    <Banknote className="h-3 w-3 mr-1" />
                    {career.avgSalary.split(" ")[0]}
                  </Badge>
                  <Badge variant="outline" className={`text-xs px-1.5 py-0 ${growth.bg}`}>
                    <GrowthIcon className={`h-3 w-3 mr-1 ${growth.color}`} />
                    <span className={growth.color}>{career.growthOutlook}</span>
                  </Badge>
                </div>
              </div>
              {matchScore !== undefined && (
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-muted/30"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${matchScore} 100`}
                        className="text-purple-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {matchScore}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Match</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Expandable Details for compact mode */}
          {showExpandButton && (
            <>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-3 border-t space-y-3">
                      {/* Key Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          <span className="text-xs font-medium">Key Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {career.keySkills.slice(0, 4).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-[10px] capitalize bg-purple-500/5 border-purple-500/20"
                            >
                              {skill.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Education Path */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium">Education</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {career.educationPath}
                        </p>
                      </div>

                      {/* Reality Check */}
                      {showRealityCheck && (
                        <div className="mt-2">
                          <CareerRealityCheck roleSlug={career.id} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                className="w-full rounded-none border-t h-8 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Learn More
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 hover:border-purple-500/30 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{career.emoji}</span>
              <div>
                <h3 className="font-bold text-lg">{career.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {career.description}
                </p>
              </div>
            </div>
            {matchScore !== undefined && (
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(matchScore / 100) * 150.8} 150.8`}
                      className="text-purple-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {matchScore}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Match</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              <Banknote className="h-3 w-3 mr-1" />
              {career.avgSalary}
            </Badge>
            <Badge variant="outline" className={`text-xs ${growth.bg}`}>
              <GrowthIcon className={`h-3 w-3 mr-1 ${growth.color}`} />
              <span className={growth.color}>{growth.label}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              <GraduationCap className="h-3 w-3 mr-1" />
              {career.educationPath.split(" ").slice(0, 3).join(" ")}...
            </Badge>
          </div>
        </div>

        {/* Key Skills */}
        <div className="px-4 py-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Key Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {career.keySkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs capitalize bg-purple-500/5 border-purple-500/20"
              >
                {skill.replace("-", " ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Expandable Details */}
        {showExpandButton && (
          <>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 border-t space-y-4">
                    {/* Education Path */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Education Path</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {career.educationPath}
                      </p>
                    </div>

                    {/* Daily Tasks */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">What You'll Do</span>
                      </div>
                      <ul className="text-sm text-muted-foreground pl-6 space-y-1">
                        {career.dailyTasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reality Check (if enabled) */}
                    {showRealityCheck && (
                      <div className="mt-4">
                        <CareerRealityCheck roleSlug={career.id} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              className="w-full rounded-none border-t h-10 text-sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Learn More
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
});
