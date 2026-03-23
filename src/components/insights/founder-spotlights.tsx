"use client";

/**
 * Build Your Own Path - Founder Spotlights Section
 *
 * Displays verified, real founder stories with source links.
 * Shows micro-venture ideas and reality checks.
 *
 * CRITICAL: Only shows verified stories in production.
 * No fabricated content is ever displayed as real.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  BookOpen,
  Users,
  TrendingUp,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FounderSpotlight,
  FounderSpotlightTag,
  MicroVentureIdea,
  FOUNDER_SPOTLIGHT_TAGS,
} from "@/lib/founders/types";

interface FoundersApiResponse {
  spotlights: FounderSpotlight[];
  microVentures: MicroVentureIdea[];
  realityChecks: { id: string; point: string; detail: string }[];
  metadata: { lastRefreshISO: string; verifiedCount: number };
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  filters: { availableTags: FounderSpotlightTag[]; availableCountries: string[] };
}

/**
 * Tag color mapping
 */
const TAG_COLORS: Record<FounderSpotlightTag, string> = {
  youth: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  student: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "side-hustle": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  tech: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "local-business": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  creative: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "social-impact": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "food-beverage": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  service: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  "e-commerce": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

/**
 * Startup cost icon mapping
 */
const COST_INFO: Record<string, { icon: typeof DollarSign; label: string; color: string }> = {
  free: { icon: DollarSign, label: "Free to start", color: "text-green-600" },
  low: { icon: DollarSign, label: "Under $100", color: "text-amber-600" },
  medium: { icon: DollarSign, label: "Under $500", color: "text-orange-600" },
};

/**
 * Main component
 */
export function FounderSpotlights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<FounderSpotlightTag[]>([]);
  const [page, setPage] = useState(1);
  const [showAllVentures, setShowAllVentures] = useState(false);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", "9");
    if (searchQuery) params.set("search", searchQuery);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    return params.toString();
  }, [page, searchQuery, selectedTags]);

  // Fetch data
  const { data, isLoading, error } = useQuery<FoundersApiResponse>({
    queryKey: ["founder-spotlights", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/founders?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle tag filter
  const toggleTag = (tag: FounderSpotlightTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Get ventures to display
  const visibleVentures = useMemo(() => {
    if (!data?.microVentures) return [];
    return showAllVentures ? data.microVentures : data.microVentures.slice(0, 6);
  }, [data?.microVentures, showAllVentures]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Build Your Own Path</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Real founder stories (with sources) to show that creating value is another path — not just getting hired.
        </p>
      </div>

      {/* A) Founder Spotlights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Real Founder Spotlights</h4>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag chips */}
          {data?.filters.availableTags && data.filters.availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {FOUNDER_SPOTLIGHT_TAGS.filter((t) =>
                data.filters.availableTags.includes(t.value)
              ).map((tag) => (
                <Badge
                  key={tag.value}
                  variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag.value)
                      ? ""
                      : TAG_COLORS[tag.value]
                  }`}
                  onClick={() => toggleTag(tag.value)}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Spotlights Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">Failed to load founder stories</p>
            </CardContent>
          </Card>
        ) : data?.spotlights && data.spotlights.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {data.spotlights.map((spotlight, index) => (
                  <SpotlightCard key={spotlight.id} spotlight={spotlight} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptySpotlightsState hasFilters={searchQuery !== "" || selectedTags.length > 0} />
        )}
      </div>

      {/* B) Micro-Ventures */}
      {data?.microVentures && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium">Micro-Ventures You Can Try</h4>
            <Badge variant="secondary" className="text-xs">
              Ideas for inspiration
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            These are generic ideas to spark your thinking — not claims of success. Your results will depend on your effort, skills, and circumstances.
          </p>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visibleVentures.map((venture) => (
              <MicroVentureCard key={venture.id} venture={venture} />
            ))}
          </div>

          {data.microVentures.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllVentures(!showAllVentures)}
              className="w-full"
            >
              {showAllVentures ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show fewer ideas
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show {data.microVentures.length - 6} more ideas
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* C) Reality Check */}
      {data?.realityChecks && (
        <RealityCheckPanel checks={data.realityChecks} />
      )}
    </div>
  );
}

/**
 * Individual spotlight card
 */
function SpotlightCard({
  spotlight,
  index,
}: {
  spotlight: FounderSpotlight;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{spotlight.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Source verified:{" "}
                    {spotlight.verifiedAtISO
                      ? new Date(spotlight.verifiedAtISO).toLocaleDateString()
                      : "Recently"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="flex items-center gap-1">
            <span className="font-medium text-foreground">{spotlight.founderName}</span>
            {spotlight.founderAgeAtStart && (
              <span className="text-muted-foreground">
                (age {spotlight.founderAgeAtStart})
              </span>
            )}
            {spotlight.country && (
              <span className="text-muted-foreground">• {spotlight.country}</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* What they built */}
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {spotlight.whatTheyBuilt}
            </p>
          </div>

          {/* Key lesson */}
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-sm font-medium">
              <BookOpen className="mr-1 inline h-3 w-3 text-primary" />
              {spotlight.keyLesson}
            </p>
          </div>

          {/* Tags */}
          {spotlight.tags && spotlight.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {spotlight.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs ${TAG_COLORS[tag]}`}
                >
                  {FOUNDER_SPOTLIGHT_TAGS.find((t) => t.value === tag)?.label || tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Source link */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">{spotlight.sourceName}</span>
            <a
              href={spotlight.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Read story
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Micro-venture idea card
 */
function MicroVentureCard({ venture }: { venture: MicroVentureIdea }) {
  const costInfo = COST_INFO[venture.startupCost];

  return (
    <Card className="h-full border-dashed">
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-medium">{venture.title}</h5>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs">
                  <costInfo.icon className={`mr-1 h-3 w-3 ${costInfo.color}`} />
                  {costInfo.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Estimated startup cost</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-sm text-muted-foreground">{venture.description}</p>

        <div className="flex flex-wrap gap-1">
          {venture.skillsNeeded.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="capitalize">{venture.timeCommitment}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reality check panel
 */
function RealityCheckPanel({
  checks,
}: {
  checks: { id: string; point: string; detail: string }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500" />
        <h4 className="font-medium">Reality Check</h4>
      </div>

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <p className="mb-4 text-sm">
            Entrepreneurship can be rewarding, but it&apos;s not instant or guaranteed. Here&apos;s what to keep in mind:
          </p>

          <ul className="grid gap-2 md:grid-cols-2">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div>
                  <span className="text-sm font-medium">{check.point}</span>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Empty state when no spotlights
 */
function EmptySpotlightsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
        {hasFilters ? (
          <>
            <p className="text-sm font-medium">No stories match your filters</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or clearing tag filters
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">No verified founder stories available yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We only publish stories with reliable sources.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default FounderSpotlights;
