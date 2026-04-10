'use client';

/**
 * Live Opportunities — UI for the career-opportunities agent.
 *
 * Calls POST /api/agents/career-opportunities for the user's active
 * career goal and renders the validated array as three grouped lists:
 * Universities · Courses · Jobs.
 *
 * Features
 * --------
 * - Three view modes (cards / list / compact) — preference saved
 *   in localStorage so it sticks across visits.
 * - Collapse / expand toggle — also persisted.
 * - Helper line under the header explaining what the section is for.
 * - Source-hostname badge per item, confidence dot, flag chip.
 *
 * Loading state shows a calm skeleton, not a spinner. Error or empty
 * state hides the section. The whole component hides if no goal yet
 * — handled by the parent.
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  GraduationCap,
  BookOpen,
  Briefcase,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  List,
  AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mirror the agent's public types so we don't import server-side
// modules into a client component.
type Decision = 'KEEP' | 'KEEP_WITH_FLAGS' | 'REJECT';

interface StructuredItemData {
  role: string;
  category: 'job' | 'course' | 'university';
  title: string;
  provider: string;
  location: string;
  url: string;
  summary: string;
  requirements: string[];
  skills: string[];
  tags: string[];
  source: string;
  last_verified: string;
  confidence_score: number;
  flags: string[];
}

interface ValidatedItem {
  data: StructuredItemData;
  decision: Decision;
  confidence_score: number;
  flags: string[];
}

interface AgentResponse {
  items: ValidatedItem[];
  cached: boolean;
  generatedAt?: string;
}

interface LiveOpportunitiesSectionProps {
  careerTitle: string;
  location?: string;
}

const CATEGORY_CONFIG: Record<
  StructuredItemData['category'],
  { label: string; icon: typeof GraduationCap; color: string }
> = {
  university: { label: 'Universities', icon: GraduationCap, color: 'text-violet-400' },
  course:     { label: 'Courses',      icon: BookOpen,       color: 'text-sky-400' },
  job:        { label: 'Jobs',         icon: Briefcase,      color: 'text-emerald-400' },
};

type ViewMode = 'cards' | 'list' | 'compact';

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'cards',   label: 'Cards',   icon: LayoutGrid },
  { id: 'list',    label: 'List',    icon: List },
  { id: 'compact', label: 'Compact', icon: AlignJustify },
];

const VIEW_STORAGE_KEY = 'live-opportunities-view';
const COLLAPSED_STORAGE_KEY = 'live-opportunities-collapsed';

// ── Tiny localStorage hook (no dep) ────────────────────────────────

function usePersistedState<T extends string | boolean>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  // Hydrate after mount so SSR doesn't choke.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        if (typeof initial === 'boolean') {
          setValue((raw === '1') as T);
        } else {
          setValue(raw as T);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const update = (v: T) => {
    setValue(v);
    try {
      window.localStorage.setItem(
        key,
        typeof v === 'boolean' ? (v ? '1' : '0') : String(v),
      );
    } catch {
      /* ignore */
    }
  };
  return [value, update] as const;
}

// ── Section ─────────────────────────────────────────────────────────

