/**
 * BIG PICTURE CHART - Industry Insights
 *
 * A lightweight, calm infographic showing employment distribution
 * by industry sector. Uses CSS div bars for maximum performance
 * and SSR compatibility.
 *
 * Features:
 * - Horizontal bar chart (mobile-friendly)
 * - Tier-1 source attribution
 * - Plain language explanation
 * - No animations that hurt performance
 * - Accessible labels
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  TOP_INDUSTRIES_DATASET,
  type IndustryCategory,
} from "@/lib/industry-insights/topIndustriesDataset";

// ============================================
// TYPES
// ============================================

interface BigPictureChartProps {
  className?: string;
}

// ============================================
// BAR COMPONENT
// ============================================

function IndustryBar({
  category,
  maxPercent,
}: {
  category: IndustryCategory;
  maxPercent: number;
}) {
  // Calculate width relative to largest category for better visual scaling
  const widthPercent = (category.sharePercent / maxPercent) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Label - fixed width for alignment */}
      <div className="w-32 sm:w-40 flex-shrink-0">
        <span className="text-xs sm:text-sm text-foreground truncate block">
          {category.name}
        </span>
      </div>

      {/* Bar container */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-5 bg-muted/50 rounded-sm overflow-hidden">
          <div
            className={`h-full rounded-sm ${category.color || "bg-primary"}`}
            style={{ width: `${widthPercent}%` }}
            role="progressbar"
            aria-valuenow={category.sharePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${category.name}: ${category.sharePercent}%`}
          />
        </div>
        {/* Percentage value */}
        <span className="w-10 text-right text-xs sm:text-sm font-medium text-muted-foreground tabular-nums">
          {category.sharePercent}%
        </span>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function BigPictureChart({ className }: BigPictureChartProps) {
  const dataset = TOP_INDUSTRIES_DATASET;

  // Find max value for scaling bars
  const maxPercent = Math.max(...dataset.categories.map((c) => c.sharePercent));

  // Sort categories by share (largest first) for better readability
  const sortedCategories = [...dataset.categories].sort(
    (a, b) => b.sharePercent - a.sharePercent
  );

  return (
    <Card className={`border-2 overflow-hidden ${className || ""}`}>
      {/* Subtle gradient header */}
      <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400" />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              {dataset.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {dataset.subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Bar Chart */}
        <div className="space-y-2" role="img" aria-label="Employment by industry sector">
          {sortedCategories.map((category) => (
            <IndustryBar
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
          {dataset.explanationBullets[0]}
        </p>

        {/* Source attribution */}
        <p className="text-[10px] text-muted-foreground/70 pt-1">
          Source: {dataset.sourceName} &bull; {dataset.year} &bull;{" "}
          {dataset.geographyScope}
        </p>
      </CardContent>
    </Card>
  );
}
