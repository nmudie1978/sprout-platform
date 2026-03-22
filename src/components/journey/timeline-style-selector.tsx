'use client';

import { type TimelineStyle } from '@/hooks/use-timeline-style';
import { cn } from '@/lib/utils';

interface StyleOption {
  id: TimelineStyle;
  label: string;
  description: string;
  /** Tiny SVG preview of the layout */
  preview: React.ReactNode;
}

const OPTIONS: StyleOption[] = [
  {
    id: 'zigzag',
    label: 'Zigzag',
    description: 'Alternating wave',
    preview: (
      <svg viewBox="0 0 32 20" className="w-full h-full" fill="none">
        <polyline
          points="4,5 16,15 28,5"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="5" r="2.5" fill="currentColor" />
        <circle cx="16" cy="15" r="2.5" fill="currentColor" />
        <circle cx="28" cy="5" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'rail',
    label: 'Rail',
    description: 'Straight track',
    preview: (
      <svg viewBox="0 0 32 20" className="w-full h-full" fill="none">
        <line
          x1="4"
          y1="10"
          x2="28"
          y2="10"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx="4" cy="10" r="2.5" fill="currentColor" />
        <circle cx="16" cy="10" r="2.5" fill="currentColor" />
        <circle cx="28" cy="10" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'stepping',
    label: 'Steps',
    description: 'Vertical list',
    preview: (
      <svg viewBox="0 0 32 20" className="w-full h-full" fill="none">
        <line
          x1="6"
          y1="3"
          x2="6"
          y2="17"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx="6" cy="4" r="2.5" fill="currentColor" />
        <circle cx="6" cy="10" r="2.5" fill="currentColor" />
        <circle cx="6" cy="16" r="2.5" fill="currentColor" />
        <rect x="12" y="2" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="12" y="8" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="12" y="14" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
];

interface TimelineStyleSelectorProps {
  value: TimelineStyle;
  onChange: (style: TimelineStyle) => void;
}

export function TimelineStyleSelector({ value, onChange }: TimelineStyleSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-1.5 py-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          title={`${opt.label} — ${opt.description}`}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors',
            value === opt.id
              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <span className="w-5 h-3.5">{opt.preview}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
