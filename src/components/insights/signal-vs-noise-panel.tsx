/**
 * SIGNAL VS NOISE PANEL
 *
 * Helps youth distinguish between online hype and market reality.
 * Neutral and non-judgmental in tone.
 */

"use client";

import { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NoiseVsSignal {
  id: string;
  noise: {
    claim: string;
    context: string;
  };
  signal: {
    reality: string;
    context: string;
  };
}

// Curated comparison data
// TODO: Connect to backend data source when available
const SIGNAL_VS_NOISE_DATA: NoiseVsSignal[] = [
  {
    id: "svn-1",
    noise: {
      claim: '"Learn to code in 30 days and get a $100k job"',
      context: "Common claim in online course ads",
    },
    signal: {
      reality: "Entry-level developer roles require 6-12 months of consistent practice",
      context:
        "Most employers look for portfolio projects and problem-solving skills, not just course completion",
    },
  },
  {
    id: "svn-2",
    noise: {
      claim: '"AI will replace all jobs by 2030"',
      context: "Sensational headlines",
    },
    signal: {
      reality: "AI is changing ~40% of tasks, not eliminating most jobs",
      context:
        "WEF research shows AI creates new roles while transforming existing ones. Adaptability matters more than avoidance.",
    },
  },
  {
    id: "svn-3",
    noise: {
      claim: '"You need a degree to succeed"',
      context: "Traditional career advice",
    },
    signal: {
      reality: "Skills and experience matter more than ever",
      context:
        "Apprenticeships, certifications, and practical experience are increasingly valued by employers, especially in tech and trades.",
    },
  },
  {
    id: "svn-4",
    noise: {
      claim: '"Remote work is dead"',
      context: "Post-pandemic media narratives",
    },
    signal: {
      reality: "Remote/hybrid work remains common in knowledge sectors",
      context:
        "OECD data shows ~30% of jobs now offer hybrid options. It varies significantly by industry and role type.",
    },
  },
  {
    id: "svn-5",
    noise: {
      claim: '"Side hustles are the only path to financial freedom"',
      context: "Social media influencer advice",
    },
    signal: {
      reality: "Stable employment with growth potential remains valuable",
      context:
        "Building skills in one area often leads to better long-term outcomes than scattered efforts across many.",
    },
  },
];

interface SignalVsNoisePanelProps {
  className?: string;
  initialExpanded?: boolean;
}

export function SignalVsNoisePanel({
  className,
  initialExpanded = false,
}: SignalVsNoisePanelProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleItems = isExpanded
    ? SIGNAL_VS_NOISE_DATA
    : SIGNAL_VS_NOISE_DATA.slice(0, 2);

  return (
    <Card className={`border-2 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          Signal vs Noise
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Separating online hype from market reality
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Info callout */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Not all career advice online is accurate. Here&apos;s how to spot the difference.
          </span>
        </div>

        {/* Comparison items */}
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {/* Noise side */}
              <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                    Trending Online
                  </span>
                </div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 italic">
                  {item.noise.claim}
                </p>
                <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-1">
                  {item.noise.context}
                </p>
              </div>

              {/* Signal side */}
              <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Market Reality
                  </span>
                </div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {item.signal.reality}
                </p>
                <p className="text-[10px] text-green-600/70 dark:text-green-400/70 mt-1">
                  {item.signal.context}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/collapse button */}
        {SIGNAL_VS_NOISE_DATA.length > 2 && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-7 px-3"
            >
              {isExpanded ? (
                <>
                  Show less
                  <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Show {SIGNAL_VS_NOISE_DATA.length - 2} more
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center pt-2 border-t">
          This is general guidance, not personal advice. Your path may differ based on your context.
        </p>
      </CardContent>
    </Card>
  );
}

export default SignalVsNoisePanel;
