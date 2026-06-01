"use client";

/**
 * Interest Level UI — a calm 1–5 star rating for how strongly a career
 * (a "possible future") resonates with the user. Three presentations:
 *   - <InterestLevelStars>  read-only compact stars (+ optional label)
 *   - <InterestLevelPicker> interactive selector (radiogroup, keyboard)
 *   - <InterestLevelBadge>  label-only pill for tight list rows
 *
 * Gold/amber stars read clearly in both dark and light themes. The brand
 * level labels come from the pure config; callers localise surrounding
 * headings via the `interest` i18n namespace.
 */
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INTEREST_LEVELS,
  type InterestLevel,
  interestLevelLabel,
} from "@/lib/interest-level/types";

const SIZES = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;
type Size = keyof typeof SIZES;

export function InterestLevelStars({
  value,
  size = "sm",
  showLabel = false,
  className,
}: {
  value: InterestLevel | null | undefined;
  size?: Size;
  showLabel?: boolean;
  className?: string;
}) {
  const lvl = value ?? 0;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              SIZES[size],
              i <= lvl
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30",
            )}
          />
        ))}
      </span>
      {showLabel && value ? (
        <span className="text-[11px] font-medium text-foreground/70">
          {interestLevelLabel(value)}
        </span>
      ) : null}
      <span className="sr-only">
        {value
          ? `Interest level: ${interestLevelLabel(value)}, ${value} of 5`
          : "Interest level not set"}
      </span>
    </span>
  );
}

export function InterestLevelPicker({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: InterestLevel | null | undefined;
  onChange: (level: InterestLevel) => void;
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div role="radiogroup" aria-label="Interest level" className="inline-flex items-center gap-1">
        {INTEREST_LEVELS.map((m) => {
          const active = !!value && m.level <= value;
          const selected = value === m.level;
          return (
            <button
              key={m.level}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${m.label} (${m.level} of 5)`}
              title={m.hint}
              onClick={() => onChange(m.level)}
              className="rounded-md p-1 transition-colors hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            >
              <Star
                className={cn(
                  SIZES[size],
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground/40",
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 min-h-[1rem]">
        {value ? interestLevelLabel(value) : ""}
      </p>
    </div>
  );
}

export function InterestLevelBadge({
  value,
  notRatedLabel = "Not rated",
  className,
}: {
  value: InterestLevel | null | undefined;
  notRatedLabel?: string;
  className?: string;
}) {
  if (!value) {
    return (
      <span className={cn("text-[11px] text-muted-foreground/40", className)}>{notRatedLabel}</span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400",
        className,
      )}
    >
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {interestLevelLabel(value)}
    </span>
  );
}
