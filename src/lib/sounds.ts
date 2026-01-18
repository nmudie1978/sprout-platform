/**
 * Sound effects using Web Audio API
 * No external audio files needed - synthesized on the fly
 */

type SoundType = "success" | "apply" | "notification" | "error";

export function playSound(type: SoundType = "success") {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    switch (type) {
      case "apply":
        // Funky celebratory sound for job applications
        playApplySound(ctx);
        break;
      case "success":
        playSuccessSound(ctx);
        break;
      case "notification":
        playNotificationSound(ctx);
        break;
      case "error":
        playErrorSound(ctx);
        break;
    }
  } catch (e) {
    // Silently fail if audio isn't supported
    console.debug("Audio playback not supported");
  }
}

function playApplySound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Create a funky ascending arpeggio
  const notes = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 0.08 },   // E5
    { freq: 783.99, time: 0.16 },   // G5
    { freq: 1046.50, time: 0.24 },  // C6
  ];

  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.15);

    osc.start(now + time);
    osc.stop(now + time + 0.2);
  });

  // Add a little sparkle/shimmer at the end
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();

  shimmer.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);

  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(1318.51, now + 0.28); // E6
  shimmer.frequency.exponentialRampToValueAtTime(2093, now + 0.4); // C7

  shimmerGain.gain.setValueAtTime(0.2, now + 0.28);
  shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  shimmer.start(now + 0.28);
  shimmer.stop(now + 0.55);
}

function playSuccessSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Simple two-tone success sound
  [440, 554.37].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    const startTime = now + i * 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}

function playNotificationSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.start(now);
  osc.stop(now + 0.2);
}

function playErrorSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.15);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.25);
}
