"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  Sparkles,
} from "lucide-react";
import type { Career } from "@/lib/career-pathways";

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

/* ------------------------------------------------------------------ */
/*  CareerCard — focused preview: identity, salary, growth, skills    */
/* ------------------------------------------------------------------ */

export const CareerCard = memo(function CareerCard({
  career,
  compact = false,
  matchScore,
}: CareerCardProps) {
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;

  /* ---------- COMPACT MODE ---------- */
  if (compact) {
    return (
      <Card className="overflow-hidden border-2 hover:border-teal-500/30 transition-colors">
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
                        className="text-teal-500"
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
        </CardContent>
      </Card>
    );
  }

  /* ---------- FULL MODE ---------- */
  return (
    <Card className="overflow-hidden border hover:border-teal-500/30 transition-colors">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 bg-teal-50/30 dark:bg-teal-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{career.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg tracking-tight">{career.title}</h3>
                  {career.entryLevel && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Entry Level
                    </Badge>
                  )}
                </div>
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
                      className="text-teal-500"
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

          {/* Salary & Growth */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Salary</p>
                <p className="text-sm font-semibold truncate">{career.avgSalary}</p>
              </div>
            </div>
            <div className={`rounded-lg px-3 py-2.5 flex items-center gap-2 border ${growth.bg}`}>
              <GrowthIcon className={`h-4 w-4 shrink-0 ${growth.color}`} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Growth</p>
                <p className={`text-sm font-semibold ${growth.color}`}>{growth.label}</p>
              </div>
            </div>
          </div>

          {/* Key Skills */}
          {career.keySkills.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3 text-teal-500" />
                <span className="text-[10px] font-medium text-muted-foreground">Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {career.keySkills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-[10px] capitalize bg-teal-500/5 border-teal-500/20"
                  >
                    {skill.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
