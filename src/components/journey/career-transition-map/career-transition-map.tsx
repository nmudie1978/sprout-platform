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

import { useMemo, useRef, useState, useCallback, useLayoutEffect } from "react";
import { Plus, Minus, Maximize, ExternalLink } from "lucide-react";
import type { BridgeMindmap, BridgeBranch } from "@/lib/journey/bridge-mindmap-types";
import { ROUTE_META, ROUTE_COLOR_CLASSES, type MapRouteKind } from "./route-meta";
import { getRouteLadders, ROUTE_VIEW_KEYS, ROUTE_VIEW_LABELS, ROUTE_VIEW_BLURB, type RouteViewKey } from "./route-ladders";
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

type ViewKey = "full" | RouteViewKey;

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
  const [view, setView] = useState<ViewKey>("full");
  const ladders = useMemo(() => getRouteLadders(targetCareer), [targetCareer]);

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
      {/* View toggle — only shown when curated route-views exist for this
          target. On the career-changer map (no curated ladders) the Full map
          is the only view, so we hide the toggle entirely rather than show
          disabled "Soon" buttons. */}
      {ladders && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 pb-3">
          <button
            type="button"
            onClick={() => setView("full")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
              view === "full" ? "border-teal-500/40 bg-teal-500/15 text-teal-300" : "border-border/30 bg-muted/10 text-muted-foreground/70 hover:bg-muted/20",
            )}
          >
            Full map
          </button>
          {ROUTE_VIEW_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              title={ROUTE_VIEW_BLURB[k]}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium border transition-colors",
                view === k
                  ? "border-teal-500/40 bg-teal-500/15 text-teal-300"
                  : "border-border/30 bg-muted/10 text-muted-foreground/70 hover:bg-muted/20",
              )}
            >
              {ROUTE_VIEW_LABELS[k]}
            </button>
          ))}
        </div>
      )}

      {view === "full" ? (
        <>
          {/* Desktop: zoom/pan canvas. Mobile: vertical stack. */}
          <DesktopCanvas cards={cards} targetCareer={targetCareer} previousOccupation={previousOccupation} />
          <div className="md:hidden flex-1 overflow-y-auto space-y-3 pb-6">
            <HeroCard targetCareer={targetCareer} previousOccupation={previousOccupation} />
            {cards.map((c) => (
              <RouteCardView key={c.id} card={c} />
            ))}
            <NavNote />
          </div>
        </>
      ) : (
        ladders && (
          <RouteLadderView
            key={view}
            steps={ladders[view]}
            viewKey={view}
            from={previousOccupation}
          />
        )
      )}
    </div>
  );
}

