'use client';

/**
 * Career type-ahead backed by the full Endeavrly catalogue (via useCareerCatalog).
 * Used by the "Not in work" starting-point editor for "What did you do before?".
 * Selecting a suggestion stores the career's canonical title; free typing is
 * still allowed (a custom occupation is fine, it just won't match a card).
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useCareerCatalog } from '@/hooks/use-career-catalog';
import { cn } from '@/lib/utils';

interface CareerPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CareerPicker({ value, onChange, placeholder = 'Search careers — e.g. Interior designer' }: CareerPickerProps) {
  const { searchCareers, careers } = useCareerCatalog();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep the visible text in sync when the dialog reloads a saved value.
  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim();
    const list = q ? searchCareers(q) : careers;
    return list.slice(0, 8);
  }, [query, searchCareers, careers]);

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-indigo-500/40"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-border/30 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto py-1">
            {suggestions.map((c) => {
              const selected = c.title.toLowerCase() === query.trim().toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  // mouseDown (not click) so selection fires before the input blurs
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(c.title);
                    onChange(c.title);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-[11px] hover:bg-muted/30 transition-colors',
                    selected ? 'text-indigo-300 font-medium' : 'text-foreground/80',
                  )}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
