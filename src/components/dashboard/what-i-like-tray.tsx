'use client';

/**
 * WhatILikeTray — Right-edge slide-in tray surfacing the user's
 * Career Radar "What I Like" profile summary on the dashboard.
 *
 * Only mounts when the user has actually filled in Career Radar
 * preferences (discoveryPreferences). Mirrors the interaction model
 * of the other dashboard-side trays (SavedCareersTray, MessagesTray):
 * hover or click the right-edge tab to reveal a compact panel; ESC or
 * outside click closes.
 *
 * Content is deliberately sparse — a single summary sentence plus a
 * link back to the Radar so the user can update their answers. No
 * pills, no tag chips, no repetition of the subjects the sentence
 * already names.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiscoverRecommendations } from '@/hooks/use-discover-recommendations';

interface WhatILikeTrayProps {
  /** Offset from centre so the tray stacks cleanly with other right-edge tabs. */
  topOffsetPx?: number;
  className?: string;
}

export function WhatILikeTray({ topOffsetPx = 0, className }: WhatILikeTrayProps) {
  const { data } = useDiscoverRecommendations(true);
  const [open, setOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasProfile = !!data?.hasProfile && !!data.summary;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Hover on the tab opens the tray. Once open, it stays open until
  // the user actively dismisses it — the old hover-close pattern
  // raced with the fade-out trigger and the dead zone between tab
  // and panel, producing a visible flicker (panel closes, mouse
  // re-enters, panel opens, outside-click closes, repeat). Dismiss
  // via X, ESC, outside click, or clicking the tab again.
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 120);
  }, []);

  const handleHoverCancel = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  // No profile yet — the tray simply doesn't render. Users who haven't
  // filled in Career Radar shouldn't see an empty tab.
  if (!hasProfile) return null;

  return (
    <div
      ref={trayRef}
      className={cn('fixed right-0 top-1/2 z-40 pointer-events-none', className)}
      style={{ transform: `translateY(calc(-50% + ${topOffsetPx}px))` }}
    >
      <button
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleHoverCancel}
        aria-expanded={open}
        aria-controls="what-i-like-tray-panel"
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-auto',
          'flex items-center gap-1.5 py-3 pl-2 pr-1.5',
          'rounded-l-lg border border-r-0 border-violet-500/30',
          'bg-gradient-to-b from-violet-500/[0.08] via-fuchsia-500/[0.06] to-teal-500/[0.08]',
          'backdrop-blur-sm shadow-[0_0_12px_rgba(167,139,250,0.12)]',
          'text-[10px] font-medium text-violet-300/85',
          'hover:text-violet-200 hover:border-violet-500/45 hover:shadow-[0_0_16px_rgba(167,139,250,0.2)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
          'transition-all duration-200',
          open && 'opacity-0 pointer-events-none',
        )}
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <Sparkles className="h-3 w-3 rotate-90" />
        <span>What I Like</span>
      </button>

      <div
        id="what-i-like-tray-panel"
        role="region"
        aria-label="What I Like"
        aria-hidden={!open}
        className={cn(
          'w-[300px] sm:w-[340px]',
          'rounded-l-xl border border-r-0 border-border/40',
          'bg-card/95 backdrop-blur-md shadow-xl',
          'flex flex-col overflow-hidden',
          'transition-transform duration-250 ease-out',
          open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none',
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
          <div>
            <h3 className="text-xs font-semibold text-foreground">What I Like</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Your Career Radar profile summary
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close What I Like"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-4 bg-gradient-to-br from-violet-500/[0.04] via-fuchsia-500/[0.03] to-teal-500/[0.04]">
          <p className="text-[13px] text-foreground/90 leading-relaxed">
            {data!.summary}
          </p>
        </div>

        <div className="px-4 py-2 border-t border-border/20 shrink-0">
          <Link
            href="/careers/radar"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-violet-300 transition-colors"
          >
            Update in Career Radar
            <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
