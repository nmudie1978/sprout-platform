"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { JourneyMap, JourneyMapCompact } from "@/components/growth/journey-map";
import type { ReadinessCheck } from "@/lib/growth/stage-config";

export default function GrowthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isYouth = session?.user?.role === "YOUTH";

  // Fetch readiness data for JourneyMap
  const { data: readiness } = useQuery<ReadinessCheck>({
    queryKey: ["growth-readiness"],
    queryFn: async () => {
      const response = await fetch("/api/growth/readiness");
      if (!response.ok) throw new Error("Failed to fetch readiness");
      return response.json();
    },
    enabled: isYouth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default readiness if not loaded yet
  const readinessData: ReadinessCheck = readiness || {
    hasTargetCareer: false,
    hasSkillTags: false,
    hasLocationPreference: false,
    hasCV: false,
  };

  // Check if we're on a stage page (not the dashboard)
  const isOnStagePage =
    pathname.startsWith("/growth/explore") ||
    pathname.startsWith("/growth/build") ||
    pathname.startsWith("/growth/apply");

  // Dashboard only shows for /growth exact
  const isDashboard = pathname === "/growth";

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight">
              My{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Growth
              </span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Your career journey in three stages: Explore, Build, Apply
          </p>
        </motion.div>

        {/* Journey Map - Always Visible */}
        {isYouth && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-6"
          >
            {/* Full JourneyMap on desktop, compact on mobile */}
            <div className="hidden md:block">
              <JourneyMap readiness={readinessData} />
            </div>
            <div className="md:hidden">
              <JourneyMapCompact readiness={readinessData} />
            </div>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
