"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Baby,
  Dog,
  Snowflake,
  SprayCan,
  Wrench,
  Smartphone,
  ShoppingBag,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobStats {
  stats: Array<{
    category: string;
    count: number;
  }>;
  total: number;
}

const categoryConfig: Record<string, { label: string; icon: any; description: string }> = {
  BABYSITTING: {
    label: "Babysitting",
    icon: Baby,
    description: "Childcare & supervision",
  },
  DOG_WALKING: {
    label: "Dog Walking",
    icon: Dog,
    description: "Pet care & walks",
  },
  SNOW_CLEARING: {
    label: "Snow Clearing",
    icon: Snowflake,
    description: "Driveways & walkways",
  },
  CLEANING: {
    label: "Cleaning",
    icon: SprayCan,
    description: "House & car cleaning",
  },
  DIY_HELP: {
    label: "DIY Help",
    icon: Wrench,
    description: "Assembly & repairs",
  },
  TECH_HELP: {
    label: "Tech Help",
    icon: Smartphone,
    description: "Digital assistance",
  },
  ERRANDS: {
    label: "Errands",
    icon: ShoppingBag,
    description: "Shopping & deliveries",
  },
  OTHER: {
    label: "Other",
    icon: MoreHorizontal,
    description: "Miscellaneous tasks",
  },
};

function getHeatColor(count: number, maxCount: number): string {
  if (maxCount === 0) return "bg-gray-100 dark:bg-gray-800";

  const intensity = count / maxCount;

  if (intensity === 0) return "bg-gray-100 dark:bg-gray-800 border-gray-200";
  if (intensity <= 0.25) return "bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-900";
  if (intensity <= 0.5) return "bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900";
  if (intensity <= 0.75) return "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900";
  return "bg-green-100 dark:bg-green-950/40 border-green-200 dark:border-green-900";
}

function getTextColor(count: number, maxCount: number): string {
  if (maxCount === 0) return "text-gray-400";

  const intensity = count / maxCount;

  if (intensity === 0) return "text-gray-400";
  if (intensity <= 0.25) return "text-red-600 dark:text-red-400";
  if (intensity <= 0.5) return "text-orange-600 dark:text-orange-400";
  if (intensity <= 0.75) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

interface JobHeatMapProps {
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string;
}

export function JobHeatMap({ onCategoryClick, selectedCategory }: JobHeatMapProps) {
  const { data, isLoading } = useQuery<JobStats>({
    queryKey: ["job-stats"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/stats");
      if (!response.ok) throw new Error("Failed to fetch job stats");
      return response.json();
    },
    refetchInterval: 60000, // Refresh every 60 seconds (stats don't change that fast)
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false, // Don't poll when tab is in background
  });

  if (isLoading) {
    return (
      <Card className="mb-6 border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Job Availability Heat Map
          </CardTitle>
          <CardDescription>Loading job statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...(data?.stats.map((s) => s.count) || [0]), 1);

  return (
    <Card className="mb-6 border-2 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Job Availability Heat Map
        </CardTitle>
        <CardDescription>
          {data?.total || 0} jobs available across all categories. Click a category to filter.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mb-4 text-xs text-muted-foreground">
          <span>Fewer jobs</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950/40 border border-red-200" />
            <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-950/40 border border-orange-200" />
            <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950/40 border border-yellow-200" />
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/40 border border-green-200" />
          </div>
          <span>More jobs</span>
        </div>

        {/* Heat Map Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data?.stats.map((stat) => {
            const config = categoryConfig[stat.category];
            const Icon = config.icon;
            const isSelected = selectedCategory === stat.category;

            return (
              <button
                key={stat.category}
                onClick={() => onCategoryClick?.(stat.category)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-md text-left",
                  getHeatColor(stat.count, maxCount),
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={cn("h-6 w-6", getTextColor(stat.count, maxCount))} />
                  <span className={cn(
                    "text-2xl font-bold",
                    getTextColor(stat.count, maxCount)
                  )}>
                    {stat.count}
                  </span>
                </div>
                <h3 className="font-semibold text-sm">{config.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {config.description}
                </p>
                {stat.count === 0 && (
                  <span className="absolute top-2 right-2 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    No jobs
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Total available jobs: <span className="font-semibold text-foreground">{data?.total || 0}</span>
          </span>
          {selectedCategory && (
            <button
              onClick={() => onCategoryClick?.("")}
              className="text-primary hover:underline text-xs"
            >
              Clear filter
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
