"use client";

import { cn } from "@/lib/utils";
import { getAvatarById, defaultAvatarId, type AvatarDefinition } from "@/lib/avatars";

interface AvatarProps {
  avatarId?: string | null;
  fallbackInitial?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBorder?: boolean;
  animated?: boolean;
  style?: React.CSSProperties;
}

const sizeClasses = {
  xs: "w-6 h-6 text-sm",
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
  xl: "w-20 h-20 text-4xl",
  "2xl": "w-24 h-24 text-5xl",
};

const pixelatedStyle = {
  imageRendering: "pixelated" as const,
};

export function Avatar({
  avatarId,
  fallbackInitial = "?",
  size = "md",
  className,
  showBorder = true,
  animated = true,
  style,
}: AvatarProps) {
  const avatar = avatarId ? getAvatarById(avatarId) : getAvatarById(defaultAvatarId);

  if (!avatar) {
    // Fallback to initial-based avatar
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-primary to-purple-500 text-white",
          sizeClasses[size],
          showBorder && "border-2 border-white shadow-lg",
          className
        )}
        style={style}
      >
        {fallbackInitial.charAt(0).toUpperCase()}
      </div>
    );
  }

  const isPixel = avatar.style === "pixel";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg transition-transform",
        avatar.bgGradient,
        sizeClasses[size],
        showBorder && `border-2 ${avatar.borderColor}`,
        animated && "hover:scale-110",
        isPixel && "rounded-lg", // Pixel avatars are slightly squared
        className
      )}
      style={{ ...(isPixel ? pixelatedStyle : {}), ...style }}
    >
      <span
        className={cn(
          "select-none",
          animated && "transition-transform hover:scale-110"
        )}
        role="img"
        aria-label={avatar.name}
      >
        {avatar.emoji}
      </span>
    </div>
  );
}

// Avatar with name display
interface AvatarWithNameProps extends AvatarProps {
  name?: string;
  subtitle?: string;
}

export function AvatarWithName({
  name,
  subtitle,
  avatarId,
  size = "md",
  ...props
}: AvatarWithNameProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar avatarId={avatarId} size={size} {...props} />
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

// Mini avatar grid preview
interface AvatarGridProps {
  avatarIds: string[];
  maxDisplay?: number;
  size?: "xs" | "sm";
}

export function AvatarGrid({ avatarIds, maxDisplay = 4, size = "xs" }: AvatarGridProps) {
  const displayAvatars = avatarIds.slice(0, maxDisplay);
  const remaining = avatarIds.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((id, index) => (
        <Avatar
          key={id}
          avatarId={id}
          size={size}
          className="ring-2 ring-background"
          style={{ zIndex: displayAvatars.length - index }}
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
