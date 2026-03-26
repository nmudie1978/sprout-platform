'use client';

/**
 * HOW YOUR JOURNEY WORKS — Sub-page
 *
 * Full explanation of the Discover → Understand → Grow framework.
 * Must match the actual content and steps in the My Journey tabs.
 */

import Link from 'next/link';
import { ArrowLeft, Search, Globe, Rocket, Lightbulb, Route, GraduationCap } from 'lucide-react';

const STAGES = [
  {
    icon: Search,
    label: 'Discover',
    subtitle: 'Know Yourself',
    color: 'teal',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
    borderColor: 'border-teal-500/20',
    description:
      'Before you can make good decisions, it helps to know what you\'re good at and what interests you. This stage helps you reflect, explore, and choose a direction.',
    steps: [
      { name: 'Reflect on Strengths', detail: 'Identify what you\'re naturally good at' },
      { name: 'Explore Careers', detail: 'Browse career paths and save what interests you' },
      { name: 'Set Your Career Direction', detail: 'Choose a career goal to focus your journey' },
    ],
    extras: [
      { name: 'Know Yourself Better', detail: '5 self-discovery reflections — motivations, work style, growth areas, role models, and experiences' },
    ],
  },
  {
    icon: Globe,
    label: 'Understand',
    subtitle: 'Know the Role',
    color: 'emerald',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
    description:
      'Once you have a direction, explore what that path actually looks like. What does the role involve day to day? What qualifications and skills do you need? What\'s the industry outlook?',
    steps: [
      { name: 'Role Reality & Industry Insights', detail: 'Research what the career involves and what trends look like' },
      { name: 'Path, Skills & Requirements', detail: 'Explore qualifications, key skills, and what\'s needed to get started' },
      { name: 'Validate Your Understanding of the Role', detail: 'Write down realistic actions you can take based on your research' },
    ],
    extras: [],
  },
  {
    icon: Rocket,
    label: 'Grow',
    subtitle: 'Take Action & Grow',
    color: 'amber',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500/20',
    description:
      'Time to do something real. Complete a meaningful action — a course, a project, an application — then reflect on what you learned. Completing these two steps unlocks your personalised career roadmap and school alignment.',
    steps: [
      { name: 'Complete Real-World Actions', detail: 'Take a real step — a course, project, job application, or volunteering' },
      { name: 'Reflect on What You\'ve Learned', detail: 'Think about what you learned and how it connects to your direction' },
    ],
    extras: [],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/my-journey"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Journey
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
          How Your Journey Works
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Your journey moves through three stages, each one building on what came before.
          There&apos;s no deadline and no pressure — go at your own pace. You can always revisit and
          update things as your thinking evolves.
        </p>
      </div>

      {/* Flow arrow indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${stage.iconBg}`}>
              <stage.icon className={`h-3.5 w-3.5 ${stage.iconColor}`} />
              <span className={`text-xs font-semibold ${stage.iconColor}`}>{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className="w-6 h-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Stage cards */}
      <div className="space-y-4">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.label}
              className={`rounded-xl border ${stage.borderColor} bg-card/60 p-5 sm:p-6`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stage.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stage.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{stage.label}</h2>
                  <p className={`text-xs ${stage.iconColor}`}>{stage.subtitle}</p>
                </div>
                <span className={`ml-auto text-xs font-bold ${stage.iconColor} bg-${stage.color}-500/10 px-2 py-0.5 rounded-full`}>
                  Stage {i + 1}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {stage.description}
              </p>

              {/* Steps */}
              <div className="space-y-2 mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  Steps
                </p>
                {stage.steps.map((step, si) => (
                  <div key={step.name} className="flex items-start gap-2.5">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 mt-0.5 text-[9px] font-bold bg-${stage.color}-500/15 ${stage.iconColor}`}>
                      {si + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80">{step.name}</p>
                      <p className="text-xs text-muted-foreground/60">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extras */}
              {stage.extras.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Also in this stage
                  </p>
                  {stage.extras.map((extra) => (
                    <div key={extra.name} className="flex items-start gap-2.5">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-md shrink-0 mt-0.5 bg-${stage.color}-500/10`}>
                        <div className={`h-1.5 w-1.5 rounded-full bg-${stage.color}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/80">{extra.name}</p>
                        <p className="text-xs text-muted-foreground/60">{extra.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What you unlock */}
      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
        <div className="flex items-start gap-3">
          <Route className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold mb-1">What you unlock</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              When you complete all three stages, your personalised career roadmap and school
              alignment section unlock. These show you the path ahead — age-based milestones,
              how your current subjects connect to your goal, and what to focus on next.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-amber-500" />
                Career Roadmap
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-teal-500" />
                School & Learning Alignment
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key principle */}
      <div className="mt-4 rounded-xl border border-border/40 bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold mb-1">Why the order matters</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Understanding yourself before understanding the world, and understanding the world
              before taking action, leads to decisions that are aligned with who you actually are.
              Each stage produces signals that feed into the next — and you can always go back
              and update earlier stages as you learn more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