/* ── Route ladder (Shortest / Most realistic / …) ─────────────────── */
function RouteLadderView({
  steps,
  viewKey,
  from,
}: {
  steps: { role: string; duration: string; why: string }[];
  viewKey: RouteViewKey;
  from: string | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-1 pb-6 animate-in fade-in duration-200">
      <p className="mb-5 max-w-xl text-[12.5px] leading-snug text-muted-foreground/80">{ROUTE_VIEW_BLURB[viewKey]}</p>
      <ol className="relative mx-auto max-w-xl space-y-4 border-l border-border/40 pl-6">
        {/* start */}
        <li className="relative">
          <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-muted-foreground/40 bg-background" />
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/55">{from ? `From ${from}` : "Where you are now"}</p>
        </li>
        {steps.map((s, i) => {
          const isTarget = i === steps.length - 1;
          return (
            <li key={i} className="relative">
              <span
                className={cn(
                  "absolute -left-[33px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                  isTarget ? "bg-indigo-500 text-white" : "bg-teal-500/80 text-white",
                )}
              >
                {isTarget ? "★" : i + 1}
              </span>
              <div
                className={cn(
                  "rounded-xl border p-3.5 shadow-sm",
                  isTarget ? "border-indigo-400/40 bg-indigo-500/10" : "border-border/40 bg-card/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-semibold leading-tight", isTarget ? "text-indigo-200" : "text-foreground/90")}>{s.role}</p>
                  <span className="shrink-0 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground/80">{s.duration}</span>
                </div>
                <p className="mt-1 text-[12px] leading-snug text-muted-foreground/75">{s.why}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function HeroCard({ targetCareer, previousOccupation }: { targetCareer: string; previousOccupation: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600/85 to-indigo-900/90 p-5 shadow-xl shadow-indigo-950/40">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200/90">Your bridge to</span>
      <p className="mt-1 text-xl font-bold leading-tight text-white">{targetCareer}</p>
      {previousOccupation && (
        <p className="mt-0.5 text-sm text-indigo-200/90">from {previousOccupation}</p>
      )}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-indigo-50">
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

/* ── Desktop zoom/pan canvas (mindmap) ────────────────────────────────
 * hero (left) → route cards (middle column). Click a card to fan its
 * sub-items out as their own connected child nodes to the right — a true
 * mindmap branch, not stacked text. The vertical layout is *measured*
 * (real node heights) so an expanded branch never overlaps the next one.
 */
const HERO_W = 260, HERO_H = 150;
const CARD_W = 300, CHILD_W = 250;
const COL_GAP = 96;        // hero → card column
const CHILD_GAP_X = 64;    // card → child column
const V_GAP = 20;          // between card "slots"
const CHILD_V_GAP = 12;    // between child nodes
const cardX = HERO_W + COL_GAP;
const childX = cardX + CARD_W + CHILD_GAP_X;
const CANVAS_W = childX + CHILD_W;

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const zoom = useCallback((delta: number) => {
    setT((p) => ({ ...p, scale: Math.min(2, Math.max(0.5, +(p.scale + delta).toFixed(2))) }));
  }, []);
  const reset = useCallback(() => setT({ scale: 1, x: 0, y: 0 }), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setT((p) => ({ ...p, scale: Math.min(2, Math.max(0.5, +(p.scale - e.deltaY * 0.002).toFixed(2))) }));
    } else {
      setT((p) => ({
        ...p,
        x: p.x - (e.shiftKey ? e.deltaY : e.deltaX),
        y: p.y - (e.shiftKey ? 0 : e.deltaY),
      }));
    }
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

  // Measure real node heights so the layout never overlaps.
  const elRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const setRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      if (el) elRefs.current.set(key, el);
      else elRefs.current.delete(key);
    },
    [],
  );
  const [heights, setHeights] = useState<Record<string, number>>({});
  // Measure intrinsic node heights after the set of nodes changes (cards or
  // which card is expanded). Heights are content-based, not position-based, so
  // one measure pass per change is enough; the guard makes the update a no-op
  // when nothing moved, so this never loops.
  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    elRefs.current.forEach((el, key) => { next[key] = el.offsetHeight; });
    setHeights((prev) => {
      const keys = Object.keys(next);
      const same = keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === next[k]);
      return same ? prev : next;
    });
  }, [cards, expandedId]);

  const expanded = expandedId ? cards.find((c) => c.id === expandedId) ?? null : null;

  // Vertical stacking: each card gets a "slot" tall enough for itself or its
  // expanded children, whichever is larger; the card sits centred in its slot.
  const layout = useMemo(() => {
    const cardPos: Record<string, { x: number; y: number; h: number }> = {};
    const childPos: Record<string, { x: number; y: number; h: number }> = {};
    let y = 0;
    for (const card of cards) {
      const ch = heights[`card:${card.id}`] ?? 130;
      let slotH = ch;
      if (card.id === expandedId && card.leaves.length) {
        const chs = card.leaves.map((l) => heights[`child:${card.id}:${l.id}`] ?? 52);
        const totalChildH = chs.reduce((a, b) => a + b, 0) + (chs.length - 1) * CHILD_V_GAP;
        slotH = Math.max(ch, totalChildH);
        let cy = y + slotH / 2 - totalChildH / 2;
        card.leaves.forEach((l, idx) => {
          childPos[`${card.id}:${l.id}`] = { x: childX, y: cy, h: chs[idx] };
          cy += chs[idx] + CHILD_V_GAP;
        });
      }
      cardPos[card.id] = { x: cardX, y: y + slotH / 2 - ch / 2, h: ch };
      y += slotH + V_GAP;
    }
    const contentH = Math.max(y - V_GAP, HERO_H);
    return { cardPos, childPos, contentH, heroY: contentH / 2 - HERO_H / 2 };
  }, [cards, expandedId, heights]);

  const canvasW = expanded ? CANVAS_W : cardX + CARD_W;

  return (
    <div
      className="relative hidden md:block flex-1 overflow-hidden rounded-xl border border-border/20 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.06),transparent_60%)]"
      onWheel={onWheel}
    >
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoom(0.2)} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => zoom(-0.2)} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={reset} className="rounded-md border border-border/40 bg-card/80 p-1.5 text-muted-foreground hover:text-foreground" title="Reset view"><Maximize className="h-3.5 w-3.5" /></button>
      </div>
      <p className="absolute left-3 bottom-2 z-10 text-[10px] text-muted-foreground/50">Click a route to open its branches · scroll or drag to move · ⌘/Ctrl + scroll to zoom</p>

      <div
        className="absolute left-8 top-8 cursor-grab active:cursor-grabbing touch-none"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`, transformOrigin: "0 0" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ position: "relative", width: canvasW, height: layout.contentH }}>
          {/* connectors */}
          <svg className="absolute inset-0 pointer-events-none" width={canvasW} height={layout.contentH} aria-hidden>
            {/* hero → each card */}
            {cards.map((card) => {
              const cp = layout.cardPos[card.id];
              const x1 = HERO_W, y1 = layout.heroY + HERO_H / 2, x2 = cp.x, y2 = cp.y + cp.h / 2;
              const mx = (x1 + x2) / 2;
              return <path key={card.id} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" className={cn("stroke-teal-500/30", card.id === expandedId && "stroke-teal-400/60")} strokeWidth={2} />;
            })}
            {/* expanded card → each child */}
            {expanded?.leaves.map((l) => {
              const cp = layout.cardPos[expanded.id];
              const kp = layout.childPos[`${expanded.id}:${l.id}`];
              if (!kp) return null;
              const x1 = cp.x + CARD_W, y1 = cp.y + cp.h / 2, x2 = kp.x, y2 = kp.y + kp.h / 2;
              const mx = (x1 + x2) / 2;
              return <path key={l.id} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" className="stroke-teal-400/40" strokeWidth={1.5} />;
            })}
          </svg>

          {/* hero */}
          <div ref={setRef("hero")} style={{ position: "absolute", left: 0, top: layout.heroY, width: HERO_W }}>
            <HeroCard targetCareer={targetCareer} previousOccupation={previousOccupation} />
          </div>

          {/* route cards */}
          {cards.map((card) => {
            const cp = layout.cardPos[card.id];
            return (
              <div key={card.id} ref={setRef(`card:${card.id}`)} style={{ position: "absolute", left: cp.x, top: cp.y, width: CARD_W }}>
                <CanvasCard
                  card={card}
                  expanded={card.id === expandedId}
                  onToggle={() => setExpandedId((id) => (id === card.id ? null : card.id))}
                />
              </div>
            );
          })}

          {/* children of the expanded card */}
          {expanded?.leaves.map((l) => {
            const kp = layout.childPos[`${expanded.id}:${l.id}`];
            if (!kp) return null;
            const meta = ROUTE_META[expanded.kind];
            return (
              <div key={l.id} ref={setRef(`child:${expanded.id}:${l.id}`)} style={{ position: "absolute", left: kp.x, top: kp.y, width: CHILD_W }}>
                <ChildNode leaf={l} color={ROUTE_COLOR_CLASSES[meta.color]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Canvas card (header only; children render as separate nodes) ──── */
function CanvasCard({ card, expanded, onToggle }: { card: RouteCard; expanded: boolean; onToggle: () => void }) {
  const meta = ROUTE_META[card.kind];
  const c = ROUTE_COLOR_CLASSES[meta.color];
  const hasLeaves = card.leaves.length > 0;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full rounded-xl border bg-card/90 p-3.5 text-left shadow-lg backdrop-blur-sm transition-colors",
        c.border, c.glow,
        expanded && "ring-1 ring-teal-400/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", c.dot)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight text-foreground/90">{meta.title}</p>
            {card.kind !== "tried" && card.kind !== "related" && card.kind !== "reality" && <Stars n={meta.likelihood} />}
          </div>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground/80">{meta.blurb}</p>
          {meta.duration !== "—" && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground/70">
              <span><span className="text-muted-foreground/50">Duration:</span> {meta.duration}</span>
              <span><span className="text-muted-foreground/50">Difficulty:</span> {meta.difficulty}</span>
            </div>
          )}
          {hasLeaves && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-teal-300/90">
              {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {expanded ? "Hide branches" : `${card.leaves.length} branch${card.leaves.length === 1 ? "" : "es"}`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Child node (one sub-branch leaf) ─────────────────────────────── */
function ChildNode({ leaf, color }: { leaf: RouteCard["leaves"][number]; color: (typeof ROUTE_COLOR_CLASSES)[keyof typeof ROUTE_COLOR_CLASSES] }) {
  return (
    <div className={cn("rounded-lg border bg-card/80 px-3 py-2 shadow-md backdrop-blur-sm", color.border, leaf.tried && "opacity-60")}>
      <div className="flex items-start gap-2">
        <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", leaf.navFact ? "bg-teal-400" : color.dot)} />
        <div className="min-w-0">
          <p className={cn("text-[12.5px] font-medium leading-tight text-foreground/90", leaf.tried && "line-through")}>{leaf.label}</p>
          {leaf.detail && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70">{leaf.detail}</p>}
        </div>
      </div>
    </div>
  );
}
