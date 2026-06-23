'use client';

/**
 * Roadmap first-run tips card.
 *
 * A calm, dismissible card shown ONCE at the top of the Clarity roadmap to
 * explain two non-obvious things — what "Your Starting Point" is, and the
 * "Scenarios" control. After it's dismissed (or once it's been seen) it never
 * returns on that device. Per-device, localStorage-backed, no DB / no tracking.
 *
 * See docs/superpowers/specs/2026-06-23-roadmap-first-run-tips-design.md
 */

import { useState } from 'react';
import { Compass, X, Target, Shuffle } from 'lucide-react';

/** localStorage flag — set once the user has seen/dismissed the tips. */
export const ROADMAP_TIPS_SEEN_KEY = 'roadmap-guidance-seen';

function alreadySeen(): boolean {
  // SSR-safe + resilient to iOS private tabs where localStorage throws.
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(ROADMAP_TIPS_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function RoadmapTipsCard({ showScenarios }: { showScenarios: boolean }) {
  // Lazy initializer so the card never flashes on hydration if already seen.
  const [dismissed, setDismissed] = useState(alreadySeen);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(ROADMAP_TIPS_SEEN_KEY, '1');
    } catch {
      /* private tab — fine, it just shows once per session instead. */
    }
    setDismissed(true);
  };

  return (
    <div className="relative mb-3 rounded-card border border-border/40 bg-muted/20 px-4 py-3">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>

      <div className="flex items-center gap-1.5 pr-7">
        <Compass className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
        <p className="text-xs font-semibold text-foreground/85">A couple of things on this roadmap</p>
      </div>

      <ul className="mt-2 space-y-1.5">
        <li className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground/85">
          <Target className="mt-0.5 h-3 w-3 shrink-0 text-teal-500" aria-hidden />
          <span>
            <span className="font-medium text-foreground/85">Your Starting Point</span> — tell us where you are
            today and we&rsquo;ll tailor every step of this roadmap to you.
          </span>
        </li>
        {showScenarios && (
          <li className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground/85">
            <Shuffle className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" aria-hidden />
            <span>
              <span className="font-medium text-foreground/85">Scenarios</span> — tap it to explore different
              paths to the same goal; each one reshapes the roadmap.
            </span>
          </li>
        )}
      </ul>

      <div className="mt-2.5 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex items-center rounded-full border border-border/50 bg-background/60 px-3 py-1 text-[11px] font-semibold text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
