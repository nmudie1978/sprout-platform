'use client';

/**
 * Salary Progression — line + shaded range band.
 *
 * Renders inside the Discover-tab salary popup. A trend LINE shows the typical
 * (average) salary at each career level (Entry → Lead); a soft shaded BAND shows
 * the min–max range around it. Works for EVERY career: curated data where it
 * exists, otherwise an "Estimated" curve synthesized from the typical range.
 *
 * Data: buildSalaryProgression() in src/lib/salary-progression.ts
 */

import { useMemo } from 'react';
import { TrendingUp, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { buildSalaryProgression } from '@/lib/salary-progression';
import { getSalaryProvenance } from '@/lib/career-data-recency';
import { formatSalary } from '@/components/journey/salary-progression';

interface SalaryProgressionLineProps {
  career: {
    id: string;
    title?: string;
    avgSalary?: string | null;
    /** Provenance — drives the verified/indicative trust chip + footnote. */
    sourceUrl?: string | null;
    lastVerifiedAt?: string | null;
  } | null;
}

type Row = {
  level: string;
  experience: string;
  avg: number;
  min: number;
  /** [min, max] tuple — recharts renders this as the shaded range band. */
  range: [number, number];
};

/**
 * X-axis tick that anchors the first label to the start and the last to the
 * end, so long end-labels ("Lead / Principal", "Senior / Overlege") don't clip
 * at the chart edges. Middle labels stay centred.
 */
function XTick({ x, y, payload, index, count }: any) {
  const anchor = index === 0 ? 'start' : index === count - 1 ? 'end' : 'middle';
  return (
    <text x={x} y={y + 10} textAnchor={anchor} fill="hsl(215, 10%, 55%)" fontSize={9}>
      {payload.value}
    </text>
  );
}

function LineTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Row;
  return (
    <div className="bg-[hsl(220,20%,14%)] border border-[hsl(220,15%,25%)] rounded-lg px-3 py-2.5 text-[11px] shadow-lg">
      <p className="font-semibold text-foreground/90 mb-0.5">{d.level}</p>
      <p className="text-muted-foreground/70 mb-2">{d.experience}</p>
      <p className="text-foreground/80">
        Typical: <span className="font-medium text-teal-400">{formatSalary(d.avg)} kr</span>
      </p>
      <p className="text-muted-foreground/60">
        Range: {formatSalary(d.min)} – {formatSalary(d.range[1])} kr
      </p>
    </div>
  );
}

export function SalaryProgressionLine({ career }: SalaryProgressionLineProps) {
  const progression = useMemo(
    () => (career ? buildSalaryProgression(career) : null),
    [career],
  );

  const provenance = useMemo(
    () =>
      career
        ? getSalaryProvenance(
            {
              sourceUrl: career.sourceUrl ?? undefined,
              lastVerifiedAt: career.lastVerifiedAt ?? undefined,
            },
            { estimated: progression?.estimated },
          )
        : null,
    [career, progression?.estimated],
  );

  const rows = useMemo<Row[]>(() => {
    if (!progression) return [];
    return progression.steps.map((s) => ({
      level: s.label,
      experience: `${s.years} yrs`,
      avg: Math.round((s.minK + s.maxK) / 2),
      min: s.minK,
      range: [s.minK, s.maxK],
    }));
  }, [progression]);

  if (!progression || rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 py-6 text-center">
        Salary progression isn&rsquo;t available for this career yet.
      </p>
    );
  }

  const maxValue = Math.max(...rows.map((r) => r.range[1])) * 1.12;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[12px] font-semibold text-foreground/85">How pay grows with experience</h3>
          <p className="text-[9px] text-muted-foreground/50">Typical salary with market range · NOK/year · Norway</p>
        </div>
        {provenance?.tier === 'verified' ? (
          provenance.sourceUrl ? (
            <a
              href={provenance.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-pill border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title={provenance.note}
            >
              <ShieldCheck className="h-2.5 w-2.5" />
              {provenance.label}
              <ExternalLink className="h-2 w-2 opacity-60" />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-pill border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400"
              title={provenance.note}
            >
              <ShieldCheck className="h-2.5 w-2.5" />
              {provenance.label}
            </span>
          )
        ) : provenance?.tier === 'estimated' ? (
          <span
            className="inline-flex items-center gap-1 rounded-pill border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-500"
            title={provenance.note}
          >
            <Sparkles className="h-2.5 w-2.5" />
            {provenance.label}
          </span>
        ) : provenance ? (
          <span
            className="inline-flex items-center gap-1 rounded-pill border border-muted-foreground/20 bg-muted-foreground/5 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60"
            title={provenance.note}
          >
            {provenance.label}
          </span>
        ) : null}
      </div>

      {/* Chart */}
      <div style={{ height: 240 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
            <XAxis
              dataKey="level"
              tick={<XTick count={rows.length} />}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              type="number"
              domain={[0, maxValue]}
              tick={{ fontSize: 9, fill: 'hsl(215, 10%, 50%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatSalary}
              width={44}
            />
            <Tooltip content={<LineTooltip />} cursor={{ stroke: 'hsl(220, 15%, 30%)', strokeDasharray: '3 3' }} />

            {/* National median reference line */}
            <ReferenceLine
              y={progression.nationalMedianK}
              stroke="hsl(215, 10%, 40%)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Median ${formatSalary(progression.nationalMedianK)}`,
                position: 'insideTopRight',
                fontSize: 9,
                fill: 'hsl(215, 10%, 50%)',
              }}
            />

            {/* Shaded min–max range band */}
            <Area
              dataKey="range"
              stroke="none"
              fill="hsl(166, 72%, 50%)"
              fillOpacity={0.14}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Typical (avg) trend line */}
            <Line
              dataKey="avg"
              stroke="hsl(166, 72%, 50%)"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: 'hsl(166, 72%, 50%)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Note — provenance-aware. A curated career may carry an editorial
          note (e.g. "Partner earnings vary…"); append it after the
          provenance line so we never drop that context. */}
      <p className="text-[9px] text-muted-foreground/45 italic">
        {provenance?.note ?? 'Actual pay varies by employer, region and specialism.'}
        {progression.note && !progression.estimated ? ` ${progression.note}` : ''}
      </p>
    </div>
  );
}
