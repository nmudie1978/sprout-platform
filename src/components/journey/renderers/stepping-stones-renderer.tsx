'use client';

/**
 * Stepping Stones renderer — the alternative Clarity-tab roadmap.
 *
 * A calm row of stones (circles) connected by a single hairline, read
 * left→right. Foundation ("Your Starting Point") is the first stone. Each
 * stone carries the stage icon and progress state; the stage label, title,
 * subtitle and age sit beneath. Full detail opens in the dialog on tap.
 * Theme-aware, scrolls on mobile.
 *
 * Wired to real journey data via {@link useRoadmapModel}, keeping click-to-
 * detail, progress states, "you are here", year stamps, scenario overrides
 * and read-only mode.
 */

import { type JourneyItem, STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import { cn } from '@/lib/utils';
import type { RendererProps } from './types';
import { getStepIcon, type StepState } from './shared-node';
import { useRoadmapModel } from './shared-roadmap';
import { Check } from 'lucide-react';

const STONE_COL = 140;

export function SteppingStonesRenderer(props: RendererProps) {
  const { onItemClick, onProgressCycle, readOnly, cardDataMap } = props;
  const {
    foundationItem,
    foundationStatus,
    foundationState,
    foundationEmpty,
    columns,
    FOUNDATION_ITEM_ID,
  } = useRoadmapModel(props);

  const colCount = columns.length + 1;
  const minWidth = colCount * STONE_COL;

  return (
    <div className="-mx-2 px-2 pb-4">
      <div className="overflow-x-auto">
        <div className="relative pt-2" style={{ minWidth }}>
          {/* hairline behind the stones, centred on the stone circles */}
          <div
            className="pointer-events-none absolute top-[42px] h-px bg-slate-200 dark:bg-slate-700"
            style={{ left: STONE_COL / 2, right: STONE_COL / 2 }}
            aria-hidden
          />
          <ol className="relative flex items-start">
            <li
              className="flex shrink-0 flex-col items-center px-2 text-center"
              style={{ width: STONE_COL }}
            >
              <Stone
                item={foundationItem}
                state={foundationState}
                progressStatus={foundationStatus}
                label="Now"
                isFoundation
                glow={foundationEmpty}
                onClick={() => !readOnly && onItemClick(foundationItem)}
                onProgressCycle={
                  onProgressCycle && !readOnly
                    ? () => onProgressCycle(FOUNDATION_ITEM_ID)
                    : undefined
                }
              />
            </li>
            {columns.map((column) => (
              <li
                key={column[0].item.id}
                className="flex shrink-0 flex-col items-center px-2 text-center"
                style={{ width: STONE_COL }}
              >
                {column.map((step, si) => (
                  <div key={step.item.id} className={si > 0 ? 'mt-3' : ''}>
                    <Stone
                      item={step.item}
                      state={step.state}
                      progressStatus={cardDataMap?.[step.item.id]?.status}
                      label={step.ageLabel}
                      scenarioAnnotation={step.scenarioAnnotation}
                      onClick={() => onItemClick(step.item)}
                      onProgressCycle={
                        onProgressCycle ? () => onProgressCycle(step.item.id) : undefined
                      }
                    />
                  </div>
                ))}
                {column.length > 1 && (
                  <span className="mt-2 rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
                    at the same time
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Stone({
  item,
  state,
  label,
  scenarioAnnotation,
  isFoundation,
  glow,
  onClick,
}: {
  item: JourneyItem;
  state: StepState;
  progressStatus?: 'not_started' | 'in_progress' | 'done';
  label: string;
  scenarioAnnotation?: string;
  isFoundation?: boolean;
  glow?: boolean;
  onClick: () => void;
  onProgressCycle?: () => void;
}) {
  const accent = STAGE_CONFIG[item.stage].color;
  const stageLabel = STAGE_CONFIG[item.stage].label;
  const Icon = getStepIcon(item);
  const completed = state === 'completed';
  const emphasised = isFoundation || state === 'next'; // calm "you are here" / next emphasis

  return (
      <button
        onClick={onClick}
        className="group flex flex-col items-center rounded-2xl px-1 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {/* stone */}
        <span
          className={cn(
            'relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-card transition-transform group-hover:-translate-y-0.5',
            glow && 'foundation-attn-glow',
          )}
          style={{
            boxShadow: completed
              ? `0 0 0 2px #10b981`
              : emphasised
                ? `0 0 0 2px ${accent}, 0 8px 22px -12px ${accent}`
                : `0 0 0 1px ${accent}66`,
          }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={
              completed
                ? { background: '#10b981', color: '#fff' }
                : emphasised
                  ? { background: accent, color: '#fff' }
                  : { background: `${accent}1f`, color: accent }
            }
          >
            {completed ? (
              <Check className="h-5 w-5" strokeWidth={3} />
            ) : (
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            )}
          </span>
        </span>

        {/* stage label */}
        <span
          className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: accent }}
        >
          {stageLabel}
        </span>

        {/* title + subtitle */}
        <h3
          className={cn(
            'mt-1 text-sm font-bold leading-tight',
            state === 'future' ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {item.title}
        </h3>
        {isFoundation && glow ? (
          // Empty foundation — guidance prompt (the stone also glows).
          // Disappears once the user saves their details (glow → false).
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-teal-600 dark:text-teal-300">
            Tap to add your starting point — it tailors your roadmap.
          </p>
        ) : item.subtitle ? (
          <p
            className="mt-0.5 text-[11px] leading-snug text-muted-foreground"
            title={item.description ?? undefined}
          >
            {item.subtitle}
          </p>
        ) : null}

        {/* age / year chip */}
        <span className="mt-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          {label}
        </span>

        {scenarioAnnotation && (
          <span className="mt-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-500 dark:text-violet-300">
            {scenarioAnnotation}
          </span>
        )}
      </button>
  );
}
