"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-24 h-24 text-3xl",
};

const GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-teal-500 to-teal-500",
  "from-blue-500 to-teal-500",
  "from-cyan-500 to-teal-500",
  "from-emerald-500 to-green-500",
  "from-amber-500 to-orange-500",
  "from-red-500 to-rose-500",
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-teal-500 to-cyan-500",
  "from-lime-500 to-emerald-500",
  "from-orange-500 to-amber-500",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Avatar({
  name,
  size = "md",
  className,
  showBorder = true,
}: AvatarProps) {
  const displayName = name || "?";
  const initials = displayName === "?" ? "?" : getInitials(displayName);
  const gradient = getColorFromName(displayName);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold bg-gradient-to-br text-white select-none",
        gradient,
        sizeClasses[size],
        showBorder && "ring-2 ring-white/80 shadow-md",
        className
      )}
      aria-label={displayName}
    >
      {initials}
    </div>
  );
}

interface AvatarWithNameProps extends AvatarProps {
  subtitle?: string;
}

export function AvatarWithName({
  name,
  subtitle,
  size = "md",
  ...props
}: AvatarWithNameProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size={size} {...props} />
      {name && (
        <div className="flex flex-col">
          <span className="font-semibold">{name}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface AvatarGridProps {
  names: string[];
  maxDisplay?: number;
  size?: "xs" | "sm";
}

export function AvatarGrid({ names, maxDisplay = 4, size = "xs" }: AvatarGridProps) {
  const displayNames = names.slice(0, maxDisplay);
  const remaining = names.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayNames.map((name, index) => (
        <Avatar
          key={name + index}
          name={name}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
