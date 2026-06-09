"use client";

import React, { useState, useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A single card in the circular gallery. */
export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  /** Secondary line, e.g. "Podcast · WorkLife with Adam Grant". */
  subtitle?: string;
  /** Type chip, e.g. "Article" | "Podcast" | "Video". */
  badge?: string;
  /** When set, the card becomes a link that opens in a new tab. */
  href?: string;
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** How far the cards sit from the centre. */
  radius?: number;
  /** Degrees added per animation frame while idle. */
  autoRotateSpeed?: number;
}

/**
 * A 3D ring of image cards that rotates on its own and can be dragged to spin.
 * Designed to live inside a fixed-height container (no page-scroll coupling).
 */
const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 460, autoRotateSpeed = 0.03, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [hovered, setHovered] = useState(false);
    const rafRef = useRef<number | null>(null);
    const drag = useRef({ active: false, startX: 0, startRot: 0, moved: false });

    // Auto-rotate while neither hovered nor being dragged.
    useEffect(() => {
      const tick = () => {
        if (!hovered && !drag.current.active) {
          setRotation((r) => r + autoRotateSpeed);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [hovered, autoRotateSpeed]);

    const onPointerDown = (e: React.PointerEvent) => {
      drag.current = { active: true, startX: e.clientX, startRot: rotation, moved: false };
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* unsupported — drag still works without capture */
      }
    };
    const onPointerMove = (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > 4) drag.current.moved = true;
      setRotation(drag.current.startRot + dx * 0.3);
    };
    const endDrag = (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* no-op */
      }
    };

    const anglePerItem = items.length > 0 ? 360 / items.length : 0;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Content gallery"
        className={cn(
          "relative flex h-full w-full select-none items-center justify-center touch-pan-y",
          className,
        )}
        style={{ perspective: "2000px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        <div
          className="relative h-full w-full"
          style={{ transform: `rotateY(${rotation}deg)`, transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const relativeAngle = (itemAngle + (rotation % 360) + 360) % 360;
            const normalised = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.25, 1 - normalised / 180);

            const inner = (
              <div className="group relative h-full w-full overflow-hidden rounded-lg border border-border bg-card/70 shadow-2xl backdrop-blur-lg dark:bg-card/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {item.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    {item.badge}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 text-white">
                  <h3 className="line-clamp-3 text-sm font-semibold leading-snug">{item.title}</h3>
                  {item.subtitle && (
                    <p className="mt-1 line-clamp-1 text-[11px] opacity-75">{item.subtitle}</p>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={item.id}
                role="group"
                aria-label={item.title}
                className="absolute h-[300px] w-[220px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-110px",
                  marginTop: "-150px",
                  opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                    // Suppress the click that ends a drag (so dragging never opens a card).
                    onClick={(e) => {
                      if (drag.current.moved) e.preventDefault();
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
