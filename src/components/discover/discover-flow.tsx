'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { captureClientMutationError } from '@/lib/observability';
import {
  type DiscoverProfile,
  DEFAULT_DISCOVER_PROFILE,
  INTEREST_OPTIONS,
  STRENGTH_OPTIONS,
  WORK_STYLE_OPTIONS,
  MOTIVATION_OPTIONS,
  CLARITY_OPTIONS,
} from '@/lib/discover/types';
import { generateSummary, isDiscoverComplete } from '@/lib/discover/recommendation-engine';

interface DiscoverFlowProps {
  initialProfile?: DiscoverProfile;
  onComplete: (profile: DiscoverProfile) => Promise<void>;
  onSaveProgress: (profile: DiscoverProfile) => Promise<void>;
  onClose?: () => void;
}

const STEPS = [
  { id: 'interests', title: 'What interests you?', subtitle: 'Pick as many as feel right' },
  { id: 'strengths', title: 'What are you good at?', subtitle: 'Choose what feels true about you' },
  { id: 'work-style', title: 'How do you like to work?', subtitle: 'Your ideal work style' },
  { id: 'motivations', title: 'What drives you?', subtitle: 'What matters most to you' },
  { id: 'clarity', title: 'Where are you right now?', subtitle: 'There\'s no wrong answer' },
];

// ── Chip Component ──────────────────────────

function SelectableChip({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all border-2',
        selected
          ? 'border-teal-500/50 bg-teal-500/10 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.1)]'
          : 'border-border/40 bg-card/50 text-muted-foreground hover:border-border/60 hover:bg-card/80'
      )}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
      {selected && <Check className="h-3.5 w-3.5 text-teal-500" />}
    </button>
  );
}

// ── Radio Option ────────────────────────────

function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all border-2',
        selected
          ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
          : 'border-border/40 bg-card/50 text-muted-foreground hover:border-border/60'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
          selected ? 'border-teal-500 bg-teal-500' : 'border-muted-foreground/30'
        )}>
          {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
        {label}
      </div>
    </button>
  );
}

// ── Main Flow ───────────────────────────────

