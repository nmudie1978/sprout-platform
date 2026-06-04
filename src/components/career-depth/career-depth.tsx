// src/components/career-depth/career-depth.tsx
"use client";

import { useEffect, useState } from "react";
import { Sun, TrendingUp } from "lucide-react";
import type { CareerLike } from "@/lib/career-voices/match";
import { daySnapshot, salaryLevels, type DaySnapshot } from "@/lib/career-depth/snapshot";
import type { CareerLevel } from "@/lib/career-progressions";

const LEVEL_LABEL: Record<string, string> = { entry: "Entry", mid: "Mid", senior: "Senior", lead: "Lead" };

export function CareerDepth({ career }: { career: CareerLike }) {
  const [day, setDay] = useState<DaySnapshot | null>(null);
  const [levels, setLevels] = useState<CareerLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/career-details/${career.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return;
        if (d) {
          setDay(daySnapshot(d.details, !!d.hasDetails));
          setLevels(salaryLevels(d.progression ?? null));
        }
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
  if (!day && levels.length === 0) return null;

  return (
    <div className="space-y-3">
      {day && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sun className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-muted-foreground">A day in the life</span>
          </div>
          {day.realityCheck && (
            <p className="text-[11px] leading-relaxed text-foreground/80">{day.realityCheck}</p>
          )}
          {day.doing.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {day.doing.map((t, i) => (
                <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {levels.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-teal-500" />
            <span className="text-[10px] font-medium text-muted-foreground">How your pay grows</span>
          </div>
          <div className="space-y-1">
            {levels.map((l) => (
              <div key={l.level} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="font-medium">
                  {LEVEL_LABEL[l.level] ?? l.level}
                  <span className="ml-1 font-normal text-muted-foreground/60">· {l.yearsExperience}</span>
                </span>
                <span className="text-muted-foreground">{l.salaryRange}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60">Full day-in-the-life &amp; roadmap in My Journey</p>
    </div>
  );
}
