'use client';

/**
 * UNDERSTAND COMPLETE MODAL
 *
 * Shown once when the user completes the Understand stage.
 * Celebrates their research and summarises what they've learned
 * before transitioning them to the Grow phase.
 */

import { ArrowRight, Sparkles, X } from 'lucide-react';

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
  pathSkills,
  actionPlan,
}: UnderstandCompleteModalProps) {
  if (!open) return null;

  const hasContent = roleRealityNotes.length > 0 || pathSkills.length > 0 ||
    (actionPlan?.shortTermActions && actionPlan.shortTermActions.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/20 bg-card shadow-2xl overflow-hidden">
        {/* Decorative gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-emerald-500/60" />

        <div className="p-6 sm:p-8">
          {/* Close */}
          <button
            onClick={onContinue}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon with glow */}
          <div className="text-center mb-6">
            <div
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-4"
              style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)' }}
            >
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-emerald-400 mb-1.5">
              You understand the path ahead.
            </h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-sm mx-auto">
              You&apos;ve done the hard work of researching what {goalTitle ? `becoming a ${goalTitle}` : 'this career'} really involves. That clarity puts you ahead of most people your age.
            </p>
          </div>

          {/* Research summary cards */}
          {hasContent && (
            <div className="space-y-2.5 mb-6">
              {roleRealityNotes.length > 0 && (
                <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/50 mb-1.5">What the role involves</p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    {roleRealityNotes.slice(0, 2).join('. ')}{roleRealityNotes.length > 2 ? '...' : '.'}
                  </p>
                </div>
              )}

              {pathSkills.length > 0 && (
                <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/50 mb-1.5">Skills you&apos;ll need</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pathSkills.slice(0, 5).map((s) => (
                      <span key={s} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {actionPlan?.shortTermActions && actionPlan.shortTermActions.length > 0 && (
                <div className="rounded-lg bg-amber-500/[0.04] border border-amber-500/10 px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500/50 mb-1.5">Your next steps</p>
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
          )}

          {/* Transition message */}
          <p className="text-xs text-muted-foreground/50 text-center leading-relaxed mb-5">
            Now it&apos;s time to take action. Even something small — a project, a job, a conversation — turns knowledge into real experience.
          </p>

          {/* CTA */}
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
