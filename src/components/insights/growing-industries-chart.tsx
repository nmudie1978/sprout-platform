/**
 * GROWING INDUSTRIES CHART — World Lens Insight Card 2
 *
 * Shows which industries are projected to grow fastest.
 * Uses lightweight CSS bars for performance.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  GROWING_INDUSTRIES_DATA,
  type GrowthCategory,
} from "@/lib/industry-insights/world-lens-data";

// ============================================
// TYPES
// ============================================

interface GrowingIndustriesChartProps {
  className?: string;
}

// ============================================
// GROWTH BAR COMPONENT
// ============================================

function GrowthBar({
  category,
  maxPercent,
}: {
  category: GrowthCategory;
  maxPercent: number;
}) {
  const widthPercent = (category.growthPercent / maxPercent) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 sm:w-36 flex-shrink-0">
        <span className="text-xs sm:text-sm text-foreground truncate block">
          {category.name}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-4 bg-muted/50 rounded-sm overflow-hidden">
          <div
            className={`h-full rounded-sm ${category.color || "bg-primary"}`}
            style={{ width: `${widthPercent}%` }}
            role="progressbar"
            aria-valuenow={category.growthPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${category.name}: +${category.growthPercent}% growth`}
          />
        </div>
        <span className="w-12 text-right text-xs sm:text-sm font-medium text-emerald-600 tabular-nums">
          +{category.growthPercent}%
        </span>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GrowingIndustriesChart({ className }: GrowingIndustriesChartProps) {
  const data = GROWING_INDUSTRIES_DATA;
  const maxPercent = Math.max(...data.categories.map((c) => c.growthPercent));

  // Sort by growth (highest first)
  const sortedCategories = [...data.categories].sort(
    (a, b) => b.growthPercent - a.growthPercent
  );

  return (
    <Card className={`border-2 overflow-hidden ${className || ""}`}>
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              {data.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Projected growth {data.timeframe}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Growth bars */}
        <div className="space-y-2" role="img" aria-label="Industry growth projections">
          {sortedCategories.map((category) => (
            <GrowthBar
              key={category.name}
              category={category}
              maxPercent={maxPercent}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t pt-3" />

        {/* Explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {data.explanation}
        </p>

        {/* Source attribution */}
        <p className="text-[10px] text-muted-foreground/70 pt-1">
          Source: {data.sourceName} &bull; Updated: {data.lastUpdated} &bull;{" "}
          {data.geographyScope}
        </p>
      </CardContent>
    </Card>
  );
}
