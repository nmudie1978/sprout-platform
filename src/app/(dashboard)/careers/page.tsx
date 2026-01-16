"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { CareerCard } from "@/components/career-card";
import { CareerInsights } from "@/components/career-insights";
import {
  CAREER_PATHWAYS,
  getAllCareers,
  searchCareers,
  type Career,
} from "@/lib/career-pathways";
import { JobCategory } from "@prisma/client";

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  ALL: { label: "All Careers", emoji: "🌟", color: "from-purple-500 to-pink-500" },
  BABYSITTING: { label: "Childcare", emoji: "👶", color: "from-pink-500 to-rose-500" },
  DOG_WALKING: { label: "Pet Care", emoji: "🐕", color: "from-amber-500 to-orange-500" },
  SNOW_CLEARING: { label: "Property", emoji: "❄️", color: "from-cyan-500 to-blue-500" },
  CLEANING: { label: "Cleaning", emoji: "🧹", color: "from-emerald-500 to-green-500" },
  DIY_HELP: { label: "Trades", emoji: "🔧", color: "from-orange-500 to-red-500" },
  TECH_HELP: { label: "Technology", emoji: "💻", color: "from-violet-500 to-purple-500" },
  ERRANDS: { label: "Services", emoji: "🏃", color: "from-blue-500 to-cyan-500" },
  OTHER: { label: "General", emoji: "✨", color: "from-slate-500 to-gray-500" },
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
      careers = CAREER_PATHWAYS[selectedCategory as JobCategory] || [];
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative px-8 py-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Compass className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Explore Career Paths</h1>
                <p className="text-white/80 mt-1">
                  Discover careers that match your skills and interests
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <Briefcase className="h-4 w-4" />
                  Total Careers
                </div>
                <div className="text-2xl font-bold">{categoryCounts.ALL}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <LayoutGrid className="h-4 w-4" />
                  Categories
                </div>
                <div className="text-2xl font-bold">8</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  High Growth
                </div>
                <div className="text-2xl font-bold">
                  {getAllCareers().filter((c) => c.growthOutlook === "high").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <GraduationCap className="h-4 w-4" />
                  Entry Level
                </div>
                <div className="text-2xl font-bold">
                  {getAllCareers().filter((c) => c.educationPath.toLowerCase().includes("certificate")).length}
                </div>
              </div>
            </div>
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

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search careers, skills, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                <div className="flex items-center border rounded-lg p-1">
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

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    selectedCategory === key
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {categoryCounts[key] || 0}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filteredCareers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCareers.length} career{filteredCareers.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                {isYouth && recommendationMap.size > 0 && (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Personalized for you
                  </Badge>
                )}
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
                    transition={{ delay: index * 0.05 }}
                  >
                    <CareerCard
                      career={career}
                      matchScore={recommendationMap.get(career.id)}
                      compact={viewMode === "list"}
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
            transition={{ delay: 0.5 }}
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
      </div>
    </div>
  );
}
