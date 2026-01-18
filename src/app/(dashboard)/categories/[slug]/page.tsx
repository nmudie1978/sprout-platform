"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Briefcase,
  ArrowLeft,
  Clock,
  DollarSign,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { SafetyNoteBanner } from "@/components/safety-note-banner";
import { useState } from "react";

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

interface Template {
  id: string;
  title: string;
  shortDesc: string;
  suggestedPay: string | null;
  duration: string | null;
  tags: string[];
  ageGuidance: string | null;
  safetyNotes: string | null;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  templates: Template[];
  jobs: any[];
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["category-detail", slug],
    queryFn: async () => {
      const response = await fetch(`/api/job-categories/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Category not found");
        }
        throw new Error("Failed to fetch category");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const category: Category | null = data?.category || null;

  // Show first 6 templates by default
  const visibleTemplates = showAllTemplates
    ? category?.templates || []
    : (category?.templates || []).slice(0, 6);

  const hasMoreTemplates = (category?.templates?.length || 0) > 6;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Category not found</h3>
            <p className="text-muted-foreground mb-4">
              The category you're looking for doesn't exist.
            </p>
            <Link href="/categories">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 pointer-events-none" />

      {/* Back link */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full mb-3"
          />
          <p className="text-sm text-muted-foreground">Loading category...</p>
        </div>
      ) : category ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">{categoryIconMap[slug] || "📋"}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mb-8"
          >
            <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
              <CardContent className="pt-6 text-center px-8">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {category.templates?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Job Templates</p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
              <CardContent className="pt-6 text-center px-8">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {category.jobs?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Templates Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                Job Templates
              </h2>
              <p className="text-sm text-muted-foreground">
                Ideas for employers posting jobs in this category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {visibleTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card
                      className={`border hover:border-primary/30 transition-all cursor-pointer ${
                        expandedTemplate === template.id ? "border-primary/50" : ""
                      }`}
                      onClick={() =>
                        setExpandedTemplate(
                          expandedTemplate === template.id ? null : template.id
                        )
                      }
                    >
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {template.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {template.shortDesc}
                            </p>
                          </div>
                          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {expandedTemplate === template.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-3 border-t space-y-2">
                                {template.suggestedPay && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <DollarSign className="h-3 w-3 text-emerald-500" />
                                    <span className="text-muted-foreground">
                                      Suggested:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {template.suggestedPay}
                                    </span>
                                  </div>
                                )}
                                {template.duration && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Clock className="h-3 w-3 text-blue-500" />
                                    <span className="text-muted-foreground">
                                      Duration:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {template.duration}
                                    </span>
                                  </div>
                                )}
                                {template.ageGuidance && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Shield className="h-3 w-3 text-amber-500" />
                                    <span className="text-muted-foreground">
                                      {template.ageGuidance}
                                    </span>
                                  </div>
                                )}
                                {template.tags && template.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {template.tags.slice(0, 4).map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs px-1.5 py-0"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {template.safetyNotes && (
                                  <SafetyNoteBanner
                                    safetyNotes={template.safetyNotes}
                                    className="mt-2"
                                  />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasMoreTemplates && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTemplates(!showAllTemplates)}
                  className="text-muted-foreground"
                >
                  {showAllTemplates ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All {category.templates.length} Templates
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Active Jobs Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Active Jobs
              </h2>
              <Link href={`/jobs?standardCategory=${slug}`}>
                <Button variant="outline" size="sm">
                  View All in Jobs
                </Button>
              </Link>
            </div>

            {category.jobs && category.jobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.jobs.slice(0, 8).map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No active jobs yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Be the first to find a job in this category!
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">
                      Browse All Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {category.jobs && category.jobs.length > 8 && (
              <div className="flex justify-center mt-6">
                <Link href={`/jobs?standardCategory=${slug}`}>
                  <Button variant="outline">
                    View All {category.jobs.length} Jobs in {category.name}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
