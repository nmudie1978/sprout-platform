'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Globe, Info, ChevronDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CareerPresenceResult, PresenceLevel } from '@/lib/career-presence/types';

// ── Presence level styling ──────────────────────────────────────────

const LEVEL_CONFIG: Record<PresenceLevel, { label: string; dot: string; text: string }> = {
  high: {
    label: 'High',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
  },
  moderate: {
    label: 'Moderate',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
  },
  limited: {
    label: 'Limited',
    dot: 'bg-slate-400',
    text: 'text-slate-400',
  },
};

// Country flag emojis
const FLAGS: Record<string, string> = {
  NO: '🇳🇴',
  GB: '🇬🇧',
  DE: '🇩🇪',
  SE: '🇸🇪',
};

// Persisted collapse state — single global key since the card only
// appears in one place (Understand tab). Keeps it thin by default if
// the user has previously collapsed it.
const COLLAPSE_KEY = 'career-presence-collapsed';

// ── Component ───────────────────────────────────────────────────────

interface CareerPresenceCardProps {
  careerId: string;
  careerTitle: string;
}

export function CareerPresenceCard({ careerId, careerTitle }: CareerPresenceCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Read persisted collapse state on mount. Wrapped in try/catch
  // because localStorage can throw under private-mode or SSR.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(COLLAPSE_KEY) === '1') {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const { data, isLoading } = useQuery<CareerPresenceResult>({
    queryKey: ['career-presence', careerId],
    queryFn: async () => {
      const params = new URLSearchParams({ careerId, career: careerTitle });
      const res = await fetch(`/api/career-presence?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!careerId && !!careerTitle,
  });

  // Loading skeleton — same dimensions as the stripped-down card so
  // there's no layout shift when data arrives.
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/20 bg-muted/5 p-4 animate-pulse">
        <div className="h-3 w-32 bg-muted/20 rounded mb-3" />
        <div className="h-6 w-full bg-muted/10 rounded" />
      </div>
    );
  }

  // Fallback — no data for this career
  if (!data?.available) {
    return (
      <div className="rounded-lg border border-border/20 bg-muted/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">
            Career Presence
          </span>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Not yet available for this career.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/20 bg-muted/5 overflow-hidden">
      {/* Clickable header — toggles the country chips below. Laid out
          as three flex groups (left spacer, centred label, right
          controls) so the Globe + label sits at the true middle of the
          card while the Info icon and chevron stay pinned to the right.
          Same pattern as SectionHeader's `centered` mode. */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        className="w-full flex items-center px-4 py-3 hover:bg-muted/10 transition-colors cursor-pointer text-left"
      >
        {/* Left spacer — balances the right-hand Info + Chevron group */}
        <div className="flex-1" />
        {/* Centred title */}
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="h-3.5 w-3.5 text-emerald-400/60" />
          <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">
            Career Presence
          </span>
        </div>
        {/* Right controls — Info tooltip (methodology caveat) + chevron */}
        <div className="flex-1 flex justify-end items-center gap-1.5">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                >
                  <Info className="h-3 w-3 text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] text-[11px] leading-snug">
                {/* Methodology caveat — explains what the rating is
                    derived from so the user understands it as a rough
                    directional signal, not a precise measurement. */}
                <p className="font-medium text-foreground/90 mb-1">How this is calculated</p>
                <p className="text-muted-foreground/80 mb-1.5">
                  Derived from five per-country signals: job-posting volume, company/employer presence, industry ecosystem strength, local study and training pathways, and remote viability. Each is bucketed low/moderate/high and combined into the label shown.
                </p>
                <p className="text-muted-foreground/60">
                  A directional indicator, not a precise measurement. Doesn&rsquo;t reflect salary, competition, language requirements, or local barriers to entry.
                </p>
                {data.cautionNote && (
                  <p className="text-muted-foreground/60 mt-1.5 pt-1.5 border-t border-border/20">
                    {data.cautionNote}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground/55 transition-transform duration-200',
              collapsed && '-rotate-90',
            )}
          />
        </div>
      </button>

      {/* Country comparison chips — centred below the header so the
          whole card reads as one vertically-centred block. */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap justify-center gap-2">
            {data.countries.map((c) => {
              const level = LEVEL_CONFIG[c.presenceLevel];
              return (
                <div
                  key={c.countryCode}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px]',
                    c.countryCode === 'NO'
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-border/15 bg-muted/5',
                  )}
                >
                  <span className="text-xs">{FLAGS[c.countryCode] ?? ''}</span>
                  <span className="text-foreground/70 font-medium">{c.countryName}</span>
                  <span className="text-muted-foreground/40">—</span>
                  <span className={cn('font-medium', level.text)}>{level.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
