"use client";

/**
 * BEYOND BORDERS CAROUSEL
 *
 * Replaces the old accordion-based BeyondBordersSection with:
 * A) Article carousel — swipe/arrow/keyboard navigation, dot indicators
 * B) Real Paths — horizontal-scroll mini profile cards
 * C) Small Steps — tap-to-expand chips (replaces hover tooltips)
 *
 * Preserves: save-to-journey mutation, translation support, all data.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  Compass,
  BookmarkPlus,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
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
  Clock,
} from "lucide-react";
import { useTranslateContent } from "@/hooks/use-translate-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type BeyondBordersArticle,
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
// CONSTANTS
// ============================================

const SWIPE_THRESHOLD = 50;

// ============================================
// MAIN COMPONENT
// ============================================

export function BeyondBordersCarousel() {
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

  return (
    <div role="region" aria-label="Working Beyond Borders" className="space-y-6">
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

      {/* A) Article Carousel */}
      <ArticleCarousel
        articles={BEYOND_BORDERS_ARTICLES}
        savedSlugs={savedSlugs}
        onSave={handleSave}
        getText={getText}
      />

      {/* B) Real Paths — horizontal scroll */}
      <RealPathsStrip getText={getText} />

      {/* C) Small Steps — tap to expand */}
      <SmallStepsChips getText={getText} />
    </div>
  );
}

// ============================================
// A) ARTICLE CAROUSEL
// ============================================

interface ArticleCarouselProps {
  articles: BeyondBordersArticle[];
  savedSlugs: Set<string>;
  onSave: (article: BeyondBordersArticle) => void;
  getText: (key: string, original: string) => string;
}

function ArticleCarousel({ articles, savedSlugs, onSave, getText }: ArticleCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = articles.length;

  // Reduced motion detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
      setExpandedSlug(null);
    },
    [current]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
    setExpandedSlug(null);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
    setExpandedSlug(null);
  }, [total]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  // Swipe gesture handler
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD) {
        goNext();
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  const article = articles[current];
  const isSaved = savedSlugs.has(article.slug);
  const isExpanded = expandedSlug === article.slug;

  const variants = prefersReducedMotion
    ? undefined
    : {
        enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
      };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Perspectives"
      className="outline-none"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={article.id}
            custom={direction}
            variants={variants}
            initial={prefersReducedMotion ? undefined : "enter"}
            animate="center"
            exit={prefersReducedMotion ? undefined : "exit"}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="p-4 sm:p-5 touch-pan-y"
          >
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    {article.readTime} min read
                  </Badge>
                </div>
                <h4 className="text-base font-semibold leading-snug">
                  {getText(`bb-title-${article.id}`, article.title)}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {getText(`bb-subtitle-${article.id}`, article.subtitle)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => onSave(article)}
                disabled={isSaved}
                aria-label={isSaved ? "Saved to journey" : "Save to journey"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-teal-600" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Key takeaway */}
            <div className="flex items-start gap-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 px-3 py-2 mb-3">
              <Lightbulb className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
              <p className="text-sm text-teal-800 dark:text-teal-300">
                {getText(`bb-takeaway-${article.id}`, article.takeaway)}
              </p>
            </div>

            {/* Read more / expanded content */}
            <button
              onClick={() => setExpandedSlug(isExpanded ? null : article.slug)}
              className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              {isExpanded ? "Show less" : "Read more"}
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-3">
                    {article.paragraphs.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground/80">
                        {p}
                      </p>
                    ))}
                    {article.callout && <CalloutBox callout={article.callout} />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation: arrows + dots */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          onClick={goPrev}
          className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous article"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Article slides">
          {articles.map((a, idx) => (
            <button
              key={a.id}
              onClick={() => goTo(idx)}
              role="tab"
              aria-selected={current === idx}
              aria-label={`Go to article ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-200 ${
                current === idx
                  ? "w-6 bg-teal-500"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next article"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// B) REAL PATHS — HORIZONTAL SCROLL
// ============================================

interface RealPathsStripProps {
  getText: (key: string, original: string) => string;
}

function RealPathsStrip({ getText }: RealPathsStripProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleStory = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Real Paths — one possible path, not a blueprint
      </p>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {REAL_PATH_STORIES.map((story) => {
          const isExpanded = expandedId === story.id;
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
              className={`min-w-[240px] max-w-[280px] snap-start rounded-xl border p-3 cursor-pointer transition-all shrink-0 ${
                isExpanded
                  ? "border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/10"
                  : "border-border hover:border-teal-200 dark:hover:border-teal-800"
              }`}
            >
              {/* Profile row */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/40 shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{story.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-teal-200 dark:border-teal-800">
                      {story.age}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{story.role}</p>
                </div>
              </div>

              {/* From → To */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <span className="truncate">{story.fromLocation}</span>
                <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{story.toLocation}</span>
              </div>

              {/* Expanded Q&A */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                      Harder than expected
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {getText(`bb-harder-${story.id}`, story.harderThanExpected)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                      What helped growth
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {getText(`bb-helped-${story.id}`, story.helpedGrowth)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Swipe hint — mobile only */}
      <p className="text-[10px] text-muted-foreground/50 text-center sm:hidden">
        Swipe to see more
      </p>
    </div>
  );
}

// ============================================
// C) SMALL STEPS — TAP TO EXPAND
// ============================================

interface SmallStepsChipsProps {
  getText: (key: string, original: string) => string;
}

function SmallStepsChips({ getText }: SmallStepsChipsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleStep = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const expandedStep = expandedId ? SMALL_STEPS.find((s) => s.id === expandedId) : null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Small steps if you&apos;re curious
      </p>

      {/* Chips row */}
      <div className="flex flex-wrap gap-2">
        {SMALL_STEPS.map((step) => {
          const Icon = STEP_ICONS[step.icon];
          const isActive = expandedId === step.id;
          return (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              aria-expanded={isActive}
              className={`inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-600"
                  : "border-teal-300 dark:border-teal-700 bg-background hover:bg-teal-50 dark:hover:bg-teal-950/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5 text-teal-500 shrink-0" />
              <span className="font-medium text-foreground/90">
                {getText(`bb-step-title-${step.id}`, step.title)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expandedStep && (
          <motion.div
            key={expandedStep.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 space-y-1.5">
              <p className="text-sm text-foreground/80">
                {getText(`bb-step-desc-${expandedStep.id}`, expandedStep.description)}
              </p>
              <p className="text-xs italic text-muted-foreground">
                {expandedStep.reassurance}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CALLOUT BOX (reused from original)
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

export default BeyondBordersCarousel;
