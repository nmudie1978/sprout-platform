'use client';

/**
 * Route picker — Phase 3 of the pathway data model rework.
 *
 * Renders a horizontal tab strip above the Study Path programmes
 * table when the current career has more than one route recorded.
 * Selecting a tab updates the EducationBrowser to filter the table
 * to programmes referenced by that route's stages.
 *
 * Selection persists per career in localStorage so a user who returns
 * to "Counselling" once stays there. Falls back to the default route
 * if the persisted selection no longer matches any route (e.g. after
 * Phase 4 hand-curation deletes a route).
 *
 * Visually intentionally restrained: this is the first cut and the
 * user has explicitly said they may not keep this UI. Tab interaction
 * is a single button-bar; route summary appears below the tabs.
 */

import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Route } from '@/lib/education/route-types';

interface RoutePickerProps {
  routes: Route[];
  selectedRouteId: string | null;
  onSelect: (routeId: string) => void;
}

const COUNTRY_FLAG: Record<string, string> = {
  NO: '🇳🇴',
  SE: '🇸🇪',
  DK: '🇩🇰',
  FI: '🇫🇮',
  IS: '🇮🇸',
};

export function RoutePicker({ routes, selectedRouteId, onSelect }: RoutePickerProps) {
  // Resolve current selection (default route fallback). The parent
  // owns the selectedRouteId state; we just compute what's effectively
  // selected for the visual highlight + summary block below.
  const resolved = useMemo<Route | null>(() => {
    if (selectedRouteId) {
      const match = routes.find((r) => r.id === selectedRouteId);
      if (match) return match;
    }
    const def = routes.find((r) => r.isDefault);
    return def ?? routes[0] ?? null;
  }, [routes, selectedRouteId]);

  // If localStorage held a route id that no longer exists (e.g. after
  // a Phase 4 cleanup), silently bump the parent to the default.
  useEffect(() => {
    if (selectedRouteId && resolved && resolved.id !== selectedRouteId) {
      onSelect(resolved.id);
    }
  }, [selectedRouteId, resolved, onSelect]);

  if (!routes.length || !resolved) return null;

  return (
    <div className="space-y-3">
      {/* ── Tab strip ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {routes.map((r) => {
          const isActive = r.id === resolved.id;
          const flag = r.countryCode ? COUNTRY_FLAG[r.countryCode] : null;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                isActive
                  ? 'border-teal-500/50 bg-teal-500/15 text-teal-100'
                  : 'border-border/30 bg-background/40 text-foreground/65 hover:text-foreground hover:border-border/50',
              )}
              aria-pressed={isActive}
            >
              {flag && <span aria-hidden="true">{flag}</span>}
              <span>{r.shortName}</span>
              {r.estimatedYears > 0 && (
                <span className={cn('text-[10px]', isActive ? 'text-teal-200/70' : 'text-muted-foreground/60')}>
                  · {r.estimatedYears}y
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Selected route summary ────────────────────────────────── */}
      {(resolved.name || resolved.summary) && (
        <div className="rounded-lg border border-border/30 bg-background/30 px-3.5 py-3">
          {resolved.name && (
            <p className="text-[12px] font-medium text-foreground/85 leading-snug">{resolved.name}</p>
          )}
          {resolved.summary && (
            <p className="mt-1 text-[11px] text-muted-foreground/80 leading-relaxed">{resolved.summary}</p>
          )}
        </div>
      )}
    </div>
  );
}
