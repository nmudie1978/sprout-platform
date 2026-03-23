'use client';

/**
 * SCHOOL & LEARNING ALIGNMENT — Deep school layer
 *
 * Redesigned: side-by-side layout where possible, editable next decisions,
 * subjects show immediately after save via optimistic update.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  BookOpen,
  Target,
  Lightbulb,
  ChevronRight,
  Pencil,
  Check,
  Plus,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  EDUCATION_STAGE_CONFIG,
  ALIGNMENT_CONFIG,
  type EducationStage,
  type EducationContext,
} from '@/lib/education/types';
import {
  calculateSubjectAlignment,
  getCareerSubjectMapping,
} from '@/lib/education/alignment';
import { LearningGoalsTab } from './learning-goals-tab';
import { GuidanceStack } from '@/components/guidance/guidance-stack';
import { buildGuidanceContext } from '@/lib/guidance/rules';

interface SchoolAlignmentTabProps {
  goalTitle: string | null;
}

// ── Education Context Editor ─────────────────────────────────────────

interface EditorSaveData {
  stage: EducationStage;
  currentSubjects: string[];
  ageBand?: string;
  schoolName?: string;
  yearLevel?: string;
  studyProgram?: string;
  expectedCompletion?: string;
}

function EducationEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: EducationContext | null;
  onSave: (ctx: EditorSaveData) => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<EducationStage>(initial?.stage || 'school');
  const [subjects, setSubjects] = useState<string[]>(initial?.currentSubjects || []);
  const [subjectInput, setSubjectInput] = useState('');
  const [ageBand, setAgeBand] = useState(initial?.ageBand || '');
  const [schoolName, setSchoolName] = useState(initial?.schoolName || '');
  const [yearLevel, setYearLevel] = useState(initial?.yearLevel || '');
  const [studyProgram, setStudyProgram] = useState(initial?.studyProgram || '');
  const [expectedCompletion, setExpectedCompletion] = useState(initial?.expectedCompletion || '');

  const addSubject = useCallback(() => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed) && subjects.length < 15) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setSubjectInput('');
  }, [subjectInput, subjects]);

  const smallInput = "rounded-md border border-input bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-3 p-4 rounded-lg border border-teal-500/20 bg-teal-500/[0.03]">
      {/* Education stage */}
      <div>
        <p className="text-[11px] font-medium text-foreground/60 mb-1.5">Education stage</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(EDUCATION_STAGE_CONFIG) as EducationStage[]).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={cn(
                'py-1.5 px-2 rounded-lg text-[11px] font-medium text-center transition-all border',
                stage === s
                  ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                  : 'border-transparent bg-muted/30 text-muted-foreground/60 hover:bg-muted/50'
              )}
            >
              {EDUCATION_STAGE_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Row: School name + Year level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">School / institution</p>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="e.g. Oslo Katedralskole"
            className={cn(smallInput, 'w-full')}
            maxLength={100}
          />
        </div>
        <div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">Year / grade level</p>
          <input
            type="text"
            value={yearLevel}
            onChange={(e) => setYearLevel(e.target.value)}
            placeholder="e.g. Year 12, VG2"
            className={cn(smallInput, 'w-full')}
            maxLength={30}
          />
        </div>
      </div>

      {/* Row: Study program + Age + Expected completion */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">Study program</p>
          <input
            type="text"
            value={studyProgram}
            onChange={(e) => setStudyProgram(e.target.value)}
            placeholder="e.g. Science track"
            className={cn(smallInput, 'w-full')}
            maxLength={80}
          />
        </div>
        <div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">Age</p>
          <input
            type="text"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
            placeholder="e.g. 17"
            className={cn(smallInput, 'w-full')}
            maxLength={10}
          />
        </div>
        <div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">Finishing</p>
          <input
            type="text"
            value={expectedCompletion}
            onChange={(e) => setExpectedCompletion(e.target.value)}
            placeholder="e.g. 2027"
            className={cn(smallInput, 'w-full')}
            maxLength={10}
          />
        </div>
      </div>

      {/* Current subjects */}
      <div>
        <p className="text-[11px] font-medium text-foreground/60 mb-1">Current subjects</p>
        <div className="flex gap-1.5 mb-1.5">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
            placeholder="Add a subject and press Enter"
            className={cn(smallInput, 'flex-1')}
            maxLength={60}
          />
          <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={addSubject}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subjects.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] gap-0.5 pr-0.5 py-0">
                {s}
                <button
                  onClick={() => setSubjects((prev) => prev.filter((x) => x !== s))}
                  className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700" onClick={() => onSave({
          stage,
          currentSubjects: subjects,
          ageBand: ageBand || undefined,
          schoolName: schoolName || undefined,
          yearLevel: yearLevel || undefined,
          studyProgram: studyProgram || undefined,
          expectedCompletion: expectedCompletion || undefined,
        })}>
          <Check className="h-3 w-3 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}

