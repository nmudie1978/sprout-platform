'use client';

import { type TimelineStyle } from '@/hooks/use-timeline-style';
import { cn } from '@/lib/utils';

interface StyleOption {
  id: TimelineStyle;
  label: string;
  description: string;
  /** Tiny SVG preview of the layout */
  preview: React.ReactNode;
  /** Active colour classes */
  activeBg: string;
  activeText: string;
}

const OPTIONS: StyleOption[] = [
  {
    id: 'winding',
    label: 'Road',
    description: 'Winding road',
    activeBg: 'bg-violet-500/15',
    activeText: 'text-violet-700 dark:text-violet-300',
    preview: (
      <svg viewBox="0 0 32 20" className="w-full h-full" fill="none">
        <path
          d="M3 15 C 9 15 9 5 15 5 C 21 5 23 15 29 13"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx="3" cy="15" r="2.5" fill="currentColor" />
        <circle cx="15" cy="5" r="2.5" fill="currentColor" />
        <circle cx="29" cy="13" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'stepping-stones',
    label: 'Stones',
    description: 'Stepping stones',
    activeBg: 'bg-violet-500/15',
    activeText: 'text-violet-700 dark:text-violet-300',
    preview: (
      <svg viewBox="0 0 32 20" className="w-full h-full" fill="none">
        <line
          x1="6"
          y1="10"
          x2="26"
          y2="10"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        />
        <circle cx="6" cy="10" r="3.5" fill="currentColor" />
        <circle cx="16" cy="10" r="3.5" fill="currentColor" />
        <circle cx="26" cy="10" r="3.5" fill="currentColor" />
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
              ? `${opt.activeBg} ${opt.activeText}`
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
