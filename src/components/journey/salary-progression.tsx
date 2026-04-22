'use client';

/**
 * Salary Progression — horizontal step chart showing
 * junior → mid → senior → lead salary trajectory.
 */

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSalaryProgression, type SalaryStep } from '@/lib/salary-progression';

interface SalaryProgressionProps {
  careerId: string | null;
}

function formatK(k: number): string {
  return k >= 1000 ? `${(k / 1000).toFixed(1)}M` : `${k}k`;
}

function StepBar({ step, maxK, index, total }: { step: SalaryStep; maxK: number; index: number; total: number }) {
  const midK = (step.minK + step.maxK) / 2;
  const pct = Math.round((midK / maxK) * 100);
  const colors = [
    'bg-teal-500/60',
    'bg-teal-500/70',
    'bg-teal-500/80',
    'bg-teal-500/90',
  ];

  return (
    <div className="flex-1 min-w-0">
      {/* Bar */}
      <div className="h-8 bg-muted/20 rounded-md overflow-hidden relative">
        <div
          className={cn('h-full rounded-md transition-all duration-500', colors[index] ?? 'bg-teal-500/80')}
          style={{ width: `${Math.max(pct, 20)}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground/80">
          {formatK(step.minK)} – {formatK(step.maxK)}
        </span>
      </div>

      {/* Label */}
      <p className="text-[10px] font-medium text-foreground/75 mt-1.5 truncate">{step.label}</p>
      <p className="text-[9px] text-muted-foreground/50">{step.years} yrs</p>
    </div>
  );
}

export function SalaryProgressionChart({ careerId }: SalaryProgressionProps) {
  const data = useMemo(() => (careerId ? getSalaryProgression(careerId) : null), [careerId]);

  if (!data) return null;

  const globalMax = Math.max(...data.steps.map((s) => s.maxK));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          Salary progression
        </h3>
        <span className="text-[9px] text-muted-foreground/50 ml-auto">
          NOK/year · Norway
        </span>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {data.steps.map((step, i) => (
          <StepBar key={step.label} step={step} maxK={globalMax} index={i} total={data.steps.length} />
        ))}
      </div>

      {/* Median reference */}
      <p className="text-[9px] text-muted-foreground/50">
        National median salary: ~{data.nationalMedianK}k kr/year
        {data.note && <> · {data.note}</>}
      </p>
    </div>
  );
}
