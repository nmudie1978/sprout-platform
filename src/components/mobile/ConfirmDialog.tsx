"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** Icon to show in header (optional) */
  icon?: React.ReactNode;
  /** Primary action button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Primary action handler */
  onConfirm: () => void;
  /** Is the confirm action pending */
  isPending?: boolean;
  /** Variant for confirm button styling */
  variant?: "default" | "destructive";
  /** Children to render between description and footer (optional) */
  children?: React.ReactNode;
}

/**
 * ConfirmDialog - A reusable confirmation dialog
 *
 * Mobile-friendly with larger touch targets.
 * Consistent styling across the app.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isPending = false,
  variant = "default",
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm max-w-[calc(100vw-2rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2",
            icon && "text-left"
          )}>
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && (
          <div className="py-2">
            {children}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="h-11 sm:h-10 w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isPending}
            className="h-11 sm:h-10 w-full sm:w-auto"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDialogChoiceProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  choices: {
    label: string;
    sublabel?: string;
    icon?: React.ReactNode;
    value: string;
    variant?: "primary" | "secondary";
  }[];
  onSelect: (value: string) => void;
  isPending?: boolean;
  cancelText?: string;
}

/**
 * ConfirmDialogChoice - A dialog with multiple choice options
 *
 * Used for scenarios like "Replace Primary" vs "Replace Secondary" goal.
 */
export function ConfirmDialogChoice({
  open,
  onClose,
  title,
  description,
  icon,
  choices,
  onSelect,
  isPending = false,
  cancelText = "Cancel",
}: ConfirmDialogChoiceProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm max-w-[calc(100vw-2rem)] mx-auto">
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2",
            icon && "text-left"
          )}>
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {choices.map((choice) => (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              disabled={isPending}
              className={cn(
                "w-full p-3 rounded-lg border-2 transition-colors text-left group",
                "hover:border-purple-400 dark:hover:border-purple-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                choice.variant === "primary"
                  ? "border-purple-200 dark:border-purple-800"
                  : "border-slate-200 dark:border-slate-700"
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {choice.icon}
                <span className="text-xs font-medium text-muted-foreground">
                  {choice.label}
                </span>
              </div>
              {choice.sublabel && (
                <p className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {choice.sublabel}
                </p>
              )}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="w-full h-11 sm:h-10"
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
