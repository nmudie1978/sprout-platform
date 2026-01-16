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
} from "lucide-react";
import Link from "next/link";

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  ALL: { label: "All Jobs", emoji: "🌟", color: "from-purple-500 to-pink-500" },
  BABYSITTING: { label: "Babysitting", emoji: "👶", color: "from-pink-500 to-rose-500" },
  DOG_WALKING: { label: "Dog Walking", emoji: "🐕", color: "from-amber-500 to-orange-500" },
  SNOW_CLEARING: { label: "Snow Clearing", emoji: "❄️", color: "from-cyan-500 to-blue-500" },
  CLEANING: { label: "Cleaning", emoji: "🧹", color: "from-emerald-500 to-green-500" },
  DIY_HELP: { label: "DIY & Repairs", emoji: "🔧", color: "from-orange-500 to-red-500" },
  TECH_HELP: { label: "Tech Help", emoji: "💻", color: "from-violet-500 to-purple-500" },
  ERRANDS: { label: "Errands", emoji: "🏃", color: "from-blue-500 to-cyan-500" },
  OTHER: { label: "Other", emoji: "✨", color: "from-slate-500 to-gray-500" },
};

type ViewMode = "grid" | "list";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", categoryFilter === "ALL" ? "" : categoryFilter, locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (locationFilter) params.set("location", locationFilter);

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

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

  // Stats
  const totalJobs = jobs.length;
  const highPayJobs = jobs.filter((j: any) => j.payAmount >= 200).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Find Micro-Jobs</h1>
                <p className="text-white/80 text-sm">Earn money while building real-world skills</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold">{totalJobs}</div>
                <div className="text-xs text-white/70">Available Jobs</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold">{Object.keys(categoryConfig).length - 1}</div>
                <div className="text-xs text-white/70">Categories</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-2xl font-bold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {highPayJobs}
                </div>
                <div className="text-xs text-white/70">High Pay (200+)</div>
              </div>
            </div>
          </div>
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
                {(categoryFilter !== "ALL" || locationFilter) && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-purple-500 text-white">
                    {(categoryFilter !== "ALL" ? 1 : 0) + (locationFilter ? 1 : 0)}
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
                  <div className="flex items-center gap-3">
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
                    ? `bg-gradient-to-r ${config.color} text-white shadow-md`
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
  const hasImages = Array.isArray(job.images) && job.images.length > 0;

  // Format date
  const formatJobDate = () => {
    const start = job.startDate || job.dateTime;
    if (!start) return "Date TBC";
    return formatDate(start);
  };

  if (viewMode === "list") {
    // List View Card
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Link href={`/jobs/${job.id}`} className="block group">
          <Card className="border hover:border-purple-500/50 transition-all hover:shadow-md overflow-hidden">
            <div className="flex">
              {/* Image or Gradient */}
              <div className="relative w-24 h-24 shrink-0">
                {hasImages ? (
                  <img
                    src={job.images[0]}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                )}
                {hasImages && job.images.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <ImageIcon className="h-2.5 w-2.5" />
                    {job.images.length}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate group-hover:text-purple-600 transition-colors">
                      {job.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {category.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {employer?.companyName || "Individual"}
                      {employer?.verified && <CheckCircle className="h-3 w-3 text-blue-500" />}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatJobDate()}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(job.payAmount)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {job.payType === "HOURLY" ? "/hr" : "fixed"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Grid View Card (Compact)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={`/jobs/${job.id}`} className="block group h-full">
        <Card className="border hover:border-purple-500/50 transition-all hover:shadow-lg overflow-hidden h-full flex flex-col">
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {hasImages ? (
              <img
                src={job.images[0]}
                alt={job.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-5xl opacity-80">{category.emoji}</span>
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <Badge className={`bg-gradient-to-r ${category.color} text-white border-0 text-[10px] shadow-lg`}>
                {category.emoji} {category.label}
              </Badge>
              {hasImages && job.images.length > 1 && (
                <Badge variant="secondary" className="bg-black/60 text-white border-0 text-[10px]">
                  <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                  {job.images.length}
                </Badge>
              )}
            </div>

            {/* Pay badge */}
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-white/95 dark:bg-gray-900/95 text-foreground border-0 shadow-lg font-bold">
                {formatCurrency(job.payAmount)}
                <span className="font-normal text-muted-foreground ml-0.5 text-[10px]">
                  {job.payType === "HOURLY" ? "/hr" : ""}
                </span>
              </Badge>
            </div>

            {/* Deadline warning */}
            {isDeadlinePassed && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  Applications Closed
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-3 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
              {job.title}
            </h3>

            {/* Employer */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground/80 truncate">
                {employer?.companyName || "Individual"}
              </span>
              {employer?.verified && <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />}
              {employer?.averageRating && (
                <span className="flex items-center gap-0.5 shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {employer.averageRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="mt-auto space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span>{formatJobDate()}</span>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {job.duration && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {job.duration}m
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    {applicationCount}
                  </span>
                </div>
                <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
                  View
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
