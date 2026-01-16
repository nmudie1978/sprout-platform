"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Briefcase,
  Check,
  Loader2,
  UserPlus,
  Send,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface YouthSearchResult {
  id: string;
  displayName: string;
  avatarId: string | null;
  completedJobsCount: number;
  averageRating: number | null;
  skillTags: string[];
}

interface RecommendFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

export function RecommendFriendDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}: RecommendFriendDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYouth, setSelectedYouth] = useState<YouthSearchResult | null>(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search for youth workers
  const { data: searchResults = [], isLoading: isSearching } = useQuery<YouthSearchResult[]>({
    queryKey: ["youth-search", debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return [];
      const response = await fetch(`/api/youth/search?q=${encodeURIComponent(debouncedSearch)}`);
      if (!response.ok) throw new Error("Failed to search");
      return response.json();
    },
    enabled: debouncedSearch.length >= 2 && !selectedYouth,
  });

  // Create recommendation mutation
  const createRecommendation = useMutation({
    mutationFn: async () => {
      if (!selectedYouth) throw new Error("No youth selected");
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendedId: selectedYouth.id,
          jobId,
          message: message.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create recommendation");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation sent! 🎉",
        description: `You recommended ${selectedYouth?.displayName} for this job.`,
      });
      queryClient.invalidateQueries({ queryKey: ["recommendations", jobId] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSelectedYouth(null);
    setMessage("");
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectYouth = (youth: YouthSearchResult) => {
    setSelectedYouth(youth);
    setSearchQuery("");
  };

  const handleBack = () => {
    setSelectedYouth(null);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            Recommend a Friend
          </DialogTitle>
          <DialogDescription>
            {selectedYouth
              ? `Recommending ${selectedYouth.displayName} for "${jobTitle}"`
              : `Search for a friend to recommend for "${jobTitle}"`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedYouth ? (
            // Search mode
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>

              {/* Search results */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                )}

                {!isSearching && debouncedSearch.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No youth workers found matching "{debouncedSearch}"</p>
                    <p className="text-xs mt-1">Only visible profiles can be recommended</p>
                  </div>
                )}

                {!isSearching && debouncedSearch.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p>Type at least 2 characters to search</p>
                  </div>
                )}

                {searchResults.map((youth) => (
                  <motion.button
                    key={youth.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectYouth(youth)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar avatarId={youth.avatarId} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{youth.displayName}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {youth.completedJobsCount} jobs
                        </span>
                        {youth.averageRating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {youth.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground/30" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            // Confirmation mode
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Selected youth card */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <Avatar avatarId={selectedYouth.avatarId} size="lg" />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{selectedYouth.displayName}</div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {selectedYouth.completedJobsCount} jobs completed
                    </span>
                    {selectedYouth.averageRating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        {selectedYouth.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {selectedYouth.skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedYouth.skillTags.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Add a message (optional)
                </label>
                <Textarea
                  placeholder="Why do you think they'd be great for this job?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {message.length}/500
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => createRecommendation.mutate()}
                  disabled={createRecommendation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {createRecommendation.isPending ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-4 w-4" />
                  )}
                  Send Recommendation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
