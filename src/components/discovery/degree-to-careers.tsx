"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { GraduationCap, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import type { Career } from "@/lib/career-pathways";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import { searchFields, getCareersForField } from "@/lib/discover/field-options";
import { rankDisciplineCareers } from "@/lib/discover/degree-to-careers";
import { parseSalaryRange, formatSalary } from "@/lib/career-filters/utils";

const GROWTH_META: Record<Career["growthOutlook"], { label: string; dot: string }> = {
  high: { label: "Growing", dot: "bg-emerald-400" },
  medium: { label: "Steady", dot: "bg-amber-400" },
  stable: { label: "Stable", dot: "bg-sky-400" },
};

const DROPDOWN_CAP = 8;

function salaryLabel(career: Career): string | null {
  const range = parseSalaryRange(career.avgSalary);
  if (!range || range.min <= 0) return null;
  return `from ${formatSalary(range.min)}`;
}

interface DegreeToCareersProps {
  onOpen: (career: Career) => void;
  /** Dev/preview only: seeds open=true + selectedFieldId without user interaction. */
  defaultOpenFieldId?: string;
  /** Dev/preview only: seeds open=true + the search query with the dropdown shown. */
  defaultQuery?: string;
}

export function DegreeToCareers({ onOpen, defaultOpenFieldId, defaultQuery }: DegreeToCareersProps) {
  const { getCareerById, isLoading } = useCareerCatalog();

  // Seed initial state from defaultOpenFieldId if provided
  const seedField = defaultOpenFieldId
    ? searchFields("").find((f) => f.id === defaultOpenFieldId) ?? null
    : null;

  const [open, setOpen] = useState<boolean>(!!defaultOpenFieldId || !!defaultQuery);
  const [query, setQuery] = useState<string>(seedField?.label ?? defaultQuery ?? "");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    defaultOpenFieldId ?? null,
  );
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(!!defaultQuery);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = useMemo(() => searchFields(query).slice(0, DROPDOWN_CAP), [query]);
  const showDropdown = dropdownOpen && suggestions.length > 0;

  const selectedFieldLabel = useMemo(
    () => (selectedFieldId ? searchFields("").find((f) => f.id === selectedFieldId)?.label : null),
    [selectedFieldId],
  );

  // Full ranked list — no cap. The user explores every matching career
  // here in a carousel, so they never have to leave the radar.
  const rankedCareers = useMemo(() => {
    if (!selectedFieldId || isLoading) return [];
    const ids = getCareersForField(selectedFieldId);
    const careers = ids.map((id) => getCareerById(id)).filter((c): c is Career => c !== undefined);
    return rankDisciplineCareers(careers);
  }, [selectedFieldId, isLoading, getCareerById]);

  // ── Horizontal carousel ───────────────────────────────────────────
  // A snap-scrolling track of all results with prev/next controls. The
  // arrows page by (almost) one viewport so it reads as a carousel; the
  // track is also natively swipe/trackpad scrollable.
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // Recompute arrow availability whenever the result set changes (and on
  // mount). Reset the scroll position when a new field is picked.
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = 0;
    // Defer to after layout so scrollWidth/clientWidth are settled.
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [rankedCareers, updateArrows]);

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }, []);

  return (
    <div className="rounded-card border border-border/40 bg-card/40 overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-foreground/[0.02] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Already studying something?</p>
          <p className="text-xs text-muted-foreground">See where your degree can lead.</p>
        </div>
        <span className="shrink-0 text-muted-foreground/60">
          {open ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </span>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-border/30 px-4 py-4 space-y-4">
          {/* Field search */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedFieldId(null);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Your field of study (e.g. Psychology, Engineering, Law)"
              className="w-full rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Search for your field of study"
              aria-autocomplete="list"
              aria-controls="degree-field-suggestions"
            />
            {showDropdown && (
              <div
                ref={dropdownRef}
                id="degree-field-suggestions"
                role="listbox"
                aria-label="Field suggestions"
                className="mt-1 max-h-64 overflow-y-auto rounded-control border border-border bg-popover shadow-sm"
              >
                {suggestions.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    role="option"
                    aria-selected={field.id === selectedFieldId}
                    onClick={() => {
                      setSelectedFieldId(field.id);
                      setQuery(field.label);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/[0.06] transition-colors focus:outline-none focus-visible:bg-primary/[0.06]"
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {isLoading && selectedFieldId && (
            <p className="text-xs text-muted-foreground/60 animate-pulse">Loading careers…</p>
          )}

          {!isLoading && selectedFieldId && rankedCareers.length === 0 && (
            <p className="text-xs text-muted-foreground/60">
              No careers mapped to this field yet.
            </p>
          )}

          {!isLoading && selectedFieldId && rankedCareers.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Careers from a{" "}
                  <span className="text-primary">{selectedFieldLabel}</span> background
                </h3>
                <span className="text-xs text-muted-foreground shrink-0">
                  {rankedCareers.length} career{rankedCareers.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Carousel — the full list, scrollable, never leaves the radar */}
              <div className="relative">
                <div
                  ref={trackRef}
                  onScroll={updateArrows}
                  className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  role="group"
                  aria-label={`Careers from a ${selectedFieldLabel} background`}
                >
                  {rankedCareers.map((career) => {
                    const salary = salaryLabel(career);
                    const growth = GROWTH_META[career.growthOutlook];
                    return (
                      <button
                        key={career.id}
                        type="button"
                        onClick={() => onOpen(career)}
                        aria-label={`View ${career.title} details`}
                        className="snap-start shrink-0 basis-[46%] sm:basis-[calc(33.333%-0.5rem)] text-left rounded-control border border-border bg-background hover:border-primary/40 hover:bg-foreground/[0.03] transition-colors p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="text-xl" aria-hidden>
                          {career.emoji}
                        </div>
                        <div className="mt-1.5 text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                          {career.title}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                          {salary && <span>{salary}</span>}
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${growth.dot}`}
                              aria-hidden
                            />
                            {growth.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Prev / next controls — only shown when there's overflow
                    in that direction. */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollByPage(-1)}
                    aria-label="Previous careers"
                    className="absolute left-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm backdrop-blur hover:border-primary/40 hover:bg-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollByPage(1)}
                    aria-label="More careers"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm backdrop-blur hover:border-primary/40 hover:bg-background transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground/60">
                Tap a career to open its full details.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
