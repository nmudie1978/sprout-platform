"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getSmartJobPicks, type SmartJobPick } from "@/lib/my-path/actions";
import { formatCurrency } from "@/lib/utils";

const categoryEmoji: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

const categoryLabels: Record<string, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

export default function JobPicksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: jobs, isLoading } = useQuery<SmartJobPick[]>({
    queryKey: ["smart-job-picks"],
    queryFn: () => getSmartJobPicks(20),
    staleTime: 60 * 1000,
  });

  const filteredJobs = selectedCategory
    ? jobs?.filter((job) => job.category === selectedCategory)
    : jobs;

  const categories = jobs
    ? [...new Set(jobs.map((job) => job.category))]
    : [];

  if (isLoading) {
    return <JobPicksSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Smart job picks</h2>
        <p className="text-sm text-muted-foreground">
          Jobs matched to your skills and interests, ranked by fit
        </p>
      </div>

      {/* Filter Chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryEmoji[cat]} {categoryLabels[cat]}
            </Button>
          ))}
        </div>
      )}

      {/* Job List */}
      {filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <Card className="h-full border-2 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shrink-0">
                      <span className="text-xl">
                        {categoryEmoji[job.category] || "✨"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-green-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-lg text-gray-600 dark:text-gray-400">
                        {formatCurrency(job.payAmount)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {job.payType === "HOURLY" ? "per hour" : "fixed"}
                      </p>
                    </div>
                  </div>

                  {/* Why This Fits */}
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Why this fits you
                    </p>
                    <ul className="space-y-1">
                      {job.reasons.map((reason, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                        >
                          <span className="text-green-500 mt-0.5">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[job.category]}
                    </Badge>
                    <span className="text-sm text-green-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No jobs found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedCategory
                ? "No jobs in this category right now"
                : "Complete more jobs to get personalized recommendations"}
            </p>
            <Link href="/jobs">
              <Button>Browse all jobs</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function JobPicksSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
