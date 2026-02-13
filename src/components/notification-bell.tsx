"use client";

import { useState, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?limit=10");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    refetchInterval: 20000, // Poll every 20 seconds - balance between freshness and performance
    staleTime: 10000, // Consider data fresh for 10 seconds (reduces redundant requests)
    refetchOnWindowFocus: true, // Always refresh when user returns to tab
    refetchIntervalInBackground: false, // Don't poll when tab is in background
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (params: { notificationIds?: string[]; markAllRead?: boolean }) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount: number = data?.unreadCount || 0;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_APPLICATION":
        return "🎉";
      case "APPLICATION_ACCEPTED":
        return "✅";
      case "APPLICATION_REJECTED":
        return "❌";
      case "JOB_COMPLETED":
        return "🏆";
      case "NEW_REVIEW":
        return "⭐";
      case "NEW_RECOMMENDATION":
        return "🤝";
      case "NEW_MESSAGE":
        return "💬";
      case "JOB_ASSIGNED":
        return "🎯";
      default:
        return "📬";
    }
  };

  const handleMarkAllRead = () => {
    markAsReadMutation.mutate({ markAllRead: true });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate({ notificationIds: [notification.id] });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-muted rounded-lg"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => handleNotificationClick(notification)}
                      className="block p-4 hover:bg-muted/50 transition-colors"
                    >
                      <NotificationContent
                        notification={notification}
                        formatTime={formatTime}
                        getIcon={getNotificationIcon}
                      />
                    </Link>
                  ) : (
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationContent
                        notification={notification}
                        formatTime={formatTime}
                        getIcon={getNotificationIcon}
                      />
                    </div>
                  )}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

const NotificationContent = memo(function NotificationContent({
  notification,
  formatTime,
  getIcon,
}: {
  notification: Notification;
  formatTime: (date: string) => string;
  getIcon: (type: string) => string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-xl flex-shrink-0">{getIcon(notification.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
});
