// src/lib/journey/completion-chime.ts
//
// A short, gentle celebratory chime for the journey-complete moment. Synthesized
// with the Web Audio API — no audio asset, no dependency — so it stays small and
// pleasant rather than a canned fanfare. A rising C-major arpeggio (C–E–G–C)
// with a soft attack/decay per note.
//
// Degrades silently where audio is unavailable or blocked by autoplay policy.

export function playCompletionChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    // The celebration fires from a state change, not a direct click; if the
    // context starts suspended, try to resume (allowed because the user has
    // already interacted with the page to reach completion).
    ctx.resume?.().catch(() => {});

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.16; // modest — celebratory, not loud
    master.connect(ctx.destination);

    // C5, E5, G5, C6 — a bright major arpeggio.
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // soft, rounded tone
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(1, t + 0.02); // quick attack
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); // gentle decay
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.55);
    });

    // Close the context once the tail has finished so we don't leak it.
    window.setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    /* audio unsupported or blocked — degrade silently */
  }
}
