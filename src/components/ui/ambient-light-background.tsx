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
      {/* Warm peach base — matches the peach tone visible at the bottom
          so the entire viewport reads as the same warm environment. */}
      <div className="absolute inset-0" style={{ backgroundColor: "#FFDCC0" }} />

      {/* Sunrise gradient — peach/coral top-to-bottom so the whole
          canvas has the saturated warm tone the user asked for, not
          just the bottom edge. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg,
            rgba(255, 220, 192, 1) 0%,
            rgba(255, 200, 160, 1) 40%,
            rgba(255, 180, 140, 1) 75%,
            rgba(255, 170, 120, 1) 100%
          )`,
        }}
      />

      {/* Subtle amber highlight near top-center — gentle focal warmth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255, 230, 190, 0.6) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
