"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  User,
  Briefcase,
  Filter,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

const CATEGORIES = [
  "All",
  "Tech",
  "Healthcare",
  "Creative",
  "Business",
  "Education",
  "Engineering",
  "Service",
  "Other",
];

export default function BrowseQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: questions, isLoading } = useQuery({
    queryKey: ["published-questions", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  // Filter questions by search query
  const filteredQuestions = questions?.filter((q: any) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answers?.some((a: any) =>
      a.answerText.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Header */}
      <PageHeader
        title="Knowledge"
        gradientText="Base"
        description="Browse questions and answers from professionals about careers and skills"
        icon={BookOpen}
      />

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
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
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && filteredQuestions && (
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              Loading questions...
            </CardContent>
          </Card>
        ) : filteredQuestions && filteredQuestions.length > 0 ? (
          filteredQuestions.map((q: any) => (
            <Card key={q.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{q.question}</CardTitle>
                    <CardDescription className="mt-2">
                      {q.category && (
                        <Badge variant="outline" className="mr-2">
                          {q.category}
                        </Badge>
                      )}
                      <span className="text-sm">
                        Asked by {q.youth?.youthProfile?.displayName || "Anonymous"}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Answers */}
              {q.answers && q.answers.length > 0 && (
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {q.answers.map((answer: any) => (
                      <div
                        key={answer.id}
                        className="rounded-lg border bg-card p-6"
                      >
                        {/* Professional Info */}
                        <div className="mb-4 flex items-center gap-3 border-b pb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {answer.professionalTitle || "Professional"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {answer.professionalCompany && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {answer.professionalCompany}
                                </span>
                              )}
                              {answer.yearsExperience && (
                                <span>
                                  {answer.professionalCompany ? " • " : ""}
                                  {answer.yearsExperience} years experience
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(answer.publishedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Answer Text */}
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {answer.answerText}
                          </p>
                        </div>
                      </div>
                    ))}
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
              <p className="mb-4 text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Be the first to ask a question!"}
              </p>
              <Button asChild>
                <Link href="/ask-a-pro">Ask a Question</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
