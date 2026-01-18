"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Briefcase,
  Compass,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  LogIn,
  Target,
  TrendingUp,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
  sources?: {
    careers?: { id: string; roleName: string }[];
    helpDocs?: { id: string; title: string }[];
    qa?: { id: string; question: string }[];
  };
}

// Default prompts when no goal is set
const defaultPrompts = [
  {
    icon: Compass,
    label: "Explore careers",
    prompt: "What careers would suit someone who likes technology and creativity?",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: GraduationCap,
    label: "Getting started",
    prompt: "How do I get started in tech without a university degree?",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Briefcase,
    label: "Find small jobs",
    prompt: "How can I find my first job as a teenager in Norway?",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Lightbulb,
    label: "Build skills",
    prompt: "What skills should I learn to become more employable?",
    color: "from-orange-500 to-amber-500",
  },
];

// Goal-specific prompt generators
function getGoalSpecificPrompts(goal: string) {
  return [
    {
      icon: Target,
      label: "Career path",
      prompt: `What's the typical path to becoming a ${goal}?`,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: GraduationCap,
      label: "Education",
      prompt: `What education or training do I need to become a ${goal}?`,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      label: "Job market",
      prompt: `What's the job market like for ${goal}s in Norway?`,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Lightbulb,
      label: "Build skills",
      prompt: `What skills should I build now to prepare for becoming a ${goal}?`,
      color: "from-orange-500 to-amber-500",
    },
  ];
}

// Goal-specific quick questions generator
function getGoalSpecificQuestions(goal: string) {
  return [
    `What does a day in the life of a ${goal} look like?`,
    `What salary can I expect as a ${goal} in Norway?`,
    `What small jobs can help me build skills for becoming a ${goal}?`,
    `What challenges do ${goal}s typically face?`,
    `Are there apprenticeships available for ${goal}s?`,
    `What companies hire ${goal}s in Norway?`,
  ];
}

const defaultQuickQuestions = [
  "What does a day in the life of a developer look like?",
  "How much can I earn as a lærling (apprentice)?",
  "What are the fastest-growing industries in Norway?",
  "How do I write a good job application message?",
  "What remote jobs are available for young people?",
  "How do I build a portfolio without experience?",
];

export default function CareerAdvisorPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const goalParam = searchParams.get("goal");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch chat history on mount
  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoadingHistory(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/chat/history");
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            const loadedMessages: Message[] = data.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              intent: msg.intent,
            }));
            setMessages(loadedMessages);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [status]);

  // Compute goal-specific content
  const suggestedPrompts = useMemo(
    () => (goalParam ? getGoalSpecificPrompts(goalParam) : defaultPrompts),
    [goalParam]
  );
  const quickQuestions = useMemo(
    () => (goalParam ? getGoalSpecificQuestions(goalParam) : defaultQuickQuestions),
    [goalParam]
  );

  const isAuthenticated = status === "authenticated";
  const isLoadingAuth = status === "loading";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Add goal context to the message if set
      const messageWithContext = goalParam
        ? `[Context: I'm interested in becoming a ${goalParam}] ${messageText.trim()}`
        : messageText.trim();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageWithContext,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          careerGoal: goalParam || undefined,
        }),
      });

      const data = await response.json();

      // Check for hard errors (no message returned at all)
      if (data.error && !data.message) {
        throw new Error(data.error);
      }

      // API now always returns a message (even on fallback), so use it
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I'm here to help with careers and jobs! What would you like to know?",
        timestamp: new Date(),
        intent: data.intent,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Only show error for network failures or truly broken responses
      setError("Connection issue. Please try again.");
      console.error("Career advisor error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Clear local chat state only (keeps history in DB for AI context)
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Clear all history including database
  const clearAllHistory = async () => {
    try {
      const response = await fetch("/api/chat/history", { method: "DELETE" });
      if (response.ok) {
        setMessages([]);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Background gradient - matches Industry Insights */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <PageHeader
          title="AI Career"
          gradientText="Advisor"
          description="Get personalised career guidance, explore opportunities, and plan your path forward"
          icon={Bot}
        />
        <Card className="border-2 mt-8">
          <CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Background gradient - matches Industry Insights */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <PageHeader
          title="AI Career"
          gradientText="Advisor"
          description="Get personalised career guidance, explore opportunities, and plan your path forward"
          icon={Bot}
        />
        <Card className="border-2 mt-8">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 w-fit mx-auto mb-6">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sign in to use the AI Advisor</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account or sign in to get personalised career guidance,
              explore opportunities, and chat with our AI career advisor.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Still show tips for non-authenticated users */}
        <Card className="mt-6 border-2 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">What can the AI Advisor help with?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explore career options based on your interests</li>
                  <li>• Get advice on how to start in different industries</li>
                  <li>• Learn about job requirements and salary expectations</li>
                  <li>• Get help writing job applications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      {/* Background gradient - matches Industry Insights */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <PageHeader
        title="AI Career"
        gradientText="Advisor"
        description={goalParam
          ? `Get personalised guidance for your path to becoming a ${goalParam}`
          : "Get personalised career guidance, explore opportunities, and plan your path forward"}
        icon={Bot}
      />

      {/* Chat Container */}
      <Card className="border-2 mt-8 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Career Advisor</h3>
              <p className="text-xs text-muted-foreground">Powered by AI • Remembers your conversations</p>
            </div>
          </div>
          {messages.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearChat}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllHistory} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {isLoadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading conversation history...</p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-4"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              {goalParam ? (
                <>
                  <h3 className="text-xl font-bold mb-2">Let's talk about becoming a {goalParam}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I can help you understand the path to this career, the skills you'll need, and how to get started. Ask me anything!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">Hei! I'm your Career Advisor</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I can help you explore careers, find jobs, build skills, and plan your path. Ask me anything about work and careers in Norway!
                  </p>
                </>
              )}

              {/* Suggested Prompts */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-6">
                {suggestedPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => sendMessage(prompt.prompt)}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 hover:border-primary/50 bg-background hover:shadow-md transition-all text-left group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${prompt.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {prompt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Questions */}
              <div className="w-full max-w-lg">
                <p className="text-xs text-muted-foreground mb-2">Or try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(question)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-gradient-to-br from-primary to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-blue-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Sources */}
                    {message.sources && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        {message.sources.careers && message.sources.careers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {message.sources.careers.map((career) => (
                              <Badge
                                key={career.id}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-primary/20"
                              >
                                <Briefcase className="h-3 w-3 mr-1" />
                                {career.roleName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] mt-2 opacity-60">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-gradient-to-br from-primary to-purple-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about careers, jobs, skills..."
                className="w-full resize-none rounded-xl border-2 border-muted bg-muted/30 px-4 py-3 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-0 transition-colors min-h-[52px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-4"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            AI responses are for guidance only. Always verify important information.
          </p>
        </form>
      </Card>

      {/* Quick Actions */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-sm font-medium mb-3">Continue exploring:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-3 w-3" />
                {question}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      <Card className="mt-6 border-2 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Tips for better answers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific about your interests and goals</li>
                <li>• Ask follow-up questions to dig deeper</li>
                <li>• Mention your location (Norway) for local opportunities</li>
                <li>• Tell me about your skills or experience level</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
