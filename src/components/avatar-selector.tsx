"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { avatars, avatarCategories, getAvatarById, type AvatarDefinition } from "@/lib/avatars";
import { Avatar } from "@/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, Sparkles } from "lucide-react";

interface AvatarSelectorProps {
  currentAvatarId?: string | null;
  onSelect: (avatarId: string) => void;
  disabled?: boolean;
}

export function AvatarSelector({
  currentAvatarId,
  onSelect,
  disabled = false,
}: AvatarSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("pixel");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const currentAvatar = currentAvatarId ? getAvatarById(currentAvatarId) : null;
  const categoryAvatars = avatars.filter((a) => a.category === selectedCategory);

  const handleSelect = (avatarId: string) => {
    onSelect(avatarId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="group relative isolate z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <Avatar
            avatarId={currentAvatarId}
            size="xl"
            className="transition-transform group-hover:scale-105"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Pencil className="w-4 h-4" />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative z-50">
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose Your Avatar
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="flex items-center justify-center py-4 border-b relative z-10">
          <div className="text-center">
            <Avatar
              avatarId={previewId || currentAvatarId}
              size="2xl"
              className="mx-auto mb-2"
            />
            <p className="text-sm font-medium">
              {previewId
                ? getAvatarById(previewId)?.name
                : currentAvatar?.name || "Select an avatar"}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto py-3 border-b scrollbar-hide relative z-10">
          {avatarCategories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Category Description */}
        <p className="text-sm text-muted-foreground text-center py-2 relative z-10">
          {avatarCategories.find((c) => c.id === selectedCategory)?.description}
        </p>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto py-4 relative z-10">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 relative z-10">
            {categoryAvatars.map((avatar) => {
              const isSelected = currentAvatarId === avatar.id;
              const isHovered = previewId === avatar.id;

              return (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => handleSelect(avatar.id)}
                  onMouseEnter={() => setPreviewId(avatar.id)}
                  onMouseLeave={() => setPreviewId(null)}
                  className={cn(
                    "relative p-2 rounded-xl transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer",
                    isSelected && "bg-primary/10 ring-2 ring-primary"
                  )}
                >
                  <Avatar
                    avatarId={avatar.id}
                    size="lg"
                    className={cn(
                      "mx-auto transition-transform",
                      (isHovered || isSelected) && "scale-110"
                    )}
                    animated={false}
                  />
                  <p className="text-xs text-center mt-2 font-medium truncate">
                    {avatar.name}
                  </p>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t relative z-10">
          <p className="text-xs text-muted-foreground">
            {avatars.length} avatars available
          </p>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact inline selector for smaller spaces
interface AvatarSelectorInlineProps {
  currentAvatarId?: string | null;
  onSelect: (avatarId: string) => void;
  maxDisplay?: number;
}

export function AvatarSelectorInline({
  currentAvatarId,
  onSelect,
  maxDisplay = 8,
}: AvatarSelectorInlineProps) {
  const displayAvatars = avatars.slice(0, maxDisplay);

  return (
    <div className="flex flex-wrap gap-2">
      {displayAvatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={cn(
            "rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            currentAvatarId === avatar.id && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <Avatar avatarId={avatar.id} size="sm" animated={false} />
        </button>
      ))}
    </div>
  );
}
