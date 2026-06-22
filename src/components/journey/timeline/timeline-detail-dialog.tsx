'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
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
import { FOUNDATION_ITEM_ID, FOUNDATION_MICRO_ACTIONS } from '../renderers/foundation-banner';
import { ProgrammePicker } from './programme-picker';
import { SUBJECT_GROUPS, ALL_SUBJECTS } from '@/lib/education/subject-list';
import { getCertificationPath } from '@/lib/education';
import { TRIED_ROUTES, BLOCKERS, type TriedRoute, type Blocker } from '@/lib/journey/bridge-mindmap-types';
import { TRIED_ROUTE_LABELS } from '@/lib/journey/bridge-catalogue';
import { buildBridgeMindmap } from '@/lib/journey/build-bridge-mindmap';
import { BridgeMindmapView } from '@/components/journey/bridge-routes-mindmap';
import { Award, ExternalLink as ExtLink } from 'lucide-react';

const BLOCKER_LABELS: Record<Blocker, string> = {
  'no-experience': 'Not enough experience',
  'no-callbacks': 'No callbacks / interviews',
  'unknown-routes': "Don't know the routes",
};

/**
 * Returns a single contextual tip for a roadmap step — one key piece
 * of guidance that nudges the user toward the most useful action.
 *
 * The optional link is either an internal route (opens in the same
 * tab) or an external URL (opens in a new tab when `external: true`
 * is set). `linkLabel` lets the tip use phrasing tighter to the
 * action than the default "Go there".
 */
type StepTip = {
  text: string;
  link?: string;
  linkLabel?: string;
  external?: boolean;
  /** Named certifications rendered as a pill list under the tip text.
   *  Used for cert-related steps so the student sees CCNA / PMP /
   *  AWS ML Specialty etc. instead of a generic "explore options"
   *  phrase. */
  certs?: Array<{ name: string; provider: string; url: string }>;
};

