"use client";

import { useState, useMemo, useEffect, Suspense, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { CareerCardV2, type ViewMode } from "@/components/career-card-v2";
import { CareerScoreCard } from "@/components/careers/career-score-card";
import { CareerDetailSheet } from "@/components/career-detail-sheet";
import { CareerFilterBar } from "@/components/careers/career-filter-bar";
import { CareerActiveChips } from "@/components/careers/career-active-chips";
import { MobileFilterDrawer } from "@/components/careers/mobile-filter-drawer";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { motion } from "framer-motion";
import { Compass, Search, Sparkles, Loader2, Briefcase, Layers, TrendingUp, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  CAREER_PATHWAYS,
  getAllCareers,
  type Career,
} from "@/lib/career-pathways";
import { useCareerFilters } from "@/lib/career-filters/use-career-filters";
import { getAllSkills, getSalaryBounds } from "@/lib/career-filters/utils";
import { useIsMobile } from "@/hooks/use-media-query";
import type { DiscoveryPreferences } from "@/lib/career-pathways";

// Pagination constants
const PAGE_SIZE = 7;

function CareersPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pull profile to get discoveryPreferences for the Career Radar.
  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id && session?.user?.role === "YOUTH",
  });
  const discoveryPreferences: DiscoveryPreferences | null =
    (profileData?.discoveryPreferences as DiscoveryPreferences) || null;

  // Get current page from URL (default to 1)
  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  }, [searchParams]);

  // Track previous filter state to detect changes
  const prevFiltersRef = useRef<string>("");

  // Load view preference from localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("careerViewMode") as ViewMode) || "list";
    }
    return "list";
  });

  const isYouth = session?.user?.role === "YOUTH";

  // Persist view preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("careerViewMode", viewMode);
    }
  }, [viewMode]);

  // Fetch career insights for personalised match scores
  const { data: insightsData } = useQuery({
    queryKey: ["career-insights"],
    queryFn: async () => {
      const response = await fetch("/api/career-insights");
      if (!response.ok) throw new Error("Failed to fetch insights");
      return response.json();
    },
    enabled: isYouth,
  });

  // Get recommendation map for quick lookup
  const recommendationMap = useMemo(() => {
    const map = new Map<string, number>();
    if (insightsData?.recommendations) {
      for (const rec of insightsData.recommendations) {
        map.set(rec.career.id, rec.matchScore);
      }
    }
    return map;
  }, [insightsData]);

  // Use the centralized filter hook
  const {
    filters,
    updateFilter,
    toggleArrayFilter,
    clearAllFilters,
    removeFilter,
    activeChips,
    filteredCareers,
    hasActiveFilters,
    advancedFilterCount,
  } = useCareerFilters(recommendationMap);

  // Pagination calculations
  const totalItems = filteredCareers.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  // Get paginated slice of careers
  const paginatedCareers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredCareers.slice(startIndex, endIndex);
  }, [filteredCareers, validCurrentPage]);

  // Handle page change - update URL
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, router, pathname]);

  // Reset page to 1 when filters change
  useEffect(() => {
    const filterString = JSON.stringify({
      category: filters.category,
      searchQuery: filters.searchQuery,
      growthFilter: filters.growthFilter,
      salaryRange: filters.salaryRange,
      educationLevels: filters.educationLevels,
      skills: filters.skills,
      careerNatures: filters.careerNatures,
    });

    // Only reset if filters actually changed (not on initial mount)
    if (prevFiltersRef.current && prevFiltersRef.current !== filterString) {
      // Filters changed - reset to page 1
      if (currentPage !== 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      }
    }

    prevFiltersRef.current = filterString;
  }, [filters, currentPage, searchParams, router, pathname]);

  // Read category from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      updateFilter("category", categoryParam);
    }
  }, [searchParams, updateFilter]);

  // Listen for cross-component career-detail open requests (e.g. from related-niche links)
  useEffect(() => {
    const handler = (e: Event) => {
      const c = (e as CustomEvent<Career>).detail;
      if (c) setSelectedCareer(c);
    };
    window.addEventListener("open-career-detail", handler);
    return () => window.removeEventListener("open-career-detail", handler);
  }, []);

  // Memoize all skills and salary bounds from all careers
  const allCareers = useMemo(() => getAllCareers(), []);
  const allSkills = useMemo(() => getAllSkills(allCareers), [allCareers]);
  const salaryBounds = useMemo(() => getSalaryBounds(allCareers), [allCareers]);

  // Count careers by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allCareers.length };
    for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
      counts[category] = careers.length;
    }
    return counts;
  }, [allCareers.length]);

  // Handlers
  const handleCategoryChange = useCallback(
    (category: string) => updateFilter("category", category),
    [updateFilter]
  );

  const handleSearchChange = useCallback(
    (query: string) => updateFilter("searchQuery", query),
    [updateFilter]
  );

  const handleGrowthChange = useCallback(
    (growth: string) => updateFilter("growthFilter", growth),
    [updateFilter]
  );

  const handleSalaryChange = useCallback(
    (range: typeof filters.salaryRange) => updateFilter("salaryRange", range),
    [updateFilter]
  );

  const handleEducationToggle = useCallback(
    (level: typeof filters.educationLevels[number]) =>
      toggleArrayFilter("educationLevels", level),
    [toggleArrayFilter]
  );

  const handleSkillsChange = useCallback(
    (skills: string[]) => updateFilter("skills", skills),
    [updateFilter]
  );

  const handleNatureToggle = useCallback(
    (nature: typeof filters.careerNatures[number]) =>
      toggleArrayFilter("careerNatures", nature),
    [toggleArrayFilter]
  );

  const handleToggleAdvanced = useCallback(() => {
    setShowAdvancedFilters((prev) => !prev);
  }, []);

  // Reset advanced filters only (for mobile drawer reset)
  const handleResetAdvanced = useCallback(() => {
    updateFilter("salaryRange", null);
    updateFilter("educationLevels", []);
    updateFilter("skills", []);
    updateFilter("careerNatures", []);
  }, [updateFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />

      <PageHeader
        title="Explore"
        gradientText="Careers"
        description="Learn what different jobs are really like before deciding anything"
        icon={Compass}
      />

      {/* Quick Stats */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { icon: Briefcase, label: "Careers", value: getAllCareers().length, color: "text-primary" },
          { icon: Search, label: "Showing", value: totalItems, color: "text-teal-500" },
          { icon: Layers, label: "Categories", value: Object.keys(CAREER_PATHWAYS).length, color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5 sm:gap-2 bg-card/80 border border-border/40 rounded-xl px-2 sm:px-3 py-1.5 shrink-0">
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</span>
            <span className={`text-xs sm:text-sm font-semibold tabular-nums ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Primary Filters Bar */}
      <CareerFilterBar
        filters={filters}
        categoryCounts={categoryCounts}
        hasActiveFilters={hasActiveFilters}
        advancedFilterCount={advancedFilterCount}
        showAdvancedFilters={showAdvancedFilters}
        viewMode={viewMode}
        salaryBounds={salaryBounds}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        onGrowthChange={handleGrowthChange}
        onSalaryChange={handleSalaryChange}
        onToggleAdvanced={handleToggleAdvanced}
        onClearAll={clearAllFilters}
        onViewModeChange={setViewMode}
        selectedNatures={filters.careerNatures}
        onNatureToggle={handleNatureToggle}
      />

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <MobileFilterDrawer
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={filters}
          salaryBounds={salaryBounds}
          resultCount={filteredCareers.length}
          onReset={handleResetAdvanced}
          onNatureToggle={handleNatureToggle}
        />
      )}

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="mb-3">
          <CareerActiveChips
            chips={activeChips}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-3 mt-4">
        <p className="text-xs text-muted-foreground">
          {totalItems > PAGE_SIZE ? (
            <>
              Showing {((validCurrentPage - 1) * PAGE_SIZE) + 1}–{Math.min(validCurrentPage * PAGE_SIZE, totalItems)} of {totalItems} career{totalItems !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              {totalItems} career{totalItems !== 1 ? "s" : ""}
            </>
          )}
          {filters.searchQuery && ` for "${filters.searchQuery}"`}
        </p>
        <div className="flex items-center gap-2">
          {isYouth && recommendationMap.size > 0 && (
            <Badge
              variant="secondary"
              className="text-[9px] bg-teal-500/10 text-teal-600"
            >
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              Personalised
            </Badge>
          )}
        </div>
      </div>

      {/* Results */}
      {totalItems > 0 ? (
        <>
          {/* Column headers — list view only. Mirrors the ListRow grid so
              labels line up over their data columns. `w-fit mx-auto`
              centers the fixed-width table inside the page container so
              it doesn't sit at the left edge leaving dead space on the
              right. Needs `grid` (not `inline-grid`) for mx-auto to take
              effect — inline-level elements ignore auto horizontal margin. */}
          {viewMode === "list" && (
            <div className="grid grid-cols-[18rem_6rem_4rem_5rem_8rem] items-center gap-x-6 px-3 py-1 border border-b-0 rounded-t-md bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-fit mx-auto">
              <span>Career</span>
              <span className="text-right">Salary</span>
              <span className="text-center">Growth</span>
              <span className="text-center">Match</span>
              <span>Learn more</span>
            </div>
          )}
          <div
            className={
              viewMode === "list"
                ? "border rounded-b-md overflow-hidden bg-background w-fit mx-auto"
                : viewMode === "small"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            }
          >
            {paginatedCareers.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
              >
                <CareerCardV2
                  career={career}
                  viewMode={viewMode}
                  matchScore={recommendationMap.get(career.id)}
                  onLearnMore={() => setSelectedCareer(career)}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls — PaginationControls uses justify-between
              internally, and with showItemCount=false only the pagination
              block remains, so justify-between pins it hard left. Wrap in
              a flex justify-center so the pagination sits under the
              centered table. */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <PaginationControls
                currentPage={validCurrentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                showItemCount={false}
              />
            </div>
          )}
        </>
      ) : (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">No careers found</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CTA for non-youth */}
      {!isYouth && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border bg-gradient-to-r from-teal-500/10 to-pink-500/10">
            <CardContent className="py-4 text-center">
              <p className="text-sm font-medium mb-1">
                Get Personalised Recommendations
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Sign up to get career matches based on your experience
              </p>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-teal-600 to-pink-600"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Careers (anchor for Matches pill) */}
      {(() => {
        const topRecs = (insightsData?.recommendations ?? [])
          .filter((rec: any) => Math.round(rec.matchScore) > 70)
          .slice(0, 3);
        if (!isYouth || topRecs.length === 0) return null;
        return (
          <div id="recommended-careers" className="mt-8 pt-6 border-t border-border scroll-mt-20">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-500" />
              <h2 className="text-lg font-semibold">Recommended for You</h2>
              <span className="text-xs text-muted-foreground">Based on your primary goal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRecs.map((rec: any) => {
                const career = rec.career;
                const matchScore = Math.min(Math.round(rec.matchScore), 100);
                return (
                  <CareerScoreCard
                    key={career.id}
                    career={career}
                    matchScore={matchScore}
                    onLearnMore={() => setSelectedCareer(career)}
                  />
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Career Detail Sheet with Learn More content */}
      <CareerDetailSheet
        career={selectedCareer}
        onClose={() => setSelectedCareer(null)}
      />

    </div>
  );
}

function CareersLoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading careers...</p>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense fallback={<CareersLoadingFallback />}>
      <CareersPageContent />
    </Suspense>
  );
}
