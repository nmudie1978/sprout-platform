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
  getInstitutionById,
  getAdvancedCareerMapping,
  resolveCareer,
  getAlternativePaths,
  getCareerSummary,
  type ProgrammeWithInstitution,
  type Institution,
} from '@/lib/education';
import {
  computeProgrammeAlignment,
  type AlignmentResult,
  type FoundationContext,
} from '@/lib/education/programme-alignment';
import { BrowserFilters, type FilterState } from './browser-filters';
import { AlignmentBadge } from './alignment-badge';

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
  const summary = useMemo(() => (resolvedId ? getCareerSummary(resolvedId) : null), [resolvedId]);
  const alternativePaths = useMemo(() => (resolvedId ? getAlternativePaths(resolvedId) : []), [resolvedId]);

  const allProgrammes = useMemo<ProgrammeWithInstitution[]>(() => {
    if (!resolvedId) return [];
    return getProgrammesForCareer(resolvedId);
  }, [resolvedId]);

  const alignments = useMemo<Map<string, AlignmentResult>>(() => {
    const map = new Map<string, AlignmentResult>();
    for (const prog of allProgrammes) {
      map.set(prog.id, computeProgrammeAlignment(prog, foundation));
    }
    return map;
  }, [allProgrammes, foundation]);

  type ViewMode = 'list' | 'cards';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    country: '',
    type: '',
    alignment: '',
    city: '',
  });

  useEffect(() => {
    setFilters({ search: '', country: '', type: '', alignment: '', city: '' });
  }, [resolvedId]);

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
          Set a career goal from your dashboard or Career Radar to explore matching universities and programmes.
        </p>
      </div>
    );
  }

  if (allProgrammes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <h2 className="text-base font-semibold text-foreground/80 mb-1">
          No programmes found
        </h2>
        <p className="text-[12px] text-muted-foreground/75 max-w-[280px]">
          We&apos;re expanding our programme database for &ldquo;{careerTitle}&rdquo;. Try{' '}
          <a
            href={`https://utdanning.no/sok?q=${encodeURIComponent(careerTitle || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:underline"
          >
            utdanning.no
          </a>{' '}
          in the meantime.
        </p>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────

  return (
    <div
      className="space-y-6 rounded-2xl border border-teal-500/25 p-5 sm:p-6"
      style={{ boxShadow: '0 0 20px rgba(20,184,166,0.08), 0 0 50px rgba(20,184,166,0.04)' }}
    >
      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-card/90 via-card/80 to-teal-500/[0.03] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-teal-500/[0.06] blur-3xl pointer-events-none" />

        {/* Clickable header row — always visible */}
        <button
          type="button"
          onClick={() => setHeaderCollapsed((c) => !c)}
          className="relative w-full flex items-center gap-3 p-5 sm:p-6 text-left group"
          aria-expanded={!headerCollapsed}
        >
          <div className="h-10 w-10 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-teal-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-foreground/90 leading-tight flex items-center gap-2">
              <span>Study paths for{' '}<span className="text-teal-400">{careerTitle}</span></span>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span onClick={(e) => e.stopPropagation()}>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors cursor-help shrink-0" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">
                    Real universities and programmes that lead to this career — filtered by your location and subjects.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h1>
            {headerCollapsed && (
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                {groups.length} institution{groups.length !== 1 ? 's' : ''} &middot; {allProgrammes.length} programme{allProgrammes.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-transform duration-200 shrink-0',
            headerCollapsed && '-rotate-90',
          )} />
        </button>

        {/* Collapsible content */}
        {!headerCollapsed && (
          <div className="relative px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
            {summary && (
              <p className="text-[12px] text-muted-foreground/75 leading-relaxed -mt-2">
                {summary}
              </p>
            )}

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2">
              <StatPill
                icon={Building2}
                label={`${groups.length} institution${groups.length !== 1 ? 's' : ''}`}
              />
              <StatPill
                icon={BookOpen}
                label={`${allProgrammes.length} programme${allProgrammes.length !== 1 ? 's' : ''}`}
              />
              <StatPill
                icon={MapPin}
                label={countries.map((c) => COUNTRY_FLAGS[c] ?? c).join(' ')}
              />
              {alignedCount > 0 && (
                <StatPill
                  icon={Sparkles}
                  label={`${alignedCount} aligned`}
                  accent
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Info cards (advanced route / alternative paths) ────────── */}
      {!headerCollapsed && (advanced || alternativePaths.length > 0) && (
        <div className={cn('grid gap-3', advanced && alternativePaths.length > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
          {advanced && (
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.04] px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider">Specialisation route</span>
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

      {/* ── Filters ───────────────────────────────────────────────── */}
      <BrowserFilters filters={filters} onChange={setFilters} cities={cities} />

      {/* ── Results count + view toggle ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/70">
          {filtered.length} programme{filtered.length !== 1 ? 's' : ''} at{' '}
          {groups.length} institution{groups.length !== 1 ? 's' : ''}
          {foundation?.currentSubjects && foundation.currentSubjects.length > 0 && (
            <> &middot; alignment based on {foundation.currentSubjects.length} subject{foundation.currentSubjects.length !== 1 ? 's' : ''}</>
          )}
        </p>
        <div className="inline-flex items-center gap-0.5 rounded-md border border-border/40 bg-background/40 p-0.5">
          {([
            { id: 'list' as const, icon: AlignJustify, label: 'List' },
            { id: 'cards' as const, icon: LayoutGrid, label: 'Cards' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              title={label}
              aria-label={`${label} view`}
              aria-pressed={viewMode === id}
              className={cn(
                'inline-flex items-center justify-center rounded h-6 w-6 transition-colors',
                viewMode === id
                  ? 'bg-teal-500/15 text-teal-300'
                  : 'text-muted-foreground/55 hover:text-foreground/85 hover:bg-muted/20',
              )}
            >
              <Icon className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Institution cards ─────────────────────────────────────── */}
      {groups.length > 0 ? (
        <>
          {/* Cards view — flat grid of all programmes as standalone cards */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((prog) => {
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

          {/* List view — table-style rows matching Explore Careers */}
          {viewMode === 'list' && (
            <>
              {/* Column headers */}
              <div className="inline-grid grid-cols-[1fr_10rem_6rem_5rem_5rem_7rem] items-center gap-x-4 px-3 py-1 border border-b-0 rounded-t-md bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-full">
                <span>Programme</span>
                <span>Institution</span>
                <span>Location</span>
                <span className="text-center">Duration</span>
                <span className="text-center">Alignment</span>
                <span>Learn more</span>
              </div>
              <div className="border rounded-b-md overflow-hidden bg-background w-full">
                {filtered.map((prog) => {
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
                      {/* Programme */}
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-sm flex-shrink-0 leading-none">{COUNTRY_FLAGS[prog.country] ?? ''}</span>
                        <span className="text-xs font-medium truncate group-hover:text-teal-300 transition-colors">{prog.englishName}</span>
                      </span>

                      {/* Institution */}
                      <span className="text-[11px] text-muted-foreground truncate">
                        {inst?.name ?? prog.institution}
                      </span>

                      {/* Location */}
                      <span className="text-[11px] text-muted-foreground truncate">
                        {prog.city}
                      </span>

                      {/* Duration */}
                      <span className="text-[11px] text-muted-foreground text-center">
                        {prog.duration}
                      </span>

                      {/* Alignment */}
                      <span className="flex items-center justify-center">
                        <AlignmentBadge status={alignment?.status ?? 'unknown'} matchedSubjects={alignment?.matchedSubjects} missingSubjects={alignment?.missingSubjects} compact />
                      </span>

                      {/* Learn more */}
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
    </div>
  );
}

// ── Stat pill ───────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
        accent
          ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400'
          : 'border-border/15 bg-muted/[0.06] text-muted-foreground/75',
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}
