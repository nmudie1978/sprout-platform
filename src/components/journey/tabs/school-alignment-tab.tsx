'use client';

/**
 * SCHOOL & LEARNING ALIGNMENT — Deep school layer
 *
 * Sits in the supporting tools section below the roadmap.
 * Shows education stage, subjects, career alignment, recommendations,
 * and wraps the existing Learning Goals tab.
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

interface SchoolAlignmentTabProps {
  goalTitle: string | null;
}

// ── Education Context Editor ─────────────────────────────────────────

function EducationEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: EducationContext | null;
  onSave: (ctx: { stage: EducationStage; currentSubjects: string[]; ageBand?: string }) => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<EducationStage>(initial?.stage || 'school');
  const [subjects, setSubjects] = useState<string[]>(initial?.currentSubjects || []);
  const [subjectInput, setSubjectInput] = useState('');
  const [ageBand, setAgeBand] = useState(initial?.ageBand || '');

  const addSubject = useCallback(() => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed) && subjects.length < 15) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setSubjectInput('');
  }, [subjectInput, subjects]);

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border/30 bg-card/50">
      <div>
        <p className="text-xs font-medium text-foreground/70 mb-2">Education stage</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(EDUCATION_STAGE_CONFIG) as EducationStage[]).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={cn(
                'p-2 rounded-lg text-xs font-medium text-center transition-all border-2',
                stage === s
                  ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                  : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50'
              )}
            >
              {EDUCATION_STAGE_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/70 mb-2">Age band (optional)</p>
        <input
          type="text"
          value={ageBand}
          onChange={(e) => setAgeBand(e.target.value)}
          placeholder="e.g. 16–17"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={20}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/70 mb-2">Current subjects</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
            placeholder="Add a subject and press Enter"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={60}
          />
          <Button type="button" variant="outline" size="sm" onClick={addSubject}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs gap-1 pr-1">
                {s}
                <button
                  onClick={() => setSubjects((prev) => prev.filter((x) => x !== s))}
                  className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => onSave({ stage, currentSubjects: subjects, ageBand: ageBand || undefined })}>
          <Check className="h-3 w-3 mr-1" /> Save
        </Button>
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
    mutationFn: async (ctx: { stage: EducationStage; currentSubjects: string[]; ageBand?: string }) => {
      const res = await fetch('/api/journey/education-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-context'] });
      setEditing(false);
    },
  });

  const eduContext = eduData?.educationContext || null;
  const mapping = goalTitle ? getCareerSubjectMapping(goalTitle) : null;
  const alignment = eduContext && goalTitle
    ? calculateSubjectAlignment(eduContext.currentSubjects, goalTitle)
    : null;

  return (
    <div className="space-y-4">
      {/* ── Section 1: Your Education Context ──────────────── */}
      {editing ? (
        <EducationEditor
          initial={eduContext}
          onSave={(ctx) => saveMutation.mutate(ctx)}
          onCancel={() => setEditing(false)}
        />
      ) : (
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
            <div>
              <p className="text-sm font-medium text-foreground/80">
                {EDUCATION_STAGE_CONFIG[eduContext.stage].label}
                {eduContext.ageBand && (
                  <span className="text-muted-foreground/50 font-normal text-xs ml-1">
                    (Age {eduContext.ageBand})
                  </span>
                )}
              </p>
              {eduContext.currentSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {eduContext.currentSubjects.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-500">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40">
              Tell us where you are in your education to see how it connects to your career path.
            </p>
          )}
        </div>
      )}

      {/* ── Section 2: Career Alignment ────────────────────── */}
      {goalTitle && alignment && (
        <div className="rounded-lg border border-border/30 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-semibold">Career Alignment</h4>
            <span className={cn(
              'text-[10px] font-medium rounded-full px-2 py-0.5 ml-auto',
              ALIGNMENT_CONFIG[alignment.alignment].bgClass,
              ALIGNMENT_CONFIG[alignment.alignment].colorClass,
            )}>
              {ALIGNMENT_CONFIG[alignment.alignment].label}
            </span>
          </div>

          {mapping && (
            <p className="text-xs text-muted-foreground/60 mb-3 leading-relaxed">
              {mapping.whySubjectsMatter}
            </p>
          )}

          {alignment.matchedKey.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-emerald-500/60 font-medium mb-1">Matched key subjects</p>
              <div className="flex flex-wrap gap-1">
                {alignment.matchedKey.map((s) => (
                  <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {alignment.missingKey.length > 0 && (
            <div>
              <p className="text-[10px] text-amber-500/60 font-medium mb-1">Consider adding</p>
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
      )}

      {/* ── Section 3: Recommended Focus Areas ─────────────── */}
      {mapping && (
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
      )}

      {/* ── Section 4: Next Education Decisions ────────────── */}
      {mapping && (
        <div className="rounded-lg border border-border/30 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-semibold">Next decisions</h4>
          </div>
          <div className="space-y-1.5">
            {mapping.nextDecisions.map((decision) => (
              <div key={decision} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                <ChevronRight className="h-3 w-3 text-purple-400/50 mt-0.5 shrink-0" />
                {decision}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 5: Learning Goals (existing) ───────────── */}
      <div className="border-t border-border/20 pt-3">
        <LearningGoalsTab />
      </div>
    </div>
  );
}
