/**
 * AmbientLightBackground
 *
 * Light-mode canvas: dark slate base (#020617) with a soft grey
 * radial glow at the top. Static — no animation, no WebGL, just CSS.
 * Paired with frosted-glass card/popover overrides in globals.css so
 * the glow shows through sidebar, modals, and panels everywhere.
 *
 * Dark mode is untouched (this node renders `dark:hidden`).
 * Mounted once in the dashboard layout.
 */
export function AmbientLightBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none dark:hidden"
      style={{ backgroundColor: "#020617" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)",
        }}
      />
    </div>
  )
}
