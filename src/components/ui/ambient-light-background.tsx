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
      {/* Warm base — cream/ivory instead of pure white. This alone
          gives the canvas a noticeably warm undertone. */}
      <div className="absolute inset-0" style={{ backgroundColor: "#FFF4D6" }} />

      {/* Primary warm glow — saturated amber center, fully opaque,
          normal blend so the colour is felt directly rather than
          multiplied against white. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 45%, #FFD966 0%, #FFE79A 35%, transparent 75%)",
          opacity: 0.75,
        }}
      />

      {/* Secondary peach wash — adds depth toward the bottom edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(255, 195, 140, 0.55) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
