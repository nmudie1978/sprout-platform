'use client';

/**
 * Career Specialisms — renders in the Understand tab as "Where This Can Lead".
 *
 * Shows the branches a base career splits into after the core training (e.g.
 * a psychologist becomes a clinical / child / forensic psychologist). Each
 * branch expands inline to reveal its setting, day-to-day, and the extra
 * specialisation step. A branch that is ALSO a standalone career links out to
 * that career instead of expanding.
 *
 * Data + design: src/lib/career-specialisms.ts
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, GraduationCap, ArrowRight } from 'lucide-react';
import { getSpecialisms } from '@/lib/career-specialisms';
import { getCareerById } from '@/lib/career-pathways';
import { cn } from '@/lib/utils';

interface CareerSpecialismsProps {
  careerId: string;
}

export function CareerSpecialisms({ careerId }: CareerSpecialismsProps) {
  const branches = useMemo(() => getSpecialisms(careerId), [careerId]);
  const [openId, setOpenId] = useState<string | null>(null);

  if (branches.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground/60 leading-relaxed">
        Most people start on the same path, then specialise. Here&rsquo;s where this
        career can branch — same foundation, different day-to-day.
      </p>

      <div className="space-y-2">
        {branches.map((branch) => {
          // Promotion: if this branch is also a standalone career, link out
          // rather than expanding. Falls back to inline if the target id no
          // longer resolves — never a dead link.
          const promoted =
            branch.linksToCareerId && getCareerById(branch.linksToCareerId)
              ? branch.linksToCareerId
              : null;

          if (promoted) {
            return (
              <Link
                key={branch.id}
                href={`/careers?open=${promoted}`}
                className="group flex items-center gap-3 rounded-card border border-border/40 bg-card/40 p-3.5 transition-colors hover:border-teal-500/40 hover:bg-teal-500/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground/85">{branch.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {branch.setting}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                  Explore career
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          }

          const isOpen = openId === branch.id;
          return (
            <div
              key={branch.id}
              className="rounded-card border border-border/40 bg-card/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : branch.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground/85">{branch.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {branch.setting}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-border/30 px-3.5 pb-3.5 pt-3">
                  <p className="text-xs text-foreground/70 leading-relaxed">{branch.blurb}</p>

                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                      A typical day leans on
                    </p>
                    <ul className="space-y-1">
                      {branch.dayToDay.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/65 leading-relaxed">
                          <span className="mt-[5px] h-1 w-1 shrink-0 rounded-pill bg-teal-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-start gap-2 rounded-control border border-border/20 bg-muted/[0.06] px-3 py-2">
                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                        How you get here
                      </p>
                      <p className="mt-0.5 text-[11px] text-foreground/65 leading-relaxed">
                        {branch.specialisationStep}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
