"use client";

/**
 * Variant 8 — Chapters.
 * An editorial "book" layout. Steps are grouped by stage (STAGE_ORDER) into
 * Chapters, each with a large serif numeral, serif chapter title and a lede,
 * then its steps as elegant reading entries with expandable detail. Magazine
 * typography, generous whitespace, calm reading-first feel.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
  ArrowUpRight,
  Plus,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  SAMPLE_ROADMAP,
  STAGE_META,
  STAGE_ORDER,
  type RoadmapStep,
  type RoadmapStage,
} from "../_data";

const ICONS: Record<string, LucideIcon> = {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
};

const SERIF = { fontFamily: 'Georgia, "Times New Roman", serif' } as const;

const ROMAN = ["I", "II", "III", "IV"];

export default function ChaptersVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );

  const chapters = STAGE_ORDER.map((stage) => ({
    stage,
    meta: STAGE_META[stage],
    steps: steps
      .map((s, i) => ({ step: s, globalIndex: i }))
      .filter((e) => e.step.stage === stage),
  })).filter((c) => c.steps.length > 0);

  return (
    <div className="min-h-screen bg-[#13110e] text-stone-100">
      <style>{`
        @keyframes rmChapReveal { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform:none; } }
        .rm-chap-panel { overflow:hidden; display:grid; transition: grid-template-rows .4s cubic-bezier(.4,0,.2,1), opacity .4s ease; }
        @media (prefers-reduced-motion: reduce) {
          .rm-chap-panel { transition:none; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-6 py-14">
        <header>
          <Link
            href="/lab/roadmap"
            className="text-xs text-stone-500 hover:text-stone-300"
          >
            ← Roadmap Lab
          </Link>
          <p
            className="mt-8 text-xs uppercase tracking-[0.3em] text-stone-500"
            style={SERIF}
          >
            A Roadmap
          </p>
          <h1
            className="mt-3 text-4xl leading-tight text-stone-50 sm:text-5xl"
            style={SERIF}
          >
            Your roadmap to {career}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400">
            Four chapters from where you stand today to your first role. Read at
            your own pace; open any entry for the full detail.
          </p>
          <hr className="mt-8 border-stone-800" />
        </header>

        {chapters.map((chapter, ci) => (
          <Chapter
            key={chapter.stage}
            numeral={ROMAN[ci] ?? `${ci + 1}`}
            stage={chapter.stage}
            entries={chapter.steps}
            currentStepIndex={currentStepIndex}
            open={open}
            setOpen={setOpen}
          />
        ))}
      </div>
    </div>
  );
}

function Chapter({
  numeral,
  stage,
  entries,
  currentStepIndex,
  open,
  setOpen,
}: {
  numeral: string;
  stage: RoadmapStage;
  entries: { step: RoadmapStep; globalIndex: number }[];
  currentStepIndex: number;
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  const meta = STAGE_META[stage];
  return (
    <section className="mt-14">
      <div className="flex items-baseline gap-5">
        <span
          className="text-5xl leading-none sm:text-6xl"
          style={{ ...SERIF, color: meta.accent }}
        >
          {numeral}
        </span>
        <div>
          <h2 className="text-2xl text-stone-100 sm:text-3xl" style={SERIF}>
            {meta.label}
          </h2>
          <p className="mt-1 text-sm italic text-stone-400">{meta.blurb}</p>
        </div>
      </div>

      <div className="mt-8 space-y-8 border-l border-stone-800 pl-6 sm:pl-8">
        {entries.map(({ step, globalIndex }) => {
          const Icon = ICONS[step.icon] ?? Target;
          const isOpen = open === step.id;
          const isCurrent = globalIndex === currentStepIndex;
          const isDone = globalIndex < currentStepIndex;
          return (
            <article key={step.id} className="relative">
              {/* marker */}
              <span
                aria-hidden
                className="absolute -left-[33px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border sm:-left-[41px]"
                style={{
                  borderColor: meta.accent,
                  background: isDone ? meta.accent : "#13110e",
                }}
              >
                <Icon
                  className="h-2.5 w-2.5"
                  style={{ color: isDone ? "#13110e" : meta.accent }}
                />
              </span>

              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : step.id)}
                aria-expanded={isOpen}
                className="group block w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="text-[11px] uppercase tracking-widest text-stone-500">
                    Age {step.startAge}
                    {step.endAge ? `–${step.endAge}` : "+"}
                  </p>
                  {step.isMilestone && (
                    <span className="text-[11px] italic text-amber-300/90">
                      · a milestone
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[11px] italic text-emerald-300/90">
                      · you are here
                    </span>
                  )}
                </div>
                <h3
                  className="mt-1 flex items-center gap-2 text-xl text-stone-50"
                  style={SERIF}
                >
                  {step.title}
                  {isOpen ? (
                    <Minus className="h-4 w-4 text-stone-500" />
                  ) : (
                    <Plus className="h-4 w-4 text-stone-500" />
                  )}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">
                  {step.description}
                </p>
              </button>

              <div
                className="rm-chap-panel"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="min-h-0">
                  <EntryDetail step={step} accent={meta.accent} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EntryDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="mt-5 border-t border-stone-800 pt-5">
      {step.microActions.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2 text-sm text-stone-300"
              >
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.howTo.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-widest text-stone-500">
            How to
          </p>
          <ol className="mt-2 space-y-2.5">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-sm">
                <span className="text-stone-200">
                  <span className="mr-1.5 italic text-stone-500" style={SERIF}>
                    {i + 1}.
                  </span>
                  {h.step}
                </span>
                {h.detail && (
                  <p className="ml-5 mt-0.5 text-xs italic text-stone-500">
                    {h.detail}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-widest text-stone-500">
            Further reading
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {step.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-stone-700 bg-stone-900/60 px-2.5 py-1 text-xs text-stone-300 transition hover:border-stone-600 hover:text-stone-100"
              >
                {r.label}
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
