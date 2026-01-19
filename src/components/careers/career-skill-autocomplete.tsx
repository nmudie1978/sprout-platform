"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { getSkillSuggestions } from "@/lib/career-filters/utils";

interface CareerSkillAutocompleteProps {
  allSkills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  maxSelections?: number;
}

export function CareerSkillAutocomplete({
  allSkills,
  selectedSkills,
  onSkillsChange,
  maxSelections = 5,
}: CareerSkillAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = getSkillSuggestions(inputValue, allSkills, selectedSkills);

  const addSkill = useCallback(
    (skill: string) => {
      if (selectedSkills.length >= maxSelections) return;
      if (!selectedSkills.includes(skill)) {
        onSkillsChange([...selectedSkills, skill]);
      }
      setInputValue("");
      setIsOpen(false);
      setHighlightedIndex(0);
    },
    [selectedSkills, onSkillsChange, maxSelections]
  );

  const removeSkill = useCallback(
    (skill: string) => {
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    },
    [selectedSkills, onSkillsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (suggestions[highlightedIndex]) {
            addSkill(suggestions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(0);
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, addSkill]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions.length]);

  const canAddMore = selectedSkills.length < maxSelections;

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium">Skills</span>

      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="text-[10px] pl-2 pr-1 py-0.5 gap-1"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with autocomplete */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              canAddMore
                ? `Search skills... (${selectedSkills.length}/${maxSelections})`
                : "Max skills selected"
            }
            disabled={!canAddMore}
            className="h-8 pl-7 text-xs"
          />
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
            {suggestions.map((skill, index) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-accent ${
                  index === highlightedIndex ? "bg-accent" : ""
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
