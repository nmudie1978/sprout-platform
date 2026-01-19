"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { getMultipleCareerJourneys, type MultipleCareerJourneys } from "@/lib/my-path/actions";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

// Import insights components
import {
  EventsCalendar,
  BigPictureChart,
  GrowingIndustriesChart,
  ReshapingJobsCard,
  WorldLensArticles,
  InsightVideos,
} from "@/components/insights";

type IndustryFilter = "all" | "tech" | "green" | "health" | "creative";

export default function IndustryInsightsPage() {
  const { data: session } = useSession();

  // Fetch user's career goals
  const { data: careerData } = useQuery<MultipleCareerJourneys | null>({
    queryKey: ["multiple-career-journeys"],
    queryFn: () => getMultipleCareerJourneys(),
    enabled: session?.user?.role === "YOUTH",
  });

  // Extract career goal titles for filtering
  const userCareerGoals = careerData?.journeys?.map(j => j.targetCareer.title) || [];

  // Map career goals to industry types based on career category
  const getIndustryFromCareer = (careerTitle: string): IndustryFilter => {
    const lowerTitle = careerTitle.toLowerCase();
    if (lowerTitle.includes("developer") || lowerTitle.includes("software") ||
        lowerTitle.includes("data") || lowerTitle.includes("tech") ||
        lowerTitle.includes("engineer") || lowerTitle.includes("it ") ||
        lowerTitle.includes("cyber") || lowerTitle.includes("ai")) {
      return "tech";
    }
    if (lowerTitle.includes("energy") || lowerTitle.includes("wind") ||
        lowerTitle.includes("solar") || lowerTitle.includes("electric") ||
        lowerTitle.includes("green") || lowerTitle.includes("sustain")) {
      return "green";
    }
    if (lowerTitle.includes("health") || lowerTitle.includes("nurse") ||
        lowerTitle.includes("medical") || lowerTitle.includes("care") ||
        lowerTitle.includes("doctor") || lowerTitle.includes("pharmacy")) {
      return "health";
    }
    if (lowerTitle.includes("design") || lowerTitle.includes("creative") ||
        lowerTitle.includes("content") || lowerTitle.includes("market") ||
        lowerTitle.includes("media") || lowerTitle.includes("video") ||
        lowerTitle.includes("art") || lowerTitle.includes("music")) {
      return "creative";
    }
    return "tech"; // Default fallback
  };

  // Get user's industry types from their career goals
  const userIndustryTypes = [...new Set(userCareerGoals.map(getIndustryFromCareer))];

  // Fetch insights modules verification status
  const { data: modulesData } = useQuery({
    queryKey: ["insights-modules-meta"],
    queryFn: async () => {
      const response = await fetch("/api/insights/modules");
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <PageHeader
        title="Industry"
        gradientText="Insights"
        description="Understanding what's shaping careers globally"
        icon={TrendingUp}
      />

      {/* World Lens intro text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm text-muted-foreground mb-8 max-w-2xl"
      >
        Industry Insights is your world lens — helping you understand the world beyond job listings.
      </motion.p>

      {/* ============================================ */}
      {/* SECTION 1: WORLD AT A GLANCE (3 Insight Cards) */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-10"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* Insight 1: Where most people work */}
          <BigPictureChart />

          {/* Insight 2: Which industries are growing */}
          <GrowingIndustriesChart />

          {/* Insight 3: What's reshaping jobs */}
          <ReshapingJobsCard />
        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 2: WORLD LENS ARTICLES */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-10"
      >
        <WorldLensArticles />
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 3: EVENTS CALENDAR */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mb-10"
        id="events"
      >
        <EventsCalendar industryTypes={userIndustryTypes} />
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 4: INSIGHT VIDEOS */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-10"
      >
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <span>Watch & Learn</span>
          <span className="text-xs text-muted-foreground font-normal">(short explainers)</span>
        </h2>
        <InsightVideos />
      </motion.section>

      {/* ============================================ */}
      {/* DATA SOURCE NOTE */}
      {/* ============================================ */}
      <div className="mt-8 p-5 rounded-lg bg-muted/20 border">
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">About the Data</p>
            <p className="text-xs text-muted-foreground mb-2">
              All insights are derived from Tier-1 sources and reviewed quarterly. Content is summarised for clarity.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <a href="https://www.weforum.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                World Economic Forum
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.ilo.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                ILO
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.oecd.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                OECD
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.mckinsey.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                McKinsey
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status Footer */}
      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Refreshed Q1 2025</span>
        </div>
        {modulesData?.meta?.allVerifiedThisQuarter && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
