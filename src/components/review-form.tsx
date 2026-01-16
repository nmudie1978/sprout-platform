"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";

interface ReviewFormProps {
  jobId: string;
  reviewedId: string;
  reviewedName: string;
  reviewedRole: "YOUTH" | "EMPLOYER";
  onComplete?: () => void;
}

const positiveTagOptions = {
  YOUTH: [
    "Punctual",
    "Professional",
    "Great Communication",
    "Hardworking",
    "Polite",
    "Problem Solver",
    "Reliable",
    "Quick Learner",
  ],
  EMPLOYER: [
    "Clear Instructions",
    "Fair Pay",
    "Respectful",
    "Flexible",
    "Professional",
    "Good Communication",
    "Safe Environment",
    "Would Work Again",
  ],
};

export function ReviewForm({
  jobId,
  reviewedId,
  reviewedName,
  reviewedRole,
  onComplete,
}: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState({
    punctuality: 0,
    communication: 0,
    reliability: 0,
    overall: 0,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          reviewedId,
          ...ratings,
          positiveTags: selectedTags,
          comment: comment || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: `Thank you for reviewing ${reviewedName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRating = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const isValid =
    ratings.punctuality > 0 &&
    ratings.communication > 0 &&
    ratings.reliability > 0 &&
    ratings.overall > 0 &&
    selectedTags.length > 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Review {reviewedName}</CardTitle>
        <CardDescription>
          Share your experience working {reviewedRole === "YOUTH" ? "with" : "for"} {reviewedName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Categories */}
        {(Object.keys(ratings) as Array<keyof typeof ratings>).map((category) => (
          <div key={category}>
            <Label className="mb-2 block capitalize">{category}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateRating(category, value)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= ratings[category]
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Positive Tags */}
        <div>
          <Label className="mb-2 block">What stood out? (Select all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {positiveTagOptions[reviewedRole].map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedTags.includes(tag) ? "bg-primary" : "hover:bg-primary/10"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Written Comment */}
        <div>
          <Label className="mb-2 block">Additional Comments (Optional)</Label>
          <Textarea
            placeholder="Share more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={() => submitReviewMutation.mutate()}
          disabled={!isValid || submitReviewMutation.isPending}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>

        {!isValid && (
          <p className="text-xs text-muted-foreground text-center">
            Please provide all ratings and select at least one positive tag
          </p>
        )}
      </CardContent>
    </Card>
  );
}
