"use client";

import { useState, useMemo } from "react";
import { getAllCareers } from "@/lib/career-pathways";
import {
  GuidedExplorer,
  SwipeFocus,
  QuietBrowser,
  MoodMatch,
  CategoryWorlds,
  StoryCards,
  SpectrumSlider,
  SearchFirst,
  CuratedPicks,
  ProgressiveReveal,
} from "@/components/career-explorer/demos";

const DEMOS = [
  {
    id: "guided",
    name: "Guided Explorer",
    description: "Step-by-step questions narrow 300+ careers to 6 personalised results",
    philosophy: "Solves blank-page paralysis. Walks unsure users through 3 gentle questions.",
    tone: "Warm, conversational, hand-holding",
    bestFor: "First-time visitor who doesn't know what they want",
    component: GuidedExplorer,
  },
  {
    id: "swipe",
    name: "Swipe Focus",
    description: "One career at a time, full-screen. Skip or save. Pure discovery.",
    philosophy: "Eliminates choice paralysis by showing only one option at a time.",
    tone: "Clean, focused, card-by-card",
    bestFor: "Curious browser who wants to stumble into something",
    component: SwipeFocus,
  },
  {
    id: "quiet",
    name: "Quiet Browser",
    description: "Minimalist list with maximum whitespace. Expand one career at a time.",
    philosophy: "Anti-anxiety design. Stripped-back reading experience for calm exploration.",
    tone: "Near-monochrome, generous spacing, serene",
    bestFor: "Thoughtful, introverted user. Prefers reading over browsing.",
    component: QuietBrowser,
  },
  {
    id: "mood",
    name: "Mood Match",
    description: "Pick how you feel → see careers matching your energy. Emotional on-ramp.",
    philosophy: "'How do you feel?' is easier to answer than 'What career do you want?'",
    tone: "Soft pastels, warm, therapeutic",
    bestFor: "Anxious or overwhelmed user who needs an emotional entry point",
    component: MoodMatch,
  },
  {
    id: "worlds",
    name: "Category Worlds",
    description: "Each industry is a themed world. Pick one to enter a focused space.",
    philosophy: "300 careers become 10 manageable collections. Chunking reduces overload.",
    tone: "Themed accent colors per world, immersive",
    bestFor: "Visual thinker who knows roughly what area interests them",
    component: CategoryWorlds,
  },
  {
    id: "stories",
    name: "Story Cards",
    description: "Careers as day-in-the-life narratives. Feel the career, don't just read data.",
    philosophy: "Youth connect with stories, not bullet points. Makes careers human and relatable.",
    tone: "Warm editorial, magazine-like, generous text",
    bestFor: "Narrative-driven user who wants to feel what a career is like",
    component: StoryCards,
  },
  {
    id: "spectrum",
    name: "Spectrum Slider",
    description: "3 sliders (people↔solo, creative↔structured, physical↔digital) rank careers in real time.",
    philosophy: "Interactive self-discovery without quizzes. Sliders are inherently non-committal.",
    tone: "Modern, playful, scientific",
    bestFor: "Reflective user who enjoys self-discovery and personalisation",
    component: SpectrumSlider,
  },
  {
    id: "search",
    name: "Search First",
    description: "Google-style: one big search input. Type anything — careers appear instantly.",
    philosophy: "Zero friction for the user who knows roughly what they want.",
    tone: "Ultra-minimal, just input and results",
    bestFor: "Returning user or someone with a keyword in mind",
    component: SearchFirst,
  },
  {
    id: "curated",
    name: "Curated Picks",
    description: "Netflix-style rows: 'If you like helping people...', 'No degree needed...'",
    philosophy: "Curation reduces paradox of choice. Each row is a small, digestible set.",
    tone: "Soft, leisurely, browseable",
    bestFor: "Casual browser who wants to be inspired, not to search",
    component: CuratedPicks,
  },
  {
    id: "progressive",
    name: "Progressive Reveal",
    description: "Start with 3 careers. Read one → 2 more unlock. Curiosity-driven drip feed.",
    philosophy: "Never overwhelmed because you only see what you've earned through exploration.",
    tone: "Airy, spacious, meditative pace",
    bestFor: "First-time user who would be overwhelmed by 300+ careers",
    component: ProgressiveReveal,
  },
];

export default function ExploreDemosPage() {
  const [activeDemo, setActiveDemo] = useState(DEMOS[0].id);
  const [showInfo, setShowInfo] = useState(true);
  const careers = useMemo(() => getAllCareers(), []);

  const demo = DEMOS.find((d) => d.id === activeDemo)!;
  const DemoComponent = demo.component;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Explore Careers — UI Demos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          10 distinct concepts for the Explore Careers section. Each has a different visual tone, layout, and interaction style.
        </p>
      </div>

      {/* Demo selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setActiveDemo(d.id); setShowInfo(true); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
              activeDemo === d.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {i + 1}. {d.name}
          </button>
        ))}
      </div>

      {/* Design rationale panel */}
      {showInfo && (
        <div className="mb-6 p-5 rounded-xl bg-slate-50 border border-slate-200 relative">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
          <h3 className="font-semibold text-foreground mb-1">{demo.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{demo.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-medium text-foreground block mb-0.5">Philosophy</span>
              <span className="text-muted-foreground">{demo.philosophy}</span>
            </div>
            <div>
              <span className="font-medium text-foreground block mb-0.5">Visual Tone</span>
              <span className="text-muted-foreground">{demo.tone}</span>
            </div>
            <div>
              <span className="font-medium text-foreground block mb-0.5">Best For</span>
              <span className="text-muted-foreground">{demo.bestFor}</span>
            </div>
          </div>
        </div>
      )}

      {!showInfo && (
        <button onClick={() => setShowInfo(true)} className="mb-4 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Show design rationale
        </button>
      )}

      {/* Demo render area */}
      <div className="border border-slate-200 rounded-2xl bg-white min-h-[600px] overflow-hidden">
        <DemoComponent careers={careers} />
      </div>
    </div>
  );
}
