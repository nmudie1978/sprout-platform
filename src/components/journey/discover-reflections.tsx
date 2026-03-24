'use client';

/**
 * DISCOVER REFLECTIONS — 5 self-discovery cards for the Discover tab
 *
 * Each card is a simple multi-select or short text input.
 * Data saves to journeySummary.discoverReflections via API.
 * All 5 must be filled for Discover to be considered complete.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Flame,
  Users,
  TrendingUp,
  Star,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────

export interface DiscoverReflections {
  motivations: string[];
  workStyle: string[];
  growthAreas: string[];
  roleModels: string;
  experiences: string;
}

export const EMPTY_REFLECTIONS: DiscoverReflections = {
  motivations: [],
  workStyle: [],
  growthAreas: [],
  roleModels: '',
  experiences: '',
};

export function isReflectionsComplete(r: DiscoverReflections | null | undefined): boolean {
  if (!r) return false;
  return (
    r.motivations.length >= 1 &&
    r.workStyle.length >= 1 &&
    r.growthAreas.length >= 1 &&
    r.roleModels.trim().length > 0 &&
    r.experiences.trim().length > 0
  );
}

// ── Options ──────────────────────────────────────────────────────────

const MOTIVATION_OPTIONS = [
  'Helping people', 'Earning well', 'Creativity', 'Independence',
  'Stability', 'Making a difference', 'Learning new things', 'Leading others',
  'Working with my hands', 'Solving problems',
];

const WORK_STYLE_OPTIONS = [
  'With people', 'On my own', 'Indoors', 'Outdoors',
  'Fast-paced', 'Steady & calm', 'Creative', 'Technical',
  'Practical', 'Desk-based',
];

const GROWTH_OPTIONS = [
  'Confidence', 'Public speaking', 'Organisation', 'Technical skills',
  'Communication', 'Time management', 'Teamwork', 'Resilience',
  'Networking', 'Decision-making',
];

// ── Card configs ─────────────────────────────────────────────────────

interface CardConfig {
  id: keyof DiscoverReflections;
  title: string;
  description: string;
  icon: typeof Flame;
  type: 'chips' | 'text';
  options?: string[];
  placeholder?: string;
}

const CARDS: CardConfig[] = [
  {
    id: 'motivations',
    title: 'What Motivates You',
    description: 'What matters most to you in a career?',
    icon: Flame,
    type: 'chips',
    options: MOTIVATION_OPTIONS,
  },
  {
    id: 'workStyle',
    title: 'How You Work Best',
    description: 'What kind of environment suits you?',
    icon: Users,
    type: 'chips',
    options: WORK_STYLE_OPTIONS,
  },
  {
    id: 'growthAreas',
    title: 'Growth Areas',
    description: 'What do you want to get better at?',
    icon: TrendingUp,
    type: 'chips',
    options: GROWTH_OPTIONS,
  },
  {
    id: 'roleModels',
    title: 'Role Models',
    description: 'Who do you admire and why?',
    icon: Star,
    type: 'text',
    placeholder: 'e.g. My uncle — he started his own business and always helps people in the community.',
  },
  {
    id: 'experiences',
    title: 'What You\'ve Tried',
    description: 'Any work, volunteering, hobbies, or projects?',
    icon: Briefcase,
    type: 'text',
    placeholder: 'e.g. Helped at a summer camp, built a website for fun, part-time in a shop.',
  },
];

// ── Chip Selector ────────────────────────────────────────────────────

function ChipSelector({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
              isSelected
                ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                : 'border-border/30 bg-card/40 text-muted-foreground/60 hover:border-border/50 hover:text-muted-foreground',
            )}
          >
            {opt}
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function DiscoverReflectionsSection() {
  const queryClient = useQueryClient();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [localData, setLocalData] = useState<DiscoverReflections>(EMPTY_REFLECTIONS);

  // Load from API
  const { data } = useQuery<{ discoverReflections: DiscoverReflections | null }>({
    queryKey: ['discover-reflections'],
    queryFn: async () => {
      const res = await fetch('/api/discover/reflections');
      if (!res.ok) return { discoverReflections: null };
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.discoverReflections) {
      setLocalData({ ...EMPTY_REFLECTIONS, ...data.discoverReflections });
    }
  }, [data]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (reflections: DiscoverReflections) => {
      const res = await fetch('/api/discover/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoverReflections: reflections }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discover-reflections'] });
      queryClient.invalidateQueries({ queryKey: ['journey-state'] });
    },
  });

  const updateField = useCallback((field: keyof DiscoverReflections, value: string[] | string) => {
    setLocalData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-save after a short delay
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const toggleCard = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const isFilled = (card: CardConfig): boolean => {
    const val = localData[card.id];
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === 'string' && val.trim().length > 0;
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1">
        Know yourself better
      </p>

      {CARDS.map((card) => {
        const Icon = card.icon;
        const filled = isFilled(card);
        const expanded = expandedCard === card.id;

        return (
          <div
            key={card.id}
            className={cn(
              'rounded-xl border transition-all',
              filled && !expanded ? 'border-teal-500/20 bg-teal-500/[0.03]' : 'border-border/30 bg-card/30',
              expanded && 'border-teal-500/30 bg-card/50',
            )}
          >
            {/* Header — always visible */}
            <button
              onClick={() => toggleCard(card.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={cn(
                'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                filled ? 'bg-teal-500/15' : 'bg-muted/40',
              )}>
                {filled ? (
                  <Check className="h-3.5 w-3.5 text-teal-500" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-semibold', filled ? 'text-foreground/80' : 'text-muted-foreground/70')}>
                  {card.title}
                </p>
                {!expanded && filled && card.type === 'chips' && (
                  <p className="text-[10px] text-teal-500/60 truncate mt-0.5">
                    {(localData[card.id] as string[]).join(', ')}
                  </p>
                )}
                {!expanded && filled && card.type === 'text' && (
                  <p className="text-[10px] text-teal-500/60 truncate mt-0.5">
                    {(localData[card.id] as string).slice(0, 60)}...
                  </p>
                )}
                {!expanded && !filled && (
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">{card.description}</p>
                )}
              </div>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
            </button>

            {/* Expanded content */}
            {expanded && (
              <div className="px-4 pb-4">
                <p className="text-[11px] text-muted-foreground/50 mb-3">{card.description}</p>
                {card.type === 'chips' && card.options && (
                  <ChipSelector
                    options={card.options}
                    selected={localData[card.id] as string[]}
                    onChange={(val) => updateField(card.id, val)}
                  />
                )}
                {card.type === 'text' && (
                  <textarea
                    value={localData[card.id] as string}
                    onChange={(e) => updateField(card.id, e.target.value)}
                    placeholder={card.placeholder}
                    className="w-full rounded-lg border border-border/30 bg-background/50 px-3 py-2.5 text-xs text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-teal-500/30 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
