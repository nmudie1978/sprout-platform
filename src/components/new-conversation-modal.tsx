"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, User, Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarById } from "@/lib/avatars";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchUser {
  id: string;
  role: "YOUTH" | "EMPLOYER";
  name: string;
  avatar?: string;
  logo?: string;
  availabilityStatus?: "AVAILABLE" | "BUSY" | "NOT_LOOKING";
  verified?: boolean;
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search for users
  useEffect(() => {
    async function searchUsers() {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users || []);
        }
      } catch (error) {
        console.error("Failed to search users:", error);
      } finally {
        setIsSearching(false);
      }
    }

    searchUsers();
  }, [debouncedQuery]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create conversation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      onOpenChange(false);
      router.push(`/messages/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
  };

  const handleStartConversation = () => {
    if (selectedUser) {
      createConversationMutation.mutate(selectedUser.id);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    onOpenChange(false);
  };

  const renderAvatar = (user: SearchUser) => {
    if (user.role === "YOUTH" && user.avatar) {
      const avatar = getAvatarById(user.avatar);
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl">
          {avatar?.emoji || "⭐"}
        </div>
      );
    } else if (user.role === "EMPLOYER") {
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

  const getAvailabilityBadge = (status?: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Available</Badge>;
      case "BUSY":
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">Busy</Badge>;
      case "NOT_LOOKING":
        return <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Not Looking</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            New Message
          </DialogTitle>
          <DialogDescription>
            Search for someone to start a conversation with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 sm:h-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto space-y-1 touch-scroll flex-1">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Type at least 2 characters to search
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No users found
              </div>
            ) : (
              searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left min-h-[60px]",
                    selectedUser?.id === user.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "hover:bg-muted active:bg-muted border-2 border-transparent"
                  )}
                >
                  {renderAvatar(user)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{user.name}</span>
                      {user.role === "EMPLOYER" && (
                        <Badge variant="secondary" className="text-xs">
                          Employer
                        </Badge>
                      )}
                      {user.verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    {user.role === "YOUTH" && user.availabilityStatus && (
                      <div className="mt-1">
                        {getAvailabilityBadge(user.availabilityStatus)}
                      </div>
                    )}
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Action Button */}
          {selectedUser && (
            <Button
              onClick={handleStartConversation}
              disabled={createConversationMutation.isPending}
              className="w-full h-11 sm:h-10 flex-shrink-0"
            >
              {createConversationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting conversation...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message {selectedUser.name}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
