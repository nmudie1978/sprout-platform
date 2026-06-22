"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink, Compass, Users, DoorOpen, PencilRuler, MonitorPlay,
  Building2, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { YouthEventsTable } from "@/components/insights/youth-events-table";
import { cn } from "@/lib/utils";
import {
  EVENT_CATEGORIES,
  OPP_TYPE_LABEL, OPP_TYPE_ACCENT, AUDIENCE_LABEL,
  filterSources, getSourcesForCountry, getLocationOptions, eventSearchQuery,
  type OppType, type LocationKey, type Audience, type CategoryCard, type ExternalSource,
} from "@/lib/data/events-opportunities";

const EVENT_ICON: Record<string, LucideIcon> = {
  "job-fairs": Users,
  "open-days": DoorOpen,
  "career-workshops": PencilRuler,
  webinars: MonitorPlay,
  "employer-discovery": Building2,
};

const googleSearch = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const TYPE_OPTIONS: (OppType | "all")[] = ["all", "apprenticeships", "internships", "graduate-programs", "student-jobs", "entry-level"];
const AUDIENCE_OPTIONS: (Audience | "all")[] = ["all", "school-student", "student", "graduate", "career-changer", "returning"];

/**
 * Events & Opportunities — country-tailored.
 *
 * `country` is the signed-in user's `YouthProfile.country` (resolved server-side
 * by the page). It selects which national job portals appear (NAV/FINN for
 * Norway, SEPE/InfoJobs for Spain, …) on top of the always-global sources, and
 * drives the Location options + external event searches. Unknown/missing
 * country → global sources only.
 */
export function EventsOpportunitiesView({ country }: { country?: string | null }) {
  const [type, setType] = useState<OppType | "all">("all");
  const [location, setLocation] = useState<LocationKey>("all");
  const [audience, setAudience] = useState<Audience | "all">("all");
  const [tab, setTab] = useState<"events" | "opportunities">("events");

  const locationOptions = useMemo(() => getLocationOptions(country), [country]);

  // The Type filter (Opportunities tab only) drives the source directory
  // directly — there's no free-text search and no opportunity-types block.
  const sources = useMemo(
    () => filterSources(getSourcesForCountry(country), { type, location, audience }),
    [country, type, location, audience],
  );
  // Events are never filtered by the opportunities filters.
  const eventCards = EVENT_CATEGORIES;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <PageHeader
        title="Events &"
        gradientText="Opportunities"
        icon={Compass}
        description="Explore career events, open days, internships, apprenticeships, graduate programs, student jobs, and entry-level roles — all in one calm place."
      />
      <p className="mt-2 text-sm text-muted-foreground/80">
        Use this section when you&rsquo;re ready to move from exploring careers to taking real-world next steps. These are trusted starting points and curated external sources — not a live job board.
      </p>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "events" | "opportunities")} className="mt-6">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        {/* Events */}
        <TabsContent value="events" className="mt-5 space-y-6">
          {/* The real, dated events — a crisp chronological list (verified
              career events, job fairs, open days, webinars). */}
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/70">Upcoming events</h2>
            <YouthEventsTable defaultPageSize={8} />
          </section>

          {/* Secondary: browse by type / search externally where we don't
              hold a dated listing. The external search is tailored to country. */}
          {eventCards.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/70">Find more, by type</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {eventCards.map((c) => (
                  <CategoryTile
                    key={c.id}
                    card={c}
                    icon={EVENT_ICON[c.id] ?? Users}
                    accentType="events"
                    action={
                      <a
                        href={googleSearch(eventSearchQuery(c.id, country, c.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Search externally for ${c.name}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                      >
                        Search externally <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </TabsContent>

        {/* Opportunities */}
        <TabsContent value="opportunities" className="mt-5 space-y-6">
          {/* ── Filters (Opportunities only) ───────────────────────────── */}
          <div className="rounded-card border border-border/40 bg-card/40 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FilterSelect id="eo-type" label="Type" value={type} onChange={(v) => setType(v as OppType | "all")}
                options={TYPE_OPTIONS.map((t) => ({ value: t, label: t === "all" ? "All" : OPP_TYPE_LABEL[t as OppType] }))} />
              <FilterSelect id="eo-location" label="Location" value={location} onChange={(v) => setLocation(v as LocationKey)}
                options={locationOptions} />
              <FilterSelect id="eo-audience" label="Audience" value={audience} onChange={(v) => setAudience(v as Audience | "all")}
                options={AUDIENCE_OPTIONS.map((a) => ({ value: a, label: a === "all" ? "Everyone" : AUDIENCE_LABEL[a as Audience] }))} />
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              Where to look {type !== "all" ? `· ${OPP_TYPE_LABEL[type as OppType]}` : ""}
            </h2>
            {sources.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sources.map((s) => <SourceCard key={s.id} source={s} />)}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterSelect({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-medium text-muted-foreground/70">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-control border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function CategoryTile({ card, icon: Icon, accentType, action, onClick }: {
  card: CategoryCard; icon: LucideIcon; accentType: OppType; action?: React.ReactNode; onClick?: () => void;
}) {
  const accent = OPP_TYPE_ACCENT[accentType];
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", accent.pill)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{card.name}</p>
          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground/80">{card.description}</p>
        </div>
      </div>
      {card.searchTerms && card.searchTerms.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {card.searchTerms.map((t) => (
            <span key={t} className="rounded-pill border border-border/40 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/75">{t}</span>
          ))}
        </div>
      )}
      {action && <div className="mt-3">{action}</div>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn("rounded-card border bg-card/40 p-4 text-left transition-colors hover:bg-card/70", accent.ring)}>
        {inner}
      </button>
    );
  }
  return <div className={cn("rounded-card border bg-card/40 p-4", accent.ring)}>{inner}</div>;
}

function SourceCard({ source }: { source: ExternalSource }) {
  return (
    <div className="flex flex-col rounded-card border border-border/50 bg-card/40 p-4">
      <p className="text-sm font-semibold text-foreground">{source.name}</p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
        <span className="text-muted-foreground/55">Best for:</span> {source.bestFor}
      </p>
      {source.notes && <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground/75">{source.notes}</p>}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {source.tags.map((t) => (
          <span key={t} className="rounded-pill border border-border/40 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground/75">{t}</span>
        ))}
      </div>
      {source.searchTerms && source.searchTerms.length > 0 && (
        <p className="mt-2 text-[10.5px] text-muted-foreground/55">
          <span className="font-medium">Try searching:</span> {source.searchTerms.join(", ")}
        </p>
      )}
      <div className="mt-3 pt-1">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${source.name} in a new tab`}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Open {source.name} <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-border/50 bg-muted/[0.04] px-5 py-10 text-center">
      <p className="text-sm font-medium text-foreground/80">No matching opportunities found yet.</p>
      <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted-foreground/65">
        Try broadening your filters, or switch the Type to &ldquo;All&rdquo; to see every source.
      </p>
    </div>
  );
}
