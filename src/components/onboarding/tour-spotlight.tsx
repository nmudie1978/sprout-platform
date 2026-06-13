"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ── TourSpotlight ──────────────────────────────────────────────────────
//
// A calm "spotlight" layer for the first-login walkthrough. Given the sidebar
// href the current step describes, it dims the screen and punches a crisp
// (un-blurred) hole over the matching sidebar item — found via its
// `data-tour-target` attribute — ringed in a gently pulsing teal so the user
// sees *where* that feature lives.
//
// Layering (see the design doc): this renders into document.body at z-90 with
// pointer-events: none, sitting above the sidebar (z-20) but below the
// walkthrough's Radix overlay/card (z-100). The walkthrough makes its own Radix
// overlay transparent, so this is the only dim — and because it dims via a
// box-shadow rather than a backdrop blur, the highlighted item stays sharp.
//
// When there's no target (intro/CTA steps) or the element isn't on screen
// (e.g. mobile, where the sidebar is hidden), it falls back to a uniform light
// dim so those steps still read as a modal.

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DIM = "rgba(2, 6, 23, 0.5)"; // slate-950 @ 50% — matches the app's modal dim
const PAD = 6; // breathing room around the highlighted item
const SPOTLIGHT_Z = 90;

export function TourSpotlight({
  targetHref,
  active,
}: {
  targetHref: string | null;
  active: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active || !targetHref) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector(
        `[data-tour-target="${CSS.escape(targetHref)}"]`,
      );
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      // Zero-size means hidden (e.g. the sidebar is display:none on mobile) —
      // fall back to the plain dim rather than a hole at 0,0.
      if (r.width === 0 || r.height === 0) {
        setRect(null);
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    measure();
    // Re-measure once on the next frame in case the sidebar/layout is still
    // settling when the step changes, then keep it pinned through scroll/resize.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [targetHref, active]);

  if (!mounted || !active) return null;

  const content = (
    <>
      {/* Keep the pulse calm and respect reduced-motion. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes tourSpotlightPulse {
            0%, 100% { box-shadow: ${`0 0 0 9999px ${DIM}, 0 0 0 1px rgba(45,212,191,0.9), 0 0 14px 2px rgba(45,212,191,0.35)`}; }
            50%      { box-shadow: ${`0 0 0 9999px ${DIM}, 0 0 0 2px rgba(45,212,191,1), 0 0 22px 6px rgba(45,212,191,0.55)`}; }
          }
        }
      `}</style>

      {rect ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 12,
            zIndex: SPOTLIGHT_Z,
            pointerEvents: "none",
            // Static base (used when reduced-motion disables the animation),
            // then the keyframes take over to gently pulse the teal ring.
            boxShadow: `0 0 0 9999px ${DIM}, 0 0 0 1px rgba(45,212,191,0.9), 0 0 14px 2px rgba(45,212,191,0.35)`,
            animation: "tourSpotlightPulse 2.4s ease-in-out infinite",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: SPOTLIGHT_Z,
            pointerEvents: "none",
            background: DIM,
          }}
        />
      )}
    </>
  );

  return createPortal(content, document.body);
}
