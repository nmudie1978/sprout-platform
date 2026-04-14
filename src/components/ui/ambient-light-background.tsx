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
      {/* Base canvas — clean white so the central glow reads warmly */}
      <div className="absolute inset-0 bg-white" />

      {/* Soft yellow glow — single centered radial, multiply-blended so
          it tints white surfaces warmly without washing them out.
          Boosted ~50%: opacity 0.6 → 0.9 and the glow radius extended
          to 90% so the warmth reaches closer to the edges. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #FFF991 0%, transparent 90%)",
          opacity: 0.9,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
