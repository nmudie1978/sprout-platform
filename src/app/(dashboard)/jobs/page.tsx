"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ArrowRight,
  X,
  SlidersHorizontal,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { JobCardV2, JobListHeader } from "@/components/job-card-v2";
import { ViewModeToggle } from "@/components/view/ViewModeToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { PageContext } from "@/components/ui/page-context";

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  ALL: { label: "All Small Jobs", emoji: "🌟" },
  BABYSITTING: { label: "Babysitting", emoji: "👶" },
  DOG_WALKING: { label: "Dog Walking", emoji: "🐕" },
  SNOW_CLEARING: { label: "Snow Clearing", emoji: "❄️" },
  CLEANING: { label: "Cleaning", emoji: "🧹" },
  DIY_HELP: { label: "DIY & Repairs", emoji: "🔧" },
  TECH_HELP: { label: "Tech Help", emoji: "💻" },
  ERRANDS: { label: "Errands", emoji: "🏃" },
  OTHER: { label: "Other", emoji: "✨" },
};

// Icon mapping for standard categories
const categoryIconMap: Record<string, string> = {
  "home-yard-help": "🏠",
  "child-family-support": "👶",
  "pet-animal-care": "🐕",
  "cleaning-organizing": "🧹",
  "tech-digital-help": "💻",
  "errands-local-tasks": "🏃",
  "events-community-help": "🎉",
  "creative-media-gigs": "🎨",
  "education-learning-support": "📚",
  "retail-microbusiness-help": "🏪",
  "fitness-activity-help": "💪",
  "online-ai-age-jobs": "🤖",
};

