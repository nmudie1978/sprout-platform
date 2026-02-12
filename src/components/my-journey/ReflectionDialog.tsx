'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { prefersReducedMotion, PREMIUM_EASE, DURATION } from '@/lib/motion';
import {
  REFLECTION_STEPS,
  STEP_META,
  DEFAULT_SKILLS,
  ENERGY_LABELS,
  type ReflectionStep,
  type ReflectionEntry,
} from '@/lib/my-journey/reflection-types';

interface ReflectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ReflectionEntry, 'id' | 'createdAt'>) => void;
}

const ENERGY_COLORS = [
  'bg-red-500',      // 1 — Drained
  'bg-amber-500',    // 2 — Low
  'bg-amber-400',    // 3 — Neutral
  'bg-emerald-400',  // 4 — Good
  'bg-emerald-500',  // 5 — Energised
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATION.standard,
      ease: PREMIUM_EASE as unknown as string,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: {
      duration: DURATION.standard * 0.75,
      ease: PREMIUM_EASE as unknown as string,
    },
  }),
};

function StepIndicator({ current, steps }: { current: number; steps: ReflectionStep[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-1">
      {steps.map((step, i) => (
        <div
          key={step}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current
              ? 'w-8 bg-emerald-500'
              : i < current
                ? 'w-2 bg-emerald-300'
                : 'w-2 bg-muted'
          )}
        />
      ))}
    </div>
  );
}

export function ReflectionDialog({ open, onClose, onSave }: ReflectionDialogProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  // Form state
  const [awareness, setAwareness] = useState({ tried: '', learned: '', surprised: '' });
  const [energy, setEnergy] = useState({ level: 3, notes: '' });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [growthNote, setGrowthNote] = useState('');
  const [nextInterest, setNextInterest] = useState('');
  const [perspectiveShift, setPerspectiveShift] = useState('');

  const currentStep = REFLECTION_STEPS[stepIndex];
  const meta = STEP_META[currentStep];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === REFLECTION_STEPS.length - 1;

  const resetForm = useCallback(() => {
    setStepIndex(0);
    setDirection(1);
    setAwareness({ tried: '', learned: '', surprised: '' });
    setEnergy({ level: 3, notes: '' });
    setSelectedSkills([]);
    setCustomSkill('');
    setResponsibility('');
    setGrowthNote('');
    setNextInterest('');
    setPerspectiveShift('');
  }, []);

  const handleNext = () => {
    if (isLast) {
      onSave({
        awareness: {
          tried: awareness.tried || undefined,
          learned: awareness.learned || undefined,
          surprised: awareness.surprised || undefined,
        },
        energy: {
          level: energy.level,
          notes: energy.notes || undefined,
        },
        capability: {
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
          responsibility: responsibility || undefined,
          growthNote: growthNote || undefined,
        },
        direction: {
          nextInterest: nextInterest || undefined,
          perspectiveShift: perspectiveShift || undefined,
          addToRoadmap: false,
        },
      });
      resetForm();
      onClose();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
      onClose();
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  // Check if current step has any content (for gentle hint)
  const isStepEmpty = () => {
    switch (currentStep) {
      case 'awareness':
        return !awareness.tried && !awareness.learned && !awareness.surprised;
      case 'energy':
        return false; // always has a default level
      case 'capability':
        return selectedSkills.length === 0 && !responsibility && !growthNote;
      case 'direction':
        return !nextInterest && !perspectiveShift;
    }
  };

  const MotionDiv = reduced ? 'div' : motion.div;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <StepIndicator current={stepIndex} steps={REFLECTION_STEPS} />
          <DialogTitle className="text-center">{meta.title}</DialogTitle>
          <DialogDescription className="text-center">{meta.description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-[200px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <MotionDiv
              key={currentStep}
              {...(!reduced && {
                custom: direction,
                variants: slideVariants,
                initial: 'enter',
                animate: 'center',
                exit: 'exit',
              })}
              className="space-y-4"
            >
              {/* Step 1: Awareness */}
              {currentStep === 'awareness' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      What did you try recently?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. I helped at a community event..."
                      value={awareness.tried}
                      onChange={(e) => setAwareness((a) => ({ ...a, tried: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      What did you learn?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. I realised I enjoy organising..."
                      value={awareness.learned}
                      onChange={(e) => setAwareness((a) => ({ ...a, learned: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      What surprised you?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. I didn't expect to enjoy speaking up..."
                      value={awareness.surprised}
                      onChange={(e) => setAwareness((a) => ({ ...a, surprised: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Energy */}
              {currentStep === 'energy' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      How is your energy right now?
                    </label>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[energy.level]}
                      onValueChange={([v]) => setEnergy((e) => ({ ...e, level: v }))}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      {ENERGY_LABELS.map((label, i) => (
                        <span
                          key={label}
                          className={cn(
                            'transition-colors',
                            energy.level === i + 1 && 'font-semibold text-foreground'
                          )}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-center mt-4">
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full transition-colors duration-300',
                          ENERGY_COLORS[energy.level - 1]
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Any notes about how you feel?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Optional — whatever comes to mind..."
                      value={energy.notes}
                      onChange={(e) => setEnergy((en) => ({ ...en, notes: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Capability */}
              {currentStep === 'capability' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Skills you&apos;re building
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {DEFAULT_SKILLS.map((skill) => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer select-none transition-colors',
                            selectedSkills.includes(skill)
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                              : 'hover:bg-muted'
                          )}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                      {selectedSkills
                        .filter((s) => !DEFAULT_SKILLS.includes(s))
                        .map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent cursor-pointer select-none"
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a custom skill..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSkill();
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addCustomSkill}
                        disabled={!customSkill.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Any new responsibilities?
                    </label>
                    <Input
                      placeholder="e.g. I was trusted to close up the shop..."
                      value={responsibility}
                      onChange={(e) => setResponsibility(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Growth note
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="How are you growing? What would past-you think?"
                      value={growthNote}
                      onChange={(e) => setGrowthNote(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Step 4: Direction */}
              {currentStep === 'direction' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      What interests you next?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. I want to learn more about design..."
                      value={nextInterest}
                      onChange={(e) => setNextInterest(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Has your perspective shifted?
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. I used to think X, but now I see..."
                      value={perspectiveShift}
                      onChange={(e) => setPerspectiveShift(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/25 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Add to Roadmap</p>
                      <p className="text-xs text-muted-foreground/70">Coming soon</p>
                    </div>
                    <div className="h-5 w-9 rounded-full bg-muted opacity-50 relative">
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-muted-foreground/30" />
                    </div>
                  </div>
                </>
              )}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Gentle hint if empty */}
        {isStepEmpty() && currentStep !== 'energy' && (
          <p className="text-xs text-muted-foreground/60 text-center -mt-2">
            All fields are optional — add what feels right.
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isFirst}
            className={cn(isFirst && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            {stepIndex + 1} of {REFLECTION_STEPS.length}
          </span>
          <Button
            size="sm"
            onClick={handleNext}
            className={cn(
              isLast && 'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
          >
            {isLast ? 'Save Self-Reflection' : 'Next'}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
