"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Building2, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";

interface Conversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    avatar?: string;
    logo?: string;
    role: "YOUTH" | "EMPLOYER";
  };
  job: {
    id: string;
    title: string;
    status: string;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

export function ConversationList() {
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    staleTime: 15 * 1000, // Cache for 15 seconds (messages update more frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start a conversation by messaging someone
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Messages</CardTitle>
          {conversations.some((c) => c.unreadCount > 0) && (
            <Badge variant="destructive" className="ml-auto">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/messages/${conversation.id}`}
                className={cn(
                  "block p-4 hover:bg-muted/50 transition-colors",
                  conversation.unreadCount > 0 && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar - show based on role */}
                  <div className="flex-shrink-0">
                    {conversation.otherParty.role === "YOUTH" && conversation.otherParty.avatar ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl">
                        {getAvatarById(conversation.otherParty.avatar)?.emoji || "⭐"}
                      </div>
                    ) : conversation.otherParty.role === "EMPLOYER" ? (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium truncate",
                            conversation.unreadCount > 0 && "font-semibold"
                          )}
                        >
                          {conversation.otherParty.name}
                        </span>
                        {conversation.otherParty.role === "EMPLOYER" && (
                          <Badge variant="secondary" className="text-xs">
                            Job Poster
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {conversation.job && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate">{conversation.job.title}</span>
                      </div>
                    )}

                    {conversation.lastMessage && (
                      <p
                        className={cn(
                          "text-sm truncate mt-1",
                          conversation.unreadCount > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversation.lastMessage.isFromMe && "You: "}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {conversation.unreadCount > 0 && (
                    <Badge className="flex-shrink-0 bg-primary">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
