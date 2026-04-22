'use client';

/**
 * Salary Progression — smooth curve chart showing
 * junior → mid → senior → lead salary trajectory.
 * Uses recharts AreaChart for the curve + range band.
 */

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { getSalaryProgression } from '@/lib/salary-progression';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SalaryProgressionProps {
  careerId: string | null;
}

function formatK(k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
  return `${k}k`;
}

export function SalaryProgressionChart({ careerId }: SalaryProgressionProps) {
  const data = useMemo(() => (careerId ? getSalaryProgression(careerId) : null), [careerId]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.steps.map((step) => ({
      name: step.label,
      years: step.years,
      min: step.minK,
      max: step.maxK,
      mid: Math.round((step.minK + step.maxK) / 2),
    }));
  }, [data]);

  if (!data || chartData.length === 0) return null;

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

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(166, 72%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(166, 72%, 50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: 'hsl(215, 10%, 55%)' }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={40}
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'hsl(215, 10%, 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatK(v)}
              domain={['dataMin - 50', 'dataMax + 100']}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 20%, 14%)',
                border: '1px solid hsl(220, 15%, 25%)',
                borderRadius: '8px',
                fontSize: '11px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 90%)', fontWeight: 600, marginBottom: 4 }}
              formatter={(value: number, name: string) => {
                const label = name === 'min' ? 'Min' : name === 'max' ? 'Max' : 'Mid';
                return [`${formatK(value)} kr`, label];
              }}
            />
            {/* National median reference line */}
            <ReferenceLine
              y={data.nationalMedianK}
              stroke="hsl(215, 10%, 45%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Median ${formatK(data.nationalMedianK)}`,
                position: 'right',
                fontSize: 9,
                fill: 'hsl(215, 10%, 50%)',
              }}
            />
            {/* Range band (min to max) */}
            <Area
              type="monotone"
              dataKey="max"
              stroke="none"
              fill="url(#salaryGradient)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke="none"
              fill="hsl(220, 20%, 12%)"
              fillOpacity={1}
            />
            {/* Mid-point curve */}
            <Area
              type="monotone"
              dataKey="mid"
              stroke="hsl(166, 72%, 50%)"
              strokeWidth={2}
              fill="none"
              dot={{ r: 4, fill: 'hsl(166, 72%, 50%)', stroke: 'hsl(220, 20%, 12%)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'hsl(166, 72%, 50%)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend labels */}
      <div className="flex justify-between px-1">
        {chartData.map((d) => (
          <div key={d.name} className="text-center flex-1">
            <p className="text-[9px] text-muted-foreground/50">{d.years} yrs</p>
          </div>
        ))}
      </div>

      {data.note && (
        <p className="text-[9px] text-muted-foreground/45 italic">{data.note}</p>
      )}
    </div>
  );
}
