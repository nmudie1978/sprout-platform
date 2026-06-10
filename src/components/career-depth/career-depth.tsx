// src/components/career-depth/career-depth.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, Compass } from "lucide-react";
import { fitSnapshot, type FitSnapshot } from "@/lib/career-depth/snapshot";

/** Minimal career shape this card needs (id + title). */
interface CareerLike {
  id: string;
  title: string;
}

export function CareerDepth({ career }: { career: CareerLike }) {
  const [fit, setFit] = useState<FitSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/career-details/${career.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return;
        if (d) setFit(fitSnapshot(d.details, !!d.hasDetails));
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [career.id]);

  if (loading) return null;
  // "A day in the life" and "How your pay grows" deliberately live ONLY in My
  // Journey now — they were removed from the radar / detail card. The card
  // keeps the lightweight fit signals and points to My Journey for the rest.
  if (!fit || (fit.whoThisIsGoodFor.length === 0 && fit.entryPaths.length === 0)) return null;

  return (
    <div className="space-y-3">
      {fit.whoThisIsGoodFor.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Users className="h-3 w-3 text-teal-500" />
            <span className="text-[10px] font-medium text-muted-foreground">Who tends to thrive here</span>
          </div>
          <ul className="space-y-0.5">
            {fit.whoThisIsGoodFor.map((t, i) => (
              <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
            ))}
          </ul>
        </div>
      )}

      {fit.entryPaths.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Compass className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-muted-foreground">Common ways in</span>
          </div>
          <ul className="space-y-0.5">
            {fit.entryPaths.map((t, i) => (
              <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60">Full day-in-the-life &amp; roadmap in My Journey</p>
    </div>
  );
}