function getStepTip(item: JourneyItem, careerTitle?: string | null): StepTip | null {
  const title = item.title.toLowerCase();

  // University application steps → Study Paths
  if (/apply.*universit|university.*appli|apply.*studi/i.test(title)) {
    return {
      text: "Head to the Understand tab's Study Paths to explore programmes and check which courses align with your subjects.",
      link: '/my-journey#understand',
    };
  }

  // Begin university / start degree
  if (/begin.*universit|start.*degree|begin.*studi/i.test(title)) {
    return {
      text: "Use Study Paths in the Understand tab to compare programmes, entry requirements, and course alignment before you commit.",
      link: '/my-journey#understand',
    };
  }

  // Entry-level role / first job / junior position. Endeavrly doesn't run a
  // live opportunity feed, so the honest pointer is to track the intent in the
  // Momentum list and apply directly through employers' own career pages.
  if (/apply.*entry|entry.?level.*role|first.*role|first.*job|accept.*entry|junior/i.test(title)) {
    return {
      text: careerTitle
        ? `Add this to your Momentum list, then apply directly on employers' own career pages for entry-level ${careerTitle} roles.`
        : "Add this to your Momentum list, then apply directly on employers' own career pages for entry-level roles in your field.",
    };
  }

  // Internship / work experience / volunteering
  //
  // Endeavrly deliberately does NOT run a live opportunity feed. The honest
  // pointer is to track the intent in the Momentum list and approach employers
  // directly through their own career pages.
  if (/intern|work experience|volunteer|placement/i.test(title)) {
    return {
      text: careerTitle
        ? `Add this as a concrete step in your Momentum list, then approach ${careerTitle} employers directly through their own career pages.`
        : "Add this as a concrete step in your Momentum list below the roadmap, then approach employers directly through their own career pages.",
    };
  }

  // School-related / exams / subjects
  if (/school|exam|subject|grade|coursework/i.test(title)) {
    return {
      text: "Make sure your Starting Point is up to date — your current subjects shape the alignment signals across your journey.",
    };
  }

  // Certification / qualification — surface named credentials for
  // the career (e.g. CCNA / CCNP / CCIE for network engineer, PMP /
  // PRINCE2 for project manager, AWS ML Specialty for AI engineer).
  // When no cert path is mapped, fall back to a generic pointer.
  if (/certif|qualif|licence|accredit|diploma/i.test(title)) {
    if (careerTitle) {
      const path = getCertificationPath(careerTitle, careerTitle);
      if (path && path.certifications.length > 0) {
        const top = path.certifications.slice(0, 4);
        return {
          text: `For ${careerTitle}, the most recognised credentials are:`,
          certs: top.map((c) => ({ name: c.name, provider: c.provider, url: c.url })),
        };
      }
    }
    return {
      text: "Certifications valued in this field vary by employer — explore the Understand tab for named options.",
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
  { value: 'other' as const, label: 'Working' },
];

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
  const [eduStage, setEduStage] = useState<'school' | 'college' | 'university' | 'other' | 'between'>('school');
  /**
   * Sensible default finish year given the user's age + chosen stage.
   * Used to pre-fill the dropdown and avoid anomalies like a 17-year-old
   * selecting 2032 (which would push uni-start to age 23).
   *
   *   school      → age 18 (typical videregående finish)
   *   college     → age + 2 (2-year programme)
   *   university  → age + 3 (3-year bachelor)
   *   other       → age + 2
   */
  const defaultFinishYearFor = (
    age: number | null,
    stage: 'school' | 'college' | 'university' | 'other' | 'between',
  ): string => {
    // Not-working users aren't in a programme, so there's no finish year.
    if (stage === 'between') return '';
    if (typeof age !== 'number') return '';
    const thisYear = new Date().getFullYear();
    let targetAge: number;
    switch (stage) {
      case 'school':     targetAge = 18; break;
      case 'college':    targetAge = age + 2; break;
      case 'university': targetAge = age + 3; break;
      default:           targetAge = age + 2;
    }
    const year = thisYear + Math.max(0, targetAge - age);
    return String(year);
  };
  const [schoolName, setSchoolName] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  // For "In work" (other): the year the user started their current role.
  const [workStartYear, setWorkStartYear] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  // Bridge-routes mindmap inputs — collected for the "Not working right now"
  // (between) stage only.
  const [previousOccupation, setPreviousOccupation] = useState('');
  const [withNav, setWithNav] = useState(false);
  const [triedRoutes, setTriedRoutes] = useState<TriedRoute[]>([]);
  const [triedDropdownOpen, setTriedDropdownOpen] = useState(false);
  const [blocker, setBlocker] = useState<Blocker | ''>('');
  const [showRoutes, setShowRoutes] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  // User's age — drives both the default education stage and how we
  // arrange the picker (under-18 sees School first, 18+ sees it last
  // with a Vg3-only subtitle so it doesn't read as the assumed answer).
  const [userAge, setUserAge] = useState<number | null>(null);

  // Close the full-screen routes/mindmap overlay on Escape. Capture phase +
  // stopPropagation so it closes only the overlay, not the foundation dialog.
  useEffect(() => {
    if (!showRoutes) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setShowRoutes(false); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [showRoutes]);

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
          // Intentional silent fallback: age is optional, no DOB
          // means we default the picker; no user-facing error needed.
          .catch(() => null);

        Promise.all([
          // Intentional silent fallback: dialog renders with empty
           // edu context on network hiccup; user can still edit + save.
          fetch('/api/journey/education-context').then(r => r.ok ? r.json() : null).catch(() => null),
          agePromise,
        ]).then(([d, age]) => {
          if (typeof age === 'number') setUserAge(age);

          const ctx = d?.educationContext;
          if (ctx) {
            setEduStage(ctx.stage || 'school');
            setSchoolName(ctx.schoolName || '');
            setStudyProgram(ctx.studyProgram || '');
            setCurrentRole(ctx.currentRole || '');
            setWorkStartYear(ctx.workStartYear || '');
            setPreviousOccupation(ctx.previousOccupation || '');
            setWithNav(!!ctx.withNav);
            setTriedRoutes(Array.isArray(ctx.triedRoutes) ? ctx.triedRoutes : []);
            setBlocker(ctx.blocker || '');
            setExpectedCompletion(ctx.expectedCompletion || '');
            setSubjects(ctx.currentSubjects || []);
            return;
          }

          // No saved context yet — pick a sensible default based on age.
          // Under 18: almost certainly still in school (Videregående).
          // 26+: very likely past initial education and working, so default to
          // "Working" — an older career-changer should never be asked for school
          // details. 18-25: default to "university" (most common for a goal-
          // setting Endeavrly user). The picker is always editable.
          const defaultStage: 'school' | 'college' | 'university' | 'other' =
            (typeof age === 'number' && age >= 26) ? 'other'
              : (typeof age === 'number' && age >= 18) ? 'university'
                : 'school';
          setEduStage(defaultStage);
          setSchoolName('');
          setStudyProgram('');
          setCurrentRole('');
          setExpectedCompletion(defaultFinishYearFor(age, defaultStage));
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
        const res = await fetch('/api/journey/education-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: eduStage,
            schoolName: schoolName.trim() || undefined,
            // Only persist the study programme for stages that actually have
            // one. The local value is kept across stage toggles (so it isn't
            // lost), but a school/working/not-working starting point shouldn't
            // save a stale programme.
            studyProgram:
              eduStage === 'university' || eduStage === 'college'
                ? studyProgram.trim() || undefined
                : undefined,
            currentRole: currentRole.trim() || undefined,
            workStartYear: workStartYear.trim() || undefined,
            previousOccupation: previousOccupation.trim() || undefined,
            withNav,
            triedRoutes,
            blocker: blocker || undefined,
            expectedCompletion: expectedCompletion.trim() || undefined,
            currentSubjects: subjects,
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.error('Foundation save failed', res.status, errText);
          toast({
            title: "Couldn't save your starting point",
            description: errText || 'Please try again in a moment.',
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        // Invalidate so the roadmap foundation node picks up the new data.
        // Also invalidate the personal career timeline — it's keyed on
        // education stage, so a stage change must trigger a refetch
        // that regenerates the downstream steps (e.g. drop "Complete
        // Videregående" once the user marks themselves as University).
        queryClient.invalidateQueries({ queryKey: ['education-context'] });
        queryClient.invalidateQueries({ queryKey: ['personal-career-timeline'] });
      } catch (e) {
        console.error('Foundation save error', e);
        toast({
          title: "Couldn't save your starting point",
          description: 'Check your connection and try again.',
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setDirty(false);

    // Confirm the save with a green tick + a short summary of what they entered.
    if (isFoundation) {
      const summary =
        eduStage === 'other'
          ? `In work${currentRole.trim() ? ` as ${currentRole.trim()}` : ''}${schoolName.trim() ? ` at ${schoolName.trim()}` : ''}`
          : eduStage === 'between'
            ? `Not in work${previousOccupation.trim() ? ` · was ${previousOccupation.trim()}` : ''}`
            : `${eduStage === 'university' ? 'University' : eduStage === 'college' ? 'College' : 'School'}${schoolName.trim() ? ` · ${schoolName.trim()}` : ''}${(eduStage === 'university' || eduStage === 'college') && studyProgram.trim() ? ` · ${studyProgram.trim()}` : ''}`;
      toast({
        title: '✓ Starting point saved',
        description: summary,
      });
    }
    onSaved?.();
    onOpenChange(false);
  };

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}\u2013${item.endAge}`
    : `Age ${item.startAge}`;
  const stepType = classifyStepType(item);
  // For the foundation card, the "what this involves" bullets follow the
  // CURRENTLY selected stage (live), not the stale saved item.microActions —
  // so switching to In work / Not in work immediately shows work-appropriate
  // guidance instead of school subjects/teachers.
  const microActions = isFoundation ? FOUNDATION_MICRO_ACTIONS[eduStage] : item.microActions;
  const hasMicroActions = !!microActions && microActions.length > 0;
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
                // 17 and under: a minor's honest starting point is still in
                // education, so we hide "In work" and "Not in work". Unknown
                // age keeps the full set — we only narrow when we actually
                // know the user is a minor.
                const isMinor = typeof userAge === 'number' && userAge <= 17;

                const notWorking = { value: 'between' as const, label: 'Not in work' };

                // Adults (18+) see the four real starting points in a stable
                // order: University · College · In work · Not in work. School
                // (Vg3) is youth-only. Minors (≤17) get the education stages
                // only; unknown age keeps the full youth set + Not in work.
                const orderedOptions = isAdult
                  ? [
                      { value: 'university' as const, label: 'University' },
                      { value: 'college' as const, label: 'College' },
                      { value: 'other' as const, label: 'In work' },
                      notWorking,
                    ]
                  : isMinor
                    ? STAGE_OPTIONS.filter(opt => opt.value !== 'other')
                    : [...STAGE_OPTIONS, notWorking];
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {orderedOptions.map(opt => {
                      const isSchoolForAdult = isAdult && opt.value === 'school';
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setEduStage(opt.value);
                            // Keep the typed study programme in state even when
                            // switching to a stage that hides it (school /
                            // working / not-working) — toggling stages must not
                            // wipe what the user entered. It's simply omitted
                            // from the saved payload for those stages (see
                            // handleSave), so the data is preserved if they
                            // switch back to University/College.
                            // Refresh the finish-year default for the new stage
                            // (e.g. School → 18, University → age + 3).
                            setExpectedCompletion(defaultFinishYearFor(userAge, opt.value));
                            setDirty(true);
                          }}
                          title={isSchoolForAdult ? "Only if you're still in Vg3" : undefined}
                          className={cn(
                            'flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all border flex flex-col items-center justify-center leading-tight',
                            eduStage === opt.value
                              ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                              : 'border-transparent bg-muted/20 text-muted-foreground/75 hover:bg-muted/40'
                          )}
                        >
                          <span>{opt.label}</span>
                          {isSchoolForAdult && (
                            <span className="text-[8px] text-muted-foreground/70 font-normal mt-0.5">
                              if you&apos;re still in Vg3
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Working / changing career → ask their current role instead of
                  school details. This anchors a career-transition roadmap. */}
              {eduStage === 'other' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      Where do you work?
                    </label>
                    <input
                      value={schoolName}
                      onChange={(e) => { setSchoolName(e.target.value); setDirty(true); }}
                      placeholder="e.g. Telenor, Oslo kommune, self-employed"
                      className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      What&rsquo;s your role?
                    </label>
                    <input
                      value={currentRole}
                      onChange={(e) => { setCurrentRole(e.target.value); setDirty(true); }}
                      placeholder="e.g. Marketing manager, electrician, teacher"
                      className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                      When did you start?
                    </label>
                    {(() => {
                      const thisYear = new Date().getFullYear();
                      const years = Array.from({ length: 46 }, (_, i) => thisYear - i);
                      return (
                        <select
                          value={workStartYear}
                          onChange={(e) => { setWorkStartYear(e.target.value); setDirty(true); }}
                          className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 focus:outline-none focus:border-teal-500/40 [color-scheme:light] dark:[color-scheme:dark]"
                        >
                          <option value="">Select a year…</option>
                          {years.map((y) => (
                            <option key={y} value={String(y)} className="bg-card text-foreground">{y}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                  <p className="text-[10px] text-muted-foreground/65 leading-snug">
                    Your current job — we&rsquo;ll build a roadmap that moves you from here toward your goal, using the experience you already bring.
                  </p>
                </div>
              ) : eduStage === 'between' ? (
                <p className="text-[11px] text-muted-foreground/70 leading-snug">
                  No problem — that&rsquo;s your starting point. Just set your goal
                  and we&rsquo;ll map the steps from here.
                </p>
              ) : (
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
              )}

              {/* Routes back into work — NAV support + a map of practical routes
                  back into work. Only for "Not in work" (between); employed
                  users don't need it. */}
              {eduStage === 'between' && (
                <div className="space-y-3.5 rounded-xl border border-teal-500/20 bg-teal-500/[0.04] p-4">
                  <div>
                    <p className="text-sm font-semibold text-teal-300">Routes back into work</p>
                    <p className="text-[11px] text-muted-foreground/65 leading-snug mt-0.5">A calm map of practical ways back — shaped by what you tell us.</p>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">What did you do before? (optional)</label>
                    <input
                      value={previousOccupation}
                      onChange={(e) => { setPreviousOccupation(e.target.value); setDirty(true); }}
                      placeholder="e.g. Interior designer"
                      className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none focus:border-teal-500/40"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withNav}
                      onChange={(e) => { setWithNav(e.target.checked); setDirty(true); }}
                      className="h-3.5 w-3.5 accent-teal-500"
                    />
                    <span className="text-xs text-foreground/85">I&apos;m working with NAV right now</span>
                  </label>

                  <div>
                    <p className="text-sm font-medium text-foreground/90">What have you already tried?</p>
                    <p className="text-[11px] text-muted-foreground/60 leading-snug mb-1.5">We&rsquo;ll set those aside and focus on the routes you haven&rsquo;t.</p>
                    {/* selected pills */}
                    {triedRoutes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {triedRoutes.map((r) => (
                          <span key={r} className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-300">
                            {TRIED_ROUTE_LABELS[r]}
                            <button type="button" onClick={() => { setTriedRoutes((prev) => prev.filter((x) => x !== r)); setDirty(true); }} className="hover:text-red-400 transition-colors">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setTriedDropdownOpen((v) => !v)}
                      className="w-full flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-left hover:border-border/50 transition-colors"
                    >
                      <span className={triedRoutes.length > 0 ? 'text-foreground/90' : 'text-muted-foreground/55'}>
                        {triedRoutes.length > 0 ? `${triedRoutes.length} selected` : "Select what you've tried…"}
                      </span>
                      <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground/70 transition-transform', triedDropdownOpen && 'rotate-180')} />
                    </button>
                    {triedDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setTriedDropdownOpen(false)} />
                        <div className="relative z-50 mt-1.5 rounded-lg border border-border/30 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
                          <div className="max-h-[200px] overflow-y-auto p-1.5">
                            {TRIED_ROUTES.map((r) => {
                              const on = triedRoutes.includes(r);
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => {
                                    setTriedRoutes((prev) => (on ? prev.filter((x) => x !== r) : [...prev, r]));
                                    setDirty(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-left hover:bg-muted/30 transition-colors"
                                >
                                  <div className={cn('h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0', on ? 'bg-teal-500 border-teal-500' : 'border-border/40')}>
                                    {on && <Check className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className={on ? 'text-foreground/90 font-medium' : 'text-foreground/70'}>{TRIED_ROUTE_LABELS[r]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground/90">What&rsquo;s blocking you most?</p>
                    <p className="text-[11px] text-muted-foreground/60 leading-snug mb-1.5">We&rsquo;ll lead with the routes that tackle this first.</p>
                    <select
                      value={blocker}
                      onChange={(e) => { setBlocker(e.target.value as Blocker | ''); setDirty(true); }}
                      className="w-full rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/90 focus:outline-none focus:border-teal-500/40 [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      <option value="">Select…</option>
                      {BLOCKERS.map((b) => (
                        <option key={b} value={b} className="bg-card text-foreground">{BLOCKER_LABELS[b]}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRoutes(true)}
                    className="text-xs font-medium text-teal-400 hover:text-teal-300"
                  >
                    See your options in mindmap form →
                  </button>
                  {showRoutes && createPortal(
                    <div
                      className="fixed inset-0 z-[100] flex flex-col bg-background/98 backdrop-blur-sm animate-in fade-in duration-150"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Your options — routes back into work"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
                        <p className="text-sm font-semibold tracking-tight text-foreground/85">
                          Your options — routes back into work
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowRoutes(false)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/50 hover:text-foreground"
                          aria-label="Close"
                        >
                          <X className="h-3.5 w-3.5" />
                          Close
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto p-4 sm:p-8">
                        <BridgeMindmapView
                          model={buildBridgeMindmap({
                            previousOccupation: previousOccupation.trim() || null,
                            targetCareer: careerTitle || 'your target role',
                            withNav,
                            triedRoutes,
                            blocker: blocker || 'unknown-routes',
                          })}
                        />
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              )}

              {/* Study programme — only shown for college/university, not school, working, or not-working */}
              {eduStage !== 'school' && eduStage !== 'other' && eduStage !== 'between' && (
                <div>
                  <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                    Study programme
                  </label>
                  <ProgrammePicker
                    value={studyProgram}
                    onChange={(v) => { setStudyProgram(v); setDirty(true); }}
                  />
                </div>
              )}

              {eduStage !== 'other' && eduStage !== 'between' && (
                <>
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
                      // color-scheme makes the browser paint the native control
                      // and its options with the right (dark) palette — without
                      // it the popup renders white-on-white in dark mode.
                      className="w-full rounded-lg border border-amber-500/30 bg-amber-500/[0.04] px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500/60 [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      <option value="" className="bg-card text-foreground">Select a year…</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)} className="bg-card text-foreground">
                          {y}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Subjects — school stage only. School subjects are the wrong
                  vocabulary at college/university (the study programme is the
                  meaningful input there), and subjects don't feed the roadmap. */}
              {eduStage === 'school' && (
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
              )}
                </>
              )}
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
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs leading-relaxed text-foreground/70">
                  {stepTip.text}
                  {stepTip.link && (
                    <a
                      href={stepTip.link}
                      target={stepTip.external ? '_blank' : undefined}
                      rel={stepTip.external ? 'noopener noreferrer' : undefined}
                      className="ml-1 inline-flex items-center gap-0.5 text-teal-400 hover:text-teal-300 underline underline-offset-2"
                    >
                      {stepTip.linkLabel ?? 'Go there'}
                      {stepTip.external && <ExternalLink className="h-2.5 w-2.5" />}
                    </a>
                  )}
                </p>
                {stepTip.certs && stepTip.certs.length > 0 && (
                  <ul className="space-y-1">
                    {stepTip.certs.map((c) => (
                      <li key={c.name}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-[11.5px] text-foreground/80 hover:text-teal-300 transition-colors"
                        >
                          <span className="h-1 w-1 rounded-full bg-teal-400/70 shrink-0" />
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-muted-foreground/60">&middot; {c.provider}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/65 group-hover:text-teal-300 transition-colors" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* What this step involves */}
          {hasMicroActions && (
            <div>
              <p className="text-xs font-medium text-foreground/75 mb-2">What this involves</p>
              <ul className="space-y-1.5">
                {microActions!.map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5 px-2.5 py-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                    <span className="text-[13px] leading-snug text-foreground/75">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certification steps still surface specific cert data;
              the generic "Where to go next" links were removed per
              product feedback — too noisy on every step. */}
          {!isFoundation && !/\baccept\b/i.test(item.title) && /\bcertif/i.test(item.title) && (
            <CertificationsSection career={careerTitle} />
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
              <p className="text-[9px] text-muted-foreground/70 mt-0.5">{cert.recognised}</p>
            </div>
            <ExtLink className="h-3 w-3 text-muted-foreground/60 group-hover:text-violet-400 shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
