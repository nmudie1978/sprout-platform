'use client';

/**
 * 10 layout variants for the My Journey stage selector.
 *
 * Each variant renders the same 3 stages (Discover / Understand / Grow)
 * with progress, lock state, and active highlights — just in different
 * visual arrangements.
 *
 * Temporary exploration component — pick your favourite, then we'll
 * delete this file and keep only the chosen layout.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Globe,
  Rocket,
  Lock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Layers,
} from 'lucide-react';
import type { LensProgress } from '@/lib/journey/types';

// ── Shared types & data ──────────────────────────────────────────────

type JourneyTab = 'discover' | 'understand' | 'act';

interface TabDef {
  id: JourneyTab;
  label: string;
  subtitle: string;
  items: string[];
  icon: typeof Search;
  lensKey: 'discover' | 'understand' | 'act';
}

const TABS: TabDef[] = [
  { id: 'discover', label: 'Discover', subtitle: 'Know Yourself', items: ['Reflect on your strengths', 'Explore career interests', 'Set your career direction'], icon: Search, lensKey: 'discover' },
  { id: 'understand', label: 'Understand', subtitle: 'Know the World', items: ['Role reality & industry insights', 'Path, skills & requirements', 'Validate your understanding'], icon: Globe, lensKey: 'understand' },
  { id: 'act', label: 'Grow', subtitle: 'Take Action & Grow', items: ['Log real-world actions', 'Reflect on what you learned', 'Career roadmap'], icon: Rocket, lensKey: 'act' },
];

interface VariantProps {
  activeTab: JourneyTab;
  onTabChange: (tab: JourneyTab) => void;
  lenses: { discover: LensProgress; understand: LensProgress; act: LensProgress };
}

function isLocked(tab: TabDef, lenses: VariantProps['lenses']): boolean {
  if (tab.id === 'discover') return false;
  if (tab.id === 'understand') return !lenses.discover.isComplete;
  if (tab.id === 'act') return !lenses.understand.isComplete;
  return false;
}

// ── VARIANT 1 — Minimal pills (horizontal) ──────────────────────────

function V1({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
                active && 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30',
                !active && !locked && 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
                locked && 'text-muted-foreground/30 cursor-not-allowed',
              )}
            >
              {locked ? <Lock className="h-3.5 w-3.5" /> : progress.isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              {tab.label}
              {!locked && progress.progress > 0 && (
                <span className="text-[10px] opacity-60">{progress.progress}%</span>
              )}
            </button>
          );
        })}
      </div>
      {/* Active tab detail */}
      {TABS.filter((t) => t.id === activeTab).map((tab) => (
        <div key={tab.id} className="pl-1">
          <p className="text-xs text-muted-foreground/60 mb-2">{tab.subtitle}</p>
          <ul className="space-y-1">
            {tab.items.map((item) => (
              <li key={item} className="text-xs text-muted-foreground/50 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-teal-500/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── VARIANT 2 — Vertical sidebar list ────────────────────────────────

function V2({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="flex gap-6">
      {/* Left nav */}
      <div className="w-48 shrink-0 space-y-1">
        {TABS.map((tab, i) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all',
                active && 'bg-teal-500/10 border border-teal-500/20',
                !active && !locked && 'hover:bg-muted/30',
                locked && 'opacity-30 cursor-not-allowed',
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                active ? 'bg-teal-500/20' : 'bg-muted/50',
              )}>
                {locked ? <Lock className="h-4 w-4" /> : progress.isComplete ? <CheckCircle2 className="h-4 w-4 text-teal-500" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{tab.label}</p>
                <p className="text-[10px] text-muted-foreground/50">{tab.subtitle}</p>
              </div>
              {active && <ChevronRight className="h-4 w-4 text-teal-500 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
      {/* Right content area */}
      <div className="flex-1 rounded-xl border border-border/30 bg-card/50 p-5">
        {TABS.filter((t) => t.id === activeTab).map((tab) => (
          <div key={tab.id}>
            <h3 className="text-lg font-semibold mb-1">{tab.label}</h3>
            <p className="text-xs text-muted-foreground/60 mb-4">{tab.subtitle}</p>
            <ul className="space-y-2">
              {tab.items.map((item, i) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="h-6 w-6 rounded-full bg-teal-500/10 flex items-center justify-center text-[10px] font-semibold text-teal-500 shrink-0">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VARIANT 3 — Stacked progress bars (no cards) ────────────────────

function V3({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-3">
      {TABS.map((tab) => {
        const locked = isLocked(tab, lenses);
        const active = activeTab === tab.id;
        const progress = lenses[tab.lensKey];
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => !locked && onTabChange(tab.id)}
            disabled={locked}
            className={cn(
              'w-full text-left rounded-xl p-4 transition-all border',
              active && 'bg-card border-teal-500/30 shadow-sm shadow-teal-500/5',
              !active && !locked && 'border-transparent hover:bg-muted/20',
              locked && 'opacity-30 cursor-not-allowed border-transparent',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                {locked ? <Lock className="h-4 w-4 text-muted-foreground/50" /> : progress.isComplete ? <CheckCircle2 className="h-4 w-4 text-teal-500" /> : <Icon className={cn('h-4 w-4', active ? 'text-teal-400' : 'text-muted-foreground')} />}
                <span className={cn('font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{tab.label}</span>
                <span className="text-[10px] text-muted-foreground/40">{tab.subtitle}</span>
              </div>
              {!locked && <span className="text-xs text-muted-foreground/50">{progress.progress}%</span>}
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-500', active ? 'bg-teal-500' : 'bg-muted-foreground/20')} style={{ width: `${locked ? 0 : progress.progress}%` }} />
            </div>
            {/* Expanded items */}
            {active && (
              <ul className="mt-3 space-y-1.5">
                {tab.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground/60 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-teal-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── VARIANT 4 — Connected timeline dots ──────────────────────────────

function V4({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-5">
      {/* Timeline header */}
      <div className="flex items-center gap-0">
        {TABS.map((tab, i) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          return (
            <div key={tab.id} className="flex items-center flex-1">
              <button
                onClick={() => !locked && onTabChange(tab.id)}
                disabled={locked}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                  active && 'bg-teal-500 text-white ring-4 ring-teal-500/20',
                  !active && progress.isComplete && 'bg-teal-500/20 text-teal-500',
                  !active && !progress.isComplete && !locked && 'bg-muted text-muted-foreground',
                  locked && 'bg-muted/30 text-muted-foreground/30',
                )}>
                  {progress.isComplete ? <CheckCircle2 className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <span className="text-sm font-bold">{i + 1}</span>}
                </div>
                <span className={cn('text-xs font-medium', active ? 'text-foreground' : 'text-muted-foreground/60')}>{tab.label}</span>
              </button>
              {i < TABS.length - 1 && (
                <div className={cn('h-0.5 flex-1 -mx-2', progress.isComplete ? 'bg-teal-500/40' : 'bg-muted/30')} />
              )}
            </div>
          );
        })}
      </div>
      {/* Active content */}
      {TABS.filter((t) => t.id === activeTab).map((tab) => (
        <div key={tab.id} className="rounded-xl border border-border/30 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground/50 mb-3">{tab.subtitle}</p>
          <ul className="space-y-2.5">
            {tab.items.map((item, i) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground/70">
                <span className="h-5 w-5 rounded-full bg-teal-500/10 flex items-center justify-center text-[10px] font-bold text-teal-500 shrink-0 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── VARIANT 5 — Single focus card (one stage at a time) ──────────────

function V5({ activeTab, onTabChange, lenses }: VariantProps) {
  const tab = TABS.find((t) => t.id === activeTab)!;
  const progress = lenses[tab.lensKey];
  const Icon = tab.icon;
  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const canPrev = tabIndex > 0 && !isLocked(TABS[tabIndex - 1], lenses);
  const canNext = tabIndex < TABS.length - 1 && !isLocked(TABS[tabIndex + 1], lenses);

  return (
    <div className="space-y-4">
      {/* Breadcrumb-style nav */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground/40">
        {TABS.map((t, i) => {
          const locked = isLocked(t, lenses);
          return (
            <div key={t.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <button
                onClick={() => !locked && onTabChange(t.id)}
                disabled={locked}
                className={cn(
                  'transition-colors',
                  t.id === activeTab && 'text-foreground font-medium',
                  t.id !== activeTab && !locked && 'hover:text-muted-foreground',
                  locked && 'cursor-not-allowed',
                )}
              >
                {t.label}
              </button>
            </div>
          );
        })}
      </div>
      {/* Main card */}
      <div className="rounded-2xl border border-border/30 bg-card/60 p-6">
        <div className="flex items-center gap-3 mb-1">
          <Icon className="h-5 w-5 text-teal-400" />
          <h2 className="text-xl font-semibold">{tab.label}</h2>
          {progress.progress > 0 && (
            <span className="text-xs text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full">{progress.progress}%</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground/60 mb-5">{tab.subtitle}</p>

        <div className="space-y-3 mb-5">
          {tab.items.map((item, i) => (
            <div key={item} className="flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-3">
              <span className="h-6 w-6 rounded-full bg-teal-500/10 flex items-center justify-center text-[11px] font-bold text-teal-500 shrink-0">{i + 1}</span>
              <span className="text-sm text-foreground/70">{item}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-muted/30">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress.progress}%` }} />
        </div>

        {/* Nav arrows */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => canPrev && onTabChange(TABS[tabIndex - 1].id)}
            disabled={!canPrev}
            className={cn('text-xs text-muted-foreground/50 hover:text-foreground transition-colors', !canPrev && 'invisible')}
          >
            &larr; {TABS[tabIndex - 1]?.label}
          </button>
          <button
            onClick={() => canNext && onTabChange(TABS[tabIndex + 1].id)}
            disabled={!canNext}
            className={cn('text-xs text-muted-foreground/50 hover:text-foreground transition-colors', !canNext && 'invisible')}
          >
            {TABS[tabIndex + 1]?.label} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VARIANT 6 — Segmented control (iOS-style) ───────────────────────

function V6({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl bg-muted/30 p-1 gap-0.5">
        {TABS.map((tab) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          return (
            <button
              key={tab.id}
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              className={cn(
                'relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                active && 'bg-card text-foreground shadow-sm',
                !active && !locked && 'text-muted-foreground hover:text-foreground',
                locked && 'text-muted-foreground/20 cursor-not-allowed',
              )}
            >
              <span className="flex items-center gap-2">
                {locked && <Lock className="h-3 w-3" />}
                {tab.label}
                {!locked && progress.isComplete && <CheckCircle2 className="h-3 w-3 text-teal-500" />}
              </span>
              {active && !locked && progress.progress > 0 && progress.progress < 100 && (
                <div className="absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-muted/30">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${progress.progress}%` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Content */}
      {TABS.filter((t) => t.id === activeTab).map((tab) => (
        <div key={tab.id}>
          <p className="text-sm text-muted-foreground/50 mb-4">{tab.subtitle}</p>
          <div className="grid gap-2">
            {tab.items.map((item, i) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-border/20 px-4 py-3">
                <span className="text-xs font-bold text-muted-foreground/30">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-foreground/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── VARIANT 7 — Compact single-line with dropdown feel ───────────────

function V7({ activeTab, onTabChange, lenses }: VariantProps) {
  const tab = TABS.find((t) => t.id === activeTab)!;
  const progress = lenses[tab.lensKey];
  return (
    <div className="space-y-4">
      {/* Compact stage buttons */}
      <div className="flex items-center gap-3">
        {TABS.map((t, i) => {
          const locked = isLocked(t, lenses);
          const active = t.id === activeTab;
          const p = lenses[t.lensKey];
          return (
            <button
              key={t.id}
              onClick={() => !locked && onTabChange(t.id)}
              disabled={locked}
              className={cn(
                'flex items-center gap-2 text-sm transition-all',
                active && 'text-foreground font-semibold',
                !active && !locked && 'text-muted-foreground/50 hover:text-muted-foreground',
                locked && 'text-muted-foreground/20 cursor-not-allowed',
              )}
            >
              {p.isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
              ) : locked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center', active ? 'border-teal-500' : 'border-muted-foreground/30')}>
                  {active && <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                </div>
              )}
              {t.label}
            </button>
          );
        })}
      </div>
      {/* Divider with progress */}
      <div className="h-px bg-border/30 relative">
        <div className="absolute top-0 left-0 h-full bg-teal-500/50 transition-all" style={{ width: `${progress.progress}%` }} />
      </div>
      {/* Content */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <h3 className="font-semibold text-foreground">{tab.label}</h3>
          <span className="text-xs text-muted-foreground/40">{tab.subtitle}</span>
        </div>
        <ul className="space-y-2">
          {tab.items.map((item) => (
            <li key={item} className="text-sm text-muted-foreground/60 flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-teal-500/50 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── VARIANT 8 — Accordion-style (all stages visible) ─────────────────

function V8({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-2">
      {TABS.map((tab) => {
        const locked = isLocked(tab, lenses);
        const active = activeTab === tab.id;
        const progress = lenses[tab.lensKey];
        const Icon = tab.icon;
        return (
          <div key={tab.id} className={cn(
            'rounded-xl border transition-all overflow-hidden',
            active ? 'border-teal-500/30 bg-teal-500/[0.04]' : 'border-border/20',
            locked && 'opacity-30',
          )}>
            <button
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            >
              {progress.isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
              ) : locked ? (
                <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              ) : (
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-teal-400' : 'text-muted-foreground')} />
              )}
              <span className={cn('flex-1 font-medium text-sm', active ? 'text-foreground' : 'text-muted-foreground')}>
                {tab.label}
              </span>
              <span className="text-[10px] text-muted-foreground/40">{tab.subtitle}</span>
              {!locked && progress.progress > 0 && (
                <span className="text-[10px] text-teal-500 ml-2">{progress.progress}%</span>
              )}
            </button>
            {active && (
              <div className="px-4 pb-4 pt-0">
                <ul className="space-y-2 ml-7">
                  {tab.items.map((item, i) => (
                    <li key={item} className="text-xs text-muted-foreground/60 flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-teal-500/10 flex items-center justify-center text-[9px] font-bold text-teal-500 shrink-0">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
                {/* Progress */}
                <div className="ml-7 mt-3 h-1 rounded-full bg-muted/30">
                  <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── VARIANT 9 — Stepper with numbered badges ─────────────────────────

function V9({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-start">
        {TABS.map((tab, i) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          return (
            <div key={tab.id} className="flex-1 flex flex-col items-center text-center">
              <button
                onClick={() => !locked && onTabChange(tab.id)}
                disabled={locked}
                className="flex flex-col items-center gap-2"
              >
                <div className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all',
                  active && 'bg-teal-500 text-white shadow-lg shadow-teal-500/20',
                  !active && progress.isComplete && 'bg-teal-500/15 text-teal-500',
                  !active && !progress.isComplete && !locked && 'bg-muted/50 text-muted-foreground',
                  locked && 'bg-muted/20 text-muted-foreground/20',
                )}>
                  {progress.isComplete ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <div>
                  <p className={cn('text-xs font-semibold', active ? 'text-foreground' : 'text-muted-foreground/60')}>{tab.label}</p>
                  <p className="text-[9px] text-muted-foreground/30">{tab.subtitle}</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {/* Content panel */}
      {TABS.filter((t) => t.id === activeTab).map((tab) => (
        <div key={tab.id} className="rounded-2xl border border-border/20 bg-card/40 p-5">
          <div className="space-y-3">
            {tab.items.map((item, i) => (
              <div key={item} className="flex items-center gap-4 text-sm">
                <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center text-xs font-bold text-muted-foreground/40 shrink-0">
                  {i + 1}
                </div>
                <span className="text-foreground/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── VARIANT 10 — Card grid (equal size, no expand) ───────────────────

function V10({ activeTab, onTabChange, lenses }: VariantProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {TABS.map((tab, i) => {
          const locked = isLocked(tab, lenses);
          const active = activeTab === tab.id;
          const progress = lenses[tab.lensKey];
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              className={cn(
                'rounded-2xl p-4 text-left transition-all border',
                active && 'bg-card border-teal-500/30 ring-1 ring-teal-500/20',
                !active && !locked && 'border-border/20 hover:border-border/40',
                locked && 'border-border/10 opacity-25 cursor-not-allowed',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  'h-9 w-9 rounded-xl flex items-center justify-center',
                  active ? 'bg-teal-500/15' : 'bg-muted/40',
                )}>
                  {locked ? <Lock className="h-4 w-4" /> : progress.isComplete ? <CheckCircle2 className="h-4 w-4 text-teal-500" /> : <Icon className={cn('h-4 w-4', active ? 'text-teal-400' : 'text-muted-foreground')} />}
                </div>
                {!locked && progress.progress > 0 && (
                  <span className="text-[10px] text-muted-foreground/40">{progress.progress}%</span>
                )}
              </div>
              <p className={cn('text-sm font-semibold mb-0.5', active ? 'text-foreground' : 'text-muted-foreground/70')}>{tab.label}</p>
              <p className="text-[10px] text-muted-foreground/40 mb-3">{tab.subtitle}</p>
              {/* Mini progress */}
              <div className="h-1 rounded-full bg-muted/20">
                <div className={cn('h-full rounded-full transition-all', active ? 'bg-teal-500' : 'bg-muted-foreground/15')} style={{ width: `${locked ? 0 : progress.progress}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      {/* Step items below */}
      {TABS.filter((t) => t.id === activeTab).map((tab) => (
        <div key={tab.id} className="space-y-2">
          {tab.items.map((item, i) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-border/15 px-4 py-3 text-sm text-muted-foreground/60">
              <span className="text-[10px] font-bold text-teal-500/50">{String(i + 1).padStart(2, '0')}</span>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── VARIANT MAP & PICKER ─────────────────────────────────────────────

const VARIANTS: { name: string; description: string; component: React.FC<VariantProps> }[] = [
  { name: 'V1 — Minimal Pills', description: 'Horizontal pill buttons with inline detail', component: V1 },
  { name: 'V2 — Sidebar Nav', description: 'Vertical left nav with content panel', component: V2 },
  { name: 'V3 — Stacked Bars', description: 'Full-width accordion rows with progress bars', component: V3 },
  { name: 'V4 — Timeline Dots', description: 'Connected circles like a progress timeline', component: V4 },
  { name: 'V5 — Single Focus', description: 'One stage at a time with prev/next navigation', component: V5 },
  { name: 'V6 — Segmented Control', description: 'iOS-style toggle with step list below', component: V6 },
  { name: 'V7 — Radio Buttons', description: 'Compact radio-style with divider progress', component: V7 },
  { name: 'V8 — Accordion', description: 'Expandable sections showing all stages at once', component: V8 },
  { name: 'V9 — Numbered Stepper', description: 'Large numbered badges with content panel', component: V9 },
  { name: 'V10 — Card Grid', description: 'Equal-size cards (current shape) simplified', component: V10 },
];

export function StageLayoutVariants(props: VariantProps) {
  const [variant, setVariant] = useState(0);
  const Variant = VARIANTS[variant].component;

  return (
    <div>
      {/* Floating variant picker */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-500">Layout Preview</span>
          <span className="text-[10px] text-muted-foreground/50">Pick the one that feels right</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VARIANTS.map((v, i) => (
            <button
              key={i}
              onClick={() => setVariant(i)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[11px] transition-all',
                variant === i
                  ? 'bg-amber-500/15 text-amber-400 font-medium ring-1 ring-amber-500/30'
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-2">{VARIANTS[variant].name} — {VARIANTS[variant].description}</p>
      </div>

      {/* Active variant */}
      <Variant {...props} />
    </div>
  );
}
