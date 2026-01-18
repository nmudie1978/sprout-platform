"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { motion } from "framer-motion";
import { LayoutGrid, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

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

// Gradient colors for category cards
const categoryGradients: Record<string, string> = {
  "home-yard-help": "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:border-green-300",
  "child-family-support": "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 hover:border-pink-300",
  "pet-animal-care": "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:border-amber-300",
  "cleaning-organizing": "from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 hover:border-cyan-300",
  "tech-digital-help": "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 hover:border-violet-300",
  "errands-local-tasks": "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:border-blue-300",
  "events-community-help": "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 hover:border-fuchsia-300",
  "creative-media-gigs": "from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 hover:border-rose-300",
  "education-learning-support": "from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 hover:border-teal-300",
  "retail-microbusiness-help": "from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 hover:border-orange-300",
  "fitness-activity-help": "from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30 hover:border-lime-300",
  "online-ai-age-jobs": "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 hover:border-indigo-300",
};

interface StandardCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  jobCount?: number;
  _count?: {
    templates: number;
    jobs: number;
  };
}

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["job-categories-page"],
    queryFn: async () => {
      const response = await fetch("/api/job-categories?includeJobCounts=true");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories: StandardCategory[] = data?.categories || [];
  const totalJobs = categories.reduce((sum, cat) => sum + (cat.jobCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />

      <PageHeader
        title="Browse by"
        gradientText="Category"
        description="Find the perfect micro-job that matches your skills and interests"
        icon={LayoutGrid}
      />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-4 mb-8"
      >
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="pt-6 text-center px-8">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {categories.length}
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              Categories
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
          <CardContent className="pt-6 text-center px-8">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {totalJobs}
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Briefcase className="h-3 w-3" />
              Active Jobs
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full mb-3"
          />
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/categories/${category.slug}`}>
                <Card
                  className={`border-2 bg-gradient-to-br transition-all hover:shadow-md cursor-pointer h-full ${
                    categoryGradients[category.slug] || "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 hover:border-gray-300"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">
                        {categoryIconMap[category.slug] || "📋"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 truncate">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {category.jobCount !== undefined && category.jobCount > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              {category.jobCount} job{category.jobCount !== 1 ? "s" : ""}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              No active jobs
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
