"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Calendar,
  Clock,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  MoreVertical,
  Flag,
  Ban,
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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAvatarById } from "@/lib/avatars";

interface Message {
  id: string;
  content: string;
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

interface MessageTemplate {
  id: string;
  key: string;
  label: string;
  category: string;
  allowedFields: {
    fields: Array<{
      name: string;
      type: string;
      label: string;
      required?: boolean;
      options?: string[];
      min?: number;
      max?: number;
    }>;
  };
}

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  scheduling: <Calendar className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  safety: <Clock className="h-4 w-4" />,
  feedback: <MessageSquare className="h-4 w-4" />,
};

const REPORT_CATEGORIES = [
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "SPAM", label: "Spam or scam" },
  { value: "CONTACT_SHARING", label: "Trying to share contact info" },
  { value: "SUSPICIOUS_BEHAVIOR", label: "Suspicious behavior" },
  { value: "OTHER", label: "Other" },
];

export function ChatView({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [payload, setPayload] = useState<Record<string, any>>({});
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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

  // Fetch available templates
  const { data: templates } = useQuery<MessageTemplate[]>({
    queryKey: ["messageTemplates", conversation?.otherParty?.role],
    queryFn: async () => {
      const response = await fetch("/api/messages/templates");
      if (!response.ok) return [];
      const data = await response.json();
      return data.templates || [];
    },
    enabled: !!conversation,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { templateKey: string; payload: Record<string, any> }) => {
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
      setSelectedTemplate(null);
      setPayload({});
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

  const handleSend = () => {
    if (selectedTemplate && !sendMutation.isPending) {
      sendMutation.mutate({
        templateKey: selectedTemplate.key,
        payload,
      });
    }
  };

  // Check if payload is valid
  const isPayloadValid = () => {
    if (!selectedTemplate) return false;
    for (const field of selectedTemplate.allowedFields.fields) {
      if (field.required && !payload[field.name]) {
        return false;
      }
    }
    return true;
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

  // Group templates by category
  const templatesByCategory = templates?.reduce((acc, template) => {
    const category = template.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>) || {};

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
            <div className="text-center text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary/60" />
              <p className="font-medium">Safe Messaging</p>
              <p className="text-sm">
                For safety, all messages use pre-approved templates.
                <br />
                Select a message type below to get started.
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
                  {msg.templateCategory && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs mb-1",
                      msg.isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {CATEGORY_ICONS[msg.templateCategory]}
                      <span>{msg.templateLabel}</span>
                    </div>
                  )}
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

      {/* Template Selector and Input */}
      {canSendMessages ? (
        <div className="border-t p-3 sm:p-4 flex-shrink-0 space-y-3 pb-safe">
          {/* Template selector */}
          <div className="flex gap-2">
            <Select
              value={selectedTemplate?.key || ""}
              onValueChange={(key) => {
                const template = templates?.find((t) => t.key === key);
                setSelectedTemplate(template || null);
                setPayload({});
              }}
            >
              <SelectTrigger className="flex-1 h-11 sm:h-10 text-sm">
                <SelectValue placeholder="Choose a message type..." />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      {CATEGORY_ICONS[category]}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    {categoryTemplates.map((template) => (
                      <SelectItem key={template.key} value={template.key}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template fields */}
          {selectedTemplate && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              {selectedTemplate.allowedFields.fields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "select" && field.options && (
                    <Select
                      value={payload[field.name] || ""}
                      onValueChange={(value) =>
                        setPayload({ ...payload, [field.name]: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "boolean" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!payload[field.name]}
                        onChange={(e) =>
                          setPayload({ ...payload, [field.name]: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-muted-foreground">
                        Yes, I confirm
                      </span>
                    </div>
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      value={payload[field.name] || ""}
                      onChange={(e) =>
                        setPayload({ ...payload, [field.name]: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}

                  {field.type === "time" && (
                    <input
                      type="time"
                      value={payload[field.name] || ""}
                      onChange={(e) =>
                        setPayload({ ...payload, [field.name]: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      value={payload[field.name] || ""}
                      min={field.min}
                      max={field.max}
                      onChange={(e) =>
                        setPayload({ ...payload, [field.name]: Number(e.target.value) })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <Button
                className="w-full h-11 sm:h-10 touch-target"
                onClick={handleSend}
                disabled={!isPayloadValid() || sendMutation.isPending}
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
    </Card>
  );
}
