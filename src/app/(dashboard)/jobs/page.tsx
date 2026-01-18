"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Briefcase,
  Users,
  Star,
  CheckCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  CalendarDays,
  ImageIcon,
  Sparkles,
  TrendingUp,
  ArrowRight,
  X,
  SlidersHorizontal,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { JobCard as JobCardComponent } from "@/components/job-card";

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "All Jobs", emoji: "🌟" },
  BABYSITTING: { label: "Babysitting", emoji: "👶" },
  DOG_WALKING: { label: "Dog Walking", emoji: "🐕" },
  SNOW_CLEARING: { label: "Snow Clearing", emoji: "❄️" },
  CLEANING: { label: "Cleaning", emoji: "🧹" },
  DIY_HELP: { label: "DIY & Repairs", emoji: "🔧" },
  TECH_HELP: { label: "Tech Help", emoji: "💻" },
  ERRANDS: { label: "Errands", emoji: "🏃" },
  OTHER: { label: "Other", emoji: "✨" },
};

type ViewMode = "grid" | "list";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", categoryFilter === "ALL" ? "" : categoryFilter, locationFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (locationFilter) params.set("location", locationFilter);
      params.set("page", page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  // Filter by search query and start date
  const filteredJobs = jobs.filter((job: any) => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.postedBy?.employerProfile?.companyName?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Start date filter - show jobs on or after the selected date
    if (startDateFilter) {
      const filterDate = new Date(startDateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const jobStartDate = job.startDate || job.dateTime;
      if (jobStartDate) {
        const jobDate = new Date(jobStartDate);
        jobDate.setHours(0, 0, 0, 0);
        if (jobDate < filterDate) return false;
      }
    }

    return true;
  });

  // Stats
  const totalJobs = jobs.length;
  const highPayJobs = jobs.filter((j: any) => j.payAmount >= 200).length;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient - matches Industry Insights */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />

      <PageHeader
        title="Find"
        gradientText="Micro-Jobs"
        description="Earn money while building real-world skills"
        icon={Briefcase}
      />

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8"
      >
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalJobs}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Briefcase className="h-3 w-3" />
              Available Jobs
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{Object.keys(categoryConfig).length - 1}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              Categories
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 col-span-2 sm:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{highPayJobs}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              High Pay Jobs
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, employers, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
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

          {/* Filter toggle & View mode */}
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 rounded-xl"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {(categoryFilter !== "ALL" || locationFilter || startDateFilter) && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white">
                  {(categoryFilter !== "ALL" ? 1 : 0) + (locationFilter ? 1 : 0) + (startDateFilter ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <div className="flex items-center border rounded-xl p-1 bg-muted/30">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Link href="/jobs/map">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  title="Map View"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="h-11 rounded-xl flex-1 sm:w-48"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      type="date"
                      placeholder="Start date from..."
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="h-11 rounded-xl flex-1 sm:w-44"
                    />
                    {startDateFilter && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">onwards</span>
                    )}
                  </div>
                  {(categoryFilter !== "ALL" || locationFilter || startDateFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setLocationFilter("");
                        setStartDateFilter("");
                      }}
                      className="text-muted-foreground hover:text-foreground h-11 w-full sm:w-auto"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Category Pills - Sticky Navigation */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-b mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="font-medium text-foreground">{filteredJobs.length}</span> job
              {filteredJobs.length !== 1 ? "s" : ""} available
              {searchQuery && (
                <span className="text-muted-foreground"> matching "{searchQuery}"</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Jobs Grid/List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full mb-3"
          />
          <p className="text-sm text-muted-foreground">Finding jobs for you...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-3"
              }
            >
              {filteredJobs.map((job: any, index: number) => (
                <JobCard key={job.id} job={job} index={index} viewMode={viewMode} />
              ))}
            </motion.div>

            {/* Pagination Controls - Simplified for mobile */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8"
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg h-10 px-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="sm:hidden">Prev</span>
                  </Button>

                  {/* Page numbers - fewer on mobile */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 p-0 rounded-lg ${
                            page === pageNum ? "bg-primary" : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Mobile: Show current/total */}
                  <span className="sm:hidden text-sm font-medium px-3">
                    {page} / {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-lg h-10 px-3"
                  >
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <span className="hidden sm:inline text-sm text-muted-foreground">
                  Page {page} of {pagination.totalPages}
                </span>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                    setLocationFilter("");
                    setStartDateFilter("");
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  );
}

// Job Card wrapper for animation and view mode
function JobCard({ job, index, viewMode }: { job: any; index: number; viewMode: ViewMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.02 }}
      className="h-full"
    >
      <JobCardComponent
        job={job}
        variant={viewMode === "list" ? "compact" : "default"}
      />
    </motion.div>
  );
}