// ── Editable Next Decisions ──────────────────────────────────────────

function NextDecisionsEditor({
  initial,
  onChange,
}: {
  initial: string[];
  onChange: (decisions: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(initial);
  const [input, setInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const addItem = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && items.length < 8) {
      const next = [...items, trimmed];
      setItems(next);
      onChange(next);
    }
    setInput('');
  }, [input, items, onChange]);

  const removeItem = useCallback((idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onChange(next);
  }, [items, onChange]);

  const saveEdit = useCallback((idx: number) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      const next = [...items];
      next[idx] = trimmed;
      setItems(next);
      onChange(next);
    }
    setEditingIdx(null);
    setEditValue('');
  }, [editValue, items, onChange]);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <ChevronRight className="h-3 w-3 text-purple-400/50 mt-1 shrink-0" />
          {editingIdx === i ? (
            <div className="flex-1 flex gap-1.5">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEdit(i); } if (e.key === 'Escape') { setEditingIdx(null); } }}
                className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <button onClick={() => saveEdit(i)} className="text-emerald-500 hover:text-emerald-400"><Check className="h-3 w-3" /></button>
              <button onClick={() => setEditingIdx(null)} className="text-muted-foreground/40 hover:text-muted-foreground"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-xs text-muted-foreground/60">{item}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={() => { setEditingIdx(i); setEditValue(item); }} className="text-muted-foreground/30 hover:text-muted-foreground"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => removeItem(i)} className="text-muted-foreground/30 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="flex gap-1.5 mt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder="Add a decision..."
          className="flex-1 rounded border border-dashed border-border/30 bg-transparent px-2 py-1 text-xs placeholder:text-muted-foreground/30 focus:outline-none focus:border-purple-500/30"
          maxLength={120}
        />
        {input.trim() && (
          <button onClick={addItem} className="text-purple-400 hover:text-purple-300"><Plus className="h-3 w-3" /></button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function SchoolAlignmentTab({ goalTitle }: SchoolAlignmentTabProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: eduData } = useQuery<{ educationContext: EducationContext | null }>({
    queryKey: ['education-context'],
    queryFn: async () => {
      const res = await fetch('/api/journey/education-context');
      if (!res.ok) return { educationContext: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (ctx: EditorSaveData) => {
      const res = await fetch('/api/journey/education-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onMutate: async (ctx) => {
      // Optimistic update so all fields show immediately
      await queryClient.cancelQueries({ queryKey: ['education-context'] });
      const previous = queryClient.getQueryData(['education-context']);
      queryClient.setQueryData(['education-context'], {
        educationContext: {
          ...ctx,
          updatedAt: new Date().toISOString(),
        },
      });
      setEditing(false);
      return { previous };
    },
    onError: (_err, _ctx, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['education-context'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['education-context'] });
    },
  });

  const eduContext = eduData?.educationContext || null;
  const mapping = goalTitle ? getCareerSubjectMapping(goalTitle) : null;
  const alignment = eduContext && goalTitle
    ? calculateSubjectAlignment(eduContext.currentSubjects, goalTitle)
    : null;

  // Local next decisions state (starts from mapping defaults, user can edit)
  const [customDecisions, setCustomDecisions] = useState<string[] | null>(null);
  const decisions = customDecisions ?? mapping?.nextDecisions ?? [];

  // Build guidance context for school alignment
  const schoolGuidanceCtx = buildGuidanceContext({
    journey: null,
    isFirstLogin: false,
    onboardingComplete: true,
    educationContext: eduContext,
    learningGoalCount: 0,
    jobsApplied: 0,
  });
  // Override hasGoal based on goalTitle prop
  if (goalTitle) {
    schoolGuidanceCtx.hasGoal = true;
    schoolGuidanceCtx.goalTitle = goalTitle;
  }

  return (
    <div className="space-y-4">
      {/* Contextual guidance */}
      <GuidanceStack placement="school-alignment" context={schoolGuidanceCtx} />

      {/* ── Row 1: Education + Career Alignment (side by side) ── */}
      {editing ? (
        <EducationEditor
          initial={eduContext}
          onSave={(ctx) => saveMutation.mutate(ctx)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Your Education */}
          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal-500" />
                <h4 className="text-xs font-semibold">Your Education</h4>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                {eduContext ? 'Edit' : 'Set up'}
              </button>
            </div>

            {eduContext ? (
              <div className="space-y-3">
                {/* Stage + details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">Stage</p>
                    <p className="text-sm font-medium text-foreground/80">
                      {EDUCATION_STAGE_CONFIG[eduContext.stage].label}
                    </p>
                  </div>
                  {eduContext.ageBand && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">Age</p>
                      <p className="text-sm text-foreground/70">{eduContext.ageBand}</p>
                    </div>
                  )}
                  {eduContext.schoolName && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">School</p>
                      <p className="text-sm text-foreground/70">{eduContext.schoolName}</p>
                    </div>
                  )}
                  {eduContext.studyProgram && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">Program</p>
                      <p className="text-sm text-foreground/70">{eduContext.studyProgram}</p>
                    </div>
                  )}
                  {eduContext.yearLevel && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">Year</p>
                      <p className="text-sm text-foreground/70">{eduContext.yearLevel}</p>
                    </div>
                  )}
                  {eduContext.expectedCompletion && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">Finishing</p>
                      <p className="text-sm text-foreground/70">{eduContext.expectedCompletion}</p>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                {eduContext.currentSubjects.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1.5">Subjects</p>
                    <div className="flex flex-wrap gap-1">
                      {eduContext.currentSubjects.map((s) => (
                        <span key={s} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-500">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40">
                Add your education details to see how they connect to your career path.
              </p>
            )}
          </div>

          {/* Career Alignment */}
          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <h4 className="text-xs font-semibold">Career Alignment</h4>
              </div>
              {alignment && (
                <span className={cn(
                  'text-[10px] font-medium rounded-full px-2 py-0.5',
                  ALIGNMENT_CONFIG[alignment.alignment].bgClass,
                  ALIGNMENT_CONFIG[alignment.alignment].colorClass,
                )}>
                  {ALIGNMENT_CONFIG[alignment.alignment].label}
                </span>
              )}
            </div>

            {mapping ? (
              <div>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed mb-2">
                  {mapping.whySubjectsMatter}
                </p>
                {alignment && alignment.matchedKey.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[9px] text-emerald-500/50 font-medium mb-1 uppercase tracking-wider">Matched</p>
                    <div className="flex flex-wrap gap-1">
                      {alignment.matchedKey.map((s) => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {alignment && alignment.missingKey.length > 0 && (
                  <div>
                    <p className="text-[9px] text-amber-500/50 font-medium mb-1 uppercase tracking-wider">Consider adding</p>
                    <div className="flex flex-wrap gap-1">
                      {alignment.missingKey.map((s) => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-500">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40">
                {goalTitle ? 'No alignment data for this career yet.' : 'Set a career goal to see alignment.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Row 2: What to strengthen + Next decisions (side by side) ── */}
      {mapping && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* What to strengthen */}
          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-semibold">What to strengthen</h4>
            </div>
            <div className="space-y-1.5">
              {mapping.focusAreas.map((area) => (
                <div key={area} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                  <span className="h-1 w-1 rounded-full bg-blue-400/50 mt-1.5 shrink-0" />
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* Next decisions — editable */}
          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <h4 className="text-xs font-semibold">Next decisions</h4>
            </div>
            <NextDecisionsEditor
              initial={decisions}
              onChange={(d) => setCustomDecisions(d)}
            />
          </div>
        </div>
      )}

      {/* ── Row 3: Learning Goals ──────────────────────────────── */}
      <div className="border-t border-border/20 pt-3">
        <LearningGoalsTab guidanceContext={schoolGuidanceCtx} />
      </div>
    </div>
  );
}
