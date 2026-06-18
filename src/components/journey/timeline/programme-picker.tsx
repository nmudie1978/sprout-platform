'use client';

/**
 * Study-programme type-ahead, backed by the same curated FIELD_OPTIONS as the
 * Career Radar "already studying" picker (#433). Selecting a suggestion stores
 * the field's canonical label so the programme resolves cleanly to a discipline
 * (driving the programme↔career fit badge). Free typing is preserved — a custom
 * programme is still allowed; it just won't drive the fit check.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { searchFields } from '@/lib/discover/field-options';
import { cn } from '@/lib/utils';

interface ProgrammePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProgrammePicker({ value, onChange }: ProgrammePickerProps) {
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

  const suggestions = useMemo(() => searchFields(query).slice(0, 8), [query]);

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Computer Science, Psychology, Law"
        className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-border/30 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto py-1">
            {suggestions.map((f) => {
              const selected = f.label.toLowerCase() === query.trim().toLowerCase();
              return (
                <button
                  key={f.id}
                  type="button"
                  // mouseDown (not click) so selection fires before the input blurs
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(f.label);
                    onChange(f.label);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-[11px] hover:bg-muted/30 transition-colors',
                    selected ? 'text-teal-400 font-medium' : 'text-foreground/80',
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