export function DiscoverFlow({ initialProfile, onComplete, onSaveProgress, onClose }: DiscoverFlowProps) {
  // Deep-merge with defaults to guard against missing nested fields
  const safeInitial: DiscoverProfile = {
    ...DEFAULT_DISCOVER_PROFILE,
    ...(initialProfile || {}),
    workPreferences: {
      ...DEFAULT_DISCOVER_PROFILE.workPreferences,
      ...(initialProfile?.workPreferences || {}),
    },
  };
  const [profile, setProfile] = useState<DiscoverProfile>(safeInitial);
  const initialStep = Math.min(safeInitial.currentStep || 0, STEPS.length - 1);
  const [step, setStep] = useState(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(initialStep >= STEPS.length - 1 && !!safeInitial.completedAt);

  const toggleInterest = (id: string) => {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(id)
        ? p.interests.filter((i) => i !== id)
        : [...p.interests, id],
    }));
  };

  const toggleStrength = (id: string) => {
    setProfile((p) => ({
      ...p,
      strengths: p.strengths.includes(id)
        ? p.strengths.filter((i) => i !== id)
        : [...p.strengths, id],
    }));
  };

  const toggleWorkType = (id: string) => {
    setProfile((p) => ({
      ...p,
      workPreferences: {
        ...p.workPreferences,
        workType: p.workPreferences.workType.includes(id)
          ? p.workPreferences.workType.filter((i) => i !== id)
          : [...p.workPreferences.workType, id],
      },
    }));
  };

  const toggleMotivation = (id: string) => {
    setProfile((p) => ({
      ...p,
      motivations: p.motivations.includes(id)
        ? p.motivations.filter((i) => i !== id)
        : [...p.motivations, id],
    }));
  };

  const handleNext = useCallback(async () => {
    const updated = { ...profile, currentStep: step + 1 };
    setProfile(updated);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      await onSaveProgress(updated).catch(captureClientMutationError("discoverFlow:saveProgress"));
    } else {
      // Last step — show summary
      setShowSummary(true);
    }
  }, [step, profile, onSaveProgress]);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const completed = { ...profile, completedAt: new Date().toISOString(), currentStep: STEPS.length };
    await onComplete(completed);
    setIsSaving(false);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // ── Summary View ──

  if (showSummary) {
    const summary = generateSummary(profile);

    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-teal-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Here&apos;s what we learned about you</h2>
          <p className="text-sm text-muted-foreground">This shapes your personalised experience across Endeavrly</p>
        </div>

        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
          <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-card/60 border border-border/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Interests</p>
            <p className="text-xs text-foreground/80">{profile.interests.length} selected</p>
          </div>
          <div className="rounded-lg bg-card/60 border border-border/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Strengths</p>
            <p className="text-xs text-foreground/80">{profile.strengths.length} selected</p>
          </div>
          <div className="rounded-lg bg-card/60 border border-border/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Motivations</p>
            <p className="text-xs text-foreground/80">{profile.motivations.length} selected</p>
          </div>
          <div className="rounded-lg bg-card/60 border border-border/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Clarity</p>
            <p className="text-xs text-foreground/80">
              {CLARITY_OPTIONS.find((o) => o.id === profile.clarityLevel)?.label || '—'}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 text-center">
          You can update these anytime from My Journey
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowSummary(false)}>
            Go back
          </Button>
          <Button size="sm" onClick={handleFinish} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step Content ──

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
            Step {step + 1} of {STEPS.length}
          </span>
          {onClose && (
            <button onClick={onClose} className="text-xs text-muted-foreground/50 hover:text-muted-foreground">
              Save & exit
            </button>
          )}
        </div>
        <div className="h-1 rounded-full bg-border/30">
          <motion.div
            className="h-full rounded-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-lg font-bold mb-1">{STEPS[step].title}</h2>
          <p className="text-sm text-muted-foreground/70 mb-5">{STEPS[step].subtitle}</p>

          {/* Step 0: Interests */}
          {step === 0 && (
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => (
                <SelectableChip
                  key={opt.id}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={profile.interests.includes(opt.id)}
                  onClick={() => toggleInterest(opt.id)}
                />
              ))}
            </div>
          )}

          {/* Step 1: Strengths */}
          {step === 1 && (
            <div className="flex flex-wrap gap-2">
              {STRENGTH_OPTIONS.map((opt) => (
                <SelectableChip
                  key={opt.id}
                  label={opt.label}
                  selected={profile.strengths.includes(opt.id)}
                  onClick={() => toggleStrength(opt.id)}
                />
              ))}
            </div>
          )}

          {/* Step 2: Work Style */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-foreground/70 mb-2">I prefer working...</p>
                <div className="space-y-2">
                  {WORK_STYLE_OPTIONS.peoplePreference.map((opt) => (
                    <RadioOption
                      key={opt.id}
                      label={opt.label}
                      selected={profile.workPreferences.peoplePreference === opt.id}
                      onClick={() => setProfile((p) => ({ ...p, workPreferences: { ...p.workPreferences, peoplePreference: opt.id } }))}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/70 mb-2">I enjoy this type of work...</p>
                <div className="flex flex-wrap gap-2">
                  {WORK_STYLE_OPTIONS.workType.map((opt) => (
                    <SelectableChip
                      key={opt.id}
                      label={opt.label}
                      selected={profile.workPreferences.workType.includes(opt.id)}
                      onClick={() => toggleWorkType(opt.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/70 mb-2">My ideal pace...</p>
                <div className="space-y-2">
                  {WORK_STYLE_OPTIONS.pace.map((opt) => (
                    <RadioOption
                      key={opt.id}
                      label={opt.label}
                      selected={profile.workPreferences.pace === opt.id}
                      onClick={() => setProfile((p) => ({ ...p, workPreferences: { ...p.workPreferences, pace: opt.id } }))}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/70 mb-2">I prefer to work...</p>
                <div className="space-y-2">
                  {WORK_STYLE_OPTIONS.environment.map((opt) => (
                    <RadioOption
                      key={opt.id}
                      label={opt.label}
                      selected={profile.workPreferences.environment === opt.id}
                      onClick={() => setProfile((p) => ({ ...p, workPreferences: { ...p.workPreferences, environment: opt.id } }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Motivations */}
          {step === 3 && (
            <div className="flex flex-wrap gap-2">
              {MOTIVATION_OPTIONS.map((opt) => (
                <SelectableChip
                  key={opt.id}
                  label={opt.label}
                  selected={profile.motivations.includes(opt.id)}
                  onClick={() => toggleMotivation(opt.id)}
                />
              ))}
            </div>
          )}

          {/* Step 4: Clarity Level */}
          {step === 4 && (
            <div className="space-y-2">
              {CLARITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setProfile((p) => ({ ...p, clarityLevel: opt.id }))}
                  className={cn(
                    'w-full text-left rounded-xl px-5 py-4 transition-all border-2',
                    profile.clarityLevel === opt.id
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : 'border-border/40 bg-card/50 hover:border-border/60'
                  )}
                >
                  <p className={cn('text-sm font-medium', profile.clarityLevel === opt.id ? 'text-teal-400' : 'text-foreground')}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button size="sm" onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
          {step < STEPS.length - 1 ? 'Next' : 'See my summary'}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
