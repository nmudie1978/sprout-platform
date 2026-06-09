'use client';

/**
 * Journey-complete "moment of arrival".
 *
 * A calm, one-time celebration shown when a career journey is finished. Per the
 * product principles (clarity, not addiction; never over-gamify) this is a
 * premium, quiet moment — a soft checkmark reveal + sparse shimmer, a reflection
 * on the clarity gained, and a forward step. No confetti cannon, no sound,
 * no scores. Respects prefers-reduced-motion.
 *
 * Fires once per career per device — see src/lib/journey/celebration.ts.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Download, Compass, ArrowRight, Loader2, X } from 'lucide-react';
import { playCompletionChime } from '@/lib/journey/completion-chime';

interface JourneyCompleteCelebrationProps {
  open: boolean;
  onClose: () => void;
  careerTitle: string | null;
  onDownload: () => void;
  isDownloading?: boolean;
}

// Sparkles fanning out around the checkmark. [x%, y%, delay, driftX, driftY].
// Positions can exceed 0–100% so they spread beyond the icon box into the
// upper card. driftX/driftY (px) push each one outward as it fades.
const SPARKS: ReadonlyArray<[number, number, number, number, number]> = [
  [10, 18, 0.05, -22, -14],
  [90, 22, 0.12, 22, -12],
  [-8, 50, 0.18, -26, 2],
  [108, 48, 0.1, 26, 4],
  [20, 86, 0.24, -18, 18],
  [80, 82, 0.16, 18, 18],
  [48, -10, 0.3, 0, -22],
  [50, 108, 0.28, 0, 22],
  [30, 4, 0.2, -12, -18],
  [70, 6, 0.08, 12, -18],
];

export function JourneyCompleteCelebration({
  open,
  onClose,
  careerTitle,
  onDownload,
  isDownloading,
}: JourneyCompleteCelebrationProps) {
  const reduce = useReducedMotion();

  // Play the celebratory chime once, when the modal opens.
  useEffect(() => {
    if (open) playCompletionChime();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Journey complete"
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.08] via-card to-card p-7 shadow-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Checkmark reveal + soft ring + sparse sparkles */}
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              {!reduce && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-emerald-400/20"
                  initial={{ scale: 0.6, opacity: 0.7 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              )}
              <motion.div
                initial={reduce ? {} : { scale: 0, rotate: -18 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.05 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40"
              >
                <CheckCircle2 className="h-9 w-9 text-emerald-400" strokeWidth={2} />
              </motion.div>

              {!reduce &&
                SPARKS.map(([left, top, delay, dx, dy], i) => (
                  <motion.span
                    key={i}
                    className="absolute h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{ scale: [0, 1.4, 1, 0], opacity: [0, 1, 1, 0], x: [0, dx], y: [0, dy] }}
                    transition={{ duration: 1.5, delay, ease: 'easeOut' }}
                  />
                ))}
            </div>

            <div className="text-center space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                Journey complete
              </p>
              <h2 className="text-xl font-bold text-foreground leading-snug">
                You&rsquo;ve explored {careerTitle ?? 'this career'}, end to end.
              </h2>
              <p className="text-sm text-muted-foreground/75 leading-relaxed">
                You now know what it&rsquo;s really like, how to get there, and your next
                moves. That clarity is yours to keep.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={onDownload}
                disabled={isDownloading}
                className="flex w-full items-center justify-center gap-2 rounded-control bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" strokeWidth={2.25} />
                )}
                Download your journey
              </button>

              <Link
                href="/careers"
                onClick={onClose}
                className="group flex w-full items-center justify-center gap-2 rounded-control border border-border/40 bg-background/40 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors"
              >
                <Compass className="h-4 w-4" />
                Explore another career
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/dashboard"
                onClick={onClose}
                className="block w-full text-center text-[11px] font-medium text-muted-foreground/55 hover:text-foreground/80 transition-colors pt-1"
              >
                Back to dashboard
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
