'use client';

/**
 * University & Course Browser
 *
 * Career → Institutions → Programmes → Modules (on demand)
 *
 * Driven by the user's active career goal. Surfaces real Nordic
 * institutions and programmes from the 3-layer education model,
 * with alignment signals computed from Foundation data.
 */

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  Search,
  Building2,
  BookOpen,
  MapPin,
  Info,
  Sparkles,
  Route,
  LayoutGrid,
  AlignJustify,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getProgrammesForCareer,
  getProgrammeById,
  getInstitutionById,
  getAllInstitutions,
  getAdvancedCareerMapping,
  resolveCareer,
  getAlternativePaths,
  getCareerRequirements,
  getRoutesForCareer,
  hasMultipleRoutes,
  type ProgrammeWithInstitution,
  type Institution,
  type CareerRequirements,
} from '@/lib/education';
import { isAcademicTrackCareer } from '@/lib/education/route-scope';
import { RoutePicker } from './route-picker';
import { StageBlock } from './stage-block';
import { getAllCareers } from '@/lib/career-pathways';
import {
  computeProgrammeAlignment,
  type AlignmentResult,
  type FoundationContext,
} from '@/lib/education/programme-alignment';
import { BrowserFilters, type FilterState } from './browser-filters';
import { AlignmentBadge } from './alignment-badge';
import { PaginationControls } from '@/components/ui/pagination-controls';

const PAGE_SIZE = 5;

interface EducationBrowserProps {
  careerTitle: string | null;
  careerId?: string | null;
}

