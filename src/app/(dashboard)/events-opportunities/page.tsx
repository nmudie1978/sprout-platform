"use client";

import { useMemo, useState } from "react";
import {
  Search, ExternalLink, Compass, Users, DoorOpen, PencilRuler, MonitorPlay,
  Building2, Hammer, Briefcase, GraduationCap, BookOpen, Footprints, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { YouthEventsTable } from "@/components/insights/youth-events-table";
import { cn } from "@/lib/utils";
import {
  EVENT_CATEGORIES, OPPORTUNITY_CATEGORIES, EXTERNAL_SOURCES,
  OPP_TYPE_LABEL, OPP_TYPE_ACCENT, LOCATION_LABEL, AUDIENCE_LABEL,
  filterSources, filterCategories,
  type OppType, type LocationKey, type Audience, type CategoryCard, type ExternalSource,
} from "@/lib/data/events-opportunities";

const EVENT_ICON: Record<string, LucideIcon> = {
  "job-fairs": Users,
  "open-days": DoorOpen,
  "career-workshops": PencilRuler,
  webinars: MonitorPlay,
  "employer-discovery": Building2,
};

const OPP_ICON: Record<string, LucideIcon> = {
  apprenticeships: Hammer,
  internships: Briefcase,
  "graduate-programs": GraduationCap,
  "student-jobs": BookOpen,
  "entry-level": Footprints,
};

/** A safe external search for each event category (real Google query, opens in a new tab). */
const EVENT_SEARCH: Record<string, string> = {
  "job-fairs": "jobbmesse OR karrieredag Norge",
  "open-days": "åpen dag universitet høgskole Norge open day",
  "career-workshops": "karriereverksted CV workshop Norge",
  webinars: "karriere webinar online event Norge",
  "employer-discovery": "bedriftspresentasjon karriere Norge",
};
const googleSearch = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const TYPE_OPTIONS: (OppType | "all")[] = ["all", "events", "apprenticeships", "internships", "graduate-programs", "student-jobs", "entry-level"];
const LOCATION_OPTIONS: LocationKey[] = ["all", "oslo", "bergen", "trondheim", "stavanger", "remote"];
const AUDIENCE_OPTIONS: (Audience | "all")[] = ["all", "school-student", "student", "graduate", "career-changer", "returning"];

export default function EventsOpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<OppType | "all">("all");
  const [location, setLocation] = useState<LocationKey>("all");
  const [audience, setAudience] = useState<Audience | "all">("all");
  const [tab, setTab] = useState<"events" | "opportunities">("opportunities");

  // Picking a type nudges the relevant tab into view.
  const onType = (t: OppType | "all") => {
    setType(t);
    if (t === "events") setTab("events");
    else if (t !== "all") setTab("opportunities");
  };

  const sources = useMemo(
    () => filterSources(EXTERNAL_SOURCES, { query, type, location, audience }),
    [query, type, location, audience],
  );
  const eventCards = useMemo(() => filterCategories(EVENT_CATEGORIES, query), [query]);
  const oppCards = useMemo(() => {
    let cards = filterCategories(OPPORTUNITY_CATEGORIES, query);
    if (type !== "all" && type !== "events") cards = cards.filter((c) => c.type === type);
    return cards;
  }, [query, type]);

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

      {/* ── Search + filters ─────────────────────────────────────────── */}
      <div className="mt-5 rounded-card border border-border/40 bg-card/40 p-3 sm:p-4">
        <div className="relative">
          <label htmlFor="eo-search" className="sr-only">Search events and opportunities</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" aria-hidden />
          <input
            id="eo-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internships, apprenticeships, events, graduate programs..."
            className="w-full rounded-control border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect id="eo-type" label="Type" value={type} onChange={(v) => onType(v as OppType | "all")}
            options={TYPE_OPTIONS.map((t) => ({ value: t, label: t === "all" ? "All" : OPP_TYPE_LABEL[t as OppType] }))} />
          <FilterSelect id="eo-location" label="Location" value={location} onChange={(v) => setLocation(v as LocationKey)}
            options={LOCATION_OPTIONS.map((l) => ({ value: l, label: LOCATION_LABEL[l] }))} />
          <FilterSelect id="eo-audience" label="Audience" value={audience} onChange={(v) => setAudience(v as Audience | "all")}
            options={AUDIENCE_OPTIONS.map((a) => ({ value: a, label: a === "all" ? "Everyone" : AUDIENCE_LABEL[a as Audience] }))} />
        </div>
      </div>

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
              hold a dated listing. */}
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
                        href={googleSearch(EVENT_SEARCH[c.id] ?? c.name)}
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
          {oppCards.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/70">Opportunity types</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {oppCards.map((c) => (
                  <CategoryTile
                    key={c.id}
                    card={c}
                    icon={OPP_ICON[c.id] ?? Briefcase}
                    accentType={c.type ?? "entry-level"}
                    onClick={c.type ? () => onType(c.type as OppType) : undefined}
                    action={c.type && (
                      <span className="text-[12px] font-medium text-primary">See sources →</span>
                    )}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              Where to look {type !== "all" && type !== "events" ? `· ${OPP_TYPE_LABEL[type as OppType]}` : ""}
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
        Try broadening your filters or searching for internships, trainee, lærling, graduate, student, or junior.
      </p>
    </div>
  );
}
