'use client';

/**
 * Decision Confidence Tracker — lets the user rate how confident
 * they feel about their chosen career (1-5 scale). Tracks changes
 * over time so the user can see their confidence evolve.
 *
 * Stored in localStorage per career. Not shared with guardians
 * or anyone else — purely a self-reflection tool.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceTrackerProps {
  careerId: string;
  careerTitle: string;
}

interface ConfidenceEntry {
  score: number; // 1-5
  timestamp: number;
}

const LABELS = ['Not sure', 'Curious', 'Interested', 'Confident', 'Committed'];
const COLORS = [
  'bg-red-400/80',
  'bg-amber-400/80',
  'bg-yellow-400/80',
  'bg-emerald-400/80',
  'bg-teal-400/80',
];

function getStorageKey(careerId: string): string {
  return `confidence-tracker-${careerId}`;
}

function loadHistory(careerId: string): ConfidenceEntry[] {
  try {
    const raw = window.localStorage.getItem(getStorageKey(careerId));
    if (!raw) return [];
    return JSON.parse(raw) as ConfidenceEntry[];
  } catch {
    return [];
  }
}

function saveHistory(careerId: string, entries: ConfidenceEntry[]): void {
  try {
    // Keep last 20 entries max
    const trimmed = entries.slice(-20);
    window.localStorage.setItem(getStorageKey(careerId), JSON.stringify(trimmed));
  } catch { /* private tab */ }
}

export function ConfidenceTracker({ careerId, careerTitle }: ConfidenceTrackerProps) {
  const [history, setHistory] = useState<ConfidenceEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    setHistory(loadHistory(careerId));
    setHydrated(true);
  }, [careerId]);

  const currentScore = history.length > 0 ? history[history.length - 1].score : 0;
  const previousScore = history.length > 1 ? history[history.length - 2].score : null;

  const trend = useMemo(() => {
    if (previousScore === null) return 'none';
    if (currentScore > previousScore) return 'up';
    if (currentScore < previousScore) return 'down';
    return 'same';
  }, [currentScore, previousScore]);

  const handleRate = useCallback((score: number) => {
    const newEntry: ConfidenceEntry = { score, timestamp: Date.now() };
    // Don't add duplicate if same score as last entry within 1 hour
    const last = history[history.length - 1];
    if (last && last.score === score && Date.now() - last.timestamp < 3600000) return;

    const updated = [...history, newEntry];
    setHistory(updated);
    saveHistory(careerId, updated);
  }, [careerId, history]);

  if (!hydrated) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          How confident do you feel?
        </h3>
        {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
        {trend === 'same' && history.length > 1 && <Minus className="h-3 w-3 text-muted-foreground/40" />}
      </div>

      {/* 5-point scale */}
      <div className="flex gap-1.5">
        {LABELS.map((label, i) => {
          const score = i + 1;
          const isActive = score <= currentScore;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleRate(score)}
              className={cn(
                'flex-1 rounded-lg border py-2.5 text-center transition-all',
                isActive
                  ? `${COLORS[i]} border-transparent text-white`
                  : 'border-border/30 bg-card/30 text-muted-foreground/50 hover:bg-muted/20 hover:text-foreground/70',
              )}
            >
              <span className="text-[10px] font-medium block">{score}</span>
              <span className="text-[8px] block mt-0.5 leading-tight">{label}</span>
            </button>
          );
        })}
      </div>

      {/* History sparkline (simple dots) */}
      {history.length > 1 && (
        <div className="flex items-end gap-0.5 h-6">
          {history.slice(-10).map((entry, i) => (
            <div
              key={i}
              className={cn('w-2 rounded-sm transition-all', COLORS[entry.score - 1])}
              style={{ height: `${(entry.score / 5) * 100}%` }}
              title={`${LABELS[entry.score - 1]} — ${new Date(entry.timestamp).toLocaleDateString()}`}
            />
          ))}
          <span className="text-[8px] text-muted-foreground/40 ml-1.5 self-end">
            last {Math.min(history.length, 10)} ratings
          </span>
        </div>
      )}

      {currentScore === 0 && (
        <p className="text-[9px] text-muted-foreground/50 text-center">
          Rate how you feel about {careerTitle} — track your confidence over time
        </p>
      )}
    </div>
  );
}
