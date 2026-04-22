'use client';

/**
 * Top Employers — renders in the Understand tab.
 * Shows Norwegian companies where this career is most common.
 */

import { useMemo } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopEmployers, type Employer } from '@/lib/career-employers';

interface TopEmployersProps {
  careerId: string | null;
}

export function TopEmployers({ careerId }: TopEmployersProps) {
  const employers = useMemo(() => (careerId ? getTopEmployers(careerId) : []), [careerId]);

  if (employers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          Where people work in this role
        </h3>
      </div>

      <div className="rounded-lg border border-border/30 bg-card/40 overflow-hidden">
        {employers.map((emp, idx) => (
          <div
            key={emp.name}
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5',
              idx > 0 && 'border-t border-border/15',
            )}
          >
            {/* Name + industry */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground/85 truncate">
                {emp.name}
              </p>
              <p className="text-[10px] text-muted-foreground/55 truncate">
                {emp.industry} · {emp.size} in Norway
              </p>
            </div>

            {/* Careers link */}
            {emp.careersUrl && (
              <a
                href={emp.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-primary/70 hover:text-primary font-medium shrink-0 transition-colors"
              >
                Careers
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
