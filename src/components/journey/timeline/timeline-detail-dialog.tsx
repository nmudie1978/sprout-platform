'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronDown,
  Circle,
  CircleDot,
  CheckCircle2,
  Save,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { Lightbulb } from 'lucide-react';
import { FOUNDATION_ITEM_ID } from '../renderers/zigzag-renderer';
import { SUBJECT_GROUPS, ALL_SUBJECTS } from '@/lib/education/subject-list';
import { RealWorldSection } from './real-world-section';
import { getCertificationPath } from '@/lib/education';
import { Award, ExternalLink as ExtLink } from 'lucide-react';

/**
 * Returns a single contextual tip for a roadmap step — one key piece
 * of guidance that nudges the user toward the most useful action.
 */
function getStepTip(item: JourneyItem, careerTitle?: string | null): { text: string; link?: string } | null {
  const title = item.title.toLowerCase();

  // University application steps → Study Paths
  if (/apply.*universit|university.*appli|apply.*studi/i.test(title)) {
    const href = careerTitle
      ? `/my-journey#understand`
      : '/my-journey#understand';
    return {
      text: "Head to the Understand tab's Study Paths to explore programmes and check which courses align with your subjects.",
      link: href,
    };
  }

  // Begin university / start degree
  if (/begin.*universit|start.*degree|begin.*studi/i.test(title)) {
    return {
      text: "Use Study Paths in the Understand tab to compare programmes, entry requirements, and course alignment before you commit.",
      link: '/my-journey#understand',
    };
  }

  // Internship / work experience / volunteering
  if (/intern|work experience|volunteer|shadow|placement/i.test(title)) {
    return {
      text: "Check the Momentum section below your roadmap for live opportunities you can act on right now.",
    };
  }

  // School-related / exams / subjects
  if (/school|exam|subject|grade|coursework/i.test(title)) {
    return {
      text: "Make sure your Starting Point is up to date — your current subjects shape the alignment signals across your journey.",
    };
  }

  // Certification / qualification
  if (/certif|qualif|licence|accredit|diploma/i.test(title)) {
    return {
      text: "Explore the Understand tab to see which certifications are valued in this field and where to get them.",
      link: '/my-journey#understand',
    };
  }

  return null;
}

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  allItems?: JourneyItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  careerTitle?: string | null;
}

interface CardData {
  status: 'not_started' | 'in_progress' | 'done';
  notes: string;
  resourceLink: string;
  confidence: string;
  completedMicroActions?: number[];
  stickyNote?: string;
}

const STORAGE_KEY = 'roadmap-card-data';

export function loadCardData(itemId: string): CardData {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[itemId] || { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  } catch {
    return { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  }
}

function saveCardData(itemId: string, data: CardData) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[itemId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent fail
  }
}

/** Cycle progress: not_started → in_progress → done → not_started */
export function cycleProgress(itemId: string): CardData['status'] {
  const data = loadCardData(itemId);
  const next: CardData['status'] =
    data.status === 'not_started' ? 'in_progress' :
    data.status === 'in_progress' ? 'done' : 'not_started';
  saveCardData(itemId, { ...data, status: next });
  return next;
}

/**
 * Sequential gating: a step is only unlocked once every previous step
 * (and the Foundation anchor) is marked done. The Foundation card itself
 * is always unlocked — it's the starting point.
 */
export function isStepUnlocked(
  itemId: string,
  orderedItemIds: string[],
): boolean {
  if (itemId === FOUNDATION_ITEM_ID) return true;
  if (loadCardData(FOUNDATION_ITEM_ID).status !== 'done') return false;
  const idx = orderedItemIds.indexOf(itemId);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (loadCardData(orderedItemIds[i]).status !== 'done') return false;
  }
  return true;
}

/**
 * Cascade-fix the progress chain so it can never be inconsistent. Walks
 * the ordered ids in order; the moment we see a step that isn't `done`,
 * every later step that's still marked `done` is reset to `not_started`.
 *
 * Call this after any progress mutation (cycleProgress, dialog save,
 * Foundation Done toggle) so the chain stays valid: a later step can
 * never be done while an earlier step is unfinished.
 *
 * Returns true if anything was changed.
 */
