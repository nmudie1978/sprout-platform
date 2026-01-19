/**
 * WORLD LENS ARTICLES — Article Carousel
 *
 * A horizontal carousel of curated articles.
 * Articles are the primary medium for Industry Insights.
 *
 * Features:
 * - Horizontal scroll
 * - Max 7 items
 * - Desktop: 3-4 visible
 * - Mobile: 1.2 cards (peek next)
 * - No auto-scroll
 * - No infinite loading
 */

"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { ArticleInsightCard } from "./article-insight-card";
import { getCuratedArticles } from "@/lib/industry-insights/world-lens-data";

// ============================================
// TYPES
// ============================================

interface WorldLensArticlesProps {
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WorldLensArticles({ className }: WorldLensArticlesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const articles = getCuratedArticles(7);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360; // Approximate card width + gap
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className={className}>
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

          {/* Navigation arrows (desktop only) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full border hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full border hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {articles.map((article) => (
          <div key={article.id} className="snap-start">
            <ArticleInsightCard article={article} />
          </div>
        ))}
      </div>

      {/* Scroll hint for mobile */}
      <p className="text-[10px] text-muted-foreground/60 text-center mt-3 sm:hidden">
        Swipe to see more articles
      </p>
    </section>
  );
}
