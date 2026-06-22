"use client";

/**
 * Career Transition Map — Phase 1.
 *
 * A navigable career-navigation experience (not a flowchart): a premium hero
 * "bridge" card surrounded by strategic route cards, each with a one-line
 * blurb, typical duration, difficulty and success-likelihood. Desktop is a
 * zoom/pan canvas; mobile is a smooth vertical stack. Route data reuses the
 * deterministic bridge model + adds Related careers and a Reality check.
 *
 * Deferred to a later phase (needs per-transition route-ladder data): the
 * Shortest / Most realistic / Highest success / Lowest barrier views — shown
 * here as "Soon".
 */

import { useMemo, useRef, useState, useCallback } from "react";
import { Plus, Minus, Maximize, ExternalLink } from "lucide-react";
import type { BridgeMindmap, BridgeBranch } from "@/lib/journey/bridge-mindmap-types";
import { ROUTE_META, ROUTE_COLOR_CLASSES, type MapRouteKind } from "./route-meta";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import { getDisciplineForCareer } from "@/lib/education/alternatives";
import { getCareersForDiscipline } from "@/lib/discover/degree-to-careers";
import { cn } from "@/lib/utils";

/** A normalised route card the map renders. */
interface RouteCard {
  id: string;
  kind: MapRouteKind;
  leaves: { id: string; label: string; detail?: string; navFact?: boolean; tried?: boolean }[];
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[11px] tracking-tight" aria-label={`${n} of 5`}>
      <span className="text-amber-300">{"★".repeat(n)}</span>
      <span className="text-muted-foreground/30">{"★".repeat(5 - n)}</span>
    </span>
  );
}

const VIEWS = ["Full map", "Shortest", "Most realistic", "Highest success"] as const;

export function CareerTransitionMap({
  model,
  targetCareer,
  previousOccupation,
}: {
  model: BridgeMindmap;
  targetCareer: string;
  previousOccupation: string | null;
}) {
  const { getCareerById } = useCareerCatalog();

  // Related careers — same discipline as the target, excluding it. Best-effort.
  const related = useMemo(() => {
    const discipline = getDisciplineForCareer(targetCareer);
    if (!discipline) return [];
    const ids = getCareersForDiscipline(discipline).slice(0, 18);
    const titles = ids
      .map((id) => getCareerById(id)?.title)
      .filter((t): t is string => !!t && t.toLowerCase() !== targetCareer.toLowerCase());
    return Array.from(new Set(titles)).slice(0, 6);
  }, [targetCareer, getCareerById]);

  // Build the route-card list: bridge branches + Related + Reality.
  const cards: RouteCard[] = useMemo(() => {
    const fromBranches: RouteCard[] = model.branches.map((b: BridgeBranch) => ({
      id: b.id,
      kind: b.kind as MapRouteKind,
      leaves: b.leaves.map((l) => ({
        id: l.id,
        label: l.label,
        detail: l.detail,
        navFact: l.navFact,
        tried: l.state === "tried",
      })),
    }));
    const reality: RouteCard = {
      id: "reality",
      kind: "reality",
      leaves: [
        { id: "r1", label: "Typical transition: 1–3 years", detail: "Most people move in steps, not one leap." },
        { id: "r2", label: "Extra training: helpful, rarely mandatory", detail: "Evidence often matters more than another full qualification." },
        { id: "r3", label: "Common mistake: applying too early", detail: "Build a little proof first — it changes the response rate." },
      ],
    };
    const relatedCard: RouteCard | null = related.length
      ? { id: "related", kind: "related", leaves: related.map((t, i) => ({ id: `rel-${i}`, label: t })) }
      : null;
    return [...fromBranches, ...(relatedCard ? [relatedCard] : []), reality];
  }, [model.branches, related]);

  return (
    <div className="flex h-full flex-col">
      {/* View toggle */}
      <div className="flex flex-wrap items-center gap-1.5 px-1 pb-3">
        {VIEWS.map((v, i) => (
          <button
            key={v}
            type="button"
            disabled={i !== 0}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
              i === 0
                ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                : "border-border/30 bg-muted/10 text-muted-foreground/40 cursor-not-allowed",
            )}
            title={i === 0 ? "All routes" : "Coming soon"}
          >
            {v}
            {i !== 0 && <span className="ml-1 text-[9px] uppercase tracking-wide opacity-70">soon</span>}
          </button>
        ))}
      </div>

      {/* Desktop: zoom/pan canvas. Mobile: vertical stack. */}
      <DesktopCanvas
        cards={cards}
        targetCareer={targetCareer}
        previousOccupation={previousOccupation}
      />
      <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-6">
        <HeroCard targetCareer={targetCareer} previousOccupation={previousOccupation} />
        {cards.map((c) => (
          <RouteCardView key={c.id} card={c} />
        ))}
        <NavNote />
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function HeroCard({ targetCareer, previousOccupation }: { targetCareer: string; previousOccupation: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-400/30 bg-gradient-to-br from-teal-600/90 to-emerald-700/80 p-5 shadow-xl shadow-teal-900/30">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-300/20 blur-2xl" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100/90">Your bridge</span>
      <p className="mt-1 text-xl font-bold leading-tight text-white">{targetCareer}</p>
      {previousOccupation && (
        <p className="mt-0.5 text-sm text-teal-100/90">from {previousOccupation}</p>
      )}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-medium text-teal-50">
        Estimated transition · 12–36 months
      </div>
    </div>
  );
}

