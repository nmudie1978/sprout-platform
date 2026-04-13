/**
 * useWalkthroughNarration — lightweight TTS hook for the orientation
 * walkthrough. Reuses the same /api/simulation/narrate endpoint as the
 * roadmap simulation but with a much simpler state model: one audio
 * segment per step, auto-play on step change, mute toggle.
 *
 * Pre-fetches the next step's audio while the current one plays so
 * step transitions feel instant.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface WalkthroughNarrationState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether narration is muted (user toggled off) */
  isMuted: boolean;
  /** Whether the current segment is loading from TTS */
  isLoading: boolean;
  /** 0–1 progress within the current audio segment */
  progress: number;
  /** Error message if TTS fails */
  error: string | null;
}

export interface WalkthroughNarrationControls {
  /** Toggle mute on/off — muted stops current audio and skips future auto-play */
  toggleMute: () => void;
  /** Manually replay the current step's narration */
  replay: () => void;
}

interface StepContent {
  title: string;
  body: string;
}

const INITIAL_STATE: WalkthroughNarrationState = {
  isPlaying: false,
  isMuted: true, // starts muted — user must opt in
  isLoading: false,
  progress: 0,
  error: null,
};

export function useWalkthroughNarration(
  steps: StepContent[],
  currentStep: number,
): [WalkthroughNarrationState, WalkthroughNarrationControls] {
  const [state, setState] = useState<WalkthroughNarrationState>(INITIAL_STATE);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobCacheRef = useRef<Map<number, string>>(new Map());
  const prefetchingRef = useRef<Set<number>>(new Set());
  const mutedRef = useRef(true); // starts muted — user must opt in

  // ── Cleanup ────────────────────────────────────────────────────────

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
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // ── Fetch audio for a step ─────────────────────────────────────────

  const fetchAudio = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/simulation/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  // ── Pre-fetch a step ───────────────────────────────────────────────

  const prefetch = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= steps.length) return;
      if (blobCacheRef.current.has(stepIndex)) return;
      if (prefetchingRef.current.has(stepIndex)) return;
      prefetchingRef.current.add(stepIndex);

      const text = `${steps[stepIndex].title}. ${steps[stepIndex].body}`;
      fetchAudio(text).then((url) => {
        prefetchingRef.current.delete(stepIndex);
        if (url) blobCacheRef.current.set(stepIndex, url);
      });
    },
    [steps, fetchAudio],
  );

  // ── Play a specific step ───────────────────────────────────────────

  const playStep = useCallback(
    async (stepIndex: number) => {
      if (mutedRef.current) return;
      if (stepIndex >= steps.length) return;

      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setState((s) => ({ ...s, isLoading: true, progress: 0, error: null }));

      // Get audio (from cache or fetch)
      let blobUrl = blobCacheRef.current.get(stepIndex) ?? null;
      if (!blobUrl) {
        const text = `${steps[stepIndex].title}. ${steps[stepIndex].body}`;
        blobUrl = await fetchAudio(text);
      }

      if (!blobUrl) {
        setState((s) => ({
          ...s,
          isLoading: false,
          isPlaying: false,
          error: 'Narration unavailable',
        }));
        return;
      }

      // Cache it
      blobCacheRef.current.set(stepIndex, blobUrl);

      // Pre-fetch next
      prefetch(stepIndex + 1);

      // Play
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = blobUrl;

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setState((s) => ({
            ...s,
            progress: audio.currentTime / audio.duration,
          }));
        }
      };

      audio.onended = () => {
        setState((s) => ({ ...s, isPlaying: false, progress: 1 }));
      };

      audio.onerror = () => {
        setState((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          error: 'Audio playback failed',
        }));
      };

      setState((s) => ({ ...s, isLoading: false, isPlaying: true }));

      try {
        await audio.play();
      } catch {
        setState((s) => ({
          ...s,
          isPlaying: false,
          error: 'Audio blocked — tap the speaker to retry',
        }));
      }
    },
    [steps, fetchAudio, prefetch],
  );

  // ── Pre-fetch on mount (silent — no auto-play) ─────────────────────

  useEffect(() => {
    prefetch(0);
    prefetch(1);
  }, [prefetch]);

  // ── Play on step change only if user has opted in (unmuted) ────────

  const activatedRef = useRef(false); // true once user clicks the speaker
  useEffect(() => {
    if (!activatedRef.current) return; // never auto-play before user opts in
    if (mutedRef.current) return;
    playStep(currentStep);
  }, [currentStep, playStep]);

  // ── Controls ───────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;

    if (nextMuted) {
      if (audioRef.current) audioRef.current.pause();
      setState((s) => ({
        ...s,
        isMuted: true,
        isPlaying: false,
      }));
    } else {
      activatedRef.current = true; // user has opted in
      setState((s) => ({ ...s, isMuted: false }));
      playStep(currentStep);
    }
  }, [currentStep, playStep]);

  const replay = useCallback(() => {
    activatedRef.current = true;
    if (mutedRef.current) {
      mutedRef.current = false;
      setState((s) => ({ ...s, isMuted: false }));
    }
    playStep(currentStep);
  }, [currentStep, playStep]);

  const controls: WalkthroughNarrationControls = { toggleMute, replay };

  return [state, controls];
}
