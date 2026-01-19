"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MobileSheet, MobileSheetFooter } from "@/components/mobile/MobileSheet";

// ============================================
// ADD NEXT STEP SHEET
// ============================================

interface AddNextStepSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
  isPending?: boolean;
  currentCount: number;
  maxCount: number;
}

export function AddNextStepSheet({
  open,
  onClose,
  onAdd,
  isPending = false,
  currentCount,
  maxCount,
}: AddNextStepSheetProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setText("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
  };

  const canAdd = currentCount < maxCount;

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="Add Next Step"
      description={canAdd ? "What's your next step toward this goal?" : `Maximum ${maxCount} steps reached`}
    >
      {canAdd ? (
        <>
          <div className="space-y-3">
            <Input
              placeholder="e.g., Research required qualifications"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              className="h-11"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">
              {text.length}/200
            </p>
          </div>

          <MobileSheetFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isPending}
              className="flex-1 h-11"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </>
              )}
            </Button>
          </MobileSheetFooter>
        </>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">You've reached the maximum of {maxCount} steps.</p>
          <p className="text-xs mt-1">Complete or remove some steps first.</p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      )}
    </MobileSheet>
  );
}

// ============================================
// ADD SKILL SHEET
// ============================================

interface AddSkillSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (skill: string) => void;
  isPending?: boolean;
  currentSkills: string[];
  maxCount: number;
  /** Suggested skills based on career */
  suggestions?: string[];
}

export function AddSkillSheet({
  open,
  onClose,
  onAdd,
  isPending = false,
  currentSkills,
  maxCount,
  suggestions = [],
}: AddSkillSheetProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setText("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (currentSkills.includes(text.trim())) return;
    onAdd(text.trim());
  };

  const handleSuggestionClick = (skill: string) => {
    if (currentSkills.includes(skill)) return;
    onAdd(skill);
  };

  const canAdd = currentSkills.length < maxCount;
  const availableSuggestions = suggestions.filter((s) => !currentSkills.includes(s));

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="Add Skill"
      description={canAdd ? "What skill do you want to build?" : `Maximum ${maxCount} skills reached`}
    >
      {canAdd ? (
        <>
          <div className="space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <Input
                placeholder="e.g., Communication, Problem Solving"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={50}
                className="h-11"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground text-right">
                {text.length}/50
              </p>
            </div>

            {/* Suggestions */}
            {availableSuggestions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.slice(0, 6).map((skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(skill)}
                      disabled={isPending}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Current skills count */}
            <p className="text-xs text-muted-foreground">
              {currentSkills.length}/{maxCount} skills added
            </p>
          </div>

          <MobileSheetFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11"
            >
              Done
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || currentSkills.includes(text.trim()) || isPending}
              className="flex-1 h-11"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </>
              )}
            </Button>
          </MobileSheetFooter>
        </>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">You've reached the maximum of {maxCount} skills.</p>
          <p className="text-xs mt-1">Remove some skills if you want to add new ones.</p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      )}
    </MobileSheet>
  );
}

// ============================================
// ADD NOTE SHEET
// ============================================

interface AddNoteSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string) => void;
  isPending?: boolean;
}

export function AddNoteSheet({
  open,
  onClose,
  onAdd,
  isPending = false,
}: AddNoteSheetProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setContent("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd(content.trim());
  };

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="Add Note"
      description="Write your thoughts, reflections, or anything you want to remember"
    >
      <div className="space-y-3">
        <Textarea
          placeholder="What's on your mind about your career journey?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          className="min-h-[150px] resize-none"
          autoFocus
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/2000
        </p>
      </div>

      <MobileSheetFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 h-11"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
          className="flex-1 h-11"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Note"
          )}
        </Button>
      </MobileSheetFooter>
    </MobileSheet>
  );
}
