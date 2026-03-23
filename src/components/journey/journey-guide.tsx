'use client';

/**
 * JOURNEY GUIDE — "How Your Journey Works"
 *
 * Collapsible guide shown at the top of My Journey page.
 * Explains the 3 lenses (Discover, Understand, Grow), shows current position,
 * and what the user needs to do next. Remembers collapsed state in localStorage.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Globe, Zap, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JourneyUIState } from '@/lib/journey/types';

const STORAGE_KEY = 'endeavrly-journey-guide-collapsed';

interface JourneyGuideProps {
  journey: JourneyUIState;
}

const LENSES = [
  {
    id: 'DISCOVER' as const,
    title: 'Discover',
    subtitle: 'Know yourself',
    description: 'Reflect on your strengths and growth areas. Explore what interests you. Shortlist career paths and set your direction.',
    icon: Search,
    color: '#7c3aed',
    bgClass: 'bg-teal-500/10',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500/30',
    steps: ['Reflect on Strengths', 'Explore Careers', 'Deep Dive into a Role'],
  },
  {
    id: 'UNDERSTAND' as const,
    title: 'Understand',
    subtitle: 'Know the world',
    description: 'Explore industries, roles, and what they really involve. Review insights, save content, and connect your direction to reality.',
    icon: Globe,
    color: '#059669',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    steps: ['Review Industry Outlook', 'Career Shadow', 'Create Action Plan'],
  },
  {
    id: 'ACT' as const,
    title: 'Grow',
    subtitle: 'Take action and grow',
    description: 'Follow your roadmap. Set learning goals. Complete real-world actions. Reflect on what you learn and update your next move.',
    icon: Zap,
    color: '#d97706',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    steps: ['Complete Aligned Action', 'Reflect on Action', 'Update Plan', 'External Feedback'],
  },
];

export function JourneyGuide({ journey }: JourneyGuideProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    setCollapsed(stored !== 'false');
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const currentLens = journey.currentLens;
  const currentLensIndex = LENSES.findIndex((l) => l.id === currentLens);
  const nextStep = journey.steps.find((s) => s.status === 'next');

  if (!mounted) return null;

  return (
    <div className="mb-5 sm:mb-8 rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1">
            {LENSES.map((lens, i) => {
              const isComplete = i < currentLensIndex;
              const isCurrent = i === currentLensIndex;
              return (
                <div key={lens.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <div className={cn('w-4 sm:w-6 h-px', isComplete ? 'bg-emerald-500' : 'bg-border')} />
                  )}
                  <div
                    className={cn(
                      'flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold shrink-0 transition-all',
                      isComplete && 'bg-emerald-500/20 text-emerald-500',
                      isCurrent && `ring-2 ring-offset-1 ring-offset-background`,
                      !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                    style={isCurrent ? { backgroundColor: `${lens.color}20`, color: lens.color, boxShadow: `0 0 0 2px ${lens.color}` } : undefined}
                  >
                    {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : (i + 1)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              How Your Journey Works
            </p>
            {collapsed && nextStep && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                Next: {nextStep.title}
              </p>
            )}
          </div>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Intro text */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Endeavrly guides you through three lenses — each one builds on the last.
                You can't skip ahead, because each step gives you what you need for the next.
              </p>

              {/* Three lenses */}
              <div className="grid gap-3 sm:grid-cols-3">
                {LENSES.map((lens, i) => {
                  const Icon = lens.icon;
                  const isComplete = i < currentLensIndex;
                  const isCurrent = i === currentLensIndex;
                  const isLocked = i > currentLensIndex;
                  const lensProgress = journey.summary?.lenses?.[lens.id.toLowerCase() as 'discover' | 'understand' | 'act'];

                  return (
                    <div
                      key={lens.id}
                      className={cn(
                        'rounded-lg border p-3 transition-all',
                        isCurrent ? `${lens.borderClass} ${lens.bgClass}` : 'border-border/30',
                        isLocked && 'opacity-50'
                      )}
                    >
                      {/* Lens header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn('p-1.5 rounded-lg', lens.bgClass)}>
                          <Icon className={cn('h-3.5 w-3.5', lens.textClass)} />
                        </div>
                        <div>
                          <p className={cn('text-xs font-semibold', isCurrent ? lens.textClass : 'text-foreground')}>
                            {lens.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{lens.subtitle}</p>
                        </div>
                        {isComplete && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />
                        )}
                        {isCurrent && lensProgress && (
                          <span className={cn('text-[10px] font-medium ml-auto', lens.textClass)}>
                            {lensProgress.progress}%
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                        {lens.description}
                      </p>

                      {/* Steps list */}
                      <div className="space-y-1">
                        {lens.steps.map((step, si) => {
                          // Find matching step in journey data
                          const journeyStep = journey.steps.find((s) => s.title === step);
                          const stepComplete = journeyStep?.status === 'completed';
                          const stepCurrent = journeyStep?.status === 'next';

                          return (
                            <div key={si} className="flex items-center gap-1.5 text-[10px]">
                              {stepComplete ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                              ) : stepCurrent ? (
                                <ArrowRight className="h-3 w-3 shrink-0" style={{ color: lens.color }} />
                              ) : (
                                <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                              )}
                              <span className={cn(
                                stepComplete && 'text-muted-foreground line-through',
                                stepCurrent && 'font-medium text-foreground',
                                !stepComplete && !stepCurrent && 'text-muted-foreground/60'
                              )}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current step callout */}
              {nextStep && (
                <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Your next step: {nextStep.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {journey.nextStepReason || nextStep.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
