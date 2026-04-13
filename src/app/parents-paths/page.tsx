"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowRight, MapPin, GraduationCap, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllCareers, getCategoryForCareer, type CareerCategory } from "@/lib/career-pathways";

// ── Types ─────────────────────────────────────────────────────────

interface PathStep {
  age: number;
  label: string;
}

interface CareerPath {
  id: string;
  displayName: string;
  currentTitle: string;
  country: string;
  city: string | null;
  steps: PathStep[];
  careerTags: string[];
  didAttendUniversity: boolean;
  yearsOfExperience: number | null;
  headline: string | null;
  advice: string | null;
  createdAt: string;
}

// ── Category labels ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  HEALTHCARE_LIFE_SCIENCES: "Healthcare & Life Sciences",
  EDUCATION_TRAINING: "Education & Training",
  TECHNOLOGY_IT: "Technology & IT",
  BUSINESS_MANAGEMENT: "Business & Management",
  FINANCE_BANKING: "Finance & Banking",
  SALES_MARKETING: "Sales & Marketing",
  MANUFACTURING_ENGINEERING: "Manufacturing & Engineering",
  LOGISTICS_TRANSPORT: "Logistics & Transport",
  HOSPITALITY_TOURISM: "Hospitality & Tourism",
  TELECOMMUNICATIONS: "Telecommunications",
  CREATIVE_MEDIA: "Creative & Media",
  PUBLIC_SERVICE_SAFETY: "Public Service & Safety",
  MILITARY_DEFENCE: "Military & Defence",
  SPORT_FITNESS: "Sport & Fitness",
  REAL_ESTATE_PROPERTY: "Real Estate & Property",
  SOCIAL_CARE_COMMUNITY: "Social Care & Community",
  CONSTRUCTION_TRADES: "Construction & Trades",
};

// ── Helpers ───────────────────────────────────────────────────────

function getCareerInfo(careerTag: string) {
  const allCareers = getAllCareers();
  const career = allCareers.find((c) => c.id === careerTag);
  const category = getCategoryForCareer(careerTag);
  return {
    title: career?.title ?? careerTag,
    emoji: career?.emoji ?? "💼",
    category: category ?? null,
    categoryLabel: category ? CATEGORY_LABELS[category] ?? category : "Other",
  };
}

function getCategoriesForPath(path: CareerPath): { category: string; label: string }[] {
  const seen = new Set<string>();
  const result: { category: string; label: string }[] = [];
  for (const tag of path.careerTags) {
    const info = getCareerInfo(tag);
    if (info.category && !seen.has(info.category)) {
      seen.add(info.category);
      result.push({ category: info.category, label: info.categoryLabel });
    }
  }
  if (result.length === 0) result.push({ category: "OTHER", label: "Other" });
  return result;
}

// ── Page ──────────────────────────────────────────────────────────

export default function ParentsPathsPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/career-paths?all=1")
      .then((r) => r.json())
      .then((data) => setPaths(data.paths ?? []))
      .catch(() => setPaths([]))
      .finally(() => setLoading(false));
  }, []);

  // Build category filter options from actual data
  const categories = useMemo(() => {
    const catSet = new Map<string, string>();
    for (const path of paths) {
      for (const cat of getCategoriesForPath(path)) {
        if (!catSet.has(cat.category)) catSet.set(cat.category, cat.label);
      }
    }
    return Array.from(catSet.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [paths]);

  const filteredPaths = useMemo(() => {
    if (filterCategory === "ALL") return paths;
    return paths.filter((p) =>
      getCategoriesForPath(p).some((c) => c.category === filterCategory),
    );
  }, [paths, filterCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-8">
            <Star className="h-6 w-6" />
            <span className="font-semibold">Endeavrly</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
            Real Career Paths
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Real career timelines shared by parents and professionals. No two paths are the same
            &mdash; and that&apos;s the point.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Share your path
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/for-parents"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/50" />
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 pr-8 text-xs text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <option value="ALL">All categories ({paths.length})</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card/50 p-5 animate-pulse">
                <div className="h-4 w-48 bg-muted/50 rounded mb-3" />
                <div className="h-3 w-32 bg-muted/30 rounded mb-2" />
                <div className="h-3 w-64 bg-muted/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPaths.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">
              {paths.length === 0
                ? "No career paths have been approved yet."
                : "No paths in this category yet."}
            </p>
            <p className="text-sm text-muted-foreground/60">
              Be the first to{" "}
              <Link href="/contribute" className="text-primary underline underline-offset-4 hover:text-primary/80">
                share your career path
              </Link>.
            </p>
          </div>
        )}

        {/* Path cards */}
        {!loading && filteredPaths.length > 0 && (
          <div className="space-y-4">
            {filteredPaths.map((path) => {
              const pathCategories = getCategoriesForPath(path);
              const careerInfos = path.careerTags.map(getCareerInfo);
              const isExpanded = expandedId === path.id;
              const sortedSteps = [...(path.steps as PathStep[])].sort((a, b) => a.age - b.age);

              return (
                <div
                  key={path.id}
                  className="rounded-xl border bg-card/50 hover:bg-card/80 transition-colors overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : path.id)}
                    className="w-full text-left p-5"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {path.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{path.displayName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{path.currentTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                          <MapPin className="h-2.5 w-2.5" />
                          {path.country}
                        </div>
                        {!path.didAttendUniversity && (
                          <span className="text-[9px] text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full">No university</span>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    {path.headline && (
                      <p className="text-xs italic text-muted-foreground/70 mb-2">&ldquo;{path.headline}&rdquo;</p>
                    )}

                    {/* Category + career tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {pathCategories.map((cat) => (
                        <span key={cat.category} className="text-[9px] font-medium text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                          {cat.label}
                        </span>
                      ))}
                      {careerInfos.map((info) => (
                        <span key={info.title} className="text-[9px] text-muted-foreground/50 bg-muted/40 px-2 py-0.5 rounded-full">
                          {info.emoji} {info.title}
                        </span>
                      ))}
                    </div>

                    {/* Expand hint */}
                    <div className="flex justify-center mt-3">
                      <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/30 transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-border/30 pt-4">
                      {/* Timeline */}
                      <div className="space-y-2 mb-4">
                        {sortedSteps.map((step, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground/50 w-6 text-right tabular-nums font-medium">{step.age}</span>
                            <span className="h-2 w-2 rounded-full bg-primary/40 shrink-0" />
                            <span className="text-foreground/80">{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40 mb-3">
                        {path.yearsOfExperience && (
                          <span>{path.yearsOfExperience} years experience</span>
                        )}
                        {path.didAttendUniversity && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-2.5 w-2.5" />
                            University
                          </span>
                        )}
                        {path.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {path.city}, {path.country}
                          </span>
                        )}
                      </div>

                      {/* Advice */}
                      {path.advice && (
                        <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
                          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1">Advice</p>
                          <p className="text-xs text-foreground/70 italic">&ldquo;{path.advice}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-10 border-t border-border text-center">
          <p className="text-sm text-muted-foreground/60">
            Want to add your own career path?{" "}
            <Link href="/contribute" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Share it here
            </Link>
            .{" "}
            <Link href="/for-parents" className="text-foreground underline underline-offset-4 hover:text-primary">
              Learn more about contributing
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
