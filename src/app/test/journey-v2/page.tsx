'use client';

/**
 * JOURNEY V2 PROTOTYPE — Test Area
 *
 * Showcases the redesigned journey flow:
 * - Phase 1: Preview roadmap on goal selection, Day in Life videos, micro-actions, peer counter
 * - Phase 2: Scenario-based Discover, visual Understand (no textareas), Quick Journey mode
 * - Phase 3 extras: Peer stories, career comparison
 *
 * This is a standalone prototype — does not affect the real journey.
 */

import { useState } from 'react';
import {
  Search, Globe, Rocket, CheckCircle2, Play, Users, TrendingUp,
  Sparkles, Heart, ArrowRight, BookOpen, Briefcase, GraduationCap,
  Clock, MapPin, ChevronDown, ChevronUp, Star, Zap, Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================
// MOCK DATA
// ============================================

const CAREERS = [
  { id: 'doctor', title: 'Doctor / Physician', emoji: '👨‍⚕️', salary: '700k–1.4M kr', education: '6+ years', growth: 'High', explorers: 1247 },
  { id: 'software-eng', title: 'Software Engineer', emoji: '💻', salary: '550k–950k kr', education: '3–5 years', growth: 'Very High', explorers: 2103 },
  { id: 'teacher', title: 'Teacher', emoji: '👩‍🏫', salary: '450k–650k kr', education: '4 years', growth: 'Stable', explorers: 891 },
  { id: 'nurse', title: 'Nurse', emoji: '👩‍⚕️', salary: '450k–700k kr', education: '3 years', growth: 'High', explorers: 1456 },
];

const SCENARIOS = {
  motivation: [
    { a: 'Working at a hospital helping patients recover', b: 'Building an app used by millions', dimension: 'People vs Technology' },
    { a: 'Earning top salary in finance', b: 'Making a difference in education', dimension: 'Money vs Impact' },
    { a: 'Leading a team of 20 people', b: 'Working independently from home', dimension: 'Leadership vs Autonomy' },
    { a: 'Solving complex engineering problems', b: 'Creating art, music, or design', dimension: 'Analytical vs Creative' },
  ],
  workstyle: [
    { a: 'Fast-paced emergency room', b: 'Quiet research laboratory', dimension: 'High energy vs Focused calm' },
    { a: 'Outdoor fieldwork in nature', b: 'Modern office with a team', dimension: 'Outdoors vs Indoors' },
    { a: 'Different tasks every day', b: 'Deep expertise in one area', dimension: 'Variety vs Mastery' },
  ],
};

const PEER_STORIES = [
  { name: 'Amina', age: 19, location: 'Oslo', career: 'Doctor / Physician', quote: 'I had no idea what being a doctor actually involved until I used the roadmap. Now I\'m in pre-med and it matches exactly.', stage: 'University' },
  { name: 'Erik', age: 17, location: 'Bergen', career: 'Software Engineer', quote: 'The scenario questions helped me realise I\'m more into building things than managing people. That clarity saved me from picking the wrong degree.', stage: 'VG2' },
  { name: 'Sofia', age: 20, location: 'Trondheim', career: 'Nurse', quote: 'I switched from teacher to nurse after seeing the day-in-the-life video. Completely changed my direction — and I\'m happier for it.', stage: 'Nursing School' },
];

const ROADMAP_PREVIEW = [
  { age: '18', title: 'Where you are now', stage: 'foundation', color: '#6b8f7b' },
  { age: '18–19', title: 'Build your foundation', stage: 'foundation', color: '#6b8f7b' },
  { age: '19–20', title: 'Start formal education', stage: 'education', color: '#3b82f6' },
  { age: '20–22', title: 'Gain practical experience', stage: 'experience', color: '#f59e0b' },
  { age: '22+', title: 'Enter your career', stage: 'career', color: '#8b5cf6' },
];

const MICRO_ACTIONS = [
  { icon: Play, label: 'Watch a 5-min "Day in the Life" video', time: '5 min', type: 'video' },
  { icon: BookOpen, label: 'Read one article about this career', time: '3 min', type: 'read' },
  { icon: Users, label: 'Ask someone you know about their job', time: '10 min', type: 'social' },
];

// ============================================
// COMPONENTS
// ============================================

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', className)}>
      {children}
    </p>
  );
}

// ── STEP 0: GOAL SELECTION + INSTANT ROADMAP PREVIEW ────────────────

