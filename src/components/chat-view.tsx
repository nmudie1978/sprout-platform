"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  Building2,
  User,
  Briefcase,
  Loader2,
  Shield,
  AlertTriangle,
  Lock,
  CheckCircle2,
  MoreVertical,
  Flag,
  Ban,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAvatarById } from "@/lib/avatars";
import { useIsMobile } from "@/hooks/use-media-query";
import { MessageIntentSheet } from "@/components/messages/MessageIntentSheet";

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  content: string;
  intent?: string;
  intentLabel?: string;
  isLegacy?: boolean;
  // Legacy fields for backward compatibility
  templateKey?: string;
  templateLabel?: string;
  templateCategory?: string;
  senderId: string;
  isFromMe: boolean;
  read: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  frozenAt?: string;
  frozenReason?: string;
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
  messages: Message[];
}

interface IntentVariable {
  name: string;
  label: string;
  type: string;
  required: boolean;
  maxLength?: number;
  placeholder?: string;
}

interface MessageIntentData {
  intent: string;
  label: string;
  description: string;
  template: string;
  hasVariables: boolean;
  variables: IntentVariable[];
}

// ============================================
// HELPERS
// ============================================

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

const REPORT_CATEGORIES = [
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "SPAM", label: "Spam or scam" },
  { value: "CONTACT_SHARING", label: "Trying to share contact info" },
  { value: "SUSPICIOUS_BEHAVIOR", label: "Suspicious behavior" },
  { value: "OTHER", label: "Other" },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function ChatView({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const [selectedIntent, setSelectedIntent] = useState<MessageIntentData | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showIntentSheet, setShowIntentSheet] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversation
  const { data: conversation, isLoading } = useQuery<ConversationDetail>({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      return response.json();
    },
    refetchInterval: 5000,
    staleTime: 3000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  // Fetch available message intents
  const { data: intentsData } = useQuery<{ intents: MessageIntentData[] }>({
    queryKey: ["messageIntents"],
    queryFn: async () => {
      const response = await fetch("/api/message-intents");
      if (!response.ok) return { intents: [] };
      return response.json();
    },
    enabled: !!conversation,
    staleTime: 3600000, // 1 hour - intents are static
  });

  const intents = intentsData?.intents || [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { intent: string; variables: Record<string, string> }) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: (newMessage) => {
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
      setSelectedIntent(null);
      setVariables({});
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to block user");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowBlockDialog(false);
      toast.success("User blocked. You will no longer receive messages from them.");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to block user");
    },
  });

  // Report conversation mutation
  const reportMutation = useMutation({
    mutationFn: async (data: { reportedId: string; category: string; details?: string }) => {
      const response = await fetch(`/api/conversations/${conversationId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit report");
      }
      return response.json();
    },
    onSuccess: () => {
      setShowReportDialog(false);
      setReportCategory("");
      setReportDetails("");
      toast.success("Report submitted. The conversation has been frozen pending review.");
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit report");
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Handle intent selection
  const handleIntentSelect = (intentKey: string) => {
    const intent = intents.find((i) => i.intent === intentKey);
    setSelectedIntent(intent || null);
    setVariables({});
  };

  // Handle send
  const handleSend = () => {
    if (selectedIntent && !sendMutation.isPending) {
      sendMutation.mutate({
        intent: selectedIntent.intent,
        variables,
      });
    }
  };

  // Handle send from mobile sheet
  const handleMobileSheetSend = (data: { intent: string; variables: Record<string, string> }) => {
    sendMutation.mutate(data, {
      onSuccess: () => {
        setShowIntentSheet(false);
      },
    });
  };

  // Check if all required variables are filled
  const isReadyToSend = () => {
    if (!selectedIntent) return false;
    for (const variable of selectedIntent.variables) {
      if (variable.required && (!variables[variable.name] || variables[variable.name].trim() === "")) {
        return false;
      }
    }
    return true;
  };

  // Preview the message
  const getMessagePreview = () => {
    if (!selectedIntent) return "";
    let preview = selectedIntent.template;
    for (const variable of selectedIntent.variables) {
      const value = variables[variable.name] || `[${variable.name}]`;
      preview = preview.replace(`[${variable.name}]`, value);
    }
    return preview;
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

  // Check if conversation is frozen
  const isFrozen = conversation.status === "FROZEN";
  const isClosed = conversation.status === "CLOSED";
  const canSendMessages = !isFrozen && !isClosed;

  // Render avatar
  const renderAvatar = () => {
    if (conversation.otherParty.role === "YOUTH" && conversation.otherParty.avatar) {
      const avatar = getAvatarById(conversation.otherParty.avatar);
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl">
          {avatar?.emoji || "?"}
        </div>
      );
    } else if (conversation.otherParty.role === "EMPLOYER") {
      return (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }
  };

  return (
    <Card className="h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] sm:h-[600px] flex flex-col sm:rounded-lg rounded-none border-x-0 sm:border-x">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0 py-3 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          {renderAvatar()}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <CardTitle className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                {conversation.otherParty.name}
              </CardTitle>
              {conversation.otherParty.role === "EMPLOYER" && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                  Employer
                </Badge>
              )}
              {isFrozen && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 py-0">
                  <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  Frozen
                </Badge>
              )}
            </div>
            {conversation.job && (
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{conversation.job.title}</span>
              </div>
            )}
          </div>

          {/* Safety Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                className="text-amber-600"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowBlockDialog(true)}
                className="text-red-600"
              >
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Frozen/Closed Alert */}
      {isFrozen && (
        <Alert variant="destructive" className="m-3 mb-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conversation Frozen</AlertTitle>
          <AlertDescription>
            This conversation has been frozen due to a safety report.
            {conversation.frozenReason && ` Reason: ${conversation.frozenReason}`}
          </AlertDescription>
        </Alert>
      )}

      {isClosed && (
        <Alert className="m-3 mb-0">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Conversation Closed</AlertTitle>
          <AlertDescription>
            This conversation has been closed. You cannot send new messages.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 touch-scroll">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground max-w-xs">
              <Shield className="h-10 w-10 mx-auto mb-3 text-primary/60" />
              <p className="font-medium mb-1">Structured Messaging</p>
              <p className="text-sm">
                For safety, messages use predefined templates.
                Select a message type below to start.
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className={cn(
                  "flex",
                  msg.isFromMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    msg.isFromMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md",
                    msg.isLegacy && "opacity-70 border-2 border-dashed"
                  )}
                >
                  {/* Legacy message indicator */}
                  {msg.isLegacy && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] mb-1",
                      msg.isFromMe ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}>
                      <HelpCircle className="h-3 w-3" />
                      <span>Legacy message</span>
                    </div>
                  )}

                  {/* Intent label for new messages */}
                  {msg.intentLabel && !msg.isLegacy && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs mb-1",
                      msg.isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      <MessageCircle className="h-3 w-3" />
                      <span>{msg.intentLabel}</span>
                    </div>
                  )}

                  {/* Message content */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>

                  {/* Timestamp */}
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

      {/* Intent Selector and Input */}
      {canSendMessages ? (
        <div className="border-t p-3 sm:p-4 flex-shrink-0 space-y-3 pb-safe bg-background">
          {/* Mobile: Button to open intent sheet */}
          {isMobile ? (
            <Button
              onClick={() => setShowIntentSheet(true)}
              variant="outline"
              className="w-full h-11 justify-start text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {selectedIntent ? selectedIntent.label : "Tap to select message type..."}
            </Button>
          ) : (
            /* Desktop: Dropdown selector */
            <Select
              value={selectedIntent?.intent || ""}
              onValueChange={handleIntentSelect}
            >
              <SelectTrigger className="h-11 sm:h-10 text-sm">
                <SelectValue placeholder="Select a message type..." />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                {intents.map((intent) => (
                  <SelectItem key={intent.intent} value={intent.intent}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{intent.label}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {intent.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Variables input */}
          {selectedIntent && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              {/* Show template preview */}
              <div className="text-sm text-muted-foreground bg-background/50 p-2 rounded border">
                <span className="text-xs font-medium block mb-1">Preview:</span>
                {getMessagePreview()}
              </div>

              {/* Variable inputs */}
              {selectedIntent.variables.map((variable) => (
                <div key={variable.name} className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-1">
                    {variable.label}
                    {variable.required && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    value={variables[variable.name] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Enforce max length
                      if (variable.maxLength && value.length > variable.maxLength) {
                        return;
                      }
                      setVariables({ ...variables, [variable.name]: value });
                    }}
                    placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                    maxLength={variable.maxLength}
                    className="h-10"
                  />
                  {variable.maxLength && (
                    <p className="text-xs text-muted-foreground">
                      {(variables[variable.name] || "").length}/{variable.maxLength}
                    </p>
                  )}
                </div>
              ))}

              {/* Send button */}
              <Button
                className="w-full h-11 sm:h-10"
                onClick={handleSend}
                disabled={!isReadyToSend() || sendMutation.isPending}
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          )}

          {/* Quick send for intents without variables */}
          {selectedIntent && !selectedIntent.hasVariables && (
            <Button
              className="w-full h-11 sm:h-10"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          )}

          {/* Safety notice */}
          <p className="text-xs text-muted-foreground text-center">
            <Shield className="h-3 w-3 inline mr-1" />
            Messages are moderated for safety. No personal contact info allowed.
          </p>
        </div>
      ) : (
        <div className="border-t p-3 sm:p-4 flex-shrink-0 pb-safe">
          <p className="text-sm text-muted-foreground text-center">
            <Lock className="h-4 w-4 inline mr-1" />
            You cannot send messages in this conversation.
          </p>
        </div>
      )}

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto">
          <DialogHeader>
            <DialogTitle>Block {conversation.otherParty.name}?</DialogTitle>
            <DialogDescription>
              Blocking this user will:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Prevent them from messaging you</li>
                <li>Prevent you from seeing their job posts</li>
                <li>Hide your profile from them</li>
              </ul>
              <p className="mt-2 text-sm">You can unblock users from your settings.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)} className="h-11 sm:h-10 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => blockMutation.mutate(conversation.otherParty.id)}
              disabled={blockMutation.isPending}
              className="h-11 sm:h-10 w-full sm:w-auto"
            >
              {blockMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Conversation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Conversation</DialogTitle>
            <DialogDescription>
              Help us keep Sprout safe by reporting inappropriate behavior.
              Your report will be reviewed by our safety team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What happened?</label>
              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger className="h-11 sm:h-10">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional)</label>
              <Textarea
                placeholder="Describe what happened..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                maxLength={500}
                rows={3}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                {reportDetails.length}/500 characters
              </p>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This conversation will be frozen immediately while our team reviews your report.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} className="h-11 sm:h-10 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                reportMutation.mutate({
                  reportedId: conversation.otherParty.id,
                  category: reportCategory,
                  details: reportDetails || undefined,
                })
              }
              disabled={!reportCategory || reportMutation.isPending}
              className="h-11 sm:h-10 w-full sm:w-auto"
            >
              {reportMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Intent Sheet */}
      <MessageIntentSheet
        open={showIntentSheet}
        onClose={() => setShowIntentSheet(false)}
        intents={intents}
        onSend={handleMobileSheetSend}
        isPending={sendMutation.isPending}
      />
    </Card>
  );
}
