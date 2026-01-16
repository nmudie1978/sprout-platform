"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

const CATEGORIES = [
  "Tech",
  "Healthcare",
  "Creative",
  "Business",
  "Education",
  "Engineering",
  "Service",
  "Other",
];

export default function AskAProPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTab, setSelectedTab] = useState<"ask" | "my-questions">("ask");

  // Fetch user's questions
  const { data: myQuestions, isLoading: loadingMyQuestions } = useQuery({
    queryKey: ["my-questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions?my=true");
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
    enabled: selectedTab === "my-questions",
  });

  const submitQuestionMutation = useMutation({
    mutationFn: async (data: { question: string; category?: string }) => {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit question");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question submitted!",
        description: "Your question will be reviewed and answered by a professional.",
      });
      setQuestion("");
      setCategory("");
      queryClient.invalidateQueries({ queryKey: ["my-questions"] });
      setSelectedTab("my-questions");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.length < 10) {
      toast({
        title: "Question too short",
        description: "Please write at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    submitQuestionMutation.mutate({
      question,
      category: category || undefined,
    });
  };

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Only youth users can ask questions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Awaiting answer";
      case "PUBLISHED":
        return "Answered";
      case "REJECTED":
        return "Not approved";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* Header */}
      <PageHeader
        title="Ask a"
        gradientText="Pro"
        description="Get career advice from professionals. Limit: 3 questions per day."
        icon={MessageSquare}
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-3">
        <Button
          variant={selectedTab === "ask" ? "default" : "outline"}
          onClick={() => setSelectedTab("ask")}
          className={selectedTab === "ask" ? "shadow-lg" : "border-2"}
        >
          <Send className="mr-2 h-4 w-4" />
          Ask Question
        </Button>
        <Button
          variant={selectedTab === "my-questions" ? "default" : "outline"}
          onClick={() => setSelectedTab("my-questions")}
          className={selectedTab === "my-questions" ? "shadow-lg" : "border-2"}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          My Questions
        </Button>
      </div>

      {/* Ask Question Tab */}
      {selectedTab === "ask" && (
        <Card className="border-2 shadow-lg hover-lift">
          <CardHeader>
            <CardTitle className="text-xl">Submit Your Question</CardTitle>
            <CardDescription>
              Ask professionals about careers, skills, or industry insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Select */}
              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Textarea */}
              <div>
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="Example: What skills should I focus on to become a UX designer? What does a typical day look like?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={6}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  {question.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitQuestionMutation.isPending || question.length < 10}
                className="w-full"
              >
                {submitQuestionMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Question
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Questions Tab */}
      {selectedTab === "my-questions" && (
        <div className="space-y-4">
          {loadingMyQuestions ? (
            <Card>
              <CardContent className="py-12 text-center">
                Loading your questions...
              </CardContent>
            </Card>
          ) : myQuestions && myQuestions.length > 0 ? (
            myQuestions.map((q: any) => (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{q.question}</CardTitle>
                      <CardDescription className="mt-1">
                        {q.category && (
                          <Badge variant="outline" className="mr-2">
                            {q.category}
                          </Badge>
                        )}
                        <span className="text-sm">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(q.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(q.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {/* Show answers if published */}
                {q.status === "PUBLISHED" && q.answers && q.answers.length > 0 && (
                  <CardContent className="border-t">
                    {q.answers.map((answer: any) => (
                      <div key={answer.id} className="mt-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {answer.professionalTitle || "Professional"}
                          </span>
                          {answer.professionalCompany && (
                            <>
                              <span>at</span>
                              <Briefcase className="h-3 w-3" />
                              <span>{answer.professionalCompany}</span>
                            </>
                          )}
                          {answer.yearsExperience && (
                            <span>• {answer.yearsExperience} years experience</span>
                          )}
                        </div>
                        <p className="rounded-lg bg-muted p-4 text-sm">
                          {answer.answerText}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                )}

                {/* Show rejection reason if rejected */}
                {q.status === "REJECTED" && q.rejectionReason && (
                  <CardContent className="border-t">
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                      <strong>Reason:</strong> {q.rejectionReason}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">No questions yet</h2>
                <p className="mb-4 text-muted-foreground">
                  Submit your first question to get started
                </p>
                <Button onClick={() => setSelectedTab("ask")}>
                  <Send className="mr-2 h-4 w-4" />
                  Ask a Question
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
