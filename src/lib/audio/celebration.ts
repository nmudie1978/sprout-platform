/**
 * Short celebratory chime using Web Audio API.
 * No external files — generates a pleasant ascending arpeggio.
 */
export function playCelebrationChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Ascending notes: C5, E5, G5, C6 (major arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const noteDuration = 0.15;
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Soft envelope
      const noteStart = startTime + i * noteDuration;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration + 0.2);
    });

    // Final shimmer — higher octave ping
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 2093.0; // C7
    const shimmerStart = startTime + notes.length * noteDuration;
    shimmerGain.gain.setValueAtTime(0, shimmerStart);
    shimmerGain.gain.linearRampToValueAtTime(0.06, shimmerStart + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, shimmerStart + 0.5);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(shimmerStart);
    shimmer.stop(shimmerStart + 0.6);

    // Clean up context after sounds finish
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Silent fail — audio is non-critical
  }
}
