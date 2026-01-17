"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { motion } from "framer-motion";
import {
  Compass,
  Search,
  TrendingUp,
  Filter,
  Sparkles,
  Briefcase,
  GraduationCap,
  ChevronRight,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { CareerCard } from "@/components/career-card";
import { CareerInsights } from "@/components/career-insights";
import {
  CAREER_PATHWAYS,
  getAllCareers,
  getEntryLevelCareers,
  type Career,
  type CareerCategory,
} from "@/lib/career-pathways";

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  ALL: { label: "All Careers", emoji: "🌟", color: "from-purple-500 to-pink-500" },
  HEALTHCARE_LIFE_SCIENCES: { label: "Healthcare", emoji: "🏥", color: "from-red-500 to-rose-500" },
  EDUCATION_TRAINING: { label: "Education", emoji: "📚", color: "from-blue-500 to-indigo-500" },
  TECHNOLOGY_IT: { label: "Technology & IT", emoji: "💻", color: "from-violet-500 to-purple-500" },
  BUSINESS_MANAGEMENT: { label: "Business", emoji: "💼", color: "from-slate-600 to-gray-700" },
  FINANCE_BANKING: { label: "Finance", emoji: "🏦", color: "from-emerald-600 to-green-700" },
  SALES_MARKETING: { label: "Sales & Marketing", emoji: "📣", color: "from-orange-500 to-amber-500" },
  MANUFACTURING_ENGINEERING: { label: "Engineering", emoji: "⚙️", color: "from-cyan-600 to-blue-600" },
  LOGISTICS_TRANSPORT: { label: "Logistics", emoji: "🚛", color: "from-amber-600 to-yellow-600" },
  HOSPITALITY_TOURISM: { label: "Hospitality", emoji: "🏨", color: "from-pink-500 to-rose-400" },
};

const growthFilters = [
  { value: "all", label: "All Growth Levels" },
  { value: "high", label: "High Growth" },
  { value: "medium", label: "Moderate Growth" },
  { value: "stable", label: "Stable" },
];

type ViewMode = "grid" | "list";

export default function CareersPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [growthFilter, setGrowthFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const isYouth = session?.user?.role === "YOUTH";

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Fetch career insights for personalized match scores
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

  // Filter and search careers
  const filteredCareers = useMemo(() => {
    let careers: Career[];

    // Start with category filter
    if (selectedCategory === "ALL") {
      careers = getAllCareers();
    } else {
      careers = CAREER_PATHWAYS[selectedCategory as CareerCategory] || [];
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      careers = careers.filter(
        (career) =>
          career.title.toLowerCase().includes(query) ||
          career.description.toLowerCase().includes(query) ||
          career.keySkills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Apply growth filter
    if (growthFilter !== "all") {
      careers = careers.filter((career) => career.growthOutlook === growthFilter);
    }

    // Sort by match score if available, then by title
    return careers.sort((a, b) => {
      const scoreA = recommendationMap.get(a.id) || 0;
      const scoreB = recommendationMap.get(b.id) || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.title.localeCompare(b.title);
    });
  }, [selectedCategory, searchQuery, growthFilter, recommendationMap]);

  // Count careers by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: getAllCareers().length };
    for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
      counts[category] = careers.length;
    }
    return counts;
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient - matches Industry Insights */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <PageHeader
        title="Explore"
        gradientText="Careers"
        description="Discover career paths that match your skills, interests, and growth potential"
        icon={Compass}
      />

      {/* Stats Summary */}
      <motion.div {...fadeInUp} className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {categoryCounts.ALL}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Briefcase className="h-3 w-3" />
                Total Careers
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">9</div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <LayoutGrid className="h-3 w-3" />
                Categories
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {getAllCareers().filter((c) => c.growthOutlook === "high").length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                High Growth
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {getEntryLevelCareers().length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Entry Level
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Personal Insights for Youth */}
      {isYouth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CareerInsights />
        </motion.div>
      )}

      {/* Sticky Category Navigation - matches Industry Insights style */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-b mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <span>{config.emoji}</span>
              {config.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedCategory === key
                    ? "bg-white/20 text-white"
                    : "bg-background"
                }`}
              >
                {categoryCounts[key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div {...fadeInUp} className="mb-8">
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search careers, skills, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              {/* Growth Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={growthFilter}
                  onChange={(e) => setGrowthFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  {growthFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredCareers.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCareers.length} career{filteredCareers.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              <div className="flex items-center gap-2">
                {isYouth && recommendationMap.size > 0 && (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Personalized
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated: Jan 2025
                </Badge>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {filteredCareers.map((career, index) => (
                <motion.div
                  key={career.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <CareerCard
                    career={career}
                    matchScore={recommendationMap.get(career.id)}
                    compact={viewMode === "list"}
                    showRealityCheck={true}
                  />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <Card className="border-2">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No careers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setGrowthFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* CTA for non-youth */}
      {!isYouth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Get Personalized Career Recommendations
              </h3>
              <p className="text-muted-foreground mb-4">
                Sign up as a youth worker to get career matches based on your job experience
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Link href="/sign-up">
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data Source Note - matches Industry Insights */}
      <div className="mt-12 p-6 rounded-xl bg-muted/30 border">
        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium mb-2">About this data</p>
            <p className="text-sm text-muted-foreground mb-3">
              Career information is compiled from Norwegian labor market data, industry reports, and educational requirements.
              Salary ranges reflect typical Norwegian market rates.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://www.nav.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                NAV Arbeidsmarkedsstatistikk
              </a>
              <a href="https://www.ssb.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Statistisk Sentralbyrå (SSB)
              </a>
              <a href="https://utdanning.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Utdanning.no
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
