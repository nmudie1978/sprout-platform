"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  Play,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { getCareerJourney, type CareerJourneyData } from "@/lib/my-path/actions";

// Placeholder career insights for MVP
// These will adapt to user's North Star career when possible
const placeholderInsights = [
  {
    id: "1",
    careerTag: "software-engineer",
    title: "Software Engineer",
    emoji: "💻",
    teaser: "What I wish someone told me about coding jobs...",
  },
  {
    id: "2",
    careerTag: "lawyer",
    title: "Lawyer",
    emoji: "⚖️",
    teaser: "The reality of law school and early career...",
  },
  {
    id: "3",
    careerTag: "network-engineer",
    title: "Network Engineer",
    emoji: "🌐",
    teaser: "How I got started without a degree...",
  },
];

// Get a personalised placeholder based on user's North Star
function getPersonalisedPlaceholder(journey: CareerJourneyData | null) {
  if (journey?.targetCareer) {
    return {
      id: "personalised",
      careerTag: journey.targetCareer.id,
      title: journey.targetCareer.title,
      emoji: journey.targetCareer.emoji,
      teaser: `Insights about being a ${journey.targetCareer.title}...`,
      isPersonalised: true,
    };
  }
  return null;
}

function InsightPlaceholderCard({
  insight,
  index,
  isPersonalised = false,
}: {
  insight: {
    id: string;
    careerTag: string;
    title: string;
    emoji: string;
    teaser: string;
  };
  index: number;
  isPersonalised?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border-2 ${isPersonalised ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/10" : "border-dashed border-muted-foreground/20"} relative overflow-hidden`}>
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 text-muted-foreground text-xs font-medium mb-2">
              <Clock className="h-3 w-3" />
              Coming in Phase 2
            </div>
            {isPersonalised && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Tailored for your goal
              </p>
            )}
          </div>
        </div>

        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{insight.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{insight.title}</h4>
                {isPersonalised && (
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Your goal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {insight.teaser}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Video insight
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Real professional
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProInsightsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const { data: journey, isLoading: journeyLoading } = useQuery<CareerJourneyData | null>({
    queryKey: ["career-journey"],
    queryFn: () => getCareerJourney(),
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || journeyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">This page is only available for youth workers.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get personalised placeholder based on North Star
  const personalisedPlaceholder = getPersonalisedPlaceholder(journey ?? null);

  // Build the list of placeholders to show
  const insightsToShow = personalisedPlaceholder
    ? [personalisedPlaceholder, ...placeholderInsights.filter(p => p.careerTag !== personalisedPlaceholder.careerTag).slice(0, 2)]
    : placeholderInsights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">Professional Insights</h2>
          <Badge variant="outline" className="text-xs ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Phase 2
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Short, honest insights from people working in real careers — sharing what the job is really like,
          what they wish they knew earlier, and what actually matters.
        </p>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Real people. Real careers. Launching soon.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This feature will unlock as Sprout grows and real professionals contribute their insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Placeholder Insight Cards */}
      <div className="space-y-4">
        {insightsToShow.map((insight, i) => (
          <InsightPlaceholderCard
            key={insight.id}
            insight={insight}
            index={i + 1}
            isPersonalised={"isPersonalised" in insight && Boolean(insight.isPersonalised)}
          />
        ))}
      </div>

      {/* What to Expect */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border bg-muted/30">
          <CardContent className="py-5">
            <h4 className="font-medium text-sm mb-3">What to expect in Phase 2</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>Short video insights from real professionals in various careers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>Honest takes on what the job is really like day-to-day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>Advice they wish they had when starting out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>Insights personalised to your career goals</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note about one-way content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          Professional Insights is one-way content from verified professionals.
          No comments or direct contact — just honest career guidance.
        </p>
      </motion.div>
    </div>
  );
}
