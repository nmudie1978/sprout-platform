'use client';

import { ArrowLeftRight } from 'lucide-react';
import { type TimelineStyle } from '@/hooks/use-timeline-style';

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

/**
 * Smart toggle: with only two layouts, a single pill that shows the CURRENT
 * style and switches to the other on tap is far more compact than two pills
 * side by side. The little swap glyph signals it toggles.
 */
export function TimelineStyleSelector({ value, onChange }: TimelineStyleSelectorProps) {
  const current = OPTIONS.find((o) => o.id === value) ?? OPTIONS[0];
  const next = OPTIONS.find((o) => o.id !== value) ?? OPTIONS[0];

  return (
    <button
      onClick={() => onChange(next.id)}
      title={`${current.description} — tap to switch to ${next.description}`}
      aria-label={`Roadmap style: ${current.label}. Tap to switch to ${next.label}.`}
      className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-2.5 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <span className={`w-5 h-3.5 ${current.activeText}`}>{current.preview}</span>
      <span className="hidden sm:inline">{current.label}</span>
      <ArrowLeftRight className="h-3 w-3 text-muted-foreground/50" />
    </button>
  );
}
