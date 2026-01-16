"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  CheckCircle,
  XCircle,
  Clock,
  Send,
  User,
} from "lucide-react";

export default function AdminQuestionsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [answerText, setAnswerText] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [professionalCompany, setProfessionalCompany] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  // Fetch all questions for admin
  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-questions", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/questions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const answerMutation = useMutation({
    mutationFn: async (data: {
      questionId: string;
      answerText: string;
      professionalTitle?: string;
      professionalCompany?: string;
      yearsExperience?: number;
    }) => {
      const response = await fetch(`/api/questions/${data.questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerText: data.answerText,
          professionalTitle: data.professionalTitle,
          professionalCompany: data.professionalCompany,
          yearsExperience: data.yearsExperience,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit answer");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Answer published!",
        description: "The question has been answered and published.",
      });
      setAnswerModalOpen(false);
      setSelectedQuestion(null);
      setAnswerText("");
      setProfessionalTitle("");
      setProfessionalCompany("");
      setYearsExperience("");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { questionId: string; rejectionReason: string }) => {
      const response = await fetch(`/api/questions/${data.questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: data.rejectionReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject question");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Question rejected",
        description: "The question has been rejected.",
      });
      setRejectModalOpen(false);
      setSelectedQuestion(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnswer = () => {
    if (!selectedQuestion || answerText.length < 50) {
      toast({
        title: "Answer too short",
        description: "Please write at least 50 characters",
        variant: "destructive",
      });
      return;
    }

    answerMutation.mutate({
      questionId: selectedQuestion.id,
      answerText,
      professionalTitle: professionalTitle || undefined,
      professionalCompany: professionalCompany || undefined,
      yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
    });
  };

  const handleReject = () => {
    if (!selectedQuestion || rejectionReason.length < 10) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate({
      questionId: selectedQuestion.id,
      rejectionReason,
    });
  };

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Admin access required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case "PUBLISHED":
        return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="mr-1 h-3 w-3" />Published</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500 text-red-500"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Question Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Review and answer questions from youth users
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="status-filter" className="whitespace-nowrap">
              Filter by status:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Questions</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              Loading questions...
            </CardContent>
          </Card>
        ) : questions && questions.length > 0 ? (
          questions.map((q: any) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getStatusBadge(q.status)}
                      {q.category && <Badge variant="secondary">{q.category}</Badge>}
                    </div>
                    <CardTitle className="text-lg">{q.question}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>
                          {q.youth?.youthProfile?.displayName || "Anonymous"} ({q.youth?.email})
                        </span>
                        <span>•</span>
                        <span>{new Date(q.createdAt).toLocaleString()}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Actions */}
              {q.status === "PENDING" && (
                <CardContent className="flex gap-2 border-t pt-4">
                  <Button
                    onClick={() => {
                      setSelectedQuestion(q);
                      setAnswerModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Answer & Publish
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedQuestion(q);
                      setRejectModalOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </CardContent>
              )}

              {/* Show published answers */}
              {q.status === "PUBLISHED" && q.answers && q.answers.length > 0 && (
                <CardContent className="border-t">
                  {q.answers.map((answer: any) => (
                    <div key={answer.id} className="mt-4 rounded-lg bg-muted p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">
                        {answer.professionalTitle || "Professional"}
                        {answer.professionalCompany && ` at ${answer.professionalCompany}`}
                      </div>
                      <p className="text-sm">{answer.answerText}</p>
                    </div>
                  ))}
                </CardContent>
              )}

              {/* Show rejection reason */}
              {q.status === "REJECTED" && q.rejectionReason && (
                <CardContent className="border-t">
                  <div className="rounded-lg bg-red-50 p-4 text-sm dark:bg-red-950/30">
                    <strong>Rejection reason:</strong> {q.rejectionReason}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">No questions found</h2>
              <p className="text-muted-foreground">
                {statusFilter !== "ALL"
                  ? `No ${statusFilter.toLowerCase()} questions`
                  : "No questions to review"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Answer Modal */}
      <Dialog open={answerModalOpen} onOpenChange={setAnswerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.question}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="answer">Your Answer *</Label>
              <Textarea
                id="answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder="Provide a detailed, helpful answer..."
                className="resize-none"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {answerText.length}/2000 characters (minimum 50)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Your Title</Label>
                <Input
                  id="title"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={professionalCompany}
                  onChange={(e) => setProfessionalCompany(e.target.value)}
                  placeholder="e.g., Google"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g., 8"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAnswerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAnswer}
              disabled={answerMutation.isPending || answerText.length < 50}
            >
              {answerMutation.isPending ? "Publishing..." : "Publish Answer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Question</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this question. The youth will see this.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="rejection">Rejection Reason *</Label>
            <Textarea
              id="rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="e.g., Question is too vague, inappropriate content, etc."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || rejectionReason.length < 10}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