export function enforceProgressChain(orderedItemIds: string[]): boolean {
  // Foundation is the implicit step 0.
  const ids = [FOUNDATION_ITEM_ID, ...orderedItemIds];
  let chainBroken = false;
  let mutated = false;
  for (const id of ids) {
    const data = loadCardData(id);
    if (chainBroken) {
      if (data.status === 'done' || data.status === 'in_progress') {
        try {
          const all = JSON.parse(localStorage.getItem('roadmap-card-data') || '{}');
          all[id] = { ...data, status: 'not_started' };
          localStorage.setItem('roadmap-card-data', JSON.stringify(all));
          mutated = true;
        } catch { /* silent */ }
      }
    } else if (data.status !== 'done') {
      chainBroken = true;
    }
  }
  return mutated;
}

const STATUS_OPTIONS = [
  { value: 'not_started' as const, label: 'Not started', icon: Circle, color: 'text-muted-foreground/75' },
  { value: 'in_progress' as const, label: 'In progress', icon: CircleDot, color: 'text-amber-500' },
  { value: 'done' as const, label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
];

const STAGE_OPTIONS = [
  { value: 'school' as const, label: 'School' },
  { value: 'college' as const, label: 'College' },
  { value: 'university' as const, label: 'University' },
  { value: 'other' as const, label: 'Other' },
];

const EDUCATION_STAGE_LABEL: Record<'school' | 'college' | 'university' | 'other', string> = {
  school: 'school',
  college: 'college',
  university: 'university',
  other: 'current',
};

export function TimelineDetailDialog({
  item,
  allItems,
  open,
  onOpenChange,
  onSaved,
  careerTitle,
}: TimelineDetailDialogProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CardData['status']>('not_started');
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Foundation-specific education fields
  const [eduStage, setEduStage] = useState<'school' | 'college' | 'university' | 'other'>('school');
  const [schoolName, setSchoolName] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  // User's age — drives both the default education stage and how we
  // arrange the picker (under-18 sees School first, 18+ sees it last
  // with a Vg3-only subtitle so it doesn't read as the assumed answer).
  const [userAge, setUserAge] = useState<number | null>(null);

  const isFoundation = item?.id === FOUNDATION_ITEM_ID;
  const orderedIds = (allItems ?? []).map(it => it.id);
  const unlocked = item ? isStepUnlocked(item.id, orderedIds) : true;

  // Load saved data when item changes
  useEffect(() => {
    if (item && open) {
      const data = loadCardData(item.id);
      setStatus(data.status || 'not_started');
      setCompletedActions(data.completedMicroActions || []);
      setDirty(false);

      // Load education context for foundation
      if (isFoundation) {
        // Fetch the user's age once on dialog open. We need it for two
        // independent reasons: (1) defaulting the picker to a sensible
        // stage when no saved context exists, and (2) re-ordering the
        // picker tabs so 18+ users don't see "School" front-and-centre.
        const agePromise = fetch('/api/profile')
          .then(r => r.ok ? r.json() : null)
          .then(profile => {
            const dob = profile?.user?.dateOfBirth;
            if (!dob) return null;
            const birth = new Date(dob);
            const now = new Date();
            let age = now.getFullYear() - birth.getFullYear();
            const m = now.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
            return age;
          })
          .catch(() => null);

        Promise.all([
          fetch('/api/journey/education-context').then(r => r.ok ? r.json() : null).catch(() => null),
          agePromise,
        ]).then(([d, age]) => {
          if (typeof age === 'number') setUserAge(age);

          const ctx = d?.educationContext;
          if (ctx) {
            setEduStage(ctx.stage || 'school');
            setSchoolName(ctx.schoolName || '');
            setStudyProgram(ctx.studyProgram || '');
            setExpectedCompletion(ctx.expectedCompletion || '');
            setSubjects(ctx.currentSubjects || []);
            return;
          }

          // No saved context yet — pick a sensible default based on age.
          // Under 18: almost certainly still in school (Videregående).
          // 18 and over: it's a coin flip — they could be in Vg3, at
          // university, in a vocational programme, or working — so we
          // default to "university" because that's the most common
          // outcome for an Endeavrly user who has actively set a goal,
          // and the picker is clearly editable if we guessed wrong.
          const defaultStage: 'school' | 'college' | 'university' | 'other' =
            (typeof age === 'number' && age >= 18) ? 'university' : 'school';
          setEduStage(defaultStage);
          setSchoolName('');
          setStudyProgram('');
          setExpectedCompletion('');
          setSubjects([]);
        });
      }
    }
  }, [item?.id, open, isFoundation]);

  const addSubject = () => {
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed) && subjects.length < 15) {
      setSubjects(prev => [...prev, trimmed]);
      setNewSubject('');
      setDirty(true);
    }
  };

  const removeSubject = (s: string) => {
    setSubjects(prev => prev.filter(x => x !== s));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);

    // Save card data (status + micro-actions)
    const existing = loadCardData(item.id);
    saveCardData(item.id, { ...existing, status, completedMicroActions: completedActions });
    // Cascade-fix the chain so a later step can never stay done while
    // an earlier one is incomplete.
    if (allItems && allItems.length > 0) {
      enforceProgressChain(allItems.map((i) => i.id));
    }

    // Save education context for foundation
    if (isFoundation) {
      try {
        await fetch('/api/journey/education-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: eduStage,
            schoolName: schoolName.trim() || undefined,
            studyProgram: studyProgram.trim() || undefined,
            expectedCompletion: expectedCompletion.trim() || undefined,
            currentSubjects: subjects,
          }),
        });
        // Invalidate so the roadmap foundation node picks up the new data.
        // Also invalidate the personal career timeline — it's keyed on
        // education stage, so a stage change must trigger a refetch
        // that regenerates the downstream steps (e.g. drop "Complete
        // Videregående" once the user marks themselves as University).
        queryClient.invalidateQueries({ queryKey: ['education-context'] });
        queryClient.invalidateQueries({ queryKey: ['personal-career-timeline'] });
      } catch { /* silent */ }
    }

    setSaving(false);
    setDirty(false);
    onSaved?.();
    onOpenChange(false);
  };

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}\u2013${item.endAge}`
    : `Age ${item.startAge}`;
  const stepType = classifyStepType(item);
  const hasMicroActions = item.microActions && item.microActions.length > 0;
  const stepTip = isFoundation ? null : getStepTip(item, careerTitle);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              {stage.label} &middot; {ageLabel}
            </span>
          </div>
          <DialogTitle className="text-base">{item.title}</DialogTitle>
          {item.subtitle && !isFoundation && (
            <p className="text-xs text-muted-foreground/70">{item.subtitle}</p>
          )}
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Foundation: Education inputs */}
          {isFoundation && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground/75">Tell us about your current education</p>

              {/* Stage selector — once the user has filled in details for
                  their current stage (school name, programme, completion
                  date, or any subjects) we lock the *other* stages so
                  they can't accidentally switch and contradict
                  themselves. They have to clear school details first to
                  re-pick a stage. */}
              {(() => {
                const isAdult = typeof userAge === 'number' && userAge >= 18;
                const isMinor = typeof userAge === 'number' && userAge < 18;

                // Under-18: only School — they're in school, no need to choose.
                // 18+: University first, School last with Vg3 hint.
                // Age unknown: show all options (safe default).
                const orderedOptions = isMinor
                  ? [{ value: 'school' as const, label: 'School' }]
                  : isAdult
                    ? [
                        { value: 'university' as const, label: 'University' },
                        { value: 'college' as const, label: 'College' },
                        { value: 'other' as const, label: 'Other' },
                        { value: 'school' as const, label: 'School' },
                      ]
                    : STAGE_OPTIONS;
                const hasDetails =
                  schoolName.trim().length > 0 ||
                  studyProgram.trim().length > 0 ||
                  expectedCompletion.trim().length > 0 ||
                  subjects.length > 0;
                return (
                  <>
                    {/* Only show the stage picker if there's more than one option */}
                    {orderedOptions.length > 1 && (
                      <div className="flex gap-1.5">
                        {orderedOptions.map(opt => {
                          const isSchoolForAdult = isAdult && opt.value === 'school';
                          const isLocked = hasDetails && opt.value !== eduStage;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                if (isLocked) return;
                                setEduStage(opt.value);
                                setDirty(true);
                              }}
                              disabled={isLocked}
                              title={
                                isLocked
                                  ? 'Clear your current education details first to switch stage'
                                  : isSchoolForAdult
                                    ? "Only if you're still in Vg3"
                                    : undefined
                              }
                              className={cn(
                                'flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all border flex flex-col items-center justify-center leading-tight',
                                eduStage === opt.value
                                  ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                                  : isLocked
                                    ? 'border-transparent bg-muted/10 text-muted-foreground/55 cursor-not-allowed'
                                    : 'border-transparent bg-muted/20 text-muted-foreground/75 hover:bg-muted/40'
                              )}
                            >
                              <span>{opt.label}</span>
                              {isSchoolForAdult && !isLocked && (
                                <span className="text-[8px] text-muted-foreground/70 font-normal mt-0.5">
                                  if you&apos;re still in Vg3
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {hasDetails && orderedOptions.length > 1 && (
                      <p className="text-[9px] text-muted-foreground/75 mt-1 leading-snug">
                        Other stages are locked while your {EDUCATION_STAGE_LABEL[eduStage]} details are filled in. Clear them to switch.
                      </p>
                    )}
                  </>
                );
              })()}

              {/* School/University name */}
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                  {eduStage === 'university' ? 'University' : eduStage === 'college' ? 'College' : 'School'} name
                </label>
                <input
                  value={schoolName}
                  onChange={(e) => { setSchoolName(e.target.value); setDirty(true); }}
                  placeholder={eduStage === 'university' ? 'e.g. NTNU, UiO' : 'e.g. Lakewood High'}
                  className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                />
              </div>

              {/* Study programme — only shown for college/university/other, not school */}
              {eduStage !== 'school' && (
                <div>
                  <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                    Study programme
                  </label>
                  <input
                    value={studyProgram}
                    onChange={(e) => { setStudyProgram(e.target.value); setDirty(true); }}
                    placeholder="e.g. Computer Science, Nursing"
                    className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                  />
                </div>
              )}

              {/* Expected completion year — drives roadmap anchoring */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold">
                    Finish year
                    <span className="ml-1 text-amber-400/60">*</span>
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground/75 leading-snug mt-0.5 mb-1.5">
                  The single most important field. Your whole roadmap is anchored
                  to this year — when you finish, the next step starts.
                </p>
                {(() => {
                  // Show the current 4-digit year extracted from any
                  // legacy free-text value (e.g. "June 2027" → 2027) so
                  // existing rows still pre-fill cleanly.
                  const match = expectedCompletion.match(/(20\d{2})/);
                  const currentYear = match ? Number(match[1]) : null;
                  const thisYear = new Date().getFullYear();
                  // Reasonable horizon: this year through this year + 10
                  const years = Array.from({ length: 11 }, (_, i) => thisYear + i);
                  return (
                    <select
                      value={currentYear ?? ''}
                      onChange={(e) => {
                        setExpectedCompletion(e.target.value);
                        setDirty(true);
                      }}
                      className="w-full rounded-lg border border-amber-500/30 bg-amber-500/[0.04] px-3 py-2 text-xs text-foreground/85 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="">Select a year…</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Subjects — dropdown multi-select */}
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Your Subjects</label>

                {/* Selected subjects as removable pills */}
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                    {subjects.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/5 px-2 py-0.5 text-[10px] text-teal-400">
                        {s}
                        <button onClick={() => { setSubjects(prev => prev.filter(x => x !== s)); setDirty(true); }} className="hover:text-red-400 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown trigger */}
                <button
                  type="button"
                  onClick={() => setSubjectDropdownOpen(prev => !prev)}
                  className="w-full flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-left hover:border-border/50 transition-colors"
                >
                  <span className={subjects.length > 0 ? 'text-foreground/90' : 'text-muted-foreground/55'}>
                    {subjects.length > 0 ? `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} selected` : 'Select subjects...'}
                  </span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/70 transition-transform', subjectDropdownOpen && 'rotate-180')} />
                </button>

                {/* Dropdown panel — click outside to close */}
                {subjectDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSubjectDropdownOpen(false)} />
                    <div className="relative z-50 mt-1.5 rounded-lg border border-border/30 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
                    <div className="max-h-[220px] overflow-y-auto p-2 space-y-2">
                      {SUBJECT_GROUPS.map((group) => {
                        const categoryColors: Record<string, string> = {
                          'Mathematics & Science': 'text-blue-400',
                          'Technology': 'text-violet-400',
                          'Languages': 'text-amber-400',
                          'Humanities & Social': 'text-rose-400',
                          'Business & Finance': 'text-emerald-400',
                          'Creative & Practical': 'text-orange-400',
                          'Health & Care': 'text-pink-400',
                        };
                        const color = categoryColors[group.category] || 'text-muted-foreground/75';
                        return (
                          <div key={group.category}>
                            <p className={cn('text-[9px] font-bold uppercase tracking-wider px-1 mb-1', color)}>{group.category}</p>
                            {group.subjects.map((s) => {
                              const selected = subjects.includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    setSubjects(prev => selected ? prev.filter(x => x !== s) : [...prev, s]);
                                    setDirty(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-left hover:bg-muted/30 transition-colors"
                                >
                                  <div className={cn(
                                    'h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0',
                                    selected ? 'bg-teal-500 border-teal-500' : 'border-border/40'
                                  )}>
                                    {selected && <Check className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className={selected ? 'text-foreground/90 font-medium' : 'text-foreground/70'}>{s}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    {/* Other subject input inside dropdown */}
                    <div className="flex gap-1.5 p-2 border-t border-border/20">
                      <input
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Other subject..."
                        className="flex-1 rounded-md border border-border/30 bg-muted/10 px-2.5 py-1.5 text-[10px] text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                      />
                      <button onClick={addSubject} disabled={!newSubject.trim()} className="shrink-0 rounded-md bg-teal-500/10 px-2 py-1.5 text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-20">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Description (non-foundation only) */}
          {!isFoundation && item.description && (
            <div className="rounded-lg bg-muted/10 border border-border/20 p-3.5">
              <p className="text-[13px] text-foreground/70 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Contextual tip — one key nudge per step type */}
          {stepTip && (
            <div className="flex items-start gap-2.5 rounded-lg bg-teal-500/[0.06] border border-teal-500/15 px-3.5 py-3">
              <Lightbulb className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-foreground/70">
                {stepTip.text}
                {stepTip.link && (
                  <a href={stepTip.link} className="ml-1 text-teal-400 hover:text-teal-300 underline underline-offset-2">
                    Go there
                  </a>
                )}
              </p>
            </div>
          )}

          {/* What this step involves */}
          {hasMicroActions && (
            <div>
              <p className="text-xs font-medium text-foreground/75 mb-2">What this involves</p>
              <ul className="space-y-1.5">
                {item.microActions!.map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5 px-2.5 py-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                    <span className="text-[13px] leading-snug text-foreground/75">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real-world connections — courses, universities, and jobs
              relevant to this step and the user's chosen career.
              Hidden for "Accept" steps (about the job, not links).
              Certification steps get specific cert data instead of
              generic job/course links. */}
          {!isFoundation && !/\baccept\b/i.test(item.title) && (
            /\bcertif/i.test(item.title)
              ? <CertificationsSection career={careerTitle} />
              : <RealWorldSection item={item} career={careerTitle} />
          )}

          {/* Save button — foundation data persists across all careers */}
          {isFoundation && dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 border border-teal-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save foundation'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Certifications section for cert-related steps ───────────────────

function CertificationsSection({ career }: { career?: string | null }) {
  if (!career) return null;
  const certPath = getCertificationPath(career, career);
  if (!certPath || certPath.certifications.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Award className="h-3.5 w-3.5 text-violet-400" />
        <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-400/80">
          Key certifications
        </p>
      </div>
      <div className="rounded-lg border border-border/30 divide-y divide-border/20 overflow-hidden">
        {certPath.certifications.map((cert, i) => (
          <a
            key={i}
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 px-3 py-2 hover:bg-muted/10 transition-colors group"
          >
            <Award className="h-3 w-3 text-violet-400/60 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/85 group-hover:text-violet-300 transition-colors">{cert.name}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cert.provider} · {cert.duration}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">{cert.recognised}</p>
            </div>
            <ExtLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-violet-400 shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
