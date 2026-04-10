'use client';

/**
 * Programme Detail Sheet — slides up from the bottom (or right on
 * desktop) showing the full programme details, alignment explanation,
 * entry requirements, and on-demand module expansion.
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  Clock,
  MapPin,
  Globe,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgrammeWithInstitution, ModuleEntry } from '@/lib/education';
import { getModulesForProgramme } from '@/lib/education';
import type { AlignmentResult } from '@/lib/education/programme-alignment';

const TYPE_LABELS: Record<string, string> = {
  bachelor: 'Bachelor',
  master: 'Master',
  integrated: 'Integrated degree',
  vocational: 'Vocational',
  fagbrev: 'Fagbrev',
  phd: 'PhD',
  diploma: 'Diploma',
};

const ALIGNMENT_CONFIG = {
  aligned: {
    icon: CheckCircle2,
    label: 'Strong match',
    className: 'border-emerald-500/20 bg-emerald-500/[0.06]',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-300/80',
  },
  partial: {
    icon: AlertTriangle,
    label: 'Partial match',
    className: 'border-amber-500/20 bg-amber-500/[0.06]',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-300/80',
  },
  needs_attention: {
    icon: XCircle,
    label: 'Needs attention',
    className: 'border-rose-500/20 bg-rose-500/[0.06]',
    iconColor: 'text-rose-400',
    textColor: 'text-rose-300/80',
  },
  unknown: {
    icon: GraduationCap,
    label: '',
    className: '',
    iconColor: '',
    textColor: '',
  },
};

interface ProgrammeDetailSheetProps {
  programme: ProgrammeWithInstitution | null;
  alignment: AlignmentResult | null;
  routeNote?: string;
  open: boolean;
  onClose: () => void;
}

export function ProgrammeDetailSheet({
  programme: prog,
  alignment,
  routeNote,
  open,
  onClose,
}: ProgrammeDetailSheetProps) {
  const [showModules, setShowModules] = useState(false);
  const [modules, setModules] = useState<ModuleEntry[] | null>(null);
  const [loadingModules, setLoadingModules] = useState(false);

  // Reset on programme change
  useEffect(() => {
    setShowModules(false);
    setModules(null);
  }, [prog?.id]);

  const handleToggleModules = async () => {
    if (showModules) {
      setShowModules(false);
      return;
    }
    if (modules === null && prog) {
      setLoadingModules(true);
      const data = await getModulesForProgramme(prog.id);
      setModules(data);
      setLoadingModules(false);
    }
    setShowModules(true);
  };

  if (!prog) return null;

  const ac = alignment ? ALIGNMENT_CONFIG[alignment.status] : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-teal-400" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {prog.institution} &middot; {prog.city}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">
            {prog.englishName}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground/40">{prog.programme}</p>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* ── Key facts ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2">
            <FactCell icon={GraduationCap} label="Type" value={TYPE_LABELS[prog.type] ?? prog.type} />
            <FactCell icon={Clock} label="Duration" value={prog.duration} />
            <FactCell icon={MapPin} label="City" value={prog.city} />
            <FactCell icon={Globe} label="Language" value={prog.languageOfInstruction || 'Not specified'} />
          </div>

          {/* Tuition */}
          {prog.tuitionFee && (
            <div className="rounded-lg border border-border/15 bg-muted/[0.04] px-3.5 py-2.5">
              <p className="text-[10px] text-muted-foreground/45 uppercase tracking-wider mb-0.5">Tuition</p>
              <p className="text-[12px] text-foreground/75 font-medium capitalize">{prog.tuitionFee}</p>
            </div>
          )}

          {/* ── Route note (advanced careers) ──────────────────────── */}
          {routeNote && (
            <div className="flex items-start gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.04] px-3.5 py-2.5">
              <ArrowRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-300/70 leading-snug">{routeNote}</p>
            </div>
          )}

          {/* ── Alignment card ─────────────────────────────────────── */}
          {ac && alignment && alignment.status !== 'unknown' && (
            <div className={cn('rounded-xl border px-4 py-3', ac.className)}>
              <div className="flex items-center gap-2 mb-2">
                <ac.icon className={cn('h-3.5 w-3.5', ac.iconColor)} />
                <span className={cn('text-[11px] font-semibold', ac.textColor)}>{ac.label}</span>
              </div>
              {alignment.reason && (
                <p className="text-[11px] text-foreground/60 mb-2">{alignment.reason}</p>
              )}
              {(alignment.matchedSubjects.length > 0 || alignment.missingSubjects.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {alignment.matchedSubjects.slice(0, 5).map((s) => (
                    <span key={s} className="rounded-full bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 text-[9px] text-emerald-400 font-medium">
                      {s}
                    </span>
                  ))}
                  {alignment.missingSubjects.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 text-[9px] text-rose-400/70 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Entry requirements ─────────────────────────────────── */}
          {prog.entryRequirements && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                Entry requirements
              </p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                {prog.entryRequirements}
              </p>
            </div>
          )}

          {/* ── Career outcome ─────────────────────────────────────── */}
          {prog.careerOutcome && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                Where this leads
              </p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                {prog.careerOutcome}
              </p>
            </div>
          )}

          {/* ── Application route ──────────────────────────────────── */}
          <div className="rounded-lg border border-border/15 bg-muted/[0.04] px-3.5 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground/45 uppercase tracking-wider mb-0.5">Apply via</p>
              <p className="text-[12px] text-foreground/75 font-medium">{prog.applicationVia}</p>
            </div>
            <a
              href={prog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-[11px] font-medium text-teal-400 hover:bg-teal-500/15 transition-colors"
            >
              Visit programme
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* ── Modules (on demand) ────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={handleToggleModules}
              className="flex items-center gap-2 text-[11px] text-muted-foreground/50 hover:text-foreground/70 transition-colors w-full"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">Course modules</span>
              <span className="flex-1" />
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showModules && 'rotate-180')} />
            </button>

            {showModules && (
              <div className="mt-2.5">
                {loadingModules ? (
                  <div className="py-3 text-center">
                    <p className="text-[11px] text-muted-foreground/40">Loading modules...</p>
                  </div>
                ) : modules && modules.length > 0 ? (
                  (() => {
                    const byYear = new Map<number | undefined, ModuleEntry[]>();
                    for (const m of modules) {
                      const list = byYear.get(m.year) ?? [];
                      list.push(m);
                      byYear.set(m.year, list);
                    }
                    return (
                      <div className="space-y-3">
                        {[...byYear.entries()].map(([year, mods]) => (
                          <div key={year ?? 'none'}>
                            {year != null && (
                              <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider mb-1.5">
                                Year {year}
                              </p>
                            )}
                            <div className="space-y-1">
                              {mods.map((m, i) => (
                                <div
                                  key={`${m.name}-${i}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-border/10 bg-background/30 px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-[11px] text-foreground/70 truncate">
                                      {m.englishName || m.name}
                                    </p>
                                    {m.englishName && m.name !== m.englishName && (
                                      <p className="text-[9px] text-muted-foreground/35 truncate">{m.name}</p>
                                    )}
                                  </div>
                                  {m.credits && (
                                    <span className="text-[10px] text-muted-foreground/40 shrink-0 font-medium">
                                      {m.credits} ECTS
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="py-3 text-center rounded-lg border border-border/10 bg-background/20">
                    <p className="text-[11px] text-muted-foreground/40">
                      Module details not yet available for this programme.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Small helpers ───────────────────────────────────────────────────

function FactCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/10 bg-muted/[0.04] px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground/40" />
        <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-[12px] text-foreground/75 font-medium">{value}</p>
    </div>
  );
}
