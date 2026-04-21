'use client';

/**
 * Interactive Day Simulation — branching "day in the life" narratives.
 *
 * Each step presents a scenario + 2-3 choices. User clicks a choice,
 * sees the insight, then advances to the next step. At the end, a
 * summary shows what they learned about the career.
 *
 * Renders in the Discover tab of My Journey.
 */

import { useState, useMemo, useCallback } from 'react';
import { Play, Clock, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildDaySimulation, type DaySimulation, type SimNode, type SimChoice } from '@/lib/day-simulation/engine';

interface DaySimulationProps {
  careerId: string;
  careerTitle: string;
  dailyTasks: string[];
  tools: string[];
  workSetting?: string;
}

export function DaySimulationCard({ careerId, careerTitle, dailyTasks, tools, workSetting = 'office' }: DaySimulationProps) {
  const simulation = useMemo(
    () => buildDaySimulation(careerId, careerTitle, dailyTasks, tools, workSetting),
    [careerId, careerTitle, dailyTasks, tools, workSetting],
  );

  const [started, setStarted] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

  const currentNode: SimNode | null = useMemo(() => {
    if (!simulation || !currentNodeId) return null;
    return simulation.nodes[currentNodeId] ?? null;
  }, [simulation, currentNodeId]);

  const isEnd = currentNode && currentNode.choices.length === 0;
  const progress = simulation ? (visitedNodes.length / Object.keys(simulation.nodes).length) * 100 : 0;

  const handleStart = useCallback(() => {
    if (!simulation) return;
    setStarted(true);
    setCurrentNodeId(simulation.startNodeId);
    setVisitedNodes([simulation.startNodeId]);
    setSelectedChoice(null);
    setShowInsight(false);
  }, [simulation]);

  const handleChoice = useCallback((choice: SimChoice) => {
    if (!simulation) return;
    setSelectedChoice(choice.id);
    setShowInsight(true);
  }, [simulation]);

  const handleAdvance = useCallback(() => {
    if (!simulation || !selectedChoice) return;
    const nextNodeId = simulation.transitions[selectedChoice];
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
      setVisitedNodes((prev) => [...prev, nextNodeId]);
      setSelectedChoice(null);
      setShowInsight(false);
    }
  }, [simulation, selectedChoice]);

  const handleRestart = useCallback(() => {
    setStarted(false);
    setCurrentNodeId(null);
    setSelectedChoice(null);
    setShowInsight(false);
    setVisitedNodes([]);
  }, []);

  if (!simulation) return null;

  // Not started yet — show the launch card
  if (!started) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-4 w-4 text-primary" />
          <h3 className="text-[13px] font-semibold text-foreground/90">
            Experience a day as a {careerTitle}
          </h3>
        </div>
        <p className="text-[11px] text-muted-foreground/75 leading-relaxed mb-3">
          {simulation.intro}
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Play className="h-3 w-3" />
          Start simulation
        </button>
      </div>
    );
  }

  if (!currentNode) return null;

  // Active simulation
  return (
    <div className="rounded-xl border border-primary/20 bg-card/60 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-muted/30">
        <div
          className="h-full bg-primary/60 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Time badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            <Clock className="h-3 w-3" />
            {currentNode.time}
          </span>
          <span className="text-[10px] text-muted-foreground/50">
            Step {visitedNodes.length}/{Object.keys(simulation.nodes).length}
          </span>
        </div>

        {/* Scenario */}
        <p className="text-[12px] text-foreground/85 leading-relaxed">
          {currentNode.scenario}
        </p>

        {/* Choices (hidden once selected) */}
        {!selectedChoice && !isEnd && (
          <div className="space-y-1.5">
            {currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleChoice(choice)}
                className="w-full flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2.5 text-left text-[11px] text-foreground/80 hover:border-primary/40 hover:bg-primary/[0.04] transition-colors"
              >
                <ArrowRight className="h-3 w-3 text-primary/60 shrink-0" />
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* Insight (shown after choosing) */}
        {showInsight && (
          <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/20 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground/75 leading-relaxed">
                {currentNode.insight}
              </p>
            </div>
          </div>
        )}

        {/* Advance / End buttons */}
        {showInsight && !isEnd && (
          <button
            type="button"
            onClick={handleAdvance}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight className="h-3 w-3" />
          </button>
        )}

        {isEnd && (
          <div className="space-y-3 pt-1">
            <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 px-3 py-2.5">
              <p className="text-[11px] text-foreground/75 leading-relaxed">
                {currentNode.insight}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/50 px-4 py-2 text-[11px] font-medium text-foreground/70 hover:text-foreground hover:border-border/60 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Try again with different choices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
