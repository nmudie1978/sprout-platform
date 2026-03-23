'use client';

/**
 * HOW YOUR JOURNEY WORKS — Sub-page
 *
 * Full explanation of the Discover → Understand → Grow framework.
 * Moved from the collapsible guide on the My Journey page.
 */

import Link from 'next/link';
import { ArrowLeft, Search, Globe, Rocket, Sprout, Lightbulb, GraduationCap } from 'lucide-react';

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
      'Before you can make good decisions, it helps to know what you\'re good at and what interests you. This stage guides you to reflect on your strengths, explore different careers, and set a clear direction.',
    items: [
      'Strengths — what you\'re naturally good at',
      'Interests — what draws your attention',
      'Ambitions & motivations — what drives you',
      'Primary direction — your career goal',
    ],
  },
  {
    icon: Globe,
    label: 'Understand',
    subtitle: 'Know the World',
    color: 'emerald',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
    description:
      'Once you have a direction, you need to understand the reality of that path. What does the role actually involve? What qualifications do you need? What skills matter? What\'s the industry outlook?',
    items: [
      'Role reality — what the job is actually like',
      'Path & requirements — schooling and qualifications',
      'Skills that matter — what employers value',
      'Industry insights — trends and outlook',
    ],
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
      'Now you\'re ready to do something real. Follow your roadmap, set learning goals, complete real-world actions, then reflect on what you\'ve learned and update your next move.',
    items: [
      'Growth path — your career roadmap',
      'Learning goals — skills to build',
      'Real-world actions — jobs, courses, projects',
      'Next step — what to do next',
    ],
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
          Endeavrly guides you through three stages — each one builds on the last.
          You can&apos;t skip ahead, because each stage gives you what you need for the next.
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

              <div className="grid sm:grid-cols-2 gap-2">
                {stage.items.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md shrink-0 mt-0.5 bg-${stage.color}-500/10`}>
                      <div className={`h-1.5 w-1.5 rounded-full bg-${stage.color}-500`} />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key principle */}
      <div className="mt-8 rounded-xl border border-border/40 bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold mb-1">Why the order matters</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Understanding yourself before understanding the world, and understanding the world
              before taking action, leads to decisions that are aligned with who you actually are.
              Each stage produces signals that feed into the next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
