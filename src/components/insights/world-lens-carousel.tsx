/**
 * WORLD LENS CAROUSEL — Articles Carousel
 *
 * A rotating carousel of curated articles organized by theme.
 * Features:
 * - Auto-rotation every 25 seconds
 * - Pause on hover/focus
 * - Keyboard accessible controls
 * - Reduced motion support
 * - Responsive layout (4 cols desktop, 2 cols tablet, 1 col mobile)
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import {
  getArticlePages,
  ARTICLES_PAGE_LABELS,
  type CuratedArticle,
} from "@/lib/industry-insights/world-lens-data";

// ============================================
// CONSTANTS
// ============================================

const AUTO_ADVANCE_INTERVAL = 25000; // 25 seconds

// ============================================
// GRADIENT BACKGROUNDS BY TOPIC
// ============================================

const topicGradients: Record<string, string> = {
  "future of work": "from-blue-500/20 to-cyan-500/20",
  skills: "from-purple-500/20 to-pink-500/20",
  "youth employment": "from-emerald-500/20 to-teal-500/20",
  AI: "from-violet-500/20 to-indigo-500/20",
  automation: "from-slate-500/20 to-zinc-500/20",
  "green jobs": "from-green-500/20 to-emerald-500/20",
  sustainability: "from-teal-500/20 to-cyan-500/20",
  education: "from-amber-500/20 to-orange-500/20",
  "remote work": "from-sky-500/20 to-blue-500/20",
  innovation: "from-indigo-500/20 to-purple-500/20",
  technology: "from-cyan-500/20 to-blue-500/20",
  "generative AI": "from-fuchsia-500/20 to-violet-500/20",
  "renewable energy": "from-lime-500/20 to-green-500/20",
  "career development": "from-rose-500/20 to-pink-500/20",
  policy: "from-slate-500/20 to-gray-500/20",
  default: "from-slate-400/20 to-slate-500/20",
};

function getGradientForArticle(topics: string[]): string {
  for (const topic of topics) {
    const key = topic.toLowerCase();
    if (topicGradients[key]) {
      return topicGradients[key];
    }
  }
  return topicGradients.default;
}

// ============================================
// DATE FORMATTER
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// ARTICLE CARD COMPONENT
// ============================================

function ArticleCard({ article }: { article: CuratedArticle }) {
  const gradient = getGradientForArticle(article.topics);
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={article.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full"
    >
      <Card className="overflow-hidden border hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* 16:9 Visual Header */}
        <div className="aspect-video relative overflow-hidden flex-shrink-0">
          {article.imageUrl && !imgError ? (
            <>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
              {/* Subtle overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Source badge on image */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 dark:bg-black/70 rounded text-[10px] font-medium text-muted-foreground">
                {article.sourceName}
              </div>
            </>
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              <div className="text-center p-4">
                <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  {article.sourceName}
                </span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
          {/* Headline - max 2 lines */}
          <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Summary - 2 lines */}
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1">
            {article.summary}
          </p>

          {/* Source + Date */}
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 mt-2">
            {article.sourceName} &bull; {formatDate(article.publishedAt)}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-primary group-hover:underline mt-2">
            Read article
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ============================================
// CAROUSEL NAVIGATION
// ============================================

interface CarouselNavProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (page: number) => void;
}

function CarouselNav({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onDotClick,
}: CarouselNavProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {/* Previous button */}
      <button
        onClick={onPrev}
        className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Dot indicators */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Article pages">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onDotClick(idx)}
            role="tab"
            aria-selected={currentPage === idx}
            aria-label={`Go to ${ARTICLES_PAGE_LABELS[idx] || `Page ${idx + 1}`}`}
            className={`
              h-2 rounded-full transition-all duration-200
              ${
                currentPage === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }
            `}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================
// MAIN CAROUSEL COMPONENT
// ============================================

interface WorldLensCarouselProps {
  className?: string;
}

export function WorldLensCarousel({ className }: WorldLensCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get paginated articles (4 per page)
  const articlePages = getArticlePages(4);
  const totalPages = articlePages.length;

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Navigation handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-advance logic
  useEffect(() => {
    // Don't auto-advance if paused or reduced motion preferred
    if (isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(goToNext, AUTO_ADVANCE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion, goToNext]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Pause on focus within
  const handleFocusIn = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleFocusOut = useCallback((e: React.FocusEvent) => {
    // Only unpause if focus is leaving the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsPaused(false);
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  const currentArticles = articlePages[currentPage] || [];
  const pageLabel = ARTICLES_PAGE_LABELS[currentPage] || `Page ${currentPage + 1}`;

  return (
    <section
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="World Lens articles carousel"
      aria-roledescription="carousel"
    >
      {/* Section Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Newspaper className="h-5 w-5 text-muted-foreground" />
              World Lens: What's shaping jobs right now
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              A calm look at the forces influencing work and careers.
            </p>
          </div>
        </div>
      </div>

      {/* Page label and status */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          {pageLabel} ({currentPage + 1}/{totalPages})
        </p>
        {!prefersReducedMotion && (
          <p className="text-[10px] text-muted-foreground/60">
            {isPaused ? "Paused" : "Auto-advances"}
          </p>
        )}
      </div>

      {/* Articles grid */}
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        role="tabpanel"
        aria-label={pageLabel}
      >
        {currentArticles.map((article) => (
          <div
            key={article.id}
            className={`
              transition-opacity duration-300
              ${prefersReducedMotion ? "" : "animate-in fade-in-0"}
            `}
          >
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <CarouselNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={goToPrev}
        onNext={goToNext}
        onDotClick={goToPage}
      />
    </section>
  );
}