function GoalSelectionWithPreview({
  onSelect,
}: {
  onSelect: (career: typeof CAREERS[0]) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = CAREERS.find((c) => c.id === hoveredId);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1">What career interests you?</h2>
        <p className="text-sm text-muted-foreground/60">Pick one to see your personalised roadmap instantly</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CAREERS.map((career) => (
          <button
            key={career.id}
            onClick={() => onSelect(career)}
            onMouseEnter={() => setHoveredId(career.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="rounded-xl border border-border/50 bg-card/60 p-4 text-left hover:border-teal-500/40 hover:bg-teal-500/5 transition-all group"
          >
            <span className="text-2xl mb-2 block">{career.emoji}</span>
            <p className="text-sm font-semibold group-hover:text-teal-400 transition-colors">{career.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3 text-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground/40">{career.explorers.toLocaleString()} exploring</span>
            </div>
          </button>
        ))}
      </div>

      {/* Instant preview on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-4"
          >
            <p className="text-xs text-teal-500/70 font-medium mb-3">Preview: Your path to {hovered.title}</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {ROADMAP_PREVIEW.map((step, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: step.color }}>
                      {i + 1}
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 mt-1 text-center max-w-[80px]">{step.title}</p>
                    <p className="text-[8px] text-muted-foreground/30">Age {step.age}</p>
                  </div>
                  {i < ROADMAP_PREVIEW.length - 1 && (
                    <div className="w-8 h-0.5 bg-border/30 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground/50">
              <span>Salary: {hovered.salary}</span>
              <span>Education: {hovered.education}</span>
              <span>Growth: {hovered.growth}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── STEP 1: SCENARIO-BASED DISCOVER ─────────────────────────────────

function ScenarioDiscover({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const allScenarios = [...SCENARIOS.motivation, ...SCENARIOS.workstyle];
  const current = allScenarios[step];
  const total = allScenarios.length;

  const choose = (choice: 'a' | 'b') => {
    setChoices([...choices, choice === 'a' ? current.a : current.b]);
    if (step + 1 >= total) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel className="text-teal-500/60">Discover — Know Yourself</SectionLabel>
        <span className="text-[10px] text-muted-foreground/40">{step + 1} of {total}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal-500 rounded-full"
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <p className="text-xs text-muted-foreground/50 text-center">{current.dimension}</p>

      <div className="text-center mb-2">
        <p className="text-sm font-medium text-foreground/80">Which appeals to you more?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => choose('a')}
          className="rounded-xl border border-border/40 bg-card/50 p-5 text-left hover:border-teal-500/40 hover:bg-teal-500/5 transition-all group"
        >
          <p className="text-sm text-foreground/80 group-hover:text-teal-400 transition-colors leading-relaxed">
            {current.a}
          </p>
        </button>
        <button
          onClick={() => choose('b')}
          className="rounded-xl border border-border/40 bg-card/50 p-5 text-left hover:border-teal-500/40 hover:bg-teal-500/5 transition-all group"
        >
          <p className="text-sm text-foreground/80 group-hover:text-teal-400 transition-colors leading-relaxed">
            {current.b}
          </p>
        </button>
      </div>

      {choices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {choices.map((c, i) => (
            <span key={i} className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-teal-500/10 text-teal-400">
              {c.length > 30 ? c.slice(0, 30) + '...' : c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STEP 2: VISUAL UNDERSTAND ───────────────────────────────────────

function VisualUnderstand({ career, onComplete }: { career: typeof CAREERS[0]; onComplete: () => void }) {
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    {
      id: 'day-in-life',
      icon: Play,
      title: 'A Day in the Life',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      content: (
        <div className="space-y-3">
          <div className="aspect-video rounded-lg bg-muted/20 border border-border/30 flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => {
              window.open(`https://www.youtube.com/results?search_query=day+in+the+life+${encodeURIComponent(career.title)}`, '_blank');
              setViewed((p) => new Set(p).add('day-in-life'));
            }}
          >
            <div className="text-center">
              <Play className="h-10 w-10 text-red-400/60 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/60">Watch real {career.title}s talk about their day</p>
              <p className="text-[10px] text-muted-foreground/30 mt-1">Opens YouTube</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'salary',
      icon: TrendingUp,
      title: 'What You\'d Earn',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      content: (
        <div className="space-y-3">
          <div className="flex items-end gap-2 h-24">
            {[
              { label: 'Barista', amount: 320, color: 'bg-muted/40' },
              { label: career.title.split(' ')[0], amount: 800, color: 'bg-emerald-500/60' },
              { label: 'Senior', amount: 1200, color: 'bg-emerald-500/40' },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(bar.amount / 1200) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn('w-full rounded-t-md', bar.color)}
                />
                <p className="text-[9px] text-muted-foreground/50">{bar.label}</p>
                <p className="text-[10px] font-medium text-foreground/70">{bar.amount}k kr</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/50 text-center">Annual salary comparison (Norway)</p>
        </div>
      ),
    },
    {
      id: 'education',
      icon: GraduationCap,
      title: 'The Path There',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      content: (
        <div className="space-y-2">
          {[
            { step: 'Finish secondary school', years: 'Now', done: true },
            { step: 'Enter university / training', years: '1–2 years', done: false },
            { step: 'Complete degree / certification', years: '3–5 years', done: false },
            { step: 'Start working in the field', years: '5+ years', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/30 text-muted-foreground/50'
              )}>
                {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground/70">{item.step}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/40 shrink-0">{item.years}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'skills',
      icon: Zap,
      title: 'Key Skills Needed',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      content: (
        <div className="flex flex-wrap gap-2">
          {['Communication', 'Problem Solving', 'Empathy', 'Technical Knowledge', 'Teamwork', 'Stress Management'].map((skill) => (
            <span key={skill} className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {skill}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const allViewed = sections.every((s) => viewed.has(s.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel className="text-emerald-500/60">Understand — Know the Role</SectionLabel>
        <span className="text-[10px] text-muted-foreground/40">{viewed.size} of {sections.length} explored</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expanded === section.id;
          const isViewed = viewed.has(section.id);

          return (
            <div
              key={section.id}
              className={cn(
                'rounded-xl border transition-all',
                isExpanded ? 'border-emerald-500/30 bg-card/70 col-span-1 sm:col-span-2' : 'border-border/40 bg-card/40',
                isViewed && !isExpanded && 'border-emerald-500/20'
              )}
            >
              <button
                onClick={() => {
                  setExpanded(isExpanded ? null : section.id);
                  setViewed((p) => new Set(p).add(section.id));
                }}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', section.bg)}>
                  {isViewed ? <CheckCircle2 className={cn('h-4 w-4', section.color)} /> : <Icon className={cn('h-4 w-4', section.color)} />}
                </div>
                <p className="text-sm font-medium flex-1">{section.title}</p>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground/30" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/30" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">{section.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {allViewed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            I understand this career <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── STEP 3: MICRO-ACTION GROW ───────────────────────────────────────

function MicroActionGrow({ career, onComplete }: { career: typeof CAREERS[0]; onComplete: () => void }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-4">
      <SectionLabel className="text-amber-500/60">Grow — Take Your First Step</SectionLabel>

      <p className="text-sm text-muted-foreground/60">
        Start small. Pick one action — it takes less than 10 minutes.
      </p>

      <div className="space-y-2">
        {MICRO_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          const done = completed.has(i);

          return (
            <button
              key={i}
              onClick={() => {
                setCompleted((p) => new Set(p).add(i));
                if (action.type === 'video') {
                  window.open(`https://www.youtube.com/results?search_query=day+in+the+life+${encodeURIComponent(career.title)}`, '_blank');
                }
              }}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                done ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/40 hover:border-amber-500/20 hover:bg-card/60'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                done ? 'bg-amber-500/15' : 'bg-muted/30'
              )}>
                {done ? <CheckCircle2 className="h-4 w-4 text-amber-400" /> : <Icon className="h-4 w-4 text-muted-foreground/60" />}
              </div>
              <div className="flex-1">
                <p className={cn('text-sm', done ? 'text-amber-400 font-medium' : 'text-foreground/70')}>{action.label}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/30 shrink-0">{action.time}</span>
            </button>
          );
        })}
      </div>

      {completed.size > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 text-center">
          <p className="text-xs text-foreground/70">
            <span className="font-medium text-amber-400">Nice work!</span> You just took a real step toward becoming a {career.title}.
          </p>
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors mt-3"
          >
            See my full roadmap <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── PEER STORIES ────────────────────────────────────────────────────

function PeerStories() {
  return (
    <div className="space-y-3">
      <SectionLabel className="text-violet-500/60">People Like You</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PEER_STORIES.map((story, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-violet-500/15 flex items-center justify-center text-xs font-bold text-violet-400">
                {story.name[0]}
              </div>
              <div>
                <p className="text-xs font-medium">{story.name}, {story.age}</p>
                <p className="text-[10px] text-muted-foreground/40">{story.location} · {story.stage}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic">
              &ldquo;{story.quote}&rdquo;
            </p>
            <p className="text-[10px] text-violet-400/60 mt-2">Exploring: {story.career}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CAREER COMPARISON ───────────────────────────────────────────────

function CareerComparison() {
  const [a, setA] = useState(CAREERS[0]);
  const [b, setB] = useState(CAREERS[1]);

  const metrics = [
    { label: 'Salary', a: a.salary, b: b.salary },
    { label: 'Education', a: a.education, b: b.education },
    { label: 'Growth', a: a.growth, b: b.growth },
    { label: 'Exploring', a: `${a.explorers.toLocaleString()} teens`, b: `${b.explorers.toLocaleString()} teens` },
  ];

  return (
    <div className="space-y-3">
      <SectionLabel className="text-blue-500/60">Compare Careers</SectionLabel>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <select
          value={a.id}
          onChange={(e) => setA(CAREERS.find((c) => c.id === e.target.value) || CAREERS[0])}
          className="rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-sm text-foreground/80"
        >
          {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
        </select>
        <select
          value={b.id}
          onChange={(e) => setB(CAREERS.find((c) => c.id === e.target.value) || CAREERS[1])}
          className="rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-sm text-foreground/80"
        >
          {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden">
        {metrics.map((m, i) => (
          <div key={m.label} className={cn('grid grid-cols-3 gap-2 px-4 py-2.5 text-xs', i % 2 === 0 ? 'bg-card/30' : 'bg-card/50')}>
            <span className="text-foreground/70 font-medium text-right">{m.a}</span>
            <span className="text-muted-foreground/50 text-center font-medium">{m.label}</span>
            <span className="text-foreground/70 font-medium">{m.b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FULL ROADMAP RESULT ─────────────────────────────────────────────

function RoadmapResult({ career }: { career: typeof CAREERS[0] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-emerald-400 mb-1">Your roadmap is ready</h3>
        <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
          Based on what you told us, here&apos;s your personalised path to becoming a {career.title}.
        </p>
      </div>

      {/* Simplified roadmap visualization */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-5">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {ROADMAP_PREVIEW.map((step, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center w-28">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg" style={{ backgroundColor: step.color }}>
                  {i + 1}
                </div>
                <p className="text-[11px] text-foreground/70 mt-2 text-center font-medium">{step.title}</p>
                <p className="text-[9px] text-muted-foreground/40">Age {step.age}</p>
              </div>
              {i < ROADMAP_PREVIEW.length - 1 && (
                <div className="w-6 h-0.5 bg-gradient-to-r from-border/50 to-border/20 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/40 text-center">
        In the full app, this becomes your interactive career roadmap with detailed milestones, school alignment, and progress tracking.
      </p>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

type Stage = 'goal' | 'discover' | 'understand' | 'grow' | 'roadmap';

export default function JourneyV2Prototype() {
  const [stage, setStage] = useState<Stage>('goal');
  const [career, setCareer] = useState<typeof CAREERS[0] | null>(null);

  const stages: { id: Stage; label: string; color: string }[] = [
    { id: 'goal', label: 'Choose', color: 'teal' },
    { id: 'discover', label: 'Discover', color: 'teal' },
    { id: 'understand', label: 'Understand', color: 'emerald' },
    { id: 'grow', label: 'Grow', color: 'amber' },
    { id: 'roadmap', label: 'Roadmap', color: 'violet' },
  ];

  const currentIdx = stages.findIndex((s) => s.id === stage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">Prototype</span>
              <Link href="/dashboard" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground">Back to app</Link>
            </div>
            <h1 className="text-xl font-semibold mt-2">Journey V2 — Redesigned Flow</h1>
            <p className="text-sm text-muted-foreground/50">Phase 1 + Phase 2 + Peer features</p>
          </div>
        </div>

        {/* Stage progress */}
        <div className="flex items-center gap-1 mb-8">
          {stages.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => {
                  if (i <= currentIdx || (s.id === 'goal')) setStage(s.id);
                }}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all',
                  i <= currentIdx ? `bg-${s.color}-500` : 'bg-muted/30',
                  i <= currentIdx && 'cursor-pointer'
                )}
                style={i <= currentIdx ? {
                  backgroundColor: s.color === 'teal' ? '#14b8a6' : s.color === 'emerald' ? '#10b981' : s.color === 'amber' ? '#f59e0b' : '#8b5cf6',
                } : undefined}
              />
            </div>
          ))}
        </div>

        {/* Current stage content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {stage === 'goal' && (
              <GoalSelectionWithPreview onSelect={(c) => { setCareer(c); setStage('discover'); }} />
            )}

            {stage === 'discover' && (
              <ScenarioDiscover onComplete={() => setStage('understand')} />
            )}

            {stage === 'understand' && career && (
              <VisualUnderstand career={career} onComplete={() => setStage('grow')} />
            )}

            {stage === 'grow' && career && (
              <MicroActionGrow career={career} onComplete={() => setStage('roadmap')} />
            )}

            {stage === 'roadmap' && career && (
              <RoadmapResult career={career} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Always-visible sections */}
        <div className="border-t border-border/30 mt-12 pt-8 space-y-8">
          <PeerStories />
          <CareerComparison />
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 mt-8 pt-4 text-center">
          <p className="text-[11px] text-muted-foreground/30">
            This is a prototype. Data is mock. No inputs are saved.
          </p>
        </div>
      </div>
    </div>
  );
}