export function LiveOpportunitiesSection({
  careerTitle,
  location,
}: LiveOpportunitiesSectionProps) {
  const [viewMode, setViewMode] = usePersistedState<ViewMode>(VIEW_STORAGE_KEY, 'compact');
  const [collapsed, setCollapsed] = usePersistedState<boolean>(COLLAPSED_STORAGE_KEY, false);

  const { data, isLoading, isError } = useQuery<AgentResponse>({
    queryKey: ['agent', 'career-opportunities', careerTitle, location ?? ''],
    queryFn: async () => {
      const res = await fetch('/api/agents/career-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: careerTitle, location }),
      });
      if (!res.ok) throw new Error('agent failed');
      return res.json();
    },
    enabled: !!careerTitle,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  // Skeleton during the first load. The agent can take 8-20s on a
  // cache miss so we make the loading state feel intentional.
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/30 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/20">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground/90">Live Opportunities</h3>
          <span className="text-[10px] text-muted-foreground/55 ml-2">searching the web…</span>
        </div>
        <div className="p-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border/20 bg-background/20 p-3 animate-pulse">
              <div className="h-3 w-2/3 bg-muted/30 rounded mb-2" />
              <div className="h-2.5 w-full bg-muted/20 rounded mb-1.5" />
              <div className="h-2.5 w-4/5 bg-muted/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) return null; // calm fail — section just hides
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  // Group by category, preserving the agent's order within each.
  const grouped = items.reduce<Record<string, ValidatedItem[]>>((acc, item) => {
    const cat = item.data.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Render order: universities → courses → jobs (foundation → action).
  const order: StructuredItemData['category'][] = ['university', 'course', 'job'];
  const orderedGroups = order.filter((c) => grouped[c]?.length);

  if (orderedGroups.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-amber-500/25 overflow-hidden"
      style={{ boxShadow: '0 0 25px rgba(245,158,11,0.06), 0 0 50px rgba(245,158,11,0.03)' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-border/30 hover:bg-amber-500/[0.03] transition-colors text-left"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-foreground/90">Live Opportunities</h3>
          <span className="text-[10px] text-muted-foreground/60 ml-1">
            {items.length} verified for {careerTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {data?.cached && (
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">cached</span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground/60 transition-transform duration-200',
              collapsed && '-rotate-90',
            )}
          />
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Sub-header: explainer + view mode toggle */}
          <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2">
            <p className="text-[11px] text-muted-foreground/65 leading-snug max-w-[60ch]">
              Real, web-verified universities, courses and jobs for{' '}
              <span className="text-foreground/80 font-medium">{careerTitle}</span>.
              Pulled live from trusted sources (utdanning.no, samordnaopptak.no,
              finn.no, LinkedIn, Coursera) and double-checked by the agent for
              relevance and age-appropriateness. Tap any item to open it in a
              new tab — nothing here costs anything to view.
            </p>
            <div className="inline-flex items-center gap-0.5 rounded-md border border-border/40 bg-background/40 p-0.5 shrink-0">
              {VIEW_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = viewMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setViewMode(opt.id)}
                    title={opt.label}
                    aria-label={`${opt.label} view`}
                    aria-pressed={active}
                    className={cn(
                      'inline-flex items-center justify-center rounded h-6 w-6 transition-colors',
                      active
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-muted-foreground/55 hover:text-foreground/85 hover:bg-muted/20',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-1 space-y-5">
            {orderedGroups.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/65">
                      {cfg.label}
                    </p>
                    <span className="text-[10px] text-muted-foreground/45">· {grouped[cat].length}</span>
                  </div>

                  {viewMode === 'cards' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grouped[cat].map((item, i) => (
                        <OpportunityCard key={`${cat}-${i}`} item={item} />
                      ))}
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="space-y-1.5">
                      {grouped[cat].map((item, i) => (
                        <OpportunityRow key={`${cat}-${i}`} item={item} />
                      ))}
                    </div>
                  )}

                  {viewMode === 'compact' && (
                    <div className="rounded-lg border border-border/25 divide-y divide-border/20 overflow-hidden">
                      {grouped[cat].map((item, i) => (
                        <OpportunityCompact key={`${cat}-${i}`} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Confidence helper ───────────────────────────────────────────────

function confidenceColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-muted-foreground/40';
}

// ── View 1: Cards (rich) ────────────────────────────────────────────

function OpportunityCard({ item }: { item: ValidatedItem }) {
  const { data, decision, confidence_score, flags } = item;
  const isFlagged = decision === 'KEEP_WITH_FLAGS' || flags.length > 0;
  const confColor = confidenceColor(confidence_score);

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group rounded-lg border bg-background/20 p-3 transition-colors',
        'hover:border-amber-400/40 hover:bg-amber-500/[0.04]',
        isFlagged ? 'border-amber-500/20' : 'border-border/30',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground/85 group-hover:text-foreground transition-colors leading-tight line-clamp-2">
            {data.title}
          </p>
          <p className="text-[10px] text-muted-foreground/65 mt-0.5 truncate">
            {data.provider}
            {data.location && data.location !== 'Online' ? ` · ${data.location}` : ''}
            {data.location === 'Online' ? ' · Online' : ''}
          </p>
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-amber-400 shrink-0 mt-0.5" />
      </div>

      {data.summary && (
        <p className="text-[10px] text-muted-foreground/65 leading-relaxed line-clamp-2 mb-2">
          {data.summary}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-border/15">
        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/55">
          <span className={cn('h-1 w-1 rounded-full', confColor)} />
          {data.source || 'source'}
        </span>
        {flags.length > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400/80">
            <AlertTriangle className="h-2 w-2" />
            {flags[0].replace(/_/g, ' ')}
            {flags.length > 1 ? ` +${flags.length - 1}` : ''}
          </span>
        )}
      </div>
    </a>
  );
}

// ── View 2: List (single column, slightly denser, summary visible) ──

function OpportunityRow({ item }: { item: ValidatedItem }) {
  const { data, decision, confidence_score, flags } = item;
  const isFlagged = decision === 'KEEP_WITH_FLAGS' || flags.length > 0;
  const confColor = confidenceColor(confidence_score);

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-background/20 px-3 py-2 transition-colors',
        'hover:border-amber-400/40 hover:bg-amber-500/[0.04]',
        isFlagged ? 'border-amber-500/20' : 'border-border/30',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-xs font-semibold text-foreground/85 group-hover:text-foreground transition-colors leading-tight">
            {data.title}
          </p>
          <span className="text-[10px] text-muted-foreground/55 truncate">
            {data.provider}
            {data.location ? ` · ${data.location}` : ''}
          </span>
        </div>
        {data.summary && (
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed line-clamp-1 mt-0.5">
            {data.summary}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/55">
          <span className={cn('h-1 w-1 rounded-full', confColor)} />
          {data.source}
        </span>
        {flags.length > 0 && (
          <AlertTriangle className="h-2.5 w-2.5 text-amber-400/80" />
        )}
        <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-amber-400" />
      </div>
    </a>
  );
}

// ── View 3: Compact (one line per item, max density) ───────────────

function OpportunityCompact({ item }: { item: ValidatedItem }) {
  const { data, confidence_score, flags } = item;
  const confColor = confidenceColor(confidence_score);
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 px-3 py-1.5 hover:bg-amber-500/[0.04] transition-colors"
    >
      <span className={cn('h-1 w-1 rounded-full shrink-0', confColor)} />
      <span className="text-[11px] font-medium text-foreground/85 group-hover:text-foreground transition-colors truncate flex-1">
        {data.title}
      </span>
      <span className="text-[9px] text-muted-foreground/55 shrink-0 hidden sm:inline">
        {data.source}
      </span>
      {flags.length > 0 && (
        <AlertTriangle className="h-2.5 w-2.5 text-amber-400/80 shrink-0" />
      )}
      <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-amber-400 shrink-0" />
    </a>
  );
}
