'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Square,
  Waves,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  fadeInUp,
  staggerContainerVariants,
  staggerItem,
  toastVariants,
  microTransition,
  premiumTransition,
  isMotionTrialEnabled,
} from '@/lib/motion';

// ============================================
// MOTION SETTINGS CONTEXT (Local State Only)
// ============================================

export interface MotionSettings {
  ambientBackground: boolean;
  pageTransitions: boolean;
  cardAnimations: boolean;
  microInteractions: boolean;
}

const DEFAULT_SETTINGS: MotionSettings = {
  ambientBackground: true,
  pageTransitions: true,
  cardAnimations: true,
  microInteractions: true,
};

// ============================================
// MOTION PLAYGROUND COMPONENT
// ============================================

interface MotionPlaygroundProps {
  settings: MotionSettings;
  onSettingsChange: (settings: MotionSettings) => void;
  onDemoAction?: (action: string) => void;
}

export function MotionPlayground({
  settings,
  onSettingsChange,
  onDemoAction,
}: MotionPlaygroundProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demoToast, setDemoToast] = useState<string | null>(null);
  const [demoCardExpanded, setDemoCardExpanded] = useState(false);

  const handleSettingChange = useCallback(
    (key: keyof MotionSettings, value: boolean) => {
      onSettingsChange({
        ...settings,
        [key]: value,
      });
    },
    [settings, onSettingsChange]
  );

  const showDemoToast = useCallback((message: string) => {
    setDemoToast(message);
    setTimeout(() => setDemoToast(null), 3000);
    onDemoAction?.('toast');
  }, [onDemoAction]);

  const handleStageTransition = useCallback(() => {
    showDemoToast('Stage transition: Discover → Understand');
    onDemoAction?.('stage-transition');
  }, [showDemoToast, onDemoAction]);

  const handleCardToggle = useCallback(() => {
    setDemoCardExpanded((prev) => !prev);
    onDemoAction?.('card-toggle');
  }, [onDemoAction]);

  if (!isMotionTrialEnabled()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={premiumTransition}
      className="mt-12"
    >
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Settings2 className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">
                Motion Trial
              </CardTitle>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Experiment
              </Badge>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={microTransition}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={premiumTransition}
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="pt-0 pb-4">
                {/* Settings Toggles */}
                <div className="space-y-4 mb-6">
                  <p className="text-xs text-muted-foreground mb-3">
                    Toggle motion features to preview. Settings are temporary
                    and reset on page reload.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SettingToggle
                      icon={Waves}
                      label="Ambient Background"
                      description="Subtle floating gradients"
                      checked={settings.ambientBackground}
                      onCheckedChange={(v) =>
                        handleSettingChange('ambientBackground', v)
                      }
                    />
                    <SettingToggle
                      icon={Layers}
                      label="Page Transitions"
                      description="Stagger entry animations"
                      checked={settings.pageTransitions}
                      onCheckedChange={(v) =>
                        handleSettingChange('pageTransitions', v)
                      }
                    />
                    <SettingToggle
                      icon={Square}
                      label="Card Animations"
                      description="Expand/collapse effects"
                      checked={settings.cardAnimations}
                      onCheckedChange={(v) =>
                        handleSettingChange('cardAnimations', v)
                      }
                    />
                    <SettingToggle
                      icon={Sparkles}
                      label="Micro Interactions"
                      description="Button hover, tabs"
                      checked={settings.microInteractions}
                      onCheckedChange={(v) =>
                        handleSettingChange('microInteractions', v)
                      }
                    />
                  </div>
                </div>

                {/* Demo Actions */}
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    Demo Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStageTransition}
                      className="gap-1.5"
                    >
                      <Play className="h-3 w-3" />
                      Stage Transition
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCardToggle}
                      className="gap-1.5"
                    >
                      {demoCardExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {demoCardExpanded ? 'Collapse Card' : 'Expand Card'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showDemoToast('Action completed successfully')}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Show Toast
                    </Button>
                  </div>

                  {/* Demo Card Expand/Collapse */}
                  <AnimatePresence>
                    {demoCardExpanded && settings.cardAnimations && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={premiumTransition}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm font-medium mb-2">
                            Sample Journey Card Content
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This demonstrates the smooth expand/collapse
                            animation using Framer Motion layout animations.
                            The height transition is fluid and the content fades
                            in naturally.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Demo Toast */}
      <AnimatePresence>
        {demoToast && (
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-foreground text-background shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">{demoToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// SETTING TOGGLE COMPONENT
// ============================================

interface SettingToggleProps {
  icon: typeof Waves;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: SettingToggleProps) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg bg-background border cursor-pointer hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

// ============================================
// DEMO JOURNEY EVENTS DATA
// ============================================

export interface DemoJourneyEvent {
  id: string;
  title: string;
  description: string;
  stage: 'DISCOVER' | 'UNDERSTAND' | 'ACT';
  type: 'milestone' | 'reflection' | 'action';
  timestamp: Date;
}

export const DEMO_JOURNEY_EVENTS: DemoJourneyEvent[] = [
  {
    id: '1',
    title: 'Completed self-reflection',
    description: 'Identified key strengths: communication, creativity, problem-solving',
    stage: 'DISCOVER',
    type: 'milestone',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Explored career: UX Designer',
    description: 'Saved to library with notes about required skills',
    stage: 'DISCOVER',
    type: 'action',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Set primary goal',
    description: 'Career goal: Explore design and technology intersection',
    stage: 'DISCOVER',
    type: 'milestone',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Reviewed industry outlook',
    description: 'Technology sector: Growing demand for UX professionals',
    stage: 'UNDERSTAND',
    type: 'action',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Completed first aligned action',
    description: 'Helped local business improve their website layout',
    stage: 'ACT',
    type: 'milestone',
    timestamp: new Date(),
  },
];

// ============================================
// USE MOTION SETTINGS HOOK
// ============================================

export function useMotionSettings(): [
  MotionSettings,
  (settings: MotionSettings) => void
] {
  const [settings, setSettings] = useState<MotionSettings>(DEFAULT_SETTINGS);
  return [settings, setSettings];
}

// ============================================
// EXPORTS
// ============================================

export { DEFAULT_SETTINGS };
