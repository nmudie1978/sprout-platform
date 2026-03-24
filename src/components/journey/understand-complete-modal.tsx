'use client';

/**
 * UNDERSTAND COMPLETE MODAL
 *
 * Shown once when the user completes the Understand stage.
 * Summarises what they've researched about their chosen career
 * before transitioning them to the Grow phase.
 */

import { ArrowRight, Globe, X } from 'lucide-react';

interface UnderstandCompleteModalProps {
  open: boolean;
  onContinue: () => void;
  goalTitle: string | null;
  roleRealityNotes: string[];
  industryInsightNotes: string[];
  pathSkills: string[];
  actionPlan: { roleTitle?: string; shortTermActions?: string[] } | null;
}

export function UnderstandCompleteModal({
  open,
  onContinue,
  goalTitle,
  roleRealityNotes,
  industryInsightNotes,
  pathSkills,
  actionPlan,
}: UnderstandCompleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/20 bg-card shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-emerald-500/60" />
        <div className="p-6 sm:p-8">
          <button
            onClick={onContinue}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-5"
            style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' }}
          >
            <Globe className="h-6 w-6" />
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-2">
            You understand the path ahead.
          </h2>

          <p className="text-sm text-muted-foreground/70 leading-relaxed mb-5">
            You&apos;ve researched what {goalTitle ? `becoming a ${goalTitle}` : 'this career'} really involves. That clarity is powerful.
          </p>

          <div className="space-y-3 mb-6">
            {roleRealityNotes.length > 0 && (
              <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 px-4 py-3">
                <p className="text-[10px] font-medium text-emerald-500/50 mb-1.5">What the role involves</p>
                <p className="text-xs text-muted-foreground/70">
                  {roleRealityNotes.slice(0, 2).join('. ')}{roleRealityNotes.length > 2 ? '...' : '.'}
                </p>
              </div>
            )}

            {pathSkills.length > 0 && (
              <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 px-4 py-3">
                <p className="text-[10px] font-medium text-emerald-500/50 mb-1.5">Skills you&apos;ll need</p>
                <div className="flex flex-wrap gap-1.5">
                  {pathSkills.slice(0, 5).map((s) => (
                    <span key={s} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {actionPlan?.shortTermActions && actionPlan.shortTermActions.length > 0 && (
              <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/10 px-4 py-3">
                <p className="text-[10px] font-medium text-amber-500/50 mb-1.5">Your next steps</p>
                <ul className="space-y-1">
                  {actionPlan.shortTermActions.slice(0, 3).map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground/70 flex items-start gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-500/40 mt-1.5 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground/60 leading-relaxed mb-5">
            Now it&apos;s time to take action. Even something small — a project, a job, a conversation — turns knowledge into real experience.
          </p>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-sm font-medium transition-colors"
          >
            Continue to Grow
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
