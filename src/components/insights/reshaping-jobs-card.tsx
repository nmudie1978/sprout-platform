/**
 * RESHAPING JOBS CARD — World Lens Insight Card 3
 *
 * Shows the forces reshaping the job market.
 * Abstracted and non-alarming while being truthful.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { RESHAPING_JOBS_DATA } from "@/lib/industry-insights/world-lens-data";

// ============================================
// TYPES
// ============================================

interface ReshapingJobsCardProps {
  className?: string;
}

// ============================================
// IMPACT INDICATOR
// ============================================

function ImpactDot({ level }: { level: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-amber-500",
    medium: "bg-slate-400",
    low: "bg-slate-300",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[level]}`}
      aria-label={`${level} impact`}
    />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ReshapingJobsCard({ className }: ReshapingJobsCardProps) {
  const data = RESHAPING_JOBS_DATA;

  return (
    <Card className={`border-2 overflow-hidden ${className || ""}`}>
      <div className="h-1 bg-gradient-to-r from-slate-400 via-amber-400 to-slate-400" />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-amber-600" />
              {data.title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Forces shaping the future of work
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Primary metric - prominent but not alarming */}
        <div className="p-3 rounded-lg bg-muted/40 text-center">
          <div className="text-2xl font-bold text-foreground">
            {data.primaryMetric.value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.primaryMetric.context}
          </p>
        </div>

        {/* Contributing factors */}
        <div className="space-y-2">
          {data.factors.map((factor) => (
            <div
              key={factor.name}
              className="flex items-start gap-2 text-xs"
            >
              <ImpactDot level={factor.impactLevel} />
              <div className="flex-1">
                <span className="font-medium text-foreground">
                  {factor.name}
                </span>
                <span className="text-muted-foreground ml-1">
                  — {factor.description}
                </span>
              </div>
            </div>
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
