'use client';

/**
 * GUIDANCE CALLOUT — Reusable contextual guidance component
 *
 * A subtle, inline callout that appears naturally within content.
 * Supports four variants: callout, highlight, hint, nudge.
 * Always dismissible, never intrusive.
 */

import { X, Sparkles, ArrowRight, Heart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuidanceCategory, GuidanceVariant } from '@/lib/guidance/types';

interface GuidanceCalloutProps {
  id: string;
  category: GuidanceCategory;
  variant: GuidanceVariant;
  message: string;
  submessage?: string;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
  className?: string;
}

const CATEGORY_ICONS = {
  reassurance: Heart,
  direction: ArrowRight,
  reinforcement: Sparkles,
  context: Info,
} as const;

const CATEGORY_STYLES = {
  reassurance: {
    icon: 'text-teal-500/70',
    iconBg: 'bg-teal-500/8',
    border: 'border-teal-500/15',
    bg: 'bg-teal-500/[0.03]',
  },
  direction: {
    icon: 'text-sky-500/70',
    iconBg: 'bg-sky-500/8',
    border: 'border-sky-500/15',
    bg: 'bg-sky-500/[0.03]',
  },
  reinforcement: {
    icon: 'text-emerald-500/70',
    iconBg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
    bg: 'bg-emerald-500/[0.03]',
  },
  context: {
    icon: 'text-amber-500/60',
    iconBg: 'bg-amber-500/8',
    border: 'border-amber-500/15',
    bg: 'bg-amber-500/[0.03]',
  },
} as const;

export function GuidanceCallout({
  id,
  category,
  variant,
  message,
  submessage,
  dismissible = true,
  onDismiss,
  className,
}: GuidanceCalloutProps) {
  const Icon = CATEGORY_ICONS[category];
  const styles = CATEGORY_STYLES[category];

  // Variant-specific rendering
  if (variant === 'hint') {
    return (
      <div
        className={cn(
          'flex items-start gap-2 py-2 px-3 rounded-lg transition-all',
          styles.bg,
          className,
        )}
      >
        <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', styles.icon)} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {message}
            {submessage && (
              <span className="text-muted-foreground/50"> {submessage}</span>
            )}
          </p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={() => onDismiss(id)}
            className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'nudge') {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 py-2.5 px-3 rounded-lg border',
          styles.border,
          styles.bg,
          className,
        )}
      >
        <div className={cn('p-1 rounded-md shrink-0', styles.iconBg)}>
          <Icon className={cn('h-3 w-3', styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/70">{message}</p>
          {submessage && (
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{submessage}</p>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={() => onDismiss(id)}
            className="p-0.5 rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'highlight') {
    return (
      <div
        className={cn(
          'rounded-xl border p-4',
          styles.border,
          styles.bg,
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('p-1.5 rounded-lg shrink-0', styles.iconBg)}>
            <Icon className={cn('h-3.5 w-3.5', styles.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/80">{message}</p>
            {submessage && (
              <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">{submessage}</p>
            )}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={() => onDismiss(id)}
              className="p-1 rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default: callout (the most prominent variant)
  return (
    <div
      className={cn(
        'rounded-xl border p-3.5',
        styles.border,
        styles.bg,
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn('p-1.5 rounded-lg shrink-0', styles.iconBg)}>
          <Icon className={cn('h-3.5 w-3.5', styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/80 leading-relaxed">{message}</p>
          {submessage && (
            <p className="text-[11px] text-muted-foreground/50 mt-1 leading-relaxed">{submessage}</p>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={() => onDismiss(id)}
            className="p-1 rounded text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
