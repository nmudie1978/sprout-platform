'use client';

import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import type { NordicCountry, ProgrammeType } from '@/lib/education';
import type { AlignmentStatus } from '@/lib/education/programme-alignment';

export interface FilterState {
  search: string;
  country: NordicCountry | '';
  type: ProgrammeType | '';
  alignment: AlignmentStatus | '';
  city: string;
}

interface BrowserFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  cities: string[];
}

const COUNTRIES: { value: NordicCountry | ''; label: string }[] = [
  { value: '', label: 'All countries' },
  { value: 'NO', label: '🇳🇴 Norway' },
  { value: 'SE', label: '🇸🇪 Sweden' },
  { value: 'DK', label: '🇩🇰 Denmark' },
  { value: 'FI', label: '🇫🇮 Finland' },
  { value: 'IS', label: '🇮🇸 Iceland' },
];

const TYPES: { value: ProgrammeType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'integrated', label: 'Integrated' },
  { value: 'vocational', label: 'Vocational' },
  { value: 'fagbrev', label: 'Fagbrev' },
];

const ALIGNMENT: { value: AlignmentStatus | ''; label: string }[] = [
  { value: '', label: 'Any fit' },
  { value: 'aligned', label: 'Aligned' },
  { value: 'partial', label: 'Partial' },
  { value: 'needs_attention', label: 'Needs attention' },
];

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-8 rounded-lg border border-border/20 bg-muted/10 px-2 text-[11px] text-foreground/70 focus:outline-none focus:border-teal-500/30 transition-colors appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function BrowserFilters({ filters, onChange, cities }: BrowserFiltersProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.search || filters.country || filters.type || filters.alignment || filters.city;

  const cityOptions = [
    { value: '', label: 'All cities' },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/65" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search programmes, institutions, cities..."
          className="w-full h-9 rounded-xl border border-border/20 bg-muted/10 pl-9 pr-8 text-[12px] text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:border-teal-500/30 transition-colors"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => set('search', '')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/65 hover:text-foreground/60 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect value={filters.country as any} options={COUNTRIES as any} onChange={(v) => set('country', v as any)} />
        <FilterSelect value={filters.type as any} options={TYPES as any} onChange={(v) => set('type', v as any)} />
        <FilterSelect value={filters.city} options={cityOptions} onChange={(v) => set('city', v)} />
        <FilterSelect value={filters.alignment as any} options={ALIGNMENT as any} onChange={(v) => set('alignment', v as any)} />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ search: '', country: '', type: '', alignment: '', city: '' })}
            className="text-[10px] text-muted-foreground/70 hover:text-foreground/70 transition-colors ml-1"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
