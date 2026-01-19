"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  ChevronRight,
} from "lucide-react";
import type { Career } from "@/lib/career-pathways";

export type ViewMode = "list" | "small" | "large";

interface CareerCardV2Props {
  career: Career;
  viewMode: ViewMode;
  matchScore?: number;
  onLearnMore: () => void;
}

const growthConfig = {
  high: {
    icon: TrendingUp,
    label: "High",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950",
  },
  medium: {
    icon: Minus,
    label: "Med",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950",
  },
  stable: {
    icon: TrendingDown,
    label: "Low",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950",
  },
};

/**
 * List View Row - Entire row is clickable
 */
function ListRow({ career, matchScore, onLearnMore }: Omit<CareerCardV2Props, "viewMode">) {
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;
  const salaryShort = career.avgSalary.split(" ")[0];

  return (
    <button
      type="button"
      onClick={onLearnMore}
      className="w-full flex items-center gap-3 px-3 py-2 border-b hover:bg-muted/50 transition-colors text-left focus:outline-none focus:bg-muted/50"
    >
      <span className="text-lg flex-shrink-0">{career.emoji}</span>
      <span className="flex-1 text-sm font-medium truncate min-w-0">
        {career.title}
      </span>
      {matchScore !== undefined && (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 flex-shrink-0"
        >
          {matchScore}%
        </Badge>
      )}
      <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">
        {salaryShort}
      </span>
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 ${growth.bg} border-0 flex-shrink-0 w-12 justify-center`}
      >
        <GrowthIcon className={`h-3 w-3 ${growth.color}`} />
      </Badge>
      <span className="text-[10px] text-primary font-medium flex items-center gap-0.5 flex-shrink-0">
        Learn more
        <ChevronRight className="h-3 w-3" />
      </span>
    </button>
  );
}

/**
 * Small Card View - Entire card is clickable
 */
function SmallCard({ career, matchScore, onLearnMore }: Omit<CareerCardV2Props, "viewMode">) {
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;
  const salaryShort = career.avgSalary.split(" ")[0];
  const visibleSkills = career.keySkills.slice(0, 2);
  const extraSkills = career.keySkills.length - 2;

  return (
    <button
      type="button"
      onClick={onLearnMore}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      <Card className="overflow-hidden border hover:border-purple-500/30 transition-all hover:shadow-sm h-full">
        <div className="p-3">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xl flex-shrink-0">{career.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{career.title}</h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {career.description}
              </p>
            </div>
            {matchScore !== undefined && (
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted/30" />
                    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray={`${(matchScore / 100) * 75.4} 75.4`} className="text-purple-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                    {matchScore}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
              <Banknote className="h-2.5 w-2.5 mr-0.5" />
              {salaryShort}
            </Badge>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${growth.bg} border-0`}>
              <GrowthIcon className={`h-2.5 w-2.5 mr-0.5 ${growth.color}`} />
              <span className={growth.color}>{growth.label}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {visibleSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-[8px] px-1 py-0 capitalize bg-muted/50"
              >
                {skill.replace("-", " ")}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <span className="text-[9px] text-muted-foreground">+{extraSkills}</span>
            )}
          </div>

          <div className="mt-2 pt-2 border-t">
            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
              Learn more <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}

/**
 * Large Card View - Entire card is clickable
 */
function LargeCard({ career, matchScore, onLearnMore }: Omit<CareerCardV2Props, "viewMode">) {
  const growth = growthConfig[career.growthOutlook];
  const GrowthIcon = growth.icon;
  const visibleSkills = career.keySkills.slice(0, 4);
  const extraSkills = career.keySkills.length - 4;

  return (
    <button
      type="button"
      onClick={onLearnMore}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      <Card className="overflow-hidden border hover:border-purple-500/30 transition-all hover:shadow-md h-full">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl flex-shrink-0">{career.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">{career.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {career.description}
              </p>
            </div>
            {matchScore !== undefined && (
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-11 h-11">
                  <svg className="w-11 h-11 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted/30" />
                    <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${(matchScore / 100) * 113} 113`} className="text-purple-500" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {matchScore}%
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground">Match</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              <Banknote className="h-3 w-3 mr-1" />
              {career.avgSalary}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${growth.bg} border-0`}>
              <GrowthIcon className={`h-3 w-3 mr-1 ${growth.color}`} />
              <span className={growth.color}>{growth.label} Growth</span>
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {visibleSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-[9px] px-1.5 py-0 capitalize bg-purple-500/5 border-purple-500/20"
              >
                {skill.replace("-", " ")}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <span className="text-[10px] text-muted-foreground">+{extraSkills} more</span>
            )}
          </div>

          <div className="pt-2 border-t">
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              Learn more about this career <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}

export const CareerCardV2 = memo(function CareerCardV2({
  career,
  viewMode,
  matchScore,
  onLearnMore,
}: CareerCardV2Props) {
  const props = { career, matchScore, onLearnMore };

  switch (viewMode) {
    case "list":
      return <ListRow {...props} />;
    case "small":
      return <SmallCard {...props} />;
    case "large":
      return <LargeCard {...props} />;
    default:
      return <SmallCard {...props} />;
  }
});
