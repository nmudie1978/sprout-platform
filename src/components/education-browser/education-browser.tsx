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
  List,
  AlignJustify,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { InstitutionCard } from './institution-card';
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

  type ViewMode = 'detailed' | 'cards' | 'compact';
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');

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
    <div className="space-y-6">
      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-card/90 via-card/80 to-teal-500/[0.03] p-5 sm:p-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-teal-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Title row */}
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground/90 leading-tight">
                Study paths for{' '}
                <span className="text-teal-400">{careerTitle}</span>
              </h1>
              {summary && (
                <p className="text-[12px] text-muted-foreground/75 leading-relaxed mt-1 max-w-xl">
                  {summary}
                </p>
              )}
            </div>
          </div>

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
      </div>

      {/* ── Info cards (advanced route / alternative paths) ────────── */}
      {(advanced || alternativePaths.length > 0) && (
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
            { id: 'detailed' as const, icon: LayoutGrid, label: 'Detailed' },
            { id: 'cards' as const, icon: List, label: 'Cards' },
            { id: 'compact' as const, icon: AlignJustify, label: 'Compact' },
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
          {/* Detailed view — 2-col grid with institution cards + programme carousel */}
          {viewMode === 'detailed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <InstitutionCard
                  key={group.institution.id}
                  institution={group.institution}
                  programmes={group.programmes}
                  alignments={alignments}
                  routeNote={advanced?.specialisationNote}
                />
              ))}
            </div>
          )}

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
                      <AlignmentBadge status={alignment.status} compact />
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

          {/* Compact view — dense table-like rows */}
          {viewMode === 'compact' && (
            <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/25">
              {filtered.map((prog) => {
                const inst = getInstitutionById(prog.institutionId);
                const alignment = alignments.get(prog.id);
                return (
                  <a
                    key={prog.id}
                    href={prog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-500/[0.04] transition-colors group"
                  >
                    <span className="text-[11px] shrink-0">{COUNTRY_FLAGS[prog.country] ?? ''}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground/90 truncate group-hover:text-teal-300 transition-colors">
                        {prog.englishName}
                      </p>
                      <p className="text-[10px] text-muted-foreground/65 truncate">
                        {inst?.name ?? prog.institution} &middot; {prog.city} &middot; {prog.duration}
                      </p>
                    </div>
                    <AlignmentBadge status={alignment?.status ?? 'unknown'} compact />
                  </a>
                );
              })}
            </div>
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
