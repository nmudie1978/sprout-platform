"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  TrendingUp,
  MapPin,
  Bot,
  ChevronRight,
  Target,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getNextStepSuggestion } from "@/lib/onboarding/actions";

const categoryEmojis: Record<string, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

export function NextStepPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["next-step-suggestion"],
    queryFn: () => getNextStepSuggestion(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data) {
    return null;
  }

  const { suggestion, topJob, careerAspiration } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-6"
    >
      <Card className="border-2 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-3 py-2 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="font-semibold text-sm">Your Next Step</h2>
              {careerAspiration && (
                <Badge variant="secondary" className="ml-auto text-[10px] px-2 py-0.5">
                  Career goal: {careerAspiration}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-3 space-y-3">
            {/* Primary Suggestion */}
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{suggestion.suggestion}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.reason}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-2 h-7 text-xs px-3"
                  asChild
                >
                  <Link href={suggestion.action.href}>
                    {suggestion.action.label}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Bottom row: Job + Growth link */}
            <div className="grid sm:grid-cols-2 gap-2">
              {/* Top Job Pick */}
              {topJob ? (
                <Link href={`/jobs/${topJob.id}`} className="block group">
                  <div className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-all h-full">
                    <div className="flex items-start gap-2">
                      <span className="text-base">
                        {categoryEmojis[topJob.category] || "✨"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Top job match
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">
                          {topJob.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {topJob.location?.split(",")[0] || "Nearby"}
                          </span>
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {formatCurrency(topJob.payAmount)}
                          </span>
                        </div>
                        {topJob.reasons.length > 0 && (
                          <p className="text-[10px] text-primary mt-0.5">
                            {topJob.reasons[0]}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link href="/jobs" className="block group">
                  <div className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-all h-full flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30">
                      <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Find your first job</p>
                      <p className="text-[10px] text-muted-foreground">
                        Browse opportunities near you
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              )}

              {/* Growth Anchor */}
              <Link href="/growth" className="block group">
                <div className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-all h-full flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">See My Growth</p>
                    <p className="text-[10px] text-muted-foreground">
                      Track your progress
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
              </Link>
            </div>

            {/* AI Advisor Link */}
            <Link href="/career-advisor" className="block group">
              <div className="p-2.5 rounded-lg border border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10 transition-all flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Ask Sprout AI</p>
                  <p className="text-[10px] text-muted-foreground">
                    Get personalised career advice
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
