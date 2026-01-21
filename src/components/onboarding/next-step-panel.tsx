"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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

// Ticker interval in milliseconds (10 seconds)
const TICKER_INTERVAL = 10000;

export function NextStepPanel() {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["next-step-suggestion"],
    queryFn: () => getNextStepSuggestion(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const topJobs = data?.topJobs || [];

  // Auto-advance ticker
  useEffect(() => {
    if (topJobs.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentJobIndex((prev) => (prev + 1) % topJobs.length);
    }, TICKER_INTERVAL);

    return () => clearInterval(interval);
  }, [topJobs.length, isPaused]);

  // Reset index when jobs change
  useEffect(() => {
    setCurrentJobIndex(0);
  }, [topJobs.length]);

  if (isLoading || !data) {
    return null;
  }

  const { suggestion, topJob, primaryGoalTitle } = data;
  const currentJob = topJobs[currentJobIndex] || topJob;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-6"
    >
      {/* Outer neon frame */}
      <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 p-3 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10">
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">Your Next Step</span>
          </div>
          {primaryGoalTitle && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              Primary career goal: {primaryGoalTitle}
            </Badge>
          )}
        </div>

        {/* 4 columns */}
        <div className="grid grid-cols-4 gap-2">
          {/* 1. Suggested Action */}
          <div className="rounded-lg bg-white dark:bg-slate-900 border p-2.5 flex flex-col">
            <div className="flex items-center gap-1.5 text-primary mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Do This</span>
            </div>
            <p className="text-xs font-medium flex-1">{suggestion.suggestion}</p>
            <Button size="sm" className="w-full h-6 text-[10px] mt-2" asChild>
              <Link href={suggestion.action.href}>
                {suggestion.action.label}
                <ArrowRight className="h-2.5 w-2.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* 2. Top Job - Ticker */}
          <Link
            href={currentJob ? `/jobs/${currentJob.id}` : "/jobs"}
            className="block group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="rounded-lg bg-white dark:bg-slate-900 border p-2.5 h-full hover:border-blue-300 transition-colors overflow-hidden relative">
              <div className="flex items-center gap-1.5 text-blue-500 mb-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Top Small Job</span>
                {topJobs.length > 1 && (
                  <span className="text-[9px] text-muted-foreground ml-auto tabular-nums">
                    {currentJobIndex + 1}/{topJobs.length}
                  </span>
                )}
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="relative h-[32px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {currentJob ? (
                    <motion.div
                      key={currentJob.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-x-0"
                    >
                      <p className="text-xs font-medium truncate">{currentJob.title}</p>
                      <p className="text-[10px] text-muted-foreground">{currentJob.location?.split(",")[0]} · {formatCurrency(currentJob.payAmount)}</p>
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground"
                    >
                      Find small jobs near you
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {/* Progress bar indicator */}
              {topJobs.length > 1 && !isPaused && (
                <motion.div
                  key={currentJobIndex}
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-400/50"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: TICKER_INTERVAL / 1000,
                    ease: "linear"
                  }}
                />
              )}
            </div>
          </Link>

          {/* 3. My Journey */}
          <Link href="/my-journey" className="block group">
            <div className="rounded-lg bg-white dark:bg-slate-900 border p-2.5 h-full hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-1.5 text-purple-500 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">My Journey</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-medium">Track progress</p>
              <p className="text-[10px] text-muted-foreground">Skills & achievements</p>
            </div>
          </Link>

          {/* 4. Ask AI */}
          <Link href="/career-advisor" className="block group">
            <div className="rounded-lg bg-white dark:bg-slate-900 border p-2.5 h-full hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-1.5 text-primary mb-1.5">
                <Bot className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Ask AI</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-medium">Career advice</p>
              <p className="text-[10px] text-muted-foreground">Personalised guidance</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
