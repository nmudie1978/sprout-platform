/**
 * useRoadmapSimulation — React hook that drives the voice-guided
 * roadmap experience.
 *
 * Manages: script generation, TTS fetch + pre-fetch, audio playback,
 * step progression, and cleanup. The consumer (PersonalCareerTimeline)
 * reads `state` to drive UI focus and renders `SimulationControls`.
 *
 * Audio is fetched per-segment from /api/simulation/narrate. While the
 * current segment plays, the next segment is pre-fetched in the
 * background so skipping forward is instant.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Journey } from '@/lib/journey/career-journey-types';
import {
  generateNarrationScript,
  type NarrationContext,
  type NarrationScript,
  type NarrationSegment,
} from '@/lib/simulation/narration-generator';

// ── Public types ────────────────────────────────────────────────────

export interface SimulationState {
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  currentStepIndex: number; // -1 = foundation, 0..N = items, N+1 = outcome
  narrationProgress: number; // 0–1 within current audio segment
  totalSteps: number;
  currentTitle: string;
  error: string | null;
}

export interface SimulationControls {
  play: () => void;
  pause: () => void;
  resume: () => void;
  skipForward: () => void;
  skipBack: () => void;
  exit: () => void;
}

const INITIAL_STATE: SimulationState = {
  isPlaying: false,
  isPaused: false,
  isCompleted: false,
  isLoading: false,
  currentStepIndex: -1,
  narrationProgress: 0,
  totalSteps: 0,
  currentTitle: '',
  error: null,
};

// ── Hook ────────────────────────────────────────────────────────────

export function useRoadmapSimulation(
  journey: Journey | null,
  narrationCtx: NarrationContext | null,
): [SimulationState, SimulationControls] {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);

  // Refs for mutable state that shouldn't trigger re-renders.
  const scriptRef = useRef<NarrationScript | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobCacheRef = useRef<Map<number, string>>(new Map()); // segmentIndex → blobURL
  const prefetchingRef = useRef<Set<number>>(new Set());
  const playingRef = useRef(false); // mirrors state.isPlaying without re-render lag

  // ── Cleanup ───────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    for (const url of blobCacheRef.current.values()) {
      URL.revokeObjectURL(url);
    }
    blobCacheRef.current.clear();
    prefetchingRef.current.clear();
    playingRef.current = false;
  }, []);

  // Cleanup on unmount.
  useEffect(() => cleanup, [cleanup]);

  // ── Fetch audio for a segment ─────────────────────────────────────

  const fetchAudio = useCallback(async (segment: NarrationSegment): Promise<string | null> => {
    try {
      const res = await fetch('/api/simulation/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: segment.text }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  // ── Pre-fetch the next segment in the background ──────────────────

  const prefetch = useCallback(
    (segmentIndex: number) => {
      const script = scriptRef.current;
      if (!script) return;
      if (segmentIndex >= script.segments.length) return;
      if (blobCacheRef.current.has(segmentIndex)) return;
      if (prefetchingRef.current.has(segmentIndex)) return;
      prefetchingRef.current.add(segmentIndex);
      fetchAudio(script.segments[segmentIndex]).then((url) => {
        prefetchingRef.current.delete(segmentIndex);
        if (url) blobCacheRef.current.set(segmentIndex, url);
      });
    },
    [fetchAudio],
  );

  // ── Play a specific segment ───────────────────────────────────────

  const playSegment = useCallback(
    async (segmentIndex: number) => {
      const script = scriptRef.current;
      if (!script || segmentIndex >= script.segments.length) {
        // Finished all segments
        setState((s) => ({
          ...s,
          isPlaying: false,
          isCompleted: true,
          isLoading: false,
          narrationProgress: 1,
        }));
        playingRef.current = false;
        return;
      }

      const segment = script.segments[segmentIndex];
      setState((s) => ({
        ...s,
        isLoading: true,
        currentStepIndex: segment.stepIndex,
        currentTitle: segment.title,
        narrationProgress: 0,
        error: null,
      }));

      // Get audio (from cache or fetch)
      let blobUrl = blobCacheRef.current.get(segmentIndex) ?? null;
      if (!blobUrl) {
        blobUrl = await fetchAudio(segment);
      }

      if (!blobUrl) {
        // TTS failed — skip to next after a short pause
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Voice narration unavailable for this step',
        }));
        if (playingRef.current) {
          setTimeout(() => {
            if (playingRef.current) playSegment(segmentIndex + 1);
          }, 2000);
        }
        return;
      }

      // Pre-fetch next while this one plays
      prefetch(segmentIndex + 1);

      // Play audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = blobUrl;

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setState((s) => ({
            ...s,
            narrationProgress: audio.currentTime / audio.duration,
          }));
        }
      };

      audio.onended = () => {
        if (playingRef.current) {
          playSegment(segmentIndex + 1);
        }
      };

      audio.onerror = () => {
        if (playingRef.current) {
          setTimeout(() => playSegment(segmentIndex + 1), 1500);
        }
      };

      setState((s) => ({ ...s, isLoading: false }));

      try {
        await audio.play();
      } catch {
        // Autoplay blocked — user gesture required. This shouldn't
        // happen since the flow starts from a button click.
        setState((s) => ({
          ...s,
          error: 'Audio playback blocked. Tap Play to continue.',
          isPaused: true,
        }));
      }
    },
    [fetchAudio, prefetch],
  );

  // ── Controls ──────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (!narrationCtx || !journey) return;

    // Generate script
    const script = generateNarrationScript(narrationCtx);
    scriptRef.current = script;

    setState({
      isPlaying: true,
      isPaused: false,
      isCompleted: false,
      isLoading: true,
      currentStepIndex: -1,
      narrationProgress: 0,
      totalSteps: script.totalSegments,
      currentTitle: 'Your Starting Point',
      error: null,
    });
    playingRef.current = true;

    // Pre-fetch first two segments immediately
    prefetch(0);
    prefetch(1);

    // Start playing segment 0 (foundation)
    playSegment(0);
  }, [narrationCtx, journey, playSegment, prefetch]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  const skipForward = useCallback(() => {
    const script = scriptRef.current;
    if (!script) return;
    const currentSegIdx = script.segments.findIndex(
      (s) => s.stepIndex === state.currentStepIndex,
    );
    if (currentSegIdx < 0) return;
    if (audioRef.current) audioRef.current.pause();
    playSegment(currentSegIdx + 1);
  }, [state.currentStepIndex, playSegment]);

  const skipBack = useCallback(() => {
    const script = scriptRef.current;
    if (!script) return;
    const currentSegIdx = script.segments.findIndex(
      (s) => s.stepIndex === state.currentStepIndex,
    );
    if (currentSegIdx <= 0) return;
    if (audioRef.current) audioRef.current.pause();
    playSegment(currentSegIdx - 1);
  }, [state.currentStepIndex, playSegment]);

  const exit = useCallback(() => {
    cleanup();
    setState(INITIAL_STATE);
  }, [cleanup]);

  const controls: SimulationControls = {
    play,
    pause,
    resume,
    skipForward,
    skipBack,
    exit,
  };

  return [state, controls];
}
