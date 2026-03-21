'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RestoreDefaultsButtonProps {
  onRestore: () => void;
  className?: string;
}

export function RestoreDefaultsButton({ onRestore, className }: RestoreDefaultsButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-xs text-muted-foreground">Reset all tasks to defaults?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs px-2"
          onClick={() => {
            onRestore();
            setConfirming(false);
          }}
        >
          Yes, reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded',
        className
      )}
    >
      <RotateCcw className="h-3 w-3" />
      <span>Restore defaults</span>
    </button>
  );
}
