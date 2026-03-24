'use client';

/**
 * DISCOVER COMPLETE MODAL
 *
 * Shown once when the user completes the Discover stage.
 * Reflects back a personal summary of who they are — their strengths,
 * motivations, work style, and career direction — before transitioning
 * them to the Understand phase.
 *
 * Tone: warm, affirming, personal. Not cheesy or over-the-top.
 */

import { ArrowRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscoverCompleteModalProps {
  open: boolean;
  onContinue: () => void;
  strengths: string[];
  motivations: string[];
  workStyle: string[];
  growthAreas: string[];
  goalTitle: string | null;
  careerInterests: string[];
}

export function DiscoverCompleteModal({
  open,
  onContinue,
  strengths,
  motivations,
  workStyle,
  growthAreas,
  goalTitle,
  careerInterests,
}: DiscoverCompleteModalProps) {
  if (!open) return null;

  // Build a personal summary line
  const summaryParts: string[] = [];
  if (motivations.length > 0) {
    const top = motivations.slice(0, 2).map((m) => m.toLowerCase());
    summaryParts.push(
      top.length === 2
        ? `motivated by ${top[0]} and ${top[1]}`
        : `motivated by ${top[0]}`,
    );
  }
  if (workStyle.length > 0) {
    summaryParts.push(
      `thrive ${workStyle[0].toLowerCase()}`,
    );
  }

  const personalSummary = summaryParts.length > 0
    ? `You're someone who is ${summaryParts.join(', and you ')}. That's a strong foundation.`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-teal-500/20 bg-card shadow-2xl overflow-hidden">
        {/* Decorative top gradient */}
        <div className="h-1.5 bg-gradient-to-r from-teal-500/60 via-emerald-500/60 to-teal-500/60" />

        <div className="p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={onContinue}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/15 text-teal-500 mb-5"
            style={{ boxShadow: '0 0 30px rgba(20, 184, 166, 0.2)' }}
          >
            <Sparkles className="h-6 w-6" />
          </div>

          {/* Headline */}
          <h2 className="text-lg font-semibold text-foreground mb-2">
            You know yourself better now.
          </h2>

          <p className="text-sm text-muted-foreground/70 leading-relaxed mb-5">
            That takes honesty and courage. Here's what you've discovered:
          </p>

          {/* Personal summary */}
          {personalSummary && (
            <p className="text-sm text-foreground/80 leading-relaxed mb-5 italic">
              {personalSummary}
            </p>
          )}

          {/* Signal cards */}
          <div className="space-y-3 mb-6">
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="rounded-lg bg-teal-500/[0.04] border border-teal-500/10 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-teal-500/50 mb-1.5">
                  Your strengths
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Direction */}
            {goalTitle && (
              <div className="rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/50 mb-1.5">
                  Your direction
                </p>
                <p className="text-sm font-medium text-foreground/80">{goalTitle}</p>
              </div>
            )}

            {/* Growth areas */}
            {growthAreas.length > 0 && (
              <div className="rounded-lg bg-violet-500/[0.04] border border-violet-500/10 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-violet-500/50 mb-1.5">
                  Where you want to grow
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {growthAreas.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transition message */}
          <p className="text-xs text-muted-foreground/60 leading-relaxed mb-5">
            Next, you'll explore what {goalTitle ? `becoming a ${goalTitle}` : 'your chosen path'} actually looks like in the real world — the skills, the qualifications, and what to expect.
          </p>

          {/* CTA */}
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-3 text-sm font-medium transition-colors"
          >
            Continue to Understand
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
