"use client";

import { getCareerProgression, type CareerLevel } from "@/lib/career-progressions";
import { TrendingUp } from "lucide-react";

interface CareerProgressionProps {
  careerId: string;
}

const levelColors: Record<CareerLevel["level"], string> = {
  entry: "bg-purple-500",
  mid: "bg-purple-400",
  senior: "bg-emerald-400",
  lead: "bg-emerald-500",
};

const levelBorderColors: Record<CareerLevel["level"], string> = {
  entry: "border-purple-500",
  mid: "border-purple-400",
  senior: "border-emerald-400",
  lead: "border-emerald-500",
};

export function CareerProgression({ careerId }: CareerProgressionProps) {
  const progression = getCareerProgression(careerId);

  if (!progression) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium">Career Progression</span>
      </div>

      <div className="relative">
        {/* Gradient connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-500 via-purple-300 to-emerald-500 z-0" />

        {/* Timeline nodes */}
        <div className="relative z-10 flex justify-between">
          {progression.levels.map((level, index) => (
            <div
              key={level.level}
              className="flex flex-col items-center"
              style={{ width: `${100 / progression.levels.length}%` }}
            >
              {/* Node circle */}
              <div
                className={`w-8 h-8 rounded-full ${levelColors[level.level]} flex items-center justify-center text-white text-xs font-bold shadow-md`}
              >
                {index + 1}
              </div>

              {/* Level details */}
              <div className="mt-2 text-center px-1">
                <p className="text-xs font-medium truncate max-w-[80px]">
                  {level.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {level.yearsExperience}
                </p>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {level.salaryRange}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CareerProgressionCompactProps {
  careerId: string;
}

export function CareerProgressionCompact({ careerId }: CareerProgressionCompactProps) {
  const progression = getCareerProgression(careerId);

  if (!progression) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span className="text-xs font-medium">Career Path</span>
      </div>

      <div className="relative">
        {/* Gradient connecting line */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 via-purple-300 to-emerald-500 z-0" />

        {/* Timeline nodes */}
        <div className="relative z-10 flex justify-between">
          {progression.levels.map((level, index) => (
            <div
              key={level.level}
              className="flex flex-col items-center"
              style={{ width: `${100 / progression.levels.length}%` }}
            >
              {/* Node circle */}
              <div
                className={`w-6 h-6 rounded-full ${levelColors[level.level]} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
              >
                {index + 1}
              </div>

              {/* Level details */}
              <div className="mt-1 text-center px-0.5">
                <p className="text-[10px] font-medium truncate max-w-[60px]">
                  {level.title}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {level.yearsExperience}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
