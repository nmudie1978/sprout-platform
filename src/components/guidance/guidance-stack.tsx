'use client';

/**
 * GUIDANCE STACK — Renders guidance items for a given placement
 *
 * Consumes the guidance engine and renders matching callouts.
 * This is the primary integration point for adding guidance to a page.
 *
 * Usage:
 *   <GuidanceStack placement="dashboard" context={guidanceContext} />
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GuidanceCallout } from './guidance-callout';
import { getGuidanceForPlacement, dismissGuidance } from '@/lib/guidance/rules';
import type { GuidancePlacement, GuidanceContext } from '@/lib/guidance/types';

interface GuidanceStackProps {
  placement: GuidancePlacement;
  context: GuidanceContext;
  className?: string;
}

export function GuidanceStack({ placement, context, className }: GuidanceStackProps) {
  const [dismissedLocal, setDismissedLocal] = useState<Set<string>>(new Set());

  const items = useMemo(
    () => getGuidanceForPlacement(placement, context),
    [placement, context],
  );

  const handleDismiss = useCallback((id: string) => {
    dismissGuidance(id);
    setDismissedLocal((prev) => new Set([...prev, id]));
  }, []);

  const visibleItems = items.filter((item) => !dismissedLocal.has(item.id));

  if (visibleItems.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {visibleItems.map((item) => (
        <GuidanceCallout
          key={item.id}
          id={item.id}
          category={item.category}
          variant={item.variant}
          message={item.message}
          submessage={item.submessage}
          dismissible={item.dismissible}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
