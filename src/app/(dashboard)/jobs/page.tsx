"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layered gradient background */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - amber to orange transition */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/30" />

        {/* Secondary gradient overlay - adds depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-yellow-50/30 dark:from-transparent dark:via-slate-800/20 dark:to-orange-900/20" />

        {/* Radial highlight in center-top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-amber-100/50 via-orange-50/20 to-transparent dark:from-amber-900/20 dark:via-orange-950/10 dark:to-transparent blur-2xl" />

        {/* Bottom fade to darker */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-100/80 via-slate-50/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/50 dark:to-transparent" />
      </div>

      {/* Animated Background - Gradient Blobs (hidden on mobile for performance) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div
          className="absolute -top-40 -right-40 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-300/20 to-transparent blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -left-32 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-gradient-to-tr from-yellow-400/20 via-amber-300/15 to-transparent blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[200px] md:w-[350px] h-[200px] md:h-[350px] rounded-full bg-gradient-to-tl from-orange-400/20 via-red-300/15 to-transparent blur-3xl"
          animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Additional accent blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-gradient-to-r from-amber-200/10 via-orange-100/15 to-yellow-200/10 dark:from-amber-800/10 dark:via-orange-900/10 dark:to-yellow-800/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Floating Bubbles - Discreet and light */}
      <div className="fixed inset-0 z-30 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: i % 2 === 0
                ? "radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(245,158,11,0.2) 50%, transparent 70%)"
                : "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0.2) 50%, transparent 70%)",
              boxShadow: i % 2 === 0
                ? "0 0 12px rgba(245,158,11,0.3)"
                : "0 0 12px rgba(249,115,22,0.3)",
            }}
            animate={{
              y: [0, -25 - (i % 3) * 10, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Find Micro-Jobs</h1>
              <p className="text-muted-foreground text-sm">Earn money while building real-world skills</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar - 2 cols on mobile, 3 on sm+ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6"
        >
          <Card className="border">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalJobs}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10">
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{Object.keys(categoryConfig).length - 1}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{highPayJobs}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">High Pay Jobs</p>
              </div>
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

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 overflow-x-auto pb-2 -mx-4 px-4"
        >
          <div className="flex gap-2 min-w-max">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCategoryFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex items-center justify-between"
        >
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
        </motion.div>

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
    </div>
  );
}

// Compact Job Card Component
function JobCard({ job, index, viewMode }: { job: any; index: number; viewMode: ViewMode }) {
  const employer = job.postedBy?.employerProfile;
  const applicationCount = job._count?.applications || 0;
  const isDeadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const category = categoryConfig[job.category] || categoryConfig.OTHER;

  // Format dates
  const formatJobDate = (date: string | null) => {
    if (!date) return "TBC";
    return formatDate(date);
  };

  const startDate = job.startDate || job.dateTime;
  const endDate = job.endDate;

  if (viewMode === "list") {
    // List View Card - Compact
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <Link href={`/jobs/${job.id}`} className="block group">
          <Card className="border hover:border-muted-foreground/30 transition-all hover:shadow-sm">
            <div className="flex items-center p-2.5 gap-3">
              {/* Small emoji indicator */}
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm">{category.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="truncate">
                    <span className="text-muted-foreground/70">Employer:</span> {employer?.companyName || "Individual"}
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="truncate">{job.location}</span>
                </div>
              </div>

              {/* Date & Pay */}
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">{formatCurrency(job.payAmount)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {startDate ? formatJobDate(startDate).split(",")[0] : "Date TBC"}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Grid View Card - Discrete & Compact
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link href={`/jobs/${job.id}`} className="block group h-full">
        <Card className="border hover:border-muted-foreground/30 transition-all hover:shadow-sm h-full">
          <CardContent className="p-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{category.emoji}</span>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </div>
              <span className="text-sm font-semibold shrink-0">{formatCurrency(job.payAmount)}</span>
            </div>

            {/* Employer */}
            <div className="text-[11px] text-muted-foreground mb-1.5">
              <span className="text-muted-foreground/70">Employer:</span>{" "}
              <span className="text-foreground/80">{employer?.companyName || "Individual"}</span>
              {employer?.verified && <CheckCircle className="h-2.5 w-2.5 text-blue-500 inline ml-1" />}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{job.location || "Location TBC"}</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
              <CalendarDays className="h-2.5 w-2.5 shrink-0" />
              <span>
                {startDate ? formatJobDate(startDate).split(",")[0] : "Start TBC"}
                {endDate && ` - ${formatJobDate(endDate).split(",")[0]}`}
                {!endDate && startDate && " - End TBC"}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1.5 border-t text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{category.label}</span>
                {job.duration && <span>• {job.duration}min</span>}
              </div>
              <span className="text-primary/80 group-hover:text-primary transition-colors">
                View →
              </span>
            </div>

            {/* Deadline warning */}
            {isDeadlinePassed && (
              <div className="mt-2 text-[10px] text-destructive font-medium">
                Applications Closed
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
