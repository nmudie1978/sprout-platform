"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Building2,
  User,
  Briefcase,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderId: string;
  isFromMe: boolean;
  read: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  otherParty: {
    id: string;
    name: string;
    avatar?: string;
    logo?: string;
  };
  job: {
    id: string;
    title: string;
    status: string;
  } | null;
  messages: Message[];
}

const avatarOptions: Record<string, string> = {
  avatar1: "😊",
  avatar2: "😎",
  avatar3: "🤓",
  avatar4: "😄",
  avatar5: "🙂",
  avatar6: "🌟",
  avatar7: "💪",
  avatar8: "🎯",
};

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, h:mm a");
  }
}

export function ChatView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversation, isLoading } = useQuery<ConversationDetail>({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      return response.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (newMessage) => {
      // Optimistically update the conversation
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, newMessage],
          };
        }
      );
      setMessage("");
      // Invalidate conversation list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Conversation not found</p>
          <Button asChild className="mt-4">
            <Link href="/messages">Back to Messages</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          {/* Avatar */}
          {conversation.otherParty.avatar ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl">
              {avatarOptions[conversation.otherParty.avatar] || "😊"}
            </div>
          ) : conversation.otherParty.logo ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {conversation.otherParty.name}
            </CardTitle>
            {conversation.job && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span className="truncate">{conversation.job.title}</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {conversation.job.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "flex",
                  msg.isFromMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    msg.isFromMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      msg.isFromMe
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatMessageDate(msg.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Input */}
      <div className="border-t p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
