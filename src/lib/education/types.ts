/**
 * Education Context — Types & Configuration
 *
 * Data model for the user's current educational reality.
 * Used by the roadmap school node, step type system, and learning alignment module.
 */

// ── Education Stage ──────────────────────────────────────────────────

export type EducationStage = 'school' | 'college' | 'university' | 'other';

export const EDUCATION_STAGE_CONFIG: Record<EducationStage, { label: string; ageBand: string }> = {
  school: { label: 'School', ageBand: '15–18' },
  college: { label: 'College', ageBand: '16–19' },
  university: { label: 'University', ageBand: '18–23' },
  other: { label: 'Self-directed', ageBand: '' },
};

// ── Subject Alignment ────────────────────────────────────────────────

export type SubjectAlignment = 'strong' | 'partial' | 'missing' | 'unknown';

export const ALIGNMENT_CONFIG: Record<SubjectAlignment, { label: string; colorClass: string; bgClass: string }> = {
  strong: { label: 'Strong match', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
  partial: { label: 'Partial match', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  missing: { label: 'Key subjects missing', colorClass: 'text-red-400', bgClass: 'bg-red-500/10' },
  unknown: { label: 'Not assessed', colorClass: 'text-muted-foreground', bgClass: 'bg-muted/30' },
};

// ── Education Context (stored in journeySummary JSON) ────────────────

export interface EducationContext {
  stage: EducationStage;
  currentSubjects: string[];
  ageBand?: string;
  updatedAt: string;
}

// ── Roadmap Step Types ───────────────────────────────────────────────

export type RoadmapStepType = 'school' | 'real-world' | 'milestone' | 'learning' | 'qualification';

export const STEP_TYPE_CONFIG: Record<RoadmapStepType, { label: string; icon: string; colorClass: string }> = {
  school: { label: 'School-related', icon: '🎓', colorClass: 'text-blue-400' },
  'real-world': { label: 'Real-world exposure', icon: '🌍', colorClass: 'text-orange-400' },
  milestone: { label: 'Milestone', icon: '🎯', colorClass: 'text-amber-400' },
  learning: { label: 'Learning & exploration', icon: '📚', colorClass: 'text-teal-400' },
  qualification: { label: 'Qualification', icon: '📋', colorClass: 'text-purple-400' },
};

// ── Career-Subject Alignment Mapping ─────────────────────────────────

export interface CareerSubjectMapping {
  career: string;
  keySubjects: string[];
  supportingSubjects: string[];
  focusAreas: string[];
  nextDecisions: string[];
  whySubjectsMatter: string;
}
