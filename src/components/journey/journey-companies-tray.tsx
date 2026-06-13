"use client";

/**
 * JourneyCompaniesTray — Right-edge slide-in panel listing real
 * Companies and institutions where this career is common (localised to
 * the viewer's country), each linking to its careers page (or main site).
 *
 * Mirrors JourneyReflectionsTray's vertical-tab + hover/click pattern
 * so the two trays feel like the same family of UI. Where Reflections
 * is the user's private notes, Companies is an at-a-glance "where could
 * I actually work?" overview.
 *
 * Data comes from getCareerEmployers (curated list → sector fallback),
 * so it covers far more careers than the curated-only set. Category is
 * fetched from the shared career-details query (no extra round-trip).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Building2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCareerEmployers } from "@/lib/career-employers";

interface JourneyCompaniesTrayProps {
  /** Career id — keys the employer lookup and the details query. */
  careerId: string | null;
  /** Career title, for the panel heading. */
  careerTitle?: string | null;
  /** Vertical offset in pixels for the trigger tab. Default centred. */
  topOffsetPx?: number;
}

export function JourneyCompaniesTray({
  careerId,
  careerTitle,
  topOffsetPx = 0,
}: JourneyCompaniesTrayProps) {
  const [open, setOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category drives the sector-level fallback. Rides the shared
  // ['career-details', careerId] React Query cache the Understand tab
  // already populates, so opening the tray costs no extra fetch.
  const { data: detailsData } = useQuery<{ category?: string | null }>({
    queryKey: ["career-details", careerId],
    queryFn: async () => {
      const res = await fetch(`/api/career-details/${careerId}`);
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!careerId,
    staleTime: 5 * 60 * 1000,
  });

  // The employer data is Norwegian, so the tab is suppressed for
  // non-Norway users. Rides the shared ['profile-country'] cache the
  // page already populates — no extra round-trip.
  const { data: countryData } = useQuery<{ country?: string | null }>({
    queryKey: ["profile-country"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const employers = useMemo(
    () => (careerId ? getCareerEmployers(careerId, detailsData?.category, countryData?.country) : []),
    [careerId, detailsData?.category, countryData?.country],
  );

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Hover opens; once open it stays open until X / ESC / outside-click /
  // tab re-click (same anti-flicker reasoning as the Reflections tray).
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 120);
  }, []);

  const handleHoverCancel = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  // Nothing to show — no career goal, or no employers for this career.
  if (!careerId || employers.length === 0) return null;

  return (
    <div
      ref={trayRef}
      className="fixed right-0 top-1/2 z-40 pointer-events-none"
      style={{ transform: `translateY(calc(-50% + ${topOffsetPx}px))` }}
    >
      {/* Trigger tab */}
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleHoverCancel}
        aria-expanded={open}
        aria-controls="journey-companies-panel"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "flex items-center gap-1.5 py-3 pl-2 pr-1.5",
          "rounded-l-lg border border-r-0 border-sky-500/30",
          "bg-gradient-to-b from-sky-500/[0.08] via-sky-400/[0.06] to-indigo-500/[0.06]",
          "backdrop-blur-sm shadow-[0_0_12px_rgba(14,165,233,0.12)]",
          "text-[10px] font-medium text-sky-300/85",
          "hover:text-sky-200 hover:border-sky-500/45 hover:shadow-[0_0_16px_rgba(14,165,233,0.2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
          "transition-all duration-200",
          open && "opacity-0 pointer-events-none",
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <Building2 className="h-3 w-3 rotate-90" />
        <span>Companies ({employers.length})</span>
      </button>

      {/* Panel */}
      <div
        id="journey-companies-panel"
        role="region"
        aria-label="Companies where this role is common"
        aria-hidden={!open}
        className={cn(
          "w-[340px] sm:w-[380px] h-[520px] max-h-[80vh]",
          "rounded-l-xl border border-r-0 border-border/40",
          "bg-card/95 backdrop-blur-md shadow-xl",
          "flex flex-col overflow-hidden",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-sky-400" />
              Where you could work
            </h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Companies and institutions
              {careerTitle ? ` for ${careerTitle}` : ""} — tap to open their
              careers page.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/70 hover:text-foreground transition-colors"
            aria-label="Close companies"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {employers.map((emp) => {
            const domain = emp.careersUrl
              ? new URL(emp.careersUrl).hostname.replace("www.", "")
              : null;
            const row = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border/30 bg-card/40 px-3 py-2.5",
                  emp.careersUrl &&
                    "press hover:border-sky-500/40 hover:bg-card/70 transition-colors group",
                )}
              >
                {domain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt=""
                    width={18}
                    height={18}
                    className="rounded shrink-0"
                  />
                ) : (
                  <Building2 className="h-[18px] w-[18px] text-muted-foreground/65 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-foreground/90 truncate">
                    {emp.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground/55 truncate">
                    {emp.industry} · {emp.size}
                  </div>
                </div>
                {emp.careersUrl && (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/65 group-hover:text-sky-400 shrink-0 transition-colors" />
                )}
              </div>
            );
            return emp.careersUrl ? (
              <a
                key={emp.name}
                href={emp.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {row}
              </a>
            ) : (
              <div key={emp.name}>{row}</div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="px-4 py-2 border-t border-border/30 shrink-0">
          <p className="text-[9px] text-muted-foreground/45 leading-snug">
            Example employers where this kind of role is common — not job
            listings or endorsements.
          </p>
        </div>
      </div>
    </div>
  );
}
