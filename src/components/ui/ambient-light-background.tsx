/**
 * AmbientLightBackground
 *
 * App-shell background for light mode. Renders a fixed, full-viewport
 * layer containing a near-white canvas with several very soft blurred
 * radial glows in the corners. Designed to feel quiet and premium —
 * the palette is muted lavender/rose/sky rather than saturated aurora.
 *
 * Usage: mount once inside the dashboard layout (or any shell that
 * wraps light-mode pages). The component is hidden in dark mode via
 * `dark:hidden`.
 *
 * Design goals:
 * - Barely-there ambient richness; never competes with foreground
 * - Works at all viewport sizes (radial gradients scale naturally)
 * - Zero JS, pure CSS for performance
 * - pointer-events-none so it never blocks clicks
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden overflow-hidden"
    >
      {/* Warm cream base — overrides the body's bg with a clearly
          warm canvas. Shows in all the gaps between cards. */}
      <div className="absolute inset-0" style={{ backgroundColor: "#FFE8B3" }} />

      {/* Primary amber glow — full amber center fading to the warm
          cream. Covers the whole viewport so warmth is consistent. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #FFCA5C 0%, #FFDC8A 40%, transparent 85%)",
        }}
      />

      {/* Peach wash from below — adds sunset-style depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(255, 170, 120, 0.65) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
