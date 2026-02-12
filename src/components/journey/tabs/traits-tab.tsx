'use client';

import { useState, useMemo } from 'react';
import { Lightbulb, Briefcase, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTraitObservations, useRecordObservation } from '@/hooks/use-traits';
import {
  TRAIT_CATALOG,
  TRAIT_MAP,
  ROLE_TRAIT_LINKS,
  OBSERVATION_OPTIONS,
  CATEGORY_LABELS,
  generatePatterns,
  type Trait,
  type TraitId,
  type ObservationValue,
  type TraitCategory,
} from '@/lib/traits/trait-catalog';

// ============================================
// PATTERNS SUMMARY
// ============================================

function PatternsSummary({ patterns }: { patterns: string[] }) {
  return (
    <Card className="border-purple-200/50 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-950/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Patterns
            </p>
            {patterns.map((p, i) => (
              <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// OBSERVATION BUTTONS
// ============================================

function ObservationButtons({
  traitId,
  currentValue,
  onSelect,
  isPending,
  size = 'sm',
}: {
  traitId: TraitId;
  currentValue: ObservationValue | null;
  onSelect: (traitId: TraitId, value: ObservationValue) => void;
  isPending: boolean;
  size?: 'sm' | 'lg';
}) {
  return (
    <div className={cn('flex gap-1.5', size === 'lg' ? 'gap-2' : '')}>
      {OBSERVATION_OPTIONS.map((opt) => {
        const isActive = currentValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(traitId, opt.value)}
            disabled={isPending}
            className={cn(
              'rounded-lg border text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-xs',
              isActive
                ? opt.activeClass
                : 'border-border text-muted-foreground ' + opt.inactiveClass,
              isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="mr-0.5">{opt.emoji}</span>
            {size === 'lg' && <span className="ml-1">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// TRAIT CARD
// ============================================

function TraitCard({
  trait,
  currentValue,
  onSelect,
  onOpenDetail,
  isPending,
}: {
  trait: Trait;
  currentValue: ObservationValue | null;
  onSelect: (traitId: TraitId, value: ObservationValue) => void;
  onOpenDetail: (trait: Trait) => void;
  isPending: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-3 flex flex-col gap-2 h-full">
        <button
          onClick={() => onOpenDetail(trait)}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md -m-1 p-1"
        >
          <span className="text-lg" role="img" aria-label={trait.label}>
            {trait.emoji}
          </span>
          <span className="text-sm font-medium leading-tight">{trait.label}</span>
        </button>
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 flex-1">
          {trait.description}
        </p>
        <ObservationButtons
          traitId={trait.id}
          currentValue={currentValue}
          onSelect={onSelect}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}

// ============================================
// TRAIT GRID
// ============================================

function TraitGrid({
  observations,
  onSelect,
  onOpenDetail,
  isPending,
}: {
  observations: Map<string, ObservationValue>;
  onSelect: (traitId: TraitId, value: ObservationValue) => void;
  onOpenDetail: (trait: Trait) => void;
  isPending: boolean;
}) {
  const categories: TraitCategory[] = ['thinking', 'doing', 'connecting'];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const traits = TRAIT_CATALOG.filter((t) => t.category === cat);
        return (
          <div key={cat}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {traits.map((trait) => (
                <TraitCard
                  key={trait.id}
                  trait={trait}
                  currentValue={observations.get(trait.id) ?? null}
                  onSelect={onSelect}
                  onOpenDetail={onOpenDetail}
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// ROLE EXAMPLES PICKER
// ============================================

function RoleExamplesPicker({
  observations,
}: {
  observations: Map<string, ObservationValue>;
}) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const selectedLink = ROLE_TRAIT_LINKS.find((r) => r.role === selectedRole);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        How traits show up in roles
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {ROLE_TRAIT_LINKS.map((link) => (
          <button
            key={link.role}
            onClick={() =>
              setSelectedRole((prev) => (prev === link.role ? null : link.role))
            }
            className={cn(
              'flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              selectedRole === link.role
                ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700'
                : 'border-border text-muted-foreground hover:bg-muted/50'
            )}
          >
            {link.role}
          </button>
        ))}
      </div>

      {selectedLink && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {selectedLink.traits.map((traitId) => {
              const trait = TRAIT_MAP[traitId];
              if (!trait) return null;
              const isNoticed = observations.get(traitId) === 'noticed';
              return (
                <div
                  key={traitId}
                  className={cn(
                    'rounded-lg border p-2.5 flex items-center gap-2',
                    isNoticed
                      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20'
                      : 'border-border'
                  )}
                >
                  <span className="text-base">{trait.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{trait.label}</p>
                    {isNoticed && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        You noticed this
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
            <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Not everyone in this role is the same. These are common traits people in{' '}
              {selectedLink.role} roles often draw on — not requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TRAIT DETAIL DRAWER
// ============================================

function TraitDetailDrawer({
  trait,
  currentValue,
  onSelect,
  onClose,
  isPending,
}: {
  trait: Trait | null;
  currentValue: ObservationValue | null;
  onSelect: (traitId: TraitId, value: ObservationValue) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  if (!trait) return null;

  const relatedRoles = ROLE_TRAIT_LINKS.filter((r) =>
    r.traits.includes(trait.id)
  );

  return (
    <Sheet open={!!trait} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={trait.label}>
              {trait.emoji}
            </span>
            <div>
              <SheetTitle>{trait.label}</SheetTitle>
              <SheetDescription>{trait.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              You might notice this when…
            </p>
            {trait.prompts.map((prompt, i) => (
              <p key={i} className="text-sm text-foreground/80 leading-relaxed pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                {prompt}
              </p>
            ))}
          </div>

          {/* Observation buttons (large) */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Does this feel like you?
            </p>
            <ObservationButtons
              traitId={trait.id}
              currentValue={currentValue}
              onSelect={onSelect}
              isPending={isPending}
              size="lg"
            />
          </div>

          {/* Related roles */}
          {relatedRoles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Roles that often draw on this
              </p>
              <div className="flex flex-wrap gap-1.5">
                {relatedRoles.map((r) => (
                  <span
                    key={r.role}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {r.role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// TRAITS TAB (EXPORTED)
// ============================================

export function TraitsTab() {
  const { data, isLoading } = useTraitObservations();
  const recordMutation = useRecordObservation();
  const [detailTrait, setDetailTrait] = useState<Trait | null>(null);

  // Build lookup map: traitId → observation value
  const observationMap = useMemo(() => {
    const map = new Map<string, ObservationValue>();
    if (data?.observations) {
      for (const obs of data.observations) {
        map.set(obs.traitId, obs.observation as ObservationValue);
      }
    }
    return map;
  }, [data]);

  // Generate patterns from observations
  const patterns = useMemo(() => {
    if (!data?.observations) return ['Tap on any trait below to start noticing what feels like you.'];
    const obs = data.observations.map((o) => ({
      traitId: o.traitId as TraitId,
      observation: o.observation as ObservationValue,
    }));
    return generatePatterns(obs);
  }, [data]);

  const handleSelect = (traitId: TraitId, value: ObservationValue) => {
    recordMutation.mutate({ traitId, observation: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PatternsSummary patterns={patterns} />

      <TraitGrid
        observations={observationMap}
        onSelect={handleSelect}
        onOpenDetail={setDetailTrait}
        isPending={recordMutation.isPending}
      />

      <RoleExamplesPicker observations={observationMap} />

      <TraitDetailDrawer
        trait={detailTrait}
        currentValue={detailTrait ? observationMap.get(detailTrait.id) ?? null : null}
        onSelect={handleSelect}
        onClose={() => setDetailTrait(null)}
        isPending={recordMutation.isPending}
      />
    </div>
  );
}
