"use client";

/**
 * DEMO 4: MOOD MATCH
 *
 * DESIGN PHILOSOPHY:
 * Meets the user where they ARE emotionally. Instead of "what career do you want?"
 * it asks "how do you feel right now?" — then maps energy/mood to suitable careers.
 * Reduces the pressure of "choosing a future" to "what feels right today?"
 *
 * VISUAL TONE: Soft pastel gradients per mood. Warm, rounded, almost therapeutic.
 * Uses color psychology — cool blues for calm, warm yellows for energised.
 *
 * LAYOUT: Mood selection screen (4 large emoji tiles) → soft results page.
 * Results grouped by "fit reason" not category. Max 8 results shown.
 *
 * INTERACTION: Pick a mood tile → see careers that match that energy.
 * Can switch moods anytime. No commitment, no "wrong answer."
 *
 * REMOVED: Categories, search, filters, pagination, growth data, salary info.
 * Education only shown on expand. Mood is the only entry point.
 *
 * IDEAL USER: Anxious or overwhelmed user. Needs emotional on-ramp.
 * "I don't know what I want" → "How do I feel?" is easier to answer.
 *
 * WIREFRAME:
 * [Header] — "How are you feeling today?" large centered text
 * [Mood grid] — 2×2 grid of mood tiles (emoji + label + soft color)
 * [After selection] — Mood header with gradient + "Careers that match" subtitle
 * [Results] — 4-8 simple rows: emoji + title + "why this fits" one-liner
 * [Switch] — "Try a different mood" link at bottom
 */

import { useState, useMemo } from "react";
import type { DemoProps } from "./demo-types";

interface Mood {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  bg: string;
  border: string;
  text: string;
  skills: string[];
  fitReason: string;
}

const MOODS: Mood[] = [
  {
    id: "curious",
    emoji: "🔍",
    label: "Curious",
    sublabel: "I want to explore and learn",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    skills: ["research", "analysis", "learning", "problem-solving", "data", "science"],
    fitReason: "Careers for the curious mind",
  },
  {
    id: "caring",
    emoji: "💛",
    label: "Caring",
    sublabel: "I want to help others",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    skills: ["empathy", "communication", "teamwork", "patience", "support", "care"],
    fitReason: "Careers where you help people",
  },
  {
    id: "energised",
    emoji: "⚡",
    label: "Energised",
    sublabel: "I want to build and create",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    skills: ["creativity", "design", "innovation", "building", "making", "visual"],
    fitReason: "Careers for makers and creators",
  },
  {
    id: "steady",
    emoji: "🌿",
    label: "Steady",
    sublabel: "I want something reliable",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    skills: ["organisation", "planning", "detail", "structure", "process", "management"],
    fitReason: "Careers with stability and structure",
  },
];

export default function MoodMatch({ careers }: DemoProps) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!mood) return [];
    return careers
      .filter((c) =>
        c.keySkills.some((s) =>
          mood.skills.some((ms) => s.toLowerCase().includes(ms))
        )
      )
      .slice(0, 8);
  }, [careers, mood]);

  if (selected) {
    const career = careers.find((c) => c.id === selected);
    if (!career) return null;
    return (
      <div className={`max-w-lg mx-auto px-6 py-12 ${mood?.bg || ""} min-h-[60vh] rounded-2xl`}>
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
          ← Back
        </button>
        <span className="text-5xl block mb-4">{career.emoji}</span>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{career.title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">{career.description}</p>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {career.keySkills.map((s) => (
                <span key={s} className="px-3 py-1 bg-white/60 rounded-full text-sm text-foreground">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Education path</h4>
            <p className="text-sm text-muted-foreground">{career.educationPath}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">What you&apos;d do daily</h4>
            <ul className="space-y-1">
              {career.dailyTasks.map((t) => (
                <li key={t} className="text-sm text-muted-foreground">· {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (mood) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className={`rounded-2xl p-6 mb-6 ${mood.bg}`}>
          <span className="text-3xl">{mood.emoji}</span>
          <h2 className={`text-xl font-semibold mt-2 ${mood.text}`}>{mood.fitReason}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Because you&apos;re feeling <span className="lowercase font-medium">{mood.label}</span>
          </p>
        </div>

        <div className="space-y-2">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="w-full text-left p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.description}</p>
                </div>
                <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setMood(null)}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ↺ Try a different mood
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h2 className="text-2xl font-semibold text-foreground text-center mb-2">
        How are you feeling today?
      </h2>
      <p className="text-muted-foreground text-center mb-10">
        There&apos;s no wrong answer — let&apos;s find careers that match your energy.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m)}
            className={`p-6 rounded-2xl border ${m.border} ${m.bg} text-left hover:scale-[1.02] transition-transform`}
          >
            <span className="text-3xl block mb-2">{m.emoji}</span>
            <p className={`font-semibold ${m.text}`}>{m.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.sublabel}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
