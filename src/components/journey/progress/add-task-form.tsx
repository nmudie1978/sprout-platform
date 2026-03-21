'use client';

import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JourneyStage } from '@/lib/journey/career-journey-types';
import type { TaskMode } from '@/lib/journey/tasks/types';

interface AddTaskFormProps {
  stageId: JourneyStage;
  mode: TaskMode;
  onAdd: (stageId: JourneyStage, mode: TaskMode, title: string) => void;
}

export function AddTaskForm({ stageId, mode, onAdd }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(stageId, mode, trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          // Focus after render
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground/60',
          'hover:text-muted-foreground transition-colors rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
        )}
      >
        <Plus className="h-3 w-3" />
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1">
      <Plus className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setValue('');
            setIsOpen(false);
          }
        }}
        onBlur={() => {
          if (!value.trim()) setIsOpen(false);
        }}
        placeholder="Add a task..."
        className={cn(
          'flex-1 text-sm bg-transparent border-none outline-none',
          'placeholder:text-muted-foreground/40'
        )}
        maxLength={120}
      />
    </div>
  );
}
