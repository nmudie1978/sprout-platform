"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveIndustryButtonProps {
  industryId: string;
  industryName: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "icon";
}

export function SaveIndustryButton({
  industryId,
  industryName,
  variant = "outline",
  size = "sm",
}: SaveIndustryButtonProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if already saved
  useEffect(() => {
    if (session?.user) {
      fetch(`/api/insights/saved?industryId=${industryId}`)
        .then((res) => res.json())
        .then((data) => {
          setIsSaved(data.isSaved);
          setIsInitializing(false);
        })
        .catch(() => setIsInitializing(false));
    } else {
      // Check localStorage for non-logged in users
      const saved = localStorage.getItem("savedIndustries");
      if (saved) {
        const industries = JSON.parse(saved);
        setIsSaved(industries.includes(industryId));
      }
      setIsInitializing(false);
    }
  }, [session, industryId]);

  const handleToggle = async () => {
    if (!session?.user) {
      // Handle non-logged in users with localStorage
      const saved = localStorage.getItem("savedIndustries");
      const industries = saved ? JSON.parse(saved) : [];

      if (isSaved) {
        const filtered = industries.filter((id: string) => id !== industryId);
        localStorage.setItem("savedIndustries", JSON.stringify(filtered));
        setIsSaved(false);
        toast.success(`${industryName} fjernet fra lagrede`);
      } else {
        industries.push(industryId);
        localStorage.setItem("savedIndustries", JSON.stringify(industries));
        setIsSaved(true);
        toast.success(`${industryName} lagret!`);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/insights/saved", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industryId }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(
          isSaved
            ? `${industryName} fjernet fra lagrede`
            : `${industryName} lagret!`
        );
      }
    } catch (error) {
      toast.error("Kunne ikke lagre. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  // Icon variant uses a simple button element
  const isIconVariant = variant === "ghost" && size === "icon";

  if (isInitializing) {
    if (isIconVariant) {
      return (
        <button
          disabled
          className="p-2 rounded-lg text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </button>
      );
    }
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (isIconVariant) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all ${
          isSaved
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title={isSaved ? "Fjern fra lagrede" : "Lagre for senere"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isSaved ? "secondary" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={isSaved ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isSaved ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isSaved ? "Lagret" : "Lagre"}
    </Button>
  );
}
