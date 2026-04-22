'use client';

/**
 * Top Employers — horizontal carousel in the Understand tab.
 * Compact cards with favicon, name, industry, and careers link.
 */

import { useMemo, useRef } from 'react';
import { Building2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopEmployers, type Employer } from '@/lib/career-employers';

interface TopEmployersProps {
  careerId: string | null;
}

function EmployerCard({ emp }: { emp: Employer }) {
  const domain = emp.careersUrl
    ? new URL(emp.careersUrl).hostname.replace('www.', '')
    : null;

  const content = (
    <div className="flex flex-col justify-between min-w-[180px] max-w-[200px] shrink-0 rounded-lg border border-border/30 bg-card/40 px-3 py-2.5 hover:border-border/50 hover:bg-card/60 transition-colors group h-full">
      <div className="flex items-center gap-2 mb-1.5">
        {domain ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            width={16}
            height={16}
            className="rounded shrink-0"
          />
        ) : (
          <Building2 className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        )}
        <span className="text-[11px] font-medium text-foreground/90 truncate">
          {emp.name}
        </span>
      </div>
      <p className="text-[9px] text-muted-foreground/55 truncate">
        {emp.industry} · {emp.size}
      </p>
      {emp.careersUrl && (
        <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] text-primary/70 group-hover:text-primary font-medium transition-colors">
          Careers <ExternalLink className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );

  if (emp.careersUrl) {
    return (
      <a href={emp.careersUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export function TopEmployers({ careerId }: TopEmployersProps) {
  const employers = useMemo(() => (careerId ? getTopEmployers(careerId) : []), [careerId]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (employers.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="space-y-2">
      {/* Scroll arrows */}
      {employers.length > 3 && (
        <div className="flex justify-end gap-1">
          <button type="button" onClick={() => scroll('left')} className="p-1 rounded hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors" aria-label="Scroll left">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => scroll('right')} className="p-1 rounded hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors" aria-label="Scroll right">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {employers.map((emp) => (
          <EmployerCard key={emp.name} emp={emp} />
        ))}
      </div>
    </div>
  );
}
