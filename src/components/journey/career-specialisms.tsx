'use client';

/**
 * Career Specialisms — renders in the Understand tab as "Where This Can Lead".
 *
 * The data is a shared trunk that branches into specialisms after the core
 * training, so we draw it that way: a "shared foundation" trunk node with a
 * vertical rail, and each specialism hanging off it as a branch node. Each
 * branch expands inline to its setting, day-to-day, and specialisation step;
 * a branch that is ALSO a standalone career links out instead of expanding.
 *
 * The connectors are pure CSS (a centred rail + node dots in a fixed-width
 * gutter column) — no graph library, no measurement, SSR-safe, and robust to
 * branches changing height when they expand. The same layout works on mobile
 * and desktop (it's vertical, so there's no horizontal scroll).
 *
 * Data + design: src/lib/career-specialisms.ts
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, GraduationCap, ArrowRight, GitBranch } from 'lucide-react';
import { getSpecialisms, getFoundation } from '@/lib/career-specialisms';
import { useCareerCatalog } from '@/hooks/use-career-catalog';
import { cn } from '@/lib/utils';

interface CareerSpecialismsProps {
  careerId: string;
}

/**
 * The connector gutter for one tree row: a centred vertical rail segment plus
 * the node dot, aligned to the card's title line. `variant` controls how far
 * the rail runs so the line is continuous between nodes but never overshoots
 * the first/last one.
 */
function RailCell({
  variant,
  accent = false,
}: {
  variant: 'trunk' | 'middle' | 'last';
  accent?: boolean;
}) {
  return (
    <div className="relative w-4 shrink-0 self-stretch" aria-hidden="true">
      <span
        className={cn(
          'absolute left-1/2 w-px -translate-x-1/2 bg-border/55',
          variant === 'trunk' && 'top-[22px] bottom-0',
          variant === 'middle' && 'inset-y-0',
          variant === 'last' && 'top-0 h-[22px]',
        )}
      />
      <span
        className={cn(
          'absolute left-1/2 top-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full',
          accent
            ? 'h-2.5 w-2.5 bg-teal-500 ring-4 ring-background'
            : 'h-2 w-2 border border-border bg-background',
        )}
      />
    </div>
  );
}

export function CareerSpecialisms({ careerId }: CareerSpecialismsProps) {
  const { getCareerById } = useCareerCatalog();
  const branches = useMemo(() => getSpecialisms(careerId), [careerId]);
  const foundation = useMemo(() => getFoundation(careerId), [careerId]);
  const [openId, setOpenId] = useState<string | null>(null);

  if (branches.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground/60 leading-relaxed">
        Most people start on the same path, then specialise. Here&rsquo;s where this
        career can branch — same foundation, different day-to-day.
      </p>

      <div>
        {/* Trunk — the shared foundation everyone walks before diverging */}
        <div className="flex gap-3">
          <RailCell variant="trunk" accent />
          <div className="min-w-0 flex-1 pb-2.5">
            <div className="rounded-card border border-teal-500/30 bg-teal-500/[0.06] p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-teal-600/85 dark:text-teal-400/85">
                <GitBranch className="h-3 w-3" />
                Shared foundation
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                {foundation ?? 'Most people walk the same early path, then specialise.'}
              </p>
            </div>
          </div>
        </div>

        {/* Branches */}
        {branches.map((branch, idx) => {
          const isLast = idx === branches.length - 1;
          // Promotion: if a branch is also a standalone career, link out rather
          // than expanding. Falls back to inline if the id no longer resolves.
          const promoted =
            branch.linksToCareerId && getCareerById(branch.linksToCareerId)
              ? branch.linksToCareerId
              : null;
          const isOpen = openId === branch.id;

          return (
            <div key={branch.id} className="flex gap-3">
              <RailCell variant={isLast ? 'last' : 'middle'} />
              <div className="min-w-0 flex-1 pb-2.5">
                {promoted ? (
                  <Link
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
                ) : (
                  <div className="overflow-hidden rounded-card border border-border/40 bg-card/40">
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
                        <p className="text-xs leading-relaxed text-foreground/70">{branch.blurb}</p>

                        <div>
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                            A typical day leans on
                          </p>
                          <ul className="space-y-1">
                            {branch.dayToDay.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground/65"
                              >
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
                            <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/65">
                              {branch.specialisationStep}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
