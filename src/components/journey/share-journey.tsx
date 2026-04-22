'use client';

/**
 * Share Journey — generates a shareable summary the user can
 * copy/paste or send to a parent, counsellor, or friend.
 *
 * For MVP: renders a modal with a formatted text summary the user
 * can copy. A future version could generate a read-only public URL
 * via the /p/[slug] route or a PDF export.
 */

import { useState, useMemo } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Career } from '@/lib/career-pathways';

interface ShareJourneyProps {
  career: Career | null;
  goalTitle: string | null;
  /** Momentum actions the user has added. */
  momentumActions?: { title: string; status: string }[];
  /** User's foundation data. */
  foundation?: {
    educationStage?: string;
    studyTrack?: string;
    expectedCompletion?: string;
  } | null;
}

function buildShareText(
  goalTitle: string,
  career: Career | null,
  foundation: ShareJourneyProps['foundation'],
  actions: { title: string; status: string }[],
): string {
  const lines: string[] = [];
  lines.push(`🎯 I'm exploring: ${goalTitle}`);
  lines.push('');

  if (career) {
    lines.push(`Career: ${career.emoji ?? ''} ${career.title}`);
    if (career.avgSalary) lines.push(`Salary range: ${career.avgSalary}`);
    if (career.educationPath) lines.push(`Education path: ${career.educationPath}`);
    lines.push('');
  }

  if (foundation) {
    lines.push('Where I am now:');
    if (foundation.educationStage) lines.push(`  Stage: ${foundation.educationStage}`);
    if (foundation.studyTrack) lines.push(`  Track: ${foundation.studyTrack}`);
    if (foundation.expectedCompletion) lines.push(`  Expected finish: ${foundation.expectedCompletion}`);
    lines.push('');
  }

  if (actions.length > 0) {
    lines.push('My next steps:');
    actions.forEach((a) => {
      const icon = a.status === 'done' ? '✅' : a.status === 'in_progress' ? '🔄' : '⬜';
      lines.push(`  ${icon} ${a.title}`);
    });
    lines.push('');
  }

  lines.push('Shared from Endeavrly — career exploration for youth');
  lines.push('https://endeavrly.no');

  return lines.join('\n');
}

export function ShareJourney({ career, goalTitle, momentumActions = [], foundation }: ShareJourneyProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(
    () => (goalTitle ? buildShareText(goalTitle, career, foundation, momentumActions) : ''),
    [goalTitle, career, foundation, momentumActions],
  );

  if (!goalTitle) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the textarea content
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My career exploration: ${goalTitle}`,
          text: shareText,
        });
      } catch { /* cancelled */ }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/50 px-3 py-1.5 text-[11px] font-medium text-foreground/70 hover:text-foreground hover:border-border/60 transition-colors"
      >
        <Share2 className="h-3 w-3" />
        Share my journey
      </button>

      {/* Modal fallback for browsers without native share */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-card border border-border/40 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground/90">Share your exploration</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 hover:bg-muted/40 rounded transition-colors">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/70">
              Copy this summary and send it to a parent, school counsellor, or friend.
            </p>

            <textarea
              readOnly
              value={shareText}
              className="w-full h-48 bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-[11px] text-foreground/75 leading-relaxed resize-none font-mono"
            />

            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'w-full inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-medium transition-colors',
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy to clipboard
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
