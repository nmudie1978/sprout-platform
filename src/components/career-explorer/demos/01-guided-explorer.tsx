"use client";

/**
 * DEMO 1: GUIDED EXPLORER
 *
 * DESIGN PHILOSOPHY:
 * Solves the "blank page paralysis" — 300+ careers is overwhelming for a 15-year-old
 * who doesn't know what they want. Instead of dumping everything, this walks them
 * through 3 gentle questions to narrow results before showing anything.
 *
 * VISUAL TONE: Light, warm neutrals. Soft rounded corners. Large typography.
 * Very limited palette (slate + one accent). Feels like a calm conversation.
 *
 * LAYOUT: Full-screen step wizard → filtered results (max 6 shown).
 * One question per screen. Big tappable option buttons. No visible filters.
 *
 * INTERACTION: Answer 3 questions → see 6 personalised results.
 * No filters, no search bar, no pagination. Just "here's what fits you."
 *
 * REMOVED: Search bar, filter chips, pagination, category tabs, view mode toggle,
 * salary display, growth badges, card grid. All replaced by guided flow.
 *
 * IDEAL USER: First-time visitor. No idea what they want. Needs hand-holding.
 *
 * WIREFRAME (top-to-bottom):
 * [Step] — Progress dots (3 dots, current highlighted)
 * [Question] — Large friendly question text
 * [Options] — 3-4 large pill buttons, one column, generous padding
 * [After step 3] — "Here's what we found" heading + 6 vertical cards
 * [Card] — Emoji + Title + 1-line desc + "Learn more" link
 */

import { useState, useMemo } from "react";
import type { DemoProps } from "./demo-types";

type Interest = "people" | "creative" | "analytical" | "hands-on";
type Energy = "calm" | "active" | "varied";
type Education = "short" | "medium" | "long" | "any";

const QUESTIONS = [
  {
    question: "What sounds most like you?",
    options: [
      { label: "I like helping people", value: "people" as Interest },
      { label: "I enjoy making things", value: "creative" as Interest },
      { label: "I like solving puzzles", value: "analytical" as Interest },
      { label: "I prefer working with my hands", value: "hands-on" as Interest },
    ],
  },
  {
    question: "What kind of day do you want?",
    options: [
      { label: "Calm and predictable", value: "calm" as Energy },
      { label: "Busy and fast-paced", value: "active" as Energy },
      { label: "A mix of both", value: "varied" as Energy },
    ],
  },
  {
    question: "How long do you want to study?",
    options: [
      { label: "As little as possible", value: "short" as Education },
      { label: "A few years is fine", value: "medium" as Education },
      { label: "I don't mind a long path", value: "long" as Education },
      { label: "I'm not sure yet", value: "any" as Education },
    ],
  },
];

const INTEREST_SKILLS: Record<Interest, string[]> = {
  people: ["communication", "empathy", "teamwork", "leadership", "customer service"],
  creative: ["creativity", "design", "writing", "visual", "innovation"],
  analytical: ["problem-solving", "analysis", "data", "research", "mathematics"],
  "hands-on": ["technical", "building", "repair", "installation", "maintenance"],
};

export default function GuidedExplorer({ careers }: DemoProps) {
  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState<Interest | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [education, setEducation] = useState<Education | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const showResults = step >= 3;

  const results = useMemo(() => {
    if (!interest) return [];
    const skills = INTEREST_SKILLS[interest];
    return careers
      .filter((c) => {
        const skillMatch = c.keySkills.some((s) =>
          skills.some((target) => s.toLowerCase().includes(target))
        );
        if (!skillMatch) return false;
        if (education === "short" && !c.entryLevel) return false;
        if (education === "long" && c.entryLevel) return false;
        return true;
      })
      .slice(0, 6);
  }, [careers, interest, education]);

  function handleAnswer(value: string) {
    if (step === 0) setInterest(value as Interest);
    if (step === 1) setEnergy(value as Energy);
    if (step === 2) setEducation(value as Education);
    setTimeout(() => setStep((s) => s + 1), 200);
  }

  function reset() {
    setStep(0);
    setInterest(null);
    setEnergy(null);
    setEducation(null);
    setSelected(null);
  }

  if (selected) {
    const career = careers.find((c) => c.id === selected);
    if (!career) return null;
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
          ← Back to results
        </button>
        <div className="text-5xl mb-4">{career.emoji}</div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{career.title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">{career.description}</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Skills you&apos;d use</h3>
            <div className="flex flex-wrap gap-2">
              {career.keySkills.map((s) => (
                <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">What a day looks like</h3>
            <ul className="space-y-1">
              {career.dailyTasks.map((t) => (
                <li key={t} className="text-sm text-muted-foreground">· {t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Education</h3>
            <p className="text-sm text-muted-foreground">{career.educationPath}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Here&apos;s what we found</h2>
        <p className="text-muted-foreground mb-8">Based on your answers, these careers might suit you.</p>
        <div className="space-y-3">
          {results.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              We couldn&apos;t find a perfect match — try different answers?
            </p>
          )}
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-slate-900">{c.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.description}</p>
                </div>
                <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </button>
          ))}
        </div>
        <button onClick={reset} className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ↺ Start over
        </button>
      </div>
    );
  }

  const q = QUESTIONS[step];

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-slate-800" : i < step ? "bg-slate-400" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-foreground text-center mb-10">
        {q.question}
      </h2>

      <div className="space-y-3">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full text-left px-6 py-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-base text-foreground"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Go back
        </button>
      )}
    </div>
  );
}
