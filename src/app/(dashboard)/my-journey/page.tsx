"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Route, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Import Layer Components
import { JourneyDashboard } from "./journey-dashboard";
import { ProgressTimeline, type TimelineEntry } from "./progress-timeline";
import { GoalStack, type Goal } from "./goal-stack";
import { StrengthSnapshot, type StrengthData } from "./strength-snapshot";
import MoneySmartsContent from "./money-smarts-content";
import {
  JourneyVisualAnchor,
  type JourneyMarker,
  type JourneyVisualVariation,
} from "./journey-visual-anchor";

// Section Wrapper Component
function Section({
  id,
  children,
  delay = 0,
}: {
  id: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="scroll-mt-20"
    >
      {children}
    </motion.section>
  );
}

// Collapsible Section for Money Smarts
function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <CardContent className="pt-0 border-t">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

export default function MyJourneyPage() {
  const { data: session, status: sessionStatus } = useSession();

  // Fetch user's journey data including shadows
  const { data: journeyData, isLoading: journeyLoading } = useQuery({
    queryKey: ["my-journey-data"],
    queryFn: async () => {
      // Fetch completed shadows for timeline
      let shadowEntries: TimelineEntry[] = [];
      try {
        const shadowsResponse = await fetch("/api/shadows?status=COMPLETED");
        if (shadowsResponse.ok) {
          const shadows = await shadowsResponse.json();
          shadowEntries = shadows.map((shadow: any) => ({
            id: `shadow-${shadow.id}`,
            type: "shadow_completed" as const,
            title: `Shadowed: ${shadow.roleTitle}`,
            description: shadow.reflection
              ? "Reflection completed"
              : "Experience completed",
            date: new Date(shadow.completedAt || shadow.createdAt),
            metadata: {
              jobTitle: shadow.roleTitle,
            },
          }));
        }
      } catch (error) {
        console.error("Failed to fetch shadows:", error);
      }

      // Return combined journey data
      return {
        hasGoals: false,
        hasCompletedJobs: false,
        completedJobsCount: 0,
        goalsCount: 0,
        completedShadowsCount: shadowEntries.length,
        goals: [] as Goal[],
        timelineEntries: shadowEntries as TimelineEntry[],
        strengths: {
          reliability: 20,
          communication: 15,
          confidence: 10,
          teamwork: 15,
          initiative: 10,
        } as StrengthData,
        // Journey visual anchor data
        journeyMarkers: [] as JourneyMarker[],
        visualVariation: "optimistic" as JourneyVisualVariation,
        weeklyFocusTheme: "Reliability",
      };
    },
    enabled: session?.user?.role === "YOUTH",
  });

  const isLoading = sessionStatus === "loading" || journeyLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-8 w-96" />
          {/* Visual anchor skeleton */}
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              This page is only available for youth workers.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-emerald-500/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Route className="h-6 w-6 text-purple-600" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                My{" "}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
                  Journey
                </span>
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Where you are, what you're building toward, and what to do next.
          </p>
        </motion.div>

        {/* Visual Anchor - Emotional entry point */}
        <Section id="visual-anchor" delay={0.05}>
          <JourneyVisualAnchor
            variation={journeyData?.visualVariation}
            markers={journeyData?.journeyMarkers}
            weeklyFocusLabel={
              journeyData?.weeklyFocusTheme
                ? `This Week: ${journeyData.weeklyFocusTheme}`
                : undefined
            }
            onMarkerClick={(marker) => {
              // Navigate to related Proof & Progress entry
              if (marker.href) {
                window.location.href = marker.href;
              }
            }}
            onCurrentPointClick={() => {
              // Scroll to the weekly focus section in dashboard
              document
                .getElementById("dashboard")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="mb-2"
          />
        </Section>

        {/* Main Content - Four Layers */}
        <div className="space-y-8">
          {/* LAYER 1: Journey Dashboard */}
          <Section id="dashboard" delay={0.1}>
            <JourneyDashboard
              hasGoals={journeyData?.hasGoals}
              hasCompletedJobs={journeyData?.hasCompletedJobs}
              completedJobsCount={journeyData?.completedJobsCount}
              goalsCount={journeyData?.goalsCount}
            />
          </Section>

          {/* LAYER 3: Goal Stack */}
          <Section id="goals" delay={0.2}>
            <GoalStack goals={journeyData?.goals} />
          </Section>

          {/* Two Column Layout for Timeline and Strengths on larger screens */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* LAYER 2: Proof & Progress Timeline */}
            <Section id="timeline" delay={0.3}>
              <ProgressTimeline entries={journeyData?.timelineEntries} />
            </Section>

            {/* LAYER 4: Strength Snapshot */}
            <Section id="strengths" delay={0.4}>
              <StrengthSnapshot data={journeyData?.strengths} showRadar={false} />
            </Section>
          </div>

          {/* Money Skills - Embedded contextually, collapsible */}
          <Section id="money-skills" delay={0.5}>
            <CollapsibleSection
              title="Money Skills — for real life"
              description="Understand what to do with the money you earn"
            >
              <div className="pt-4">
                <MoneySmartsContent />
              </div>
            </CollapsibleSection>
          </Section>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Your journey is unique. There's no rush — explore at your own pace.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
