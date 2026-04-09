'use client';

/**
 * Live Opportunities — UI for the career-opportunities agent.
 *
 * Calls POST /api/agents/career-opportunities for the user's active
 * career goal and renders the validated array as three grouped lists:
 * Universities · Courses · Jobs. Source-hostname badge per card,
 * confidence dot, and any flags surfaced as small chips so the user
 * can see why something has caveats.
 *
 * Loading state shows a calm skeleton, not a spinner. Empty state
 * tells the user the agent is still warming up. The whole section
 * hides if the user has no goal yet — handled by the parent.
 */

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, GraduationCap, BookOpen, Briefcase, Sparkles, AlertTriangle } from 'lucide-react';
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

export function LiveOpportunitiesSection({
  careerTitle,
  location,
}: LiveOpportunitiesSectionProps) {
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
    // Server caches for 7 days, but the React Query layer can be
    // even longer — these are stable opportunities.
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
          <span className="text-[10px] text-muted-foreground/40 ml-2">searching the web…</span>
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
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-foreground/90">Live Opportunities</h3>
          <span className="text-[10px] text-muted-foreground/40 ml-1">
            {items.length} verified for {careerTitle}
          </span>
        </div>
        {data?.cached && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">cached</span>
        )}
      </div>
      <div className="p-4 space-y-5">
        {orderedGroups.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const Icon = cfg.icon;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {cfg.label}
                </p>
                <span className="text-[10px] text-muted-foreground/30">· {grouped[cat].length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grouped[cat].map((item, i) => (
                  <OpportunityCard key={`${cat}-${i}`} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityCard({ item }: { item: ValidatedItem }) {
  const { data, decision, confidence_score, flags } = item;
  const isFlagged = decision === 'KEEP_WITH_FLAGS' || flags.length > 0;

  // Confidence dot colour: green ≥80, amber 60-79, neutral <60.
  const confColor =
    confidence_score >= 80
      ? 'bg-emerald-500'
      : confidence_score >= 60
        ? 'bg-amber-500'
        : 'bg-muted-foreground/40';

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group rounded-lg border bg-background/20 p-3 transition-colors',
        'hover:border-amber-400/40 hover:bg-amber-500/[0.04]',
        isFlagged ? 'border-amber-500/20' : 'border-border/30'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground/85 group-hover:text-foreground transition-colors leading-tight line-clamp-2">
            {data.title}
          </p>
          <p className="text-[10px] text-muted-foreground/55 mt-0.5 truncate">
            {data.provider}
            {data.location && data.location !== 'Online' ? ` · ${data.location}` : ''}
            {data.location === 'Online' ? ' · Online' : ''}
          </p>
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-amber-400 shrink-0 mt-0.5" />
      </div>

      {data.summary && (
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed line-clamp-2 mb-2">
          {data.summary}
        </p>
      )}

      {/* Footer: source, confidence dot, flags */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-border/15">
        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/40">
          <span className={cn('h-1 w-1 rounded-full', confColor)} />
          {data.source || 'source'}
        </span>
        {flags.length > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400/70">
            <AlertTriangle className="h-2 w-2" />
            {flags[0].replace(/_/g, ' ')}
            {flags.length > 1 ? ` +${flags.length - 1}` : ''}
          </span>
        )}
      </div>
    </a>
  );
}
