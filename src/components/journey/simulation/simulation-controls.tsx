'use client';

/**
 * Simulation Controls — floating bar at the bottom of the roadmap
 * container during playback. Play/Pause, Skip, Exit, progress bar,
 * and current step title.
 */

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SimulationState, SimulationControls as Controls } from '@/hooks/use-roadmap-simulation';

interface SimulationControlsProps {
  state: SimulationState;
  controls: Controls;
}

export function SimulationControls({ state, controls }: SimulationControlsProps) {
  if (!state.isPlaying && !state.isPaused && !state.isCompleted) return null;

  return (
    <div className="sticky bottom-0 z-30 mt-4">
      <div className="rounded-2xl border border-teal-500/30 bg-card/95 backdrop-blur-md shadow-xl shadow-black/20 px-4 py-3 mx-auto max-w-lg">
        {/* Progress bar */}
        <div className="h-1 bg-muted/30 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-200"
            style={{
              width: state.isCompleted
                ? '100%'
                : `${((state.narrationProgress) * 100).toFixed(1)}%`,
            }}
          />
        </div>

        {/* Step title */}
        <p className="text-[11px] text-muted-foreground/70 text-center mb-2 truncate">
          {state.isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Preparing narration…
            </span>
          ) : state.isCompleted ? (
            'Journey complete'
          ) : (
            state.currentTitle
          )}
        </p>

        {/* Controls row */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={controls.skipBack}
            disabled={state.currentStepIndex <= -1}
            className="p-1.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous step"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          {state.isCompleted ? (
            <button
              type="button"
              onClick={controls.play}
              className="p-3 rounded-full bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors"
              aria-label="Replay"
            >
              <Play className="h-5 w-5" />
            </button>
          ) : state.isPaused ? (
            <button
              type="button"
              onClick={controls.resume}
              className="p-3 rounded-full bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors"
              aria-label="Resume"
            >
              <Play className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={controls.pause}
              className="p-3 rounded-full bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors"
              aria-label="Pause"
            >
              <Pause className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={controls.skipForward}
            disabled={state.isCompleted}
            className="p-1.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next step"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-border/30 mx-1" />

          <button
            type="button"
            onClick={controls.exit}
            className="p-1.5 rounded-full text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Exit simulation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.error && (
          <p className="text-[9px] text-amber-400/70 text-center mt-2">{state.error}</p>
        )}
      </div>
    </div>
  );
}