function NavNote() {
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
      <ExternalLink className="h-3 w-3" /> NAV routes are guidance — confirm details with your NAV advisor on nav.no.
    </p>
  );
}

/* ── Route card ───────────────────────────────────────────────────── */
function RouteCardView({ card, className }: { card: RouteCard; className?: string }) {
  const meta = ROUTE_META[card.kind];
  const c = ROUTE_COLOR_CLASSES[meta.color];
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("rounded-xl border bg-card/80 backdrop-blur-sm shadow-lg", c.border, c.glow, className)}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full p-3.5 text-left">
        <div className="flex items-start gap-2.5">
          <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", c.dot)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground/90 leading-tight">{meta.title}</p>
              {card.kind !== "tried" && card.kind !== "related" && card.kind !== "reality" && <Stars n={meta.likelihood} />}
            </div>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground/80">{meta.blurb}</p>
            {meta.duration !== "—" && (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground/70">
                <span><span className="text-muted-foreground/50">Duration:</span> {meta.duration}</span>
                <span><span className="text-muted-foreground/50">Difficulty:</span> {meta.difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </button>
      {open && card.leaves.length > 0 && (
        <ul className="space-y-1.5 border-t border-border/20 px-3.5 py-3">
          {card.leaves.map((lf) => (
            <li key={lf.id} className={cn("text-[12px]", lf.tried && "text-muted-foreground/60 line-through")}>
              <span className="flex items-start gap-2">
                <span className={cn("mt-1 h-1 w-1 shrink-0 rounded-full", lf.navFact ? "bg-teal-400" : c.dot)} />
                <span>
                  <span className="font-medium text-foreground/85">{lf.label}</span>
                  {lf.detail && <span className="block text-[11px] text-muted-foreground/70">{lf.detail}</span>}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Desktop zoom/pan canvas ──────────────────────────────────────── */
function DesktopCanvas({
  cards,
  targetCareer,
  previousOccupation,
}: {
  cards: RouteCard[];
  targetCareer: string;
  previousOccupation: string | null;
}) {
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const zoom = useCallback((delta: number) => {
    setT((p) => ({ ...p, scale: Math.min(2, Math.max(0.5, +(p.scale + delta).toFixed(2))) }));
  }, []);
  const reset = useCallback(() => setT({ scale: 1, x: 0, y: 0 }), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // only zoom on ctrl/⌘ + wheel; plain wheel scrolls
    e.preventDefault();
    setT((p) => ({ ...p, scale: Math.min(2, Math.max(0.5, +(p.scale - e.deltaY * 0.002).toFixed(2))) }));
  }, []);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setT((p) => ({ ...p, x: drag.current!.tx + (e.clientX - drag.current!.x), y: drag.current!.ty + (e.clientY - drag.current!.y) }));
  };
  const onPointerUp = () => { drag.current = null; };

  // Simple layout: hero on the left, route cards stacked on the right.
  const HERO_W = 280, CARD_W = 320, GAP = 18, CARD_H = 132, HERO_H = 150;
  const colX = HERO_W + 120;
  const totalH = Math.max(cards.length * (CARD_H + GAP) - GAP, HERO_H);
  const heroY = totalH / 2 - HERO_H / 2;

  return (
    <div
      className="relative hidden md:block flex-1 overflow-hidden rounded-xl border border-border/20 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.06),transparent_60%)]"
      onWheel={onWheel}
    >
      {/* controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoom(0.2)} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => zoom(-0.2)} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={reset} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Reset view"><Maximize className="h-3.5 w-3.5" /></button>
      </div>
      <p className="absolute left-3 bottom-2 z-10 text-[10px] text-muted-foreground/50">Drag to pan · ⌘/Ctrl + scroll to zoom</p>

      <div
        className="absolute left-8 top-8 cursor-grab active:cursor-grabbing touch-none"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`, transformOrigin: "0 0" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ position: "relative", width: colX + CARD_W, height: totalH }}>
          {/* edges */}
          <svg className="absolute inset-0 pointer-events-none" width={colX + CARD_W} height={totalH} aria-hidden>
            {cards.map((_, i) => {
              const cy = i * (CARD_H + GAP) + CARD_H / 2;
              const x1 = HERO_W, y1 = heroY + HERO_H / 2, x2 = colX, y2 = cy;
              const mx = (x1 + x2) / 2;
              return <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" className="stroke-teal-500/30" strokeWidth={2} />;
            })}
          </svg>
          {/* hero */}
          <div style={{ position: "absolute", left: 0, top: heroY, width: HERO_W }}>
            <HeroCard targetCareer={targetCareer} previousOccupation={previousOccupation} />
          </div>
          {/* route cards */}
          {cards.map((card, i) => (
            <div key={card.id} style={{ position: "absolute", left: colX, top: i * (CARD_H + GAP), width: CARD_W }}>
              <RouteCardView card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
