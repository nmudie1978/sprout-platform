'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Circle,
  CircleDot,
  CheckCircle2,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { FOUNDATION_ITEM_ID } from '../renderers/zigzag-renderer';

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  allItems?: JourneyItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
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

const STATUS_OPTIONS = [
  { value: 'not_started' as const, label: 'Not started', icon: Circle, color: 'text-muted-foreground/50' },
  { value: 'in_progress' as const, label: 'In progress', icon: CircleDot, color: 'text-amber-500' },
  { value: 'done' as const, label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
];

const STAGE_OPTIONS = [
  { value: 'school' as const, label: 'School' },
  { value: 'college' as const, label: 'College' },
  { value: 'university' as const, label: 'University' },
  { value: 'other' as const, label: 'Other' },
];

export function TimelineDetailDialog({
  item,
  allItems,
  open,
  onOpenChange,
  onSaved,
}: TimelineDetailDialogProps) {
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

  const isFoundation = item?.id === FOUNDATION_ITEM_ID;

  // Load saved data when item changes
  useEffect(() => {
    if (item && open) {
      const data = loadCardData(item.id);
      setStatus(data.status || 'not_started');
      setCompletedActions(data.completedMicroActions || []);
      setDirty(false);

      // Load education context for foundation
      if (isFoundation) {
        fetch('/api/journey/education-context')
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            const ctx = d?.educationContext;
            if (ctx) {
              setEduStage(ctx.stage || 'school');
              setSchoolName(ctx.schoolName || '');
              setStudyProgram(ctx.studyProgram || '');
              setExpectedCompletion(ctx.expectedCompletion || '');
              setSubjects(ctx.currentSubjects || []);
            } else {
              setEduStage('school');
              setSchoolName('');
              setStudyProgram('');
              setExpectedCompletion('');
              setSubjects([]);
            }
          })
          .catch(() => {});
      }
    }
  }, [item?.id, open, isFoundation]);

  const toggleMicroAction = useCallback((index: number) => {
    setCompletedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setDirty(true);
  }, []);

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
  const microActionsDone = hasMicroActions
    ? completedActions.filter((i) => i < item.microActions!.length).length
    : 0;
  const microActionsTotal = item.microActions?.length ?? 0;

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
              <p className="text-[11px] text-muted-foreground/50">Tell us about your current education</p>

              {/* Stage selector */}
              <div className="flex gap-1.5">
                {STAGE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setEduStage(opt.value); setDirty(true); }}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-all border',
                      eduStage === opt.value
                        ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                        : 'border-transparent bg-muted/20 text-muted-foreground/50 hover:bg-muted/40'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* School/University name */}
              <div>
                <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                  {eduStage === 'university' ? 'University' : eduStage === 'college' ? 'College' : 'School'} name
                </label>
                <input
                  value={schoolName}
                  onChange={(e) => { setSchoolName(e.target.value); setDirty(true); }}
                  placeholder={eduStage === 'university' ? 'e.g. NTNU, UiO' : 'e.g. Lakewood High'}
                  className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/80 placeholder:text-muted-foreground/25 focus:outline-none focus:border-teal-500/40"
                />
              </div>

              {/* Study program */}
              <div>
                <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                  {eduStage === 'school' ? 'Programme / Track' : 'Study programme'}
                </label>
                <input
                  value={studyProgram}
                  onChange={(e) => { setStudyProgram(e.target.value); setDirty(true); }}
                  placeholder={eduStage === 'school' ? 'e.g. Studiespesialisering, Realfag' : 'e.g. Computer Science'}
                  className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/80 placeholder:text-muted-foreground/25 focus:outline-none focus:border-teal-500/40"
                />
              </div>

              {/* Expected completion */}
              <div>
                <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Expected completion</label>
                <input
                  value={expectedCompletion}
                  onChange={(e) => { setExpectedCompletion(e.target.value); setDirty(true); }}
                  placeholder="e.g. June 2027"
                  className="w-full mt-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-foreground/80 placeholder:text-muted-foreground/25 focus:outline-none focus:border-teal-500/40"
                />
              </div>

              {/* Subjects */}
              <div>
                <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Subjects</label>
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                    {subjects.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/5 px-2 py-0.5 text-[10px] text-teal-400">
                        {s}
                        <button onClick={() => removeSubject(s)} className="hover:text-red-400 transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5 mt-1">
                  <input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Add a subject..."
                    className="flex-1 rounded-lg border border-border/30 bg-muted/10 px-3 py-1.5 text-xs text-foreground/80 placeholder:text-muted-foreground/25 focus:outline-none focus:border-teal-500/40"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                  />
                  <button onClick={addSubject} disabled={!newSubject.trim()} className="shrink-0 rounded-lg bg-teal-500/10 px-2.5 py-1.5 text-teal-400 hover:bg-teal-500/20 transition-colors disabled:opacity-20">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description (non-foundation only) */}
          {!isFoundation && item.description && (
            <div className="rounded-lg bg-muted/10 border border-border/20 p-3.5">
              <p className="text-[13px] text-foreground/70 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setStatus(opt.value); setDirty(true); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-medium transition-all border',
                    status === opt.value
                      ? 'border-foreground/20 bg-foreground/5'
                      : 'border-transparent bg-muted/20 text-muted-foreground/50 hover:bg-muted/40'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', status === opt.value ? opt.color : '')} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Action checklist */}
          {hasMicroActions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground/70">Actions</p>
                <span className="text-[10px] text-muted-foreground/40">
                  {microActionsDone}/{microActionsTotal}
                </span>
              </div>
              {microActionsTotal > 0 && (
                <div className="h-1 w-full rounded-full bg-foreground/5 mb-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(microActionsDone / microActionsTotal) * 100}%` }}
                  />
                </div>
              )}
              <ul className="space-y-1">
                {item.microActions!.map((action, i) => {
                  const isDone = completedActions.includes(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggleMicroAction(i)}
                        className={cn(
                          'w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
                          isDone ? 'bg-emerald-500/5' : 'hover:bg-muted/30'
                        )}
                      >
                        <div className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border mt-0.5 shrink-0 transition-colors',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-muted-foreground/30'
                        )}>
                          {isDone && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          'text-[13px] leading-snug',
                          isDone ? 'text-muted-foreground/40 line-through' : 'text-foreground/75'
                        )}>
                          {action}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all',
              dirty
                ? 'bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 border border-teal-500/30'
                : 'bg-muted/20 text-muted-foreground/40 border border-border/20'
            )}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
