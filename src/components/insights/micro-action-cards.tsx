/**
 * MICRO ACTION CARDS
 *
 * Small, actionable cards that suggest quick activities:
 * - "Try" - quick hands-on action
 * - "Watch" - short video content
 * - "Read" - brief article or resource
 *
 * Each includes "Add to My Journey" CTA.
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  BookOpen,
  Zap,
  ExternalLink,
  Plus,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ActionType = "try" | "watch" | "read";

export interface MicroAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  url: string;
  duration: string; // e.g., "5 min"
  tags?: string[];
}

// Curated micro-actions
// TODO: Connect to backend data source when available
const DEFAULT_MICRO_ACTIONS: MicroAction[] = [
  {
    id: "ma-1",
    type: "try",
    title: "Write a 3-sentence bio",
    description: "Practice describing yourself for a profile or CV in just 3 sentences.",
    url: "#", // Internal action
    duration: "5 min",
    tags: ["communication", "self-awareness"],
  },
  {
    id: "ma-2",
    type: "watch",
    title: "How to research a career",
    description: "Quick video on finding reliable information about jobs you're interested in.",
    url: "https://www.youtube.com/results?search_query=how+to+research+careers",
    duration: "8 min",
    tags: ["career-research", "exploration"],
  },
  {
    id: "ma-3",
    type: "read",
    title: "5 questions to ask in an interview",
    description: "Smart questions that show you're prepared and interested.",
    url: "https://www.themuse.com/advice/51-interview-questions-you-should-be-asking",
    duration: "3 min",
    tags: ["interview-prep", "communication"],
  },
  {
    id: "ma-4",
    type: "try",
    title: "List 5 things you enjoy doing",
    description: "Reflection exercise to help identify potential career directions.",
    url: "#",
    duration: "5 min",
    tags: ["self-discovery", "interests"],
  },
];

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string;
    icon: typeof Zap;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  try: {
    label: "Try",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200/50 dark:border-amber-800/30",
  },
  watch: {
    label: "Watch",
    icon: Play,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200/50 dark:border-blue-800/30",
  },
  read: {
    label: "Read",
    icon: BookOpen,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200/50 dark:border-green-800/30",
  },
};

interface MicroActionCardsProps {
  actions?: MicroAction[];
  title?: string;
  subtitle?: string;
  className?: string;
  maxVisible?: number;
}

export function MicroActionCards({
  actions = DEFAULT_MICRO_ACTIONS,
  title = "Your Next Small Steps",
  subtitle = "Quick actions to build momentum",
  className,
  maxVisible = 4,
}: MicroActionCardsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [addedActions, setAddedActions] = useState<Set<string>>(new Set());

  // Add to journey mutation
  // TODO: Connect to actual journey/library storage when available
  const addToJourneyMutation = useMutation({
    mutationFn: async (action: MicroAction) => {
      const response = await fetch("/api/journey/saved-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ARTICLE",
          title: action.title,
          url: action.url === "#" ? undefined : action.url,
          source: "Industry Insights",
          description: action.description,
          metadata: {
            actionId: action.id,
            actionType: action.type,
            duration: action.duration,
            tags: action.tags,
          },
        }),
      });

      if (!response.ok) {
        // If the endpoint doesn't exist yet, store locally
        const stored = localStorage.getItem("journey_micro_actions") || "[]";
        const actions = JSON.parse(stored);
        actions.push({
          ...action,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem("journey_micro_actions", JSON.stringify(actions));
        return { success: true, local: true };
      }

      return response.json();
    },
    onSuccess: (_, action) => {
      setAddedActions((prev) => new Set(prev).add(action.id));
      queryClient.invalidateQueries({ queryKey: ["journey-library"] });
      queryClient.invalidateQueries({ queryKey: ["journey-items"] });
    },
    onError: (_, action) => {
      // Fallback to local storage on error
      const stored = localStorage.getItem("journey_micro_actions") || "[]";
      const actions = JSON.parse(stored);
      actions.push({
        ...action,
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem("journey_micro_actions", JSON.stringify(actions));
      setAddedActions((prev) => new Set(prev).add(action.id));
    },
  });

  const visibleActions = actions.slice(0, maxVisible);

  const handleAddToJourney = (action: MicroAction) => {
    addToJourneyMutation.mutate(action);
  };

  return (
    <Card className={`border-2 overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-amber-400 via-blue-400 to-green-400" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-green-100 dark:from-amber-900/30 dark:to-green-900/30">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleActions.map((action) => {
            const config = ACTION_CONFIG[action.type];
            const Icon = config.icon;
            const isAdded = addedActions.has(action.id);
            const isAdding =
              addToJourneyMutation.isPending &&
              addToJourneyMutation.variables?.id === action.id;

            return (
              <div
                key={action.id}
                className={`p-3 rounded-lg border ${config.borderColor} bg-gradient-to-br from-background to-muted/20 hover:shadow-sm transition-shadow`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0 ${config.bgColor} ${config.color}`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {action.duration}
                  </div>
                </div>

                {/* Content */}
                <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {action.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  {action.url !== "#" ? (
                    <a
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Start
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Reflection exercise
                    </span>
                  )}

                  {session?.user ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddToJourney(action)}
                      disabled={isAdded || isAdding}
                      className="h-7 px-2 text-[10px]"
                    >
                      {isAdding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAdded ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-0.5" />
                          Add to Journey
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Sign in to save
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View all link if more actions exist */}
        {actions.length > maxVisible && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View all {actions.length} actions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MicroActionCards;