interface StandardCategory {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  jobCount?: number;
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL"); // Legacy category
  const [standardCategoryFilter, setStandardCategoryFilter] = useState<string>(""); // New taxonomy
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const { viewMode, setViewMode } = useViewMode({ storageKey: "jobViewMode", defaultMode: "list" });
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);

  // Fetch user's city from their youth profile
  const { data: profileData } = useQuery({
    queryKey: ["user-profile-city"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: session?.user?.role === "YOUTH",
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Profile API returns the YouthProfile object directly (not nested)
  const userCity = profileData?.city || null;

  // Fetch standard job categories
  const { data: categoriesData } = useQuery({
    queryKey: ["standard-job-categories-browse"],
    queryFn: async () => {
      const response = await fetch("/api/job-categories?includeJobCounts=true");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const standardCategories: StandardCategory[] = categoriesData?.categories || [];

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", categoryFilter === "ALL" ? "" : categoryFilter, standardCategoryFilter, locationFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Support both legacy and new category filtering
      if (categoryFilter && categoryFilter !== "ALL" && !standardCategoryFilter) {
        params.set("category", categoryFilter);
      }
      if (standardCategoryFilter) {
        params.set("standardCategory", standardCategoryFilter);
      }
      if (locationFilter) params.set("location", locationFilter);
      params.set("page", page.toString());
      params.set("limit", "5");

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  // Handle category selection (new taxonomy)
  const handleStandardCategorySelect = (slug: string) => {
    if (slug === standardCategoryFilter) {
      // Toggle off - go back to all
      setStandardCategoryFilter("");
      setCategoryFilter("ALL");
    } else {
      setStandardCategoryFilter(slug);
      setCategoryFilter("ALL"); // Clear legacy filter
    }
    setPage(1); // Reset to first page
  };

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
  // Count jobs near user's city (case-insensitive partial match on location field)
  const jobsNearYou = userCity
    ? jobs.filter((j: any) => j.location?.toLowerCase().includes(userCity.toLowerCase())).length
    : 0;

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 relative">

      <PageContext
        pageKey="jobs"
        purpose="Find small, real-world jobs near you — babysitting, dog walking, tech help, and more."
        action="Browse jobs, apply to ones that fit, and start building real experience and responsibility."
      />

      <PageHeader
        title="Find"
        gradientText="Small Jobs"
        description="Small jobs are your first step into real work — a chance to earn your own money, discover what you're good at, and build a track record that shows you're reliable. Every job you complete adds to your journey and helps you grow toward your bigger career goals."
        icon={Briefcase}
      />

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalJobs}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Briefcase className="h-3 w-3" />
              Available Jobs
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{standardCategories.length || 12}</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              Categories
            </p>
          </CardContent>
        </Card>
        {userCity ? (
          <Card
            className={`border-2 bg-gradient-to-br from-teal-50 to-pink-50 dark:from-teal-950/30 dark:to-pink-950/30 col-span-1 cursor-pointer transition-all sm:hover:scale-[1.02] sm:hover:shadow-md active:scale-[0.98] ${
              locationFilter.toLowerCase() === userCity.toLowerCase() ? 'ring-2 ring-teal-500 ring-offset-2' : ''
            }`}
            onClick={() => {
              if (locationFilter.toLowerCase() === userCity.toLowerCase()) {
                setLocationFilter("");
              } else {
                setLocationFilter(userCity);
              }
            }}
          >
            <CardContent className="pt-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                {jobsNearYou}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                Jobs in {userCity}
              </p>
              {locationFilter.toLowerCase() === userCity.toLowerCase() && (
                <Badge className="mt-2 bg-teal-500 text-white text-xs">Filter Active</Badge>
              )}
            </CardContent>
          </Card>
        ) : (
          <Link href="/profile" className="col-span-1">
            <Card className="border-2 bg-gradient-to-br from-teal-50 to-pink-50 dark:from-teal-950/30 dark:to-pink-950/30 cursor-pointer transition-all sm:hover:scale-[1.02] sm:hover:shadow-md active:scale-[0.98] h-full">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                  —
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Set your city in profile
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
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
              placeholder="Search jobs, job posters, locations..."
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
              {(categoryFilter !== "ALL" || standardCategoryFilter || locationFilter || startDateFilter) && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-teal-500 text-white">
                  {(categoryFilter !== "ALL" ? 1 : 0) + (standardCategoryFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (startDateFilter ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <div className="flex items-center gap-1">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showCompact={true}
              />
              <Link href="/jobs/map">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg border bg-muted/30"
                  title="Map View"
                  aria-label="Map View"
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
                  {(categoryFilter !== "ALL" || standardCategoryFilter || locationFilter || startDateFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setStandardCategoryFilter("");
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

      {/* Category Select - Sticky Navigation */}
      <div className="sticky top-0 z-40 -mx-3 px-3 sm:-mx-4 sm:px-4 py-3 bg-background/95 backdrop-blur-sm border-b mb-4 sm:mb-6">
        <Select
          value={standardCategoryFilter || "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") {
              setStandardCategoryFilter("");
              setCategoryFilter("ALL");
            } else {
              handleStandardCategorySelect(value);
            }
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              <span className="flex items-center gap-2">
                <span>🌟</span> All Jobs
              </span>
            </SelectItem>
            {standardCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                <span className="flex items-center gap-2">
                  <span>{categoryIconMap[cat.slug] || "📋"}</span>
                  {cat.name}
                  {cat.jobCount !== undefined && cat.jobCount > 0 && (
                    <span className="text-muted-foreground text-xs ml-1">({cat.jobCount})</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            className="h-8 w-8 border-3 border-teal-500 border-t-transparent rounded-full mb-3"
          />
          <p className="text-sm text-muted-foreground">Finding jobs for you...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
          <>
            {/* Column headers — list view only */}
            {viewMode === "list" && <JobListHeader />}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  : viewMode === "list"
                    ? "border rounded-b-md overflow-hidden bg-background w-fit"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5"
              }
            >
              {filteredJobs.map((job: any, index: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.02 }}
                  className={viewMode === "grid" ? "h-full" : ""}
                >
                  <JobCardV2
                    job={job}
                    viewMode={viewMode}
                    userCity={userCity}
                  />
                </motion.div>
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
                    setStandardCategoryFilter("");
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
