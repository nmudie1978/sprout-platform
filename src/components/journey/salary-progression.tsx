'use client';

/**
 * Salary Progression — horizontal bar chart with min–max range
 * band and average overlay. Fully dynamic: accepts any dataset
 * via props, sorts by avg ascending, re-renders on data change.
 */

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { getSalaryProgression } from '@/lib/salary-progression';

// ── Public types ───────────────────────────────────────────────────

export type SalaryEntry = {
  role: string;
  experience: string;
  avg: number;
  min: number;
  max: number;
};

type SalaryChartProps = {
  data: SalaryEntry[];
  title?: string;
  subtitle?: string;
  /** National median reference line (in thousands). null = hidden. */
  medianK?: number | null;
  /** Optional note below the chart. */
  note?: string;
};

// ── Formatter ──────────────────────────────────────────────────────

function formatSalary(k: number): string {
  if (k >= 1000) {
    const m = k / 1000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  return `${k}k`;
}

// ── Custom tooltip ─────────────────────────────────────────────────

function SalaryTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload as SalaryEntry & { _rangeBase: number };
  return (
    <div className="bg-[hsl(220,20%,14%)] border border-[hsl(220,15%,25%)] rounded-lg px-3 py-2.5 text-[11px] shadow-lg">
      <p className="font-semibold text-foreground/90 mb-1">{d.role}</p>
      <p className="text-muted-foreground/70 mb-2">{d.experience}</p>
      <div className="space-y-0.5">
        <p className="text-foreground/80">
          Average: <span className="font-medium text-teal-400">{formatSalary(d.avg)} kr</span>
        </p>
        <p className="text-muted-foreground/60">
          Range: {formatSalary(d.min)} – {formatSalary(d.max)} kr
        </p>
      </div>
    </div>
  );
}

// ── Custom bar label ───────────────────────────────────────────────

function BarLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      fill="hsl(166, 72%, 50%)"
      fontSize={10}
      fontWeight={600}
      dominantBaseline="central"
    >
      {formatSalary(value)}
    </text>
  );
}

// ── Y-axis tick (role + experience) ────────────────────────────────

function YAxisTick(props: any) {
  const { x, y, payload, data } = props;
  const entry = data.find((d: SalaryEntry) => d.role === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={-6}
        textAnchor="end"
        fill="hsl(0, 0%, 85%)"
        fontSize={11}
        fontWeight={500}
      >
        {payload.value}
      </text>
      {entry && (
        <text
          x={-8}
          y={8}
          textAnchor="end"
          fill="hsl(215, 10%, 50%)"
          fontSize={9}
        >
          {entry.experience}
        </text>
      )}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function SalaryChart({
  data,
  title = 'Salary progression',
  subtitle = 'Average with market range',
  medianK = null,
  note,
}: SalaryChartProps) {
  // Sort ascending by avg + compute stacked range values
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.avg - b.avg);
    return sorted.map((d) => ({
      ...d,
      // For the stacked range bar: base starts at min, range extends to max
      _rangeBase: d.min,
      _rangeSpan: d.max - d.min,
    }));
  }, [data]);

  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.max)) * 1.15,
    [data],
  );

  if (data.length === 0) return null;

  const barHeight = data.length <= 4 ? 28 : data.length <= 6 ? 22 : 18;
  const chartHeight = Math.max(180, data.length * (barHeight + 28) + 40);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[12px] font-semibold text-foreground/85">{title}</h3>
          {subtitle && (
            <p className="text-[9px] text-muted-foreground/50">{subtitle}</p>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground/40 shrink-0">
          NOK/year · Norway
        </span>
      </div>

      {/* Chart */}
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
            barGap={-barHeight}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="hsl(220, 15%, 18%)"
            />
            <XAxis
              type="number"
              domain={[0, maxValue]}
              tick={{ fontSize: 9, fill: 'hsl(215, 10%, 50%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatSalary}
            />
            <YAxis
              type="category"
              dataKey="role"
              width={160}
              tick={<YAxisTick data={chartData} />}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<SalaryTooltip />}
              cursor={{ fill: 'hsl(220, 15%, 16%)', opacity: 0.5 }}
            />

            {/* National median reference line */}
            {medianK && (
              <ReferenceLine
                x={medianK}
                stroke="hsl(215, 10%, 40%)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Median ${formatSalary(medianK)}`,
                  position: 'top',
                  fontSize: 9,
                  fill: 'hsl(215, 10%, 50%)',
                }}
              />
            )}

            {/* Range bar (min → max): background band */}
            <Bar
              dataKey="_rangeSpan"
              stackId="range"
              barSize={barHeight}
              radius={[4, 4, 4, 4]}
              fill="hsl(166, 40%, 35%)"
              fillOpacity={0.15}
            >
              {chartData.map((_, i) => (
                <Cell key={i} />
              ))}
            </Bar>

            {/* Invisible base to offset the range bar to start at min */}
            <Bar
              dataKey="_rangeBase"
              stackId="range"
              barSize={barHeight}
              fill="transparent"
            />

            {/* Average bar: solid teal overlay */}
            <Bar
              dataKey="avg"
              barSize={barHeight - 6}
              radius={[4, 4, 4, 4]}
              fill="hsl(166, 72%, 45%)"
              fillOpacity={0.85}
              label={<BarLabel />}
            >
              {chartData.map((_, i) => (
                <Cell key={i} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[hsl(166,72%,45%)] opacity-85" />
          Average
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[hsl(166,40%,35%)] opacity-15 border border-[hsl(166,40%,35%)]/30" />
          Market range
        </span>
        {medianK && (
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-[hsl(215,10%,40%)]" />
            National median
          </span>
        )}
      </div>

      {note && (
        <p className="text-[9px] text-muted-foreground/45 italic">{note}</p>
      )}
    </div>
  );
}

// ── Wrapper that pulls from salary-progression.ts data ─────────────

interface SalaryProgressionProps {
  careerId: string | null;
}

export function SalaryProgressionChart({ careerId }: SalaryProgressionProps) {
  const progression = useMemo(() => (careerId ? getSalaryProgression(careerId) : null), [careerId]);

  if (!progression) return null;

  const data: SalaryEntry[] = progression.steps.map((step) => ({
    role: step.label,
    experience: `${step.years} yrs`,
    avg: Math.round((step.minK + step.maxK) / 2),
    min: step.minK,
    max: step.maxK,
  }));

  return (
    <SalaryChart
      data={data}
      medianK={progression.nationalMedianK}
      note={progression.note}
    />
  );
}
