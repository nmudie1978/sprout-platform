"use client";

/**
 * Working Beyond Borders — Youth Lens Section
 *
 * Read-only content pillar about international career awareness.
 * Calm, grounded language. Explicitly validates staying local.
 * No auto-rotation, no auto-play — fully user-controlled.
 *
 * Redesigned for scannability: compact cards, progressive disclosure,
 * minimal visible text until the user chooses to expand.
 */

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  Compass,
  BookmarkPlus,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plane,
  Laptop,
  Globe,
  Heart,
  Users,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Languages,
} from "lucide-react";
import { useTranslateContent } from "@/hooks/use-translate-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type BeyondBordersArticle,
  type RealPathStory,
  type SmallStep,
  BEYOND_BORDERS_ARTICLES,
  REAL_PATH_STORIES,
  SMALL_STEPS,
} from "@/lib/industry-insights/beyond-borders-data";

// ============================================
// ICON MAP
// ============================================

const STEP_ICONS: Record<SmallStep["icon"], typeof Plane> = {
  plane: Plane,
  laptop: Laptop,
  globe: Globe,
  heart: Heart,
  users: Users,
};

// ============================================
// MAIN COMPONENT
// ============================================

export function BeyondBordersSection() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const locale = useLocale();
  const tc = useTranslations("common");
  const { translate, isTranslating, getTranslation } = useTranslateContent();
  const [showTranslated, setShowTranslated] = useState(false);

  const handleTranslate = useCallback(async () => {
    const items = [
      ...BEYOND_BORDERS_ARTICLES.flatMap((a) => [
        { key: `bb-title-${a.id}`, text: a.title },
        { key: `bb-subtitle-${a.id}`, text: a.subtitle },
        { key: `bb-takeaway-${a.id}`, text: a.takeaway },
      ]),
      ...REAL_PATH_STORIES.flatMap((s) => [
        { key: `bb-harder-${s.id}`, text: s.harderThanExpected },
        { key: `bb-helped-${s.id}`, text: s.helpedGrowth },
      ]),
      ...SMALL_STEPS.flatMap((s) => [
        { key: `bb-step-title-${s.id}`, text: s.title },
        { key: `bb-step-desc-${s.id}`, text: s.description },
      ]),
    ];
    for (let i = 0; i < items.length; i += 20) {
      await translate(items.slice(i, i + 20), {
        targetLocale: "nb-NO",
        contentType: "insight",
      });
    }
    setShowTranslated(true);
  }, [translate]);

  const getText = useCallback(
    (key: string, original: string) =>
      showTranslated ? getTranslation(key) ?? original : original,
    [showTranslated, getTranslation]
  );

  const toggleArticle = useCallback((slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const toggleStory = useCallback((id: string) => {
    setExpandedStory((prev) => (prev === id ? null : id));
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (article: BeyondBordersArticle) => {
      const res = await fetch("/api/journey/saved-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ARTICLE",
          title: article.title,
          url: `/insights/beyond-borders/${article.slug}`,
          source: "Sprout",
          description: article.subtitle,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return article.slug;
    },
    onSuccess: (slug) => {
      setSavedSlugs((prev) => new Set(prev).add(slug));
    },
  });

  const handleSave = useCallback(
    (article: BeyondBordersArticle) => {
      if (savedSlugs.has(article.slug) || saveMutation.isPending) return;
      saveMutation.mutate(article);
    },
    [savedSlugs, saveMutation]
  );

  const visibleSteps = showAllSteps ? SMALL_STEPS : SMALL_STEPS.slice(0, 3);

  return (
    <div role="region" aria-label="Working Beyond Borders" className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-teal-500" />
          <div>
            <h3 className="text-lg font-semibold leading-tight">Working Beyond Borders</h3>
            <p className="text-xs text-muted-foreground">
              Careers can span borders — but they don&apos;t have to. For awareness, not advice.
            </p>
          </div>
        </div>
        {locale === "nb-NO" && (
          <button
            onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
            disabled={isTranslating}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <Languages className="h-3 w-3" />
            {isTranslating ? tc("translating") : showTranslated ? tc("showOriginal") : tc("translateToNorwegian")}
          </button>
        )}
      </div>

      {/* Perspectives — compact expandable cards */}
      <div className="space-y-2">
        {BEYOND_BORDERS_ARTICLES.map((article) => {
          const isExpanded = expandedSlug === article.slug;
          const isSaved = savedSlugs.has(article.slug);
          return (
            <div
              key={article.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? "border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/10"
                  : "border-border hover:border-teal-200 dark:hover:border-teal-800"
              }`}
            >
              {/* Collapsed row */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggleArticle(article.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleArticle(article.slug);
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {getText(`bb-title-${article.id}`, article.title)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getText(`bb-subtitle-${article.id}`, article.subtitle)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(article);
                    }}
                    disabled={isSaved}
                    aria-label={isSaved ? "Saved" : "Save"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5 text-teal-600" />
                    ) : (
                      <BookmarkPlus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="border-t border-border/50 pt-3 space-y-3">
                    {article.paragraphs.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground/80">
                        {p}
                      </p>
                    ))}
                    {article.callout && <CalloutBox callout={article.callout} />}
                    <div className="flex items-start gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 px-3 py-2">
                      <Lightbulb className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-teal-800 dark:text-teal-300">
                        {getText(`bb-takeaway-${article.id}`, article.takeaway)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real Paths — compact rows */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Real Paths — one possible path, not a blueprint
        </p>
        {REAL_PATH_STORIES.map((story) => {
          const isExpanded = expandedStory === story.id;
          return (
            <div
              key={story.id}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => toggleStory(story.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleStory(story.id);
                }
              }}
              className={`rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                isExpanded
                  ? "border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/10"
                  : "border-border hover:border-teal-200 dark:hover:border-teal-800"
              }`}
            >
              {/* Summary row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/40 shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{story.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-teal-200 dark:border-teal-800">
                      {story.age}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      · {story.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{story.fromLocation}</span>
                    <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                    <span>{story.toLocation}</span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>

              {/* Expanded Q&A */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Harder than expected
                    </p>
                    <p className="text-sm text-foreground/80">
                      {getText(`bb-harder-${story.id}`, story.harderThanExpected)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      What helped growth
                    </p>
                    <p className="text-sm text-foreground/80">
                      {getText(`bb-helped-${story.id}`, story.helpedGrowth)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Small Steps — compact chips */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Small steps if you&apos;re curious
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleSteps.map((step) => {
            const Icon = STEP_ICONS[step.icon];
            return (
              <div
                key={step.id}
                className="group relative inline-flex items-center gap-2 rounded-full border border-dashed border-teal-300 dark:border-teal-700 bg-background px-3 py-1.5 text-sm transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/20"
              >
                <Icon className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="font-medium text-foreground/90">
                  {getText(`bb-step-title-${step.id}`, step.title)}
                </span>
                {/* Tooltip on hover */}
                <div className="invisible group-hover:visible absolute left-0 top-full mt-2 z-10 w-64 rounded-lg border bg-popover p-3 shadow-md text-sm">
                  <p className="text-foreground/80 mb-1">
                    {getText(`bb-step-desc-${step.id}`, step.description)}
                  </p>
                  <p className="text-xs italic text-muted-foreground">{step.reassurance}</p>
                </div>
              </div>
            );
          })}
        </div>
        {SMALL_STEPS.length > 3 && (
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
          >
            {showAllSteps ? "Show fewer" : `+${SMALL_STEPS.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CALLOUT BOX
// ============================================

function CalloutBox({
  callout,
}: {
  callout: NonNullable<BeyondBordersArticle["callout"]>;
}) {
  const isRealityCheck = callout.type === "reality-check";

  return (
    <div
      className={`rounded-lg border p-3 ${
        isRealityCheck
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
          : "border-teal-200 bg-teal-50/50 dark:border-teal-800/40 dark:bg-teal-950/20"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {isRealityCheck ? (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Lightbulb className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
        )}
        <span
          className={`text-xs font-semibold ${
            isRealityCheck
              ? "text-amber-800 dark:text-amber-300"
              : "text-teal-800 dark:text-teal-300"
          }`}
        >
          {callout.title}
        </span>
      </div>
      <ul className="space-y-1">
        {callout.items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
            <span
              className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                isRealityCheck ? "bg-amber-400" : "bg-teal-400"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BeyondBordersSection;
