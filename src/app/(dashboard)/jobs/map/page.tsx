"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  List,
  Map as MapIcon,
  X,
  SlidersHorizontal,
  ArrowLeft,
  Loader2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { JobsMap } from "@/components/jobs-map";
import { useToast } from "@/hooks/use-toast";

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  ALL: { label: "All Small Jobs", emoji: "🌟", color: "from-purple-500 to-pink-500" },
  BABYSITTING: { label: "Babysitting", emoji: "👶", color: "from-pink-500 to-rose-500" },
  DOG_WALKING: { label: "Dog Walking", emoji: "🐕", color: "from-amber-500 to-orange-500" },
  SNOW_CLEARING: { label: "Snow Clearing", emoji: "❄️", color: "from-cyan-500 to-blue-500" },
  CLEANING: { label: "Cleaning", emoji: "🧹", color: "from-emerald-500 to-green-500" },
  DIY_HELP: { label: "DIY & Repairs", emoji: "🔧", color: "from-orange-500 to-red-500" },
  TECH_HELP: { label: "Tech Help", emoji: "💻", color: "from-violet-500 to-purple-500" },
  ERRANDS: { label: "Errands", emoji: "🏃", color: "from-blue-500 to-cyan-500" },
  OTHER: { label: "Other", emoji: "✨", color: "from-slate-500 to-gray-500" },
};

export default function JobsMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["jobs-map", categoryFilter === "ALL" ? "" : categoryFilter, locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (locationFilter) params.set("location", locationFilter);

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  const jobs = data?.jobs || [];

  // Filter by search query
  const filteredJobs = jobs.filter((job: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.postedBy?.employerProfile?.companyName?.toLowerCase().includes(query)
    );
  });

  // Jobs with coordinates
  const mappableJobs = filteredJobs.filter(
    (job: any) => job.latitude !== null && job.longitude !== null
  );

  const missingCount = filteredJobs.length - mappableJobs.length;

  // Function to geocode jobs without coordinates
  const handleGeocodeJobs = async () => {
    setIsGeocoding(true);
    setGeocodeProgress("Starting...");

    let totalUpdated = 0;
    let remaining = missingCount;

    try {
      // Keep calling the API until all jobs are processed
      while (remaining > 0) {
        setGeocodeProgress(`Processing... (${remaining} remaining)`);

        const response = await fetch("/api/admin/geocode-jobs?batch=50", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to geocode jobs");
        }

        const data = await response.json();
        totalUpdated += data.updated || 0;
        remaining = data.remaining || 0;

        if (data.updated === 0 && data.remaining > 0) {
          // No progress made, some jobs can't be geocoded
          break;
        }

        // Small delay between batches
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Refresh the jobs list
      queryClient.invalidateQueries({ queryKey: ["jobs-map"] });

      toast({
        title: "Geocoding complete!",
        description: `Updated ${totalUpdated} jobs with coordinates.`,
      });
    } catch (error) {
      toast({
        title: "Geocoding failed",
        description: "There was an error geocoding jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
      setGeocodeProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/jobs">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Jobs Map
                </h1>
                <p className="text-sm text-muted-foreground">
                  Find jobs near you
                </p>
              </div>
            </div>

            <Link href="/jobs">
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, employers, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 rounded-xl"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {(categoryFilter !== "ALL" || locationFilter) && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white">
                  {(categoryFilter !== "ALL" ? 1 : 0) + (locationFilter ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex items-center gap-3 pb-2">
                  <Input
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="h-10 rounded-xl max-w-xs"
                  />
                  {(categoryFilter !== "ALL" || locationFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setLocationFilter("");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Pills */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCategoryFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    categoryFilter === key
                      ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoading ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full mb-3 mx-auto"
                />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </CardContent>
            </Card>
          ) : (
            <JobsMap jobs={filteredJobs} height="calc(100vh - 280px)" />
          )}
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center justify-between text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-4">
            <span>
              <span className="font-medium text-foreground">{filteredJobs.length}</span> total jobs
            </span>
            <span>
              <span className="font-medium text-foreground">{mappableJobs.length}</span> on map
            </span>
            {missingCount > 0 && (
              <span className="text-amber-600">
                {missingCount} without coordinates
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {searchQuery && (
              <span>
                Searching: &quot;{searchQuery}&quot;
              </span>
            )}
            {missingCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGeocodeJobs}
                disabled={isGeocoding}
                className="h-8 text-xs"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    {geocodeProgress}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-1.5" />
                    Fix {missingCount} Missing Locations
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
