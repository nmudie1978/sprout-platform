"use client";

/**
 * DEMO 5: CATEGORY WORLDS
 *
 * DESIGN PHILOSOPHY:
 * Each career category gets its own "world" — a full-screen themed landing
 * with a distinct identity. This makes 300 careers feel like 10 manageable
 * collections. Users pick a world first, then browse a small set within it.
 * Reduces cognitive load by chunking content into themed spaces.
 *
 * VISUAL TONE: Each world has its own accent color, emoji, and personality.
 * Transitions between worlds feel like entering a new space. Clean, focused.
 *
 * LAYOUT: World selection grid (5×2 tiles) → world landing → career list.
 * World landing has a hero section with category description + career count.
 *
 * INTERACTION: Pick a world → land in themed space → browse careers.
 * Each world shows max 30 careers in a clean list. Back button returns to worlds.
 *
 * REMOVED: Search bar, combined filter chips, pagination numbers, salary ranges,
 * growth badges, view mode toggles. Each world is self-contained.
 *
 * IDEAL USER: Visual thinker. Knows roughly what area interests them.
 * Wants structure but not overwhelming detail.
 *
 * WIREFRAME:
 * [Header] — "Choose a world to explore" centered
 * [Grid] — 2×5 tiles, each with emoji + name + career count + accent color
 * [World view] — Back arrow + emoji hero + category name + description
 * [Career list] — Simple rows with emoji + title + one-liner
 * [Detail] — Inline expansion below the clicked row
 */

import { useState, useMemo } from "react";
import { CAREER_PATHWAYS, type CareerCategory, type Career } from "@/lib/career-pathways";
import type { DemoProps } from "./demo-types";

interface World {
  key: CareerCategory;
  name: string;
  emoji: string;
  description: string;
  accent: string;
  accentBg: string;
  accentText: string;
}

const WORLDS: World[] = [
  { key: "HEALTHCARE_LIFE_SCIENCES", name: "Healthcare", emoji: "🏥", description: "Help people stay healthy and well", accent: "border-rose-200", accentBg: "bg-rose-50", accentText: "text-rose-700" },
  { key: "EDUCATION_TRAINING", name: "Education", emoji: "📚", description: "Shape how people learn and grow", accent: "border-teal-200", accentBg: "bg-teal-50", accentText: "text-teal-700" },
  { key: "TECHNOLOGY_IT", name: "Tech & IT", emoji: "💻", description: "Build the digital world", accent: "border-cyan-200", accentBg: "bg-cyan-50", accentText: "text-cyan-700" },
  { key: "BUSINESS_MANAGEMENT", name: "Business", emoji: "📊", description: "Lead teams and solve problems", accent: "border-blue-200", accentBg: "bg-blue-50", accentText: "text-blue-700" },
  { key: "FINANCE_BANKING", name: "Finance", emoji: "💰", description: "Work with money and markets", accent: "border-emerald-200", accentBg: "bg-emerald-50", accentText: "text-emerald-700" },
  { key: "SALES_MARKETING", name: "Marketing", emoji: "📣", description: "Connect people with ideas", accent: "border-orange-200", accentBg: "bg-orange-50", accentText: "text-orange-700" },
  { key: "MANUFACTURING_ENGINEERING", name: "Engineering", emoji: "⚙️", description: "Design and build things", accent: "border-slate-300", accentBg: "bg-slate-50", accentText: "text-slate-700" },
  { key: "LOGISTICS_TRANSPORT", name: "Logistics", emoji: "🚛", description: "Keep the world moving", accent: "border-amber-200", accentBg: "bg-amber-50", accentText: "text-amber-700" },
  { key: "HOSPITALITY_TOURISM", name: "Hospitality", emoji: "🏨", description: "Create great experiences", accent: "border-pink-200", accentBg: "bg-pink-50", accentText: "text-pink-700" },
  { key: "TELECOMMUNICATIONS", name: "Telecom", emoji: "📡", description: "Connect people everywhere", accent: "border-teal-200", accentBg: "bg-teal-50", accentText: "text-teal-700" },
];

export default function CategoryWorlds({ careers }: DemoProps) {
  const [world, setWorld] = useState<World | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const worldCareers = useMemo(() => {
    if (!world) return [];
    return CAREER_PATHWAYS[world.key] || [];
  }, [world]);

  if (world) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => { setWorld(null); setExpandedId(null); }}
          className="text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          ← All worlds
        </button>

        {/* World hero */}
        <div className={`rounded-2xl p-8 mb-8 ${world.accentBg} border ${world.accent}`}>
          <span className="text-5xl block mb-3">{world.emoji}</span>
          <h2 className={`text-2xl font-semibold ${world.accentText}`}>{world.name}</h2>
          <p className="text-muted-foreground mt-1">{world.description}</p>
          <p className="text-xs text-muted-foreground mt-3">{worldCareers.length} careers to explore</p>
        </div>

        {/* Career list */}
        <div className="divide-y divide-slate-100">
          {worldCareers.map((c) => {
            const isOpen = expandedId === c.id;
            return (
              <div key={c.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : c.id)}
                  className="w-full text-left py-4 flex items-center gap-3 group"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{c.title}</p>
                    {!isOpen && <p className="text-sm text-muted-foreground truncate">{c.description}</p>}
                  </div>
                  <span className={`text-muted-foreground text-sm transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                </button>
                {isOpen && (
                  <div className="pb-6 pl-9 space-y-3 animate-in fade-in-0 duration-200">
                    <p className="text-muted-foreground">{c.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.keySkills.map((s) => (
                        <span key={s} className={`px-2 py-0.5 rounded-full text-xs ${world.accentBg} ${world.accentText}`}>{s}</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Education:</span> {c.educationPath}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold text-foreground text-center mb-2">
        Choose a world to explore
      </h2>
      <p className="text-muted-foreground text-center mb-10">
        Each world has its own set of careers. Pick the one that interests you.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {WORLDS.map((w) => (
          <button
            key={w.key}
            onClick={() => setWorld(w)}
            className={`p-5 rounded-xl border ${w.accent} ${w.accentBg} text-left hover:scale-[1.02] transition-transform`}
          >
            <span className="text-2xl block mb-1">{w.emoji}</span>
            <p className={`font-semibold text-sm ${w.accentText}`}>{w.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {(CAREER_PATHWAYS[w.key] || []).length} careers
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