function useFoundation() {
  return useQuery<FoundationContext | null>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return null;
      const d = await res.json();
      return d?.educationContext ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

const COUNTRY_FLAGS: Record<string, string> = {
  NO: '🇳🇴',
  SE: '🇸🇪',
  DK: '🇩🇰',
  FI: '🇫🇮',
  IS: '🇮🇸',
};

export function EducationBrowser({ careerTitle, careerId }: EducationBrowserProps) {
  const { data: foundation } = useFoundation();

  const lookup = careerId || careerTitle || '';
  const resolvedId = useMemo(() => resolveCareer(lookup), [lookup]);
  const advanced = useMemo(() => (lookup ? getAdvancedCareerMapping(lookup) : null), [lookup]);
  const alternativePaths = useMemo(() => (resolvedId ? getAlternativePaths(resolvedId) : []), [resolvedId]);

  const careerProgrammes = useMemo<ProgrammeWithInstitution[]>(() => {
    if (!resolvedId) return [];
    return getProgrammesForCareer(resolvedId);
  }, [resolvedId]);

  // Phase 3 — route picker. Only surfaces when the career has >1
  // route. Selection persists per career in localStorage so a user
  // returning to the page lands on their last-picked route. Filters
  // careerProgrammes to programmes referenced by the selected route's
  // stages.
  const routes = useMemo(() => (resolvedId ? getRoutesForCareer(resolvedId) : []), [resolvedId]);
  const showRoutePicker = useMemo(() => (resolvedId ? hasMultipleRoutes(resolvedId) : false), [resolvedId]);
  const routeStorageKey = resolvedId ? `study-path-route--${resolvedId}` : null;

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  // Hydrate from localStorage in an effect (not the useState initializer)
  // so SSR + iOS Safari private tabs (where localStorage throws) don't
  // crash the render.
  useEffect(() => {
    if (!routeStorageKey) return;
    try {
      const persisted = window.localStorage.getItem(routeStorageKey);
      if (persisted) setSelectedRouteId(persisted);
      else setSelectedRouteId(null);
    } catch {
      setSelectedRouteId(null);
    }
  }, [routeStorageKey]);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId);
    if (!routeStorageKey) return;
    try {
      window.localStorage.setItem(routeStorageKey, routeId);
    } catch { /* private-tab — selection lives only for this session */ }
  };

  const activeRoute = useMemo(() => {
    if (!showRoutePicker) return null;
    return routes.find((r) => r.id === selectedRouteId) ?? routes.find((r) => r.isDefault) ?? routes[0] ?? null;
  }, [routes, selectedRouteId, showRoutePicker]);

  // The programmes the active route covers. When there's no picker
  // (single-route careers) we fall back to careerProgrammes. With a
  // picker, we resolve directly via getProgrammeById so a route can
  // reference programmes from other careers — e.g. project-manager's
  // "via engineering" route legitimately points at engineering /
  // software-developer programmes. Filtering only against
  // careerProgrammes would wipe those out.
  const allProgrammes = useMemo<ProgrammeWithInstitution[]>(() => {
    if (!activeRoute) return careerProgrammes;
    const seen = new Set<string>();
    const out: ProgrammeWithInstitution[] = [];
    for (const stage of activeRoute.stages) {
      for (const pid of stage.programmeIds) {
        if (seen.has(pid)) continue;
        seen.add(pid);
        const p = getProgrammeById(pid);
        if (p) out.push(p);
      }
    }
    return out;
  }, [careerProgrammes, activeRoute]);

  const alignments = useMemo<Map<string, AlignmentResult>>(() => {
    const map = new Map<string, AlignmentResult>();
    for (const prog of allProgrammes) {
      map.set(prog.id, computeProgrammeAlignment(prog, foundation));
    }
    return map;
  }, [allProgrammes, foundation]);

  const viewMode = 'list' as 'list' | 'cards';

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    country: '',
    type: '',
    alignment: '',
    city: '',
  });
  // Pagination — 1-indexed to match PaginationControls' contract. We
  // reset to page 1 whenever the active career changes (the list is
  // entirely different data) and also whenever filters change so the
  // user never lands on an empty trailing page.
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilters({ search: '', country: '', type: '', alignment: '', city: '' });
    setPage(1);
  }, [resolvedId]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filtered = useMemo(() => {
    let list = allProgrammes;
    if (filters.country) list = list.filter((p) => p.country === filters.country);
    if (filters.type) list = list.filter((p) => p.type === filters.type);
    if (filters.city) list = list.filter((p) => p.city === filters.city);
    if (filters.alignment) {
      list = list.filter((p) => alignments.get(p.id)?.status === filters.alignment);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.programme.toLowerCase().includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          p.institution.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allProgrammes, filters, alignments]);

  const groups = useMemo(() => {
    const map = new Map<string, { institution: Institution; programmes: ProgrammeWithInstitution[] }>();
    for (const prog of filtered) {
      const inst = getInstitutionById(prog.institutionId);
      if (!inst) continue;
      let group = map.get(inst.id);
      if (!group) {
        group = { institution: inst, programmes: [] };
        map.set(inst.id, group);
      }
      group.programmes.push(prog);
    }
    return [...map.values()].sort(
      (a, b) => b.programmes.length - a.programmes.length || a.institution.name.localeCompare(b.institution.name),
    );
  }, [filtered]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const prog of allProgrammes) if (prog.city) set.add(prog.city);
    return [...set].sort();
  }, [allProgrammes]);

  // Stats
  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const prog of allProgrammes) if (prog.country) set.add(prog.country);
    return [...set];
  }, [allProgrammes]);
  const alignedCount = useMemo(
    () => [...alignments.values()].filter((a) => a.status === 'aligned').length,
    [alignments],
  );

  // ── Empty states ────────────────────────────────────────────────────

  if (!careerTitle && !careerId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/10 flex items-center justify-center mb-4">
          <GraduationCap className="h-6 w-6 text-teal-400" />
        </div>
        <h2 className="text-base font-semibold text-foreground/80 mb-1">No career selected</h2>
        <p className="text-[12px] text-muted-foreground/75 max-w-[280px]">
          Set a Primary Goal from your dashboard or Career Radar to explore matching universities and programmes.
        </p>
      </div>
    );
  }

  // ── Fallback: career has no university programme data ──────────────
  //
  // Many careers (chef, electrician, YouTuber, soldier, trader, etc.)
  // don't follow a university pathway and so have no entries in
  // programmes.json. Instead of dead-ending the user with "No
  // programmes found", surface what we DO know: the structured
  // career-requirements record (school subjects → entry-level role
  // → progression) plus the Career object's educationPath summary.
  // This way every career renders SOMETHING useful.
  if (allProgrammes.length === 0) {
    const requirements = careerTitle ? getCareerRequirements(careerTitle) : null;
    const career = careerTitle
      ? getAllCareers().find((c) => c.title.toLowerCase() === careerTitle.toLowerCase())
      : null;

    return (
      <PathwayFallbackView
        careerTitle={careerTitle ?? ''}
        requirements={requirements}
        alternativePaths={alternativePaths}
      />
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────
  //
  // The custom hero card + outer border/glow wrapper that used to wrap
  // this view have both been removed. The section is now rendered
  // inside a standard SectionCard + SectionHeader at the call site
  // (my-journey page) so it matches "A Typical Day", "Career Presence
  // & Tools" and the other Understand-tab sections. Collapse state
  // lives at the parent level via uCollapsed('u-study-path').

  return (
    <div className="space-y-4">
      {/* Study Path section is deliberately 100% structured pathway
          data — no narrative prose. The career-summary paragraph
          that used to sit here ("In Norway, becoming a doctor
          requires...") was removed because it reads as a "how to
          become" overview, which belongs to Discover / Understand's
          other sections, not Study Path. What this section contains
          now: specialisation notes, alternative routes, institution
          and programme cards, filters, and the utdanning.no help
          link — all structured, all route-to-entry focused. */}

      {/* ── Info cards (advanced route / alternative paths) ────────── */}
      {(advanced || alternativePaths.length > 0) && (
        <div className={cn('grid gap-3', advanced && alternativePaths.length > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
          {advanced && (
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.04] px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider">Career pathway</span>
              </div>
              <p className="text-[12px] text-foreground/85 leading-relaxed">
                {advanced.specialisationNote}
              </p>
              <p className="text-[10px] text-blue-300/40 mt-1.5">
                Programmes below are for the foundational degree.
              </p>
            </div>
          )}
          {alternativePaths.length > 0 && (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Route className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">Alternative routes</span>
              </div>
              <ul className="space-y-1">
                {alternativePaths.map((path) => (
                  <li key={path} className="text-[12px] text-foreground/85 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400/60 mt-1.5 h-1 w-1 rounded-full bg-amber-400/60 shrink-0" />
                    {path}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filters intentionally hidden — the curated programme list is
          already the right answer for the user's chosen career, so the
          search + country/type/city/fit chips were removed to reduce
          surface area. Filter state is still initialised to empty
          defaults so the `filtered` useMemo passes every programme
          through unchanged. */}

      {/* ── Route picker (Phase 3) ────────────────────────────────
          Only renders when the career has >1 route. Selecting a route
          filters the programmes table below to only programmes the
          route's stages reference. Selection persists per career in
          localStorage. */}
      {showRoutePicker && (
        <RoutePicker
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelect={handleRouteSelect}
        />
      )}

      {/* ── Single-route disclaimer ──────────────────────────────────
          Until the multi-route Study Path rework lands per career,
          academic-track careers without multiple routes yet show this
          honest "more is coming" line. Auto-hides as soon as the
          route picker is visible (i.e. once Phase 4 fills in
          alternative routes for this career). */}
      {!showRoutePicker && isAcademicTrackCareer(resolvedId) && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            <span className="font-medium text-amber-200">Showing the most common route.</span>{' '}
            We&apos;re adding alternative pathways (counselling, lateral entry, study abroad, etc.) for this career soon.
          </p>
        </div>
      )}

      {/* ── Stage-based view (Phase 3.5) ─────────────────────────────
          When the picker is visible, the route's stages are the
          dominant content unit — we render each stage as a vertical
          block (icon, title, duration, description, programmes mini-
          list, outcome) instead of the flat-table view used for
          single-route careers. Stages without programmes still show
          their description + outcome — the flat table can't represent
          credential / experience steps at all. */}
      {showRoutePicker && activeRoute && (
        <div className="space-y-1 pt-1">
          {activeRoute.stages.map((stage, idx) => {
            // Resolve programmes for THIS stage only (independent of
            // the global `allProgrammes` list). Same broken-URL filter
            // applies via getProgrammeById.
            const stageProgs: ProgrammeWithInstitution[] = [];
            const seen = new Set<string>();
            for (const pid of stage.programmeIds) {
              if (seen.has(pid)) continue;
              seen.add(pid);
              const p = getProgrammeById(pid);
              if (p) stageProgs.push(p);
            }
            return (
              <StageBlock
                key={stage.id}
                stage={stage}
                programmes={stageProgs}
                stepNumber={idx + 1}
                isLast={idx === activeRoute.stages.length - 1}
              />
            );
          })}
        </div>
      )}

      {/* ── Results count + pagination slice (single-route flat table) ──
          Skipped entirely when the route picker is showing — the
          stage-based view above replaces it. */}
      {!showRoutePicker && (() => {
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, filtered.length);
        const pageData = filtered.slice(start, end);
        return (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground/70">
                {filtered.length} programme{filtered.length !== 1 ? 's' : ''} at{' '}
                {groups.length} institution{groups.length !== 1 ? 's' : ''}
                {filtered.length > PAGE_SIZE && (
                  <> &middot; showing {start + 1}–{end}</>
                )}
                {foundation?.currentSubjects && foundation.currentSubjects.length > 0 && (
                  <> &middot; alignment based on {foundation.currentSubjects.length} subject{foundation.currentSubjects.length !== 1 ? 's' : ''}</>
                )}
              </p>
            </div>

            {groups.length > 0 ? (
              <>
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {pageData.map((prog) => {
                      const inst = getInstitutionById(prog.institutionId);
                      const alignment = alignments.get(prog.id) ?? { status: 'unknown' as const, reason: '', matchedSubjects: [], missingSubjects: [] };
                      return (
                        <div
                          key={prog.id}
                          className="rounded-xl border border-border/40 bg-card/60 p-3.5 hover:border-teal-500/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-[13px] font-semibold text-foreground/90 leading-snug line-clamp-2">
                              {prog.englishName}
                            </h4>
                            <AlignmentBadge status={alignment.status} matchedSubjects={alignment.matchedSubjects} missingSubjects={alignment.missingSubjects} compact />
                          </div>
                          <p className="text-[11px] text-muted-foreground/70 mb-1 truncate">{prog.programme}</p>
                          <p className="text-[11px] text-foreground/75 font-medium mb-2">
                            {inst?.name ?? prog.institution}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/65">
                            <span>{COUNTRY_FLAGS[prog.country] ?? prog.country} {prog.city}</span>
                            <span>&middot;</span>
                            <span>{prog.type}</span>
                            <span>&middot;</span>
                            <span>{prog.duration}</span>
                          </div>
                          {prog.url && (
                            <a
                              href={prog.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-[10px] text-teal-400 hover:underline"
                            >
                              Visit programme page →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'list' && (
                  <>
                    <div className="inline-grid grid-cols-[1fr_10rem_6rem_5rem_5rem_7rem] items-center gap-x-4 px-3 py-2 border border-b-0 rounded-t-md bg-teal-500/[0.08] text-[10px] font-bold uppercase tracking-wider text-teal-300 w-full">
                      <span>Programme</span>
                      <span>Institution</span>
                      <span>Location</span>
                      <span className="text-center">Duration</span>
                      <span className="text-center">Alignment</span>
                      <span>Learn more</span>
                    </div>
                    <div className="border rounded-b-md overflow-hidden bg-background w-full">
                      {pageData.map((prog) => {
                        const inst = getInstitutionById(prog.institutionId);
                        const alignment = alignments.get(prog.id);
                        return (
                          <a
                            key={prog.id}
                            href={prog.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid grid-cols-[1fr_10rem_6rem_5rem_5rem_7rem] items-center gap-x-4 px-3 py-1.5 border-b border-border/25 hover:bg-muted/50 transition-colors text-left group"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="text-sm flex-shrink-0 leading-none">{COUNTRY_FLAGS[prog.country] ?? ''}</span>
                              <span className="text-xs font-medium truncate group-hover:text-teal-300 transition-colors">{prog.englishName}</span>
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {inst?.name ?? prog.institution}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {prog.city}
                            </span>
                            {/* Duration — strip the verbose programme
                                breakdown ("5 years (3-year bachelor +
                                2-year master)" etc.) down to the leading
                                number. The full string is preserved in
                                the data and shown in the card view and
                                on the institution's own programme page. */}
                            <span className="text-[11px] text-muted-foreground text-center tabular-nums">
                              {prog.duration.match(/^(\d+(?:\.\d+)?)/)?.[1] ?? prog.duration}
                            </span>
                            <span className="flex items-center justify-center">
                              <AlignmentBadge status={alignment?.status ?? 'unknown'} matchedSubjects={alignment?.matchedSubjects} missingSubjects={alignment?.missingSubjects} compact />
                            </span>
                            <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                              Visit page
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Pagination — only renders when there are ≥2 pages
                    (PaginationControls handles that internally). 5 rows
                    per page is the product brief for this surface. */}
                <PaginationControls
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                  showItemCount={false}
                  className="pt-2"
                />
              </>
            ) : (
              <div className="py-14 text-center rounded-2xl border border-border/30 bg-card/30">
                <p className="text-sm text-muted-foreground/75 mb-1">No results match your filters</p>
                <button
                  type="button"
                  onClick={() => setFilters({ search: '', country: '', type: '', alignment: '', city: '' })}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}

// ── Stat detail ─────────────────────────────────────────────────────

function StatDetail({
  icon: Icon,
  label,
}: {
  icon: typeof Building2;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="text-[11px] font-medium">{label}</span>
    </span>
  );
}

// ── Pathway fallback view ─────────────────────────────────────────────
//
// Rendered when a career has no matching university programmes in the
// 3-layer programmes.json data — which is the case for most vocational
// careers (chef, electrician, hairdresser, plumber, etc.). Instead of
// dead-ending, this view reconstructs a "study paths" experience from
// the structured career-requirements.json fields, so every career —
// vocational or academic — gets the same visual language: institution
// cards as the headline, typical pathway steps as secondary context.
//
// See also: the main university-browser render at the top of this file.
// The two modes are intentionally visually similar so the user doesn't
// perceive a Chef career as showing a "different feature" from a
// Medicine career — Study Paths is Study Paths regardless of tier.

function PathwayFallbackView({
  careerTitle,
  requirements,
  alternativePaths,
}: {
  careerTitle: string;
  requirements: CareerRequirements | null;
  alternativePaths: string[];
}) {
  // Parse the free-text school list from universityPath.examples. The
  // source data is inconsistent: some careers have one clean entry per
  // school (["BI", "UiO", "Aalto"]), others pack them into a single
  // comma-delimited string (["OsloMet, Bergen UC, Culinary Institute"]).
  // Flatten both shapes into a list of individual institution names.
  const schools: string[] = requirements?.universityPath?.examples
    ? requirements.universityPath.examples
        .flatMap((entry) => entry.split(/\s*,\s*/))
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const programmeName = requirements?.universityPath?.programme ?? null;
  const programmeDuration = requirements?.universityPath?.duration ?? null;
  const applicationRoute = requirements?.universityPath?.applicationRoute ?? null;

  // Custom hero + outer border/glow wrapper removed. This mode is now
  // rendered inside a standard SectionCard + SectionHeader at the call
  // site, same as the university-browser mode above. Collapse state
  // lives at the parent level via uCollapsed('u-study-path').

  return (
    <div className="space-y-5">
      {/* Fallback mode renders ONLY structured pathway data for
          vocational / non-university careers: programme stat row,
          institution cards, alternative routes, help link. The
          narrative summary paragraph was removed to match the main
          university-browser mode's content model — Study Path is
          structured data, not prose. Content that reads as "how to
          become" or "typical day" lives in other Understand-tab
          sections (Career Overview, A Typical Day), not here. */}

      {/* Programme metadata — the stat row. Mirrors the stat pills the
          main university-browser mode shows above its card grid, so the
          two modes feel like one feature. */}
      {programmeName && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <StatDetail icon={GraduationCap} label={programmeName} />
          {programmeDuration && <StatDetail icon={BookOpen} label={programmeDuration} />}
          {applicationRoute && <StatDetail icon={Route} label={applicationRoute} />}
        </div>
      )}

      {/* Institution cards grid — the headline of the vocational view.
          Each school in universityPath.examples gets a standalone card
          linking to a utdanning.no search for that school + programme.
          Layout mirrors the university-browser's card grid so users
          perceive Study Paths as one feature, not two. */}
      {schools.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/30 bg-muted/[0.04] flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Schools offering {programmeName || 'this programme'}
            </p>
            <span className="text-[10px] text-muted-foreground/45 tabular-nums shrink-0">
              {schools.length} institution{schools.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3">
            {schools.map((school) => {
              const searchQuery = programmeName ? `${school} ${programmeName}` : school;
              const url = `https://utdanning.no/sok?q=${encodeURIComponent(searchQuery)}`;
              // Match school name against known institutions to get country flag
              const lowerSchool = school.toLowerCase();
              const matchedInst = getAllInstitutions().find(
                (inst) => inst.name.toLowerCase() === lowerSchool || inst.shortName.toLowerCase() === lowerSchool
              );
              const flag = matchedInst ? COUNTRY_FLAGS[matchedInst.country] : '🇳🇴';
              return (
                <a
                  key={school}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border/40 bg-card/60 p-3.5 hover:border-teal-500/30 transition-colors group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    {flag && <span className="text-sm shrink-0 mt-0.5">{flag}</span>}
                    <h4 className="text-[13px] font-semibold text-foreground/90 leading-snug line-clamp-2 group-hover:text-teal-300 transition-colors">
                      {school}
                    </h4>
                  </div>
                  {programmeName && (
                    <p className="text-[11px] text-muted-foreground/70 mb-1 truncate">
                      {programmeName}
                    </p>
                  )}
                  {programmeDuration && (
                    <p className="text-[10px] text-muted-foreground/65">{programmeDuration}</p>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-teal-400 group-hover:underline">
                    Visit school page →
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* "How this career works" step list and "What you'll do" daily
          tasks list have both been removed per product direction:
          vocational careers without a university degree should present
          only the alternative study path (institution cards above) and
          nothing else — those two sections duplicated information that
          already lives on the Discover tab's Career Overview card and
          the "What You'll Actually Do" section in Understand. */}

      {/* Alternative routes (if any) */}
      {alternativePaths.length > 0 && (
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Route className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">
              Alternative routes
            </span>
          </div>
          <ul className="space-y-1">
            {alternativePaths.map((path) => (
              <li key={path} className="text-[12px] text-foreground/85 leading-relaxed flex items-start gap-2">
                <span className="text-amber-400/60 mt-1.5 h-1 w-1 rounded-full bg-amber-400/60 shrink-0" />
                {path}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Help link */}
      <p className="text-[10px] text-muted-foreground/55 text-center">
        Looking for more options? Search{' '}
        <a
          href={`https://utdanning.no/sok?q=${encodeURIComponent(careerTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-400/80 hover:text-teal-400 hover:underline"
        >
          utdanning.no
        </a>{' '}
        for the latest programmes.
      </p>
    </div>
  );
}
