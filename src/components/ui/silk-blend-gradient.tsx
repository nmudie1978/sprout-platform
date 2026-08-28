// GradientBackground — "Silk Blend gradient", from the 21st.dev Gradient
// Builder, exported as live CSS (the builder's Copy-CSS background plus its
// soften-blur and grain passes). Zero dependencies: one <div> that fills its
// parent. Drop it behind your content:
// <div className="relative h-96"><GradientBackground className="absolute inset-0" /></div>
// Remix the source recipe (colors, mode, finish) in the editor:
// https://21st.dev/community/gradients/editor?from=a1ae0c0e-7273-4673-8406-1cf567fe6544
//
// ── One deliberate change from the exported recipe ──────────────────────────
// The builder's stops are #4C6CB3 → #B28FCE → #F4B3C2. Used as a full-app
// canvas that blue top measures 3.52:1 against the theme's ink — below WCAG AA
// for body text, and this app puts prose directly on the canvas in places. Each
// stop is therefore lifted one step, which keeps the blue → lilac → pink
// journey intact and takes every stop clear of 4.5:1:
//
//   stop     as-exported          shipped            contrast vs --foreground
//   blue     #4C6CB3  3.52 ✗      #7B93CC             5.90 ✓
//   lilac    #B28FCE  6.61 ✓      #C7AEDC             9.01 ✓
//   pink     #F4B3C2 10.35 ✓      #F7C9D4            12.22 ✓
//
// Revert to the exported values only alongside a plan for prose that sits
// directly on the canvas near the top of a page.
//
// The palette is fixed here, NOT token-derived, so `--background` in
// globals.css must move with it — it is set to SILK_BLEND_BASE below, which is
// what shows anywhere this layer doesn't reach.

/** The gradient's first stop. Keep `--background` in globals.css equal to this. */
export const SILK_BLEND_BASE = "#7B93CC";

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-1cqmin",
          filter: "blur(0.5cqmin)",
          backgroundColor: SILK_BLEND_BASE,
          backgroundImage:
            "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.095'/></svg>\"), radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 52%, rgba(0, 0, 0, 0.016) 100%), linear-gradient(170deg, #7B93CC 0%, #C7AEDC 53%, #F7C9D4 100%)",
          backgroundSize: "120px 120px, auto, auto",
          backgroundBlendMode: "overlay, normal, normal",
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.095,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="grain-a1ae0c0e">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-a1ae0c0e)" />
      </svg>
    </div>
  )
}
