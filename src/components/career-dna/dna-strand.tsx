'use client';

/**
 * DNAStrand — a calm, premium horizontal double-helix.
 *
 * Two crossing sine strands with one colour-coded rung per trait. Node size
 * reflects the trait score, so the strand reads as a quick visual fingerprint
 * of the career. Animation is a gentle node shimmer, disabled under
 * `prefers-reduced-motion`.
 */

import { useId } from 'react';
import type { CareerDNATrait } from '@/types/career-dna';

type DNAStrandProps = {
  traits: CareerDNATrait[];
  className?: string;
  /** Compact variant for the small in-tab preview. */
  compact?: boolean;
};

export function DNAStrand({ traits, className, compact = false }: DNAStrandProps) {
  const uid = useId().replace(/:/g, '');
  const W = 600;
  const H = compact ? 60 : 120;
  const midY = H / 2;
  const amp = compact ? 16 : 30;
  const padX = 30;
  const usableW = W - padX * 2;
  const cycles = 2.2;

  const n = traits.length || 10;
  // Smooth strand paths sampled finely so the curve is crisp.
  const samples = 80;
  const yAt = (frac: number, sign: 1 | -1) =>
    midY + sign * amp * Math.sin(frac * cycles * Math.PI * 2);
  const buildPath = (sign: 1 | -1) => {
    let d = '';
    for (let i = 0; i <= samples; i++) {
      const frac = i / samples;
      const x = padX + frac * usableW;
      const y = yAt(frac, sign);
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };

  const rungs = traits.map((t, i) => {
    const frac = n === 1 ? 0.5 : i / (n - 1);
    const x = padX + frac * usableW;
    const yTop = yAt(frac, 1);
    const yBot = yAt(frac, -1);
    const r = (compact ? 2.2 : 3.2) + (t.score / 10) * (compact ? 2.2 : 3.8);
    return { t, x, yTop, yBot, r, frac };
  });

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Career DNA strand — coloured nodes show each trait's intensity"
        preserveAspectRatio="xMidYMid meet"
      >
        <style>{`
          @keyframes dna-shimmer-${uid} {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .dna-node-${uid} { animation: none !important; opacity: 0.9 !important; }
          }
        `}</style>

        {/* Strands */}
        <path d={buildPath(1)} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1.5} className="text-foreground" />
        <path d={buildPath(-1)} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1.5} className="text-foreground" />

        {/* Rungs + nodes */}
        {rungs.map(({ t, x, yTop, yBot, r }, i) => (
          <g key={t.id}>
            <line x1={x} y1={yTop} x2={x} y2={yBot} stroke={t.color} strokeOpacity={0.35} strokeWidth={1.4} />
            <circle
              cx={x}
              cy={yTop}
              r={r}
              fill={t.color}
              className={`dna-node-${uid}`}
              style={{
                animation: `dna-shimmer-${uid} 3.2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
            <circle
              cx={x}
              cy={yBot}
              r={r * 0.7}
              fill={t.color}
              fillOpacity={0.7}
              className={`dna-node-${uid}`}
              style={{
                animation: `dna-shimmer-${uid} 3.2s ease-in-out ${i * 0.18 + 0.4}s infinite`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
